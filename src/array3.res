open Types

type t<'a, 'b, 'c>

@module("@nasi/bigarray-runtime")
external create: (kind<'a, 'b>, layout<'c>, int, int, int) => t<'a, 'b, 'c> = "createVariadic"

@send
external dim1: (t<'a, 'b, 'c>, @as(0) _) => int = "nthDim"

@send
external dim2: (t<'a, 'b, 'c>, @as(1) _) => int = "nthDim"

@send
external dim3: (t<'a, 'b, 'c>, @as(2) _) => int = "nthDim"

@get
external kind: t<'a, 'b, 'c> => kind<'a, 'b> = "kind"

@get
external layout: t<'a, 'b, 'c> => layout<'c> = "layout"

@module("@nasi/bigarray-runtime")
external change_layout: (t<'a, 'b, 'c>, layout<'d>) => t<'a, 'b, 'd> = "changeLayout"

@send
external size_in_bytes: t<'a, 'b, 'c> => int = "byteSize"

@send
external get: (t<'a, 'b, 'c>, int, int, int) => 'a = "get3"

@send
external set: (t<'a, 'b, 'c>, int, int, int, 'a) => unit = "set3"

@send
external sub_left: (t<'a, 'b, c_layout>, int, int) => unit = "sub"

@send
external sub_right: (t<'a, 'b, fortran_layout>, int, int) => unit = "sub"

@send
external slice_left_1: (t<'a, 'b, c_layout>, int, int) => Array1.t<'a, 'b, c_layout> =
  "sliceVariadic"

@send
external slice_right_1: (t<'a, 'b, fortran_layout>, int, int) => Array1.t<'a, 'b, fortran_layout> =
  "sliceVariadic"

@send
external slice_left_2: (t<'a, 'b, c_layout>, int) => Array2.t<'a, 'b, c_layout> = "sliceVariadic"

@send
external slice_right_2: (t<'a, 'b, fortran_layout>, int) => Array2.t<'a, 'b, fortran_layout> =
  "sliceVariadic"

@send
external blit: (t<'a, 'b, 'c>, t<'a, 'b, 'c>) => unit = "blit"

@send
external fill: (t<'a, 'b, 'c>, 'a) => unit = "fill"

@module("@nasi/bigarray-runtime")
external of_array: (kind<'a, 'b>, layout<'c>, array<array<array<'a>>>) => t<'a, 'b, 'c> = "from3"

@send
external unsafe_get: (t<'a, 'b, 'c>, int, int) => 'a = "unsafeGet3"

@send
external unsafe_set: (t<'a, 'b, 'c>, int, int) => 'a = "unsafeSet3"
