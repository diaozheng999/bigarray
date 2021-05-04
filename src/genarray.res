open Types

type t<'ml_kind, 'elt_kind, 'layout>

@module("@nasi/bigarray-runtime")
external create: (kind<'a, 'b>, layout<'c>, array<int>) => t<'a, 'b, 'c> = "create"

@get external num_dims: t<'a, 'b, 'c> => int = "ndim"

@send external nth_dim: (t<'a, 'b, 'c>, int) => int = "nthDim"

@get external kind: t<'a, 'b, 'c> => kind<'a, 'b> = "kind"

@get external layout: t<'a, 'b, 'c> => layout<'c> = "layout"

@module("@nasi/bigarray-runtime")
external change_layout: (t<'a, 'b, 'c>, layout<'d>) => t<'a, 'b, 'd> = "changeLayout"

@send external size_in_bytes: t<'a, 'b, 'c> => int = "byteSize"

@send external get: (t<'a, 'b, 'c>, array<int>) => 'a = "get"

@send external set: (t<'a, 'b, 'c>, array<int>, 'a) => unit = "set"

@send external sub_left: (t<'a, 'b, c_layout>, int, int) => t<'a, 'b, c_layout> = "sub"

@send external sub_right: (t<'a, 'b, fortran_layout>, int, int) => t<'a, 'b, fortran_layout> = "sub"

@send external slice_left: (t<'a, 'b, c_layout>, array<int>) => t<'a, 'b, c_layout> = "slice"

@send
external slice_right: (t<'a, 'b, fortran_layout>, array<int>) => t<'a, 'b, fortran_layout> = "slice"

@send
external blit: (t<'a, 'b, 'c>, t<'a, 'b, 'c>) => unit = "blit"

@send external fill: (t<'a, 'b, 'c>, 'a) => unit = "fill"
