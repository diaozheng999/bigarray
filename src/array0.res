open Types

type t<'a, 'b, 'c>

@module("@nasi/bigarray-runtime")
external create: (kind<'a, 'b>, layout<'c>, @as(json`[]`) _) => t<'a, 'b, 'c> = "create"

@get external kind: t<'a, 'b, 'c> => kind<'a, 'b> = "kind"

@get external layout: t<'a, 'b, 'c> => layout<'c> = "layout"

@module("@nasi/bigarray-runtime")
external change_layout: (t<'a, 'b, 'c>, layout<'d>) => t<'a, 'b, 'd> = "changeLayout"

@send external size_in_bytes: t<'a, 'b, 'c> => int = "byteSize"

@send external get: t<'a, 'b, 'c> => 'a = "get0"

@send external set: (t<'a, 'b, 'c>, 'a) => unit = "set0"

@send external blit: (t<'a, 'b, 'c>, t<'a, 'b, 'c>) => unit = "blit"

@send external fill: (t<'a, 'b, 'c>, t<'a, 'b, 'c>) => unit = "fill"

@module("@nasi/bigarray-runtime")
external of_value: (kind<'a, 'b>, layout<'c>, 'a) => t<'a, 'b, 'c> = "constant"
