open Types
open Private

type buffer<'ml_kind, 'elt_kind>

type t<'ml_kind, 'elt_kind, 'layout> = {
  buffer: buffer<'ml_kind, 'elt_kind>,
  kind: kind<'ml_kind, 'elt_kind>,
  layout: layout<'layout>,
  dims: array<int>,
  a_dims: array<int>,
  start: int,
  size: int,
}

@new external float32: int => buffer<'a, 'b> = "Float32Array"

@new external float64: int => buffer<'a, 'b> = "Float64Array"

@val external complex32: int => buffer<'a, 'b> = "Array"

@val external complex64: int => buffer<'a, 'b> = "Array"

@new external int8_signed: int => buffer<'a, 'b> = "Int8Array"

@new external int8_unsigned: int => buffer<'a, 'b> = "Uint8Array"

@new external int16_signed: int => buffer<'a, 'b> = "Int16Array"

@new external int16_unsigned: int => buffer<'a, 'b> = "Uint16Array"

@new external int: int => buffer<'a, 'b> = "Int32Array"

@new external int32: int => buffer<'a, 'b> = "Int32Array"

@new external int64: int => buffer<'a, 'b> = "BigInt64Array"

@new external nativeint: int => buffer<'a, 'b> = "Int32Array"

@new external char: int => buffer<'a, 'b> = "Uint8Array"

let accumulate_c_dim = dims => {
  let result = Array.make(Js.Array2.length(dims), 1)
  let _ = Js.Array2.reduceRighti(
    dims,
    (acc, v, i) => {
      Js.Array2.unsafe_set(result, i, acc)
      acc * v
    },
    1,
  )
  result
}

let accumulate_fortran_dims = dims => {
  let result = Array.make(Js.Array2.length(dims), 1)
  let _ = Js.Array2.reducei(
    dims,
    (acc, v, i) => {
      Js.Array2.unsafe_set(result, i, acc)
      acc * v
    },
    1,
  )
  result
}

let accumulate_dims = (dims, layout) => {
  switch unsafe_expose_int_tag_of_layout(layout) {
  | 0 => accumulate_c_dim(dims)
  | _ => accumulate_fortran_dims(dims)
  }
}

let compute_size = dims =>
  switch Js.Array2.length(dims) {
  | 0 => 0
  | _ => Js.Array2.reduce(dims, (a, b) => a * b, 1)
  }

let create = (kind, layout, dims) => {
  let size = compute_size(dims)
  let buffer = switch unsafe_expose_int_tag_of_kind(kind) {
  | 0 => int8_signed(size)
  | 1 => int8_unsigned(size)
  | 2 => char(size)
  | 3 => int16_signed(size)
  | 4 => int16_unsigned(size)
  | 5 => int(size)
  | 6 => int32(size)
  | 7 => nativeint(size)
  | 8 => float32(size)
  | 9 => complex32(size)
  | 10 => int64(size)
  | 11 => float64(size)
  | 12 => complex64(size)
  | _ => raise(Unknown_kind)
  }
  {
    buffer: buffer,
    kind: kind,
    layout: layout,
    dims: dims,
    a_dims: accumulate_dims(dims, layout),
    start: 0,
    size: size,
  }
}

let num_dims = ({dims}) => Js.Array2.length(dims)

let nth_dim = ({dims}, n) => dims[n]

let kind = ({kind}) => kind

let layout = ({layout}) => layout

let change_layout = ({buffer, kind, dims, start, size}, layout) => {
  buffer: buffer,
  kind: kind,
  dims: dims,
  start: start,
  size: size,
  layout: layout,
  a_dims: accumulate_dims(dims, layout),
}

let size_in_bytes = ({size, kind}) => size * kind_size_in_bytes(kind)

/*
   Redefine ReScript primitives here to allow us to generate array indexing
   primitives in JavaScript
 */
external unsafe_get: (buffer<'a, 'b>, int) => 'a = "%array_unsafe_get"
external unsafe_set: (buffer<'a, 'b>, int, 'a) => unit = "%array_unsafe_set"

let compute_idx = ({a_dims, dims, start, layout}, idx) => {
  // crazy, but since C layout (tag 0) starts from 0, and fortran layout
  // (tag 1) starts from 1, we can use this to offset everything properly
  let n = unsafe_expose_int_tag_of_layout(layout)
  Js.Array2.reducei(
    idx,
    (acc, v, i) => {
      let idx = v - n
      // check for index safety
      if idx < 0 || idx >= dims[i] {
        invalid_arg(`Dimension ${Js.Int.toString(i)} out of bounds.`)
      }
      idx * Js.Array2.unsafe_get(a_dims, i) + acc
    },
    start,
  )
}

let compute_idx_unsafe = ({a_dims, start, layout}, idx) => {
  let n = unsafe_expose_int_tag_of_layout(layout)
  Js.Array2.reducei(idx, (acc, v, i) => (v - n) * Js.Array2.unsafe_get(a_dims, i) + acc, start)
}

@warning("-27")
let map_bigint_to_int64 = (n: 'a): 'a => %raw("[Number(n >> 32n), Number(n & 0xffffffffn) >>> 0]")

@warning("-27")
let map_int64_to_bigint = (n: 'a): 'a => %raw("BigInt(n[0]) << 32n | BigInt(n[1])")

let get = (array, idx) => {
  let id = compute_idx(array, idx)
  // ReScript tends to inline map_bigint_to_int64. We keep the variables the same
  // to prevent runtime issues.
  let n = unsafe_get(array.buffer, id)
  if unsafe_expose_int_tag_of_kind(array.kind) == unsafe_expose_int_tag_of_kind(Int64) {
    map_bigint_to_int64(n)
  } else {
    n
  }
}

let set = (array, idx, n) => {
  let id = compute_idx(array, idx)
  if unsafe_expose_int_tag_of_kind(array.kind) == unsafe_expose_int_tag_of_kind(Int64) {
    // amazingly ReScript does not inline this
    unsafe_set(array.buffer, id, map_int64_to_bigint(n))
  } else {
    unsafe_set(array.buffer, id, n)
  }
}

let validate_c_layout_range = (dims, ofs, len) => {
  let n = dims[0]
  if ofs < n || ofs + len >= n {
    invalid_arg("Genarray: unable to subset 0th dimension.")
  }
}

let validate_fortran_layout_range = (dims, ofs, len, len_dims) => {
  if len_dims < 0 {
    invalid_arg("Cannot sub_right an array of 0 dimension.")
  }
  let n = dims[len_dims]
  if ofs < n || ofs + len >= n {
    invalid_arg("Genarray: unsable to subset (n-1)th dimension.")
  }
}

let sub_left = ({buffer, kind, layout, a_dims, dims, start}, ofs, len) => {
  let n_dims = Js.Array2.length(dims)
  validate_c_layout_range(dims, ofs, len)
  let start = ofs * a_dims[0] + start
  let dims = Js.Array2.copy(dims)
  Js.Array2.unsafe_set(dims, 0, len)
  let multiplier = if n_dims > 1 {
    Js.Array2.unsafe_get(a_dims, 1)
  } else {
    1
  }
  let size = len * multiplier
  {
    buffer: buffer,
    kind: kind,
    layout: layout,
    dims: dims,
    start: start,
    size: size,
    a_dims: a_dims,
  }
}

let sub_right = ({buffer, kind, layout, a_dims, dims, start}, ofs, len) => {
  let idx = Js.Array2.length(dims) - 1
  validate_fortran_layout_range(dims, ofs, len, idx)
  let start = ofs * a_dims[idx] + start
  let dims = Js.Array2.copy(dims)
  Js.Array2.unsafe_set(dims, idx, len)
  let multiplier = if idx > 0 {
    Js.Array2.unsafe_get(a_dims, idx - 1)
  } else {
    1
  }
  let size = len * multiplier
  {
    buffer: buffer,
    kind: kind,
    layout: layout,
    dims: dims,
    start: start,
    size: size,
    a_dims: a_dims,
  }
}
