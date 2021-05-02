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

let create = (kind, layout, dims) => {
  let size = Js.Array2.reduce(dims, (a, b) => a * b, 1)
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

let compute_idx = ({a_dims, start, size, layout}, idx) => {
  let id = Js.Array2.reducei(
    idx,
    (acc, v, i) => v * Js.Array2.unsafe_get(a_dims, i) + acc,
    /* 
     crazy, but since C layout (tag 0) starts from 0, and fortran layout (tag
     1) starts from 1, we can use this to offset everything properly */
    start - unsafe_expose_int_tag_of_layout(layout),
  )
  if id >= size {
    invalid_arg("Array index out of bounds.")
  } else {
    id
  }
}

let get = (array, idx) => {
  let id = compute_idx(array, idx)
  unsafe_get(array.buffer, id)
}

let set = (array, idx, value) => {
  let id = compute_idx(array, idx)
  unsafe_set(array.buffer, id, value)
}
