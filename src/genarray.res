open Types
open Private

type buffer<'ml_kind, 'elt_kind>

type t<'ml_kind, 'elt_kind, 'layout> = {
  buffer: buffer<'ml_kind, 'elt_kind>,
  kind: kind<'ml_kind, 'elt_kind>,
  layout: layout<'layout>,
  dims: array<int>,
  a_dims: array<int>,
}

@module("@nasi/bigarray-runtime") @new external float32: int => buffer<'a, 'b> = "Float32Array"

@module("@nasi/bigarray-runtime") @new external float64: int => buffer<'a, 'b> = "Float64Array"

@module("@nasi/bigarray-runtime") @new external complex32: int => buffer<'a, 'b> = "Complex32Array"

@module("@nasi/bigarray-runtime") @new external complex64: int => buffer<'a, 'b> = "Complex64Array"

@module("@nasi/bigarray-runtime") @new external int8_signed: int => buffer<'a, 'b> = "Int8Array"

@module("@nasi/bigarray-runtime") @new external int8_unsigned: int => buffer<'a, 'b> = "Uint8Array"

@module("@nasi/bigarray-runtime") @new external int16_signed: int => buffer<'a, 'b> = "Int16Array"

@module("@nasi/bigarray-runtime") @new
external int16_unsigned: int => buffer<'a, 'b> = "Uint16Array"

@module("@nasi/bigarray-runtime") @new external int: int => buffer<'a, 'b> = "Int32Array"

@module("@nasi/bigarray-runtime") @new external int32: int => buffer<'a, 'b> = "Int32Array"

@module("@nasi/bigarray-runtime") @new external int64: int => buffer<'a, 'b> = "Int64Array"

@module("@nasi/bigarray-runtime") @new external nativeint: int => buffer<'a, 'b> = "Int32Array"

@module("@nasi/bigarray-runtime") @new external char: int => buffer<'a, 'b> = "Uint8Array"

@send external unsafe_get: (buffer<'a, 'b>, int) => 'a = "at"
@send external unsafe_set: (buffer<'a, 'b>, int, 'a) => unit = "setValue"

@get external size: buffer<'a, 'b> => int = "length"
@send external subarray: (buffer<'a, 'b>, ~begin: int, ~end: int) => buffer<'a, 'b> = "subarray"

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
  }
}

let num_dims = ({dims}) => Js.Array2.length(dims)

let nth_dim = ({dims}, n) => dims[n]

let kind = ({kind}) => kind

let layout = ({layout}) => layout

let change_layout = ({buffer, kind, dims}, layout) => {
  buffer: buffer,
  kind: kind,
  dims: dims,
  layout: layout,
  a_dims: accumulate_dims(dims, layout),
}

let size_in_bytes = ({buffer, kind}) => size(buffer) * kind_size_in_bytes(kind)

let compute_idx = ({a_dims, dims, layout}, idx) => {
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
    0,
  )
}

let compute_idx_unsafe = ({a_dims, layout}, idx) => {
  let n = unsafe_expose_int_tag_of_layout(layout)
  Js.Array2.reducei(idx, (acc, v, i) => (v - n) * Js.Array2.unsafe_get(a_dims, i) + acc, 0)
}

let get = (array, idx) => {
  let id = compute_idx(array, idx)
  unsafe_get(array.buffer, id)
}

let set = (array, idx, n) => {
  let id = compute_idx(array, idx)
  unsafe_set(array.buffer, id, n)
}

let validate_c_layout_range = (dims, ofs, len) => {
  let n = dims[0]
  if ofs < 0 || ofs + len > n {
    invalid_arg("Genarray: unable to subset 0th dimension.")
  }
}

let validate_fortran_layout_range = (dims, ofs, len, len_dims) => {
  if len_dims < 0 {
    invalid_arg("Cannot sub_right an array of 0 dimension.")
  }
  let n = dims[len_dims]
  if ofs < 0 || ofs + len > n {
    invalid_arg("Genarray: unsable to subset (n-1)th dimension.")
  }
}

let sub_left = ({buffer, kind, layout, a_dims, dims}, ofs, len) => {
  validate_c_layout_range(dims, ofs, len)
  let begin = ofs * a_dims[0]
  let end = (ofs + len) * a_dims[0]
  let dims = Js.Array2.copy(dims)
  Js.Array2.unsafe_set(dims, 0, len)
  {
    buffer: subarray(buffer, ~begin, ~end),
    kind: kind,
    layout: layout,
    dims: dims,
    a_dims: a_dims,
  }
}

let sub_right = ({buffer, kind, layout, a_dims, dims}, ofs, len) => {
  let idx = Js.Array2.length(dims) - 1
  validate_fortran_layout_range(dims, ofs, len, idx)
  let begin = ofs * a_dims[idx]
  let end = (ofs + len) * a_dims[idx]
  let dims = Js.Array2.copy(dims)
  Js.Array2.unsafe_set(dims, idx, len)
  {
    buffer: subarray(buffer, ~begin, ~end),
    kind: kind,
    layout: layout,
    dims: dims,
    a_dims: a_dims,
  }
}
