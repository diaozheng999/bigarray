open Types

type t<'a, 'b, 'c>

@module("@nasi/bigarray-runtime")
external create: (kind<'a, 'b>, layout<'c>, int) => t<'a, 'b, 'c> = "createVariadic"

@get
external dim: t<'a, 'b, 'c> => int = "length"

@get
external kind: t<'a, 'b, 'c> => kind<'a, 'b> = "kind"

@get
external layout: t<'a, 'b, 'c> => layout<'c> = "layout"

@module("@nasi/bigarray-runtime")
external change_layout: (t<'a, 'b, 'c>, layout<'d>) => t<'a, 'b, 'd> = "changeLayout"

@send
external size_in_bytes: t<'a, 'b, 'c> => int = "byteSize"

@send
external get: (t<'a, 'b, 'c>, int) => 'a = "get1"

@send
external set: (t<'a, 'b, 'c>, int, 'a) => unit = "set1"

@send
external sub: (t<'a, 'b, 'c>, int, int) => t<'a, 'b, 'c> = "sub1"

@send
external slice: (t<'a, 'b, 'c>, int) => Array0.t<'a, 'b, 'c> = "slice1"

@send
external blit: (t<'a, 'b, 'c>, t<'a, 'b, 'c>) => unit = "blit"

@send
external fill: (t<'a, 'b, 'c>, 'a) => unit = "fill"

@module("@nasi/bigarray-runtime")
external of_array: (kind<'a, 'b>, layout<'c>, array<'a>) => t<'a, 'b, 'c> = "from"

@send
external unsafe_get: (t<'a, 'b, 'c>, int) => 'a = "unsafeGet1"

@send
external unsafe_set: (t<'a, 'b, 'c>, int, 'a) => 'a = "unsafeSet1"
