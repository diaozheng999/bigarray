open Types

type t<'a, 'b, 'c> = Array1.t<'a, 'b, 'c>

let create: (kind<'a, 'b>, layout<'c>, int) => t<'a, 'b, 'c>

let dim: t<'a, 'b, 'c> => int

let kind: t<'a, 'b, 'c> => kind<'a, 'b>

let layout: t<'a, 'b, 'c> => layout<'c>

let change_layout: (t<'a, 'b, 'c>, layout<'d>) => t<'a, 'b, 'd>

let size_in_bytes: t<'a, 'b, 'c> => int

let get: (t<'a, 'b, 'c>, int) => 'a

let set: (t<'a, 'b, 'c>, int, 'a) => unit

let sub: (t<'a, 'b, 'c>, int, int) => unit

let slice: (t<'a, 'b, 'c>, int) => Array0.t<'a, 'b, 'c>

let blit: (t<'a, 'b, 'c>, t<'a, 'b, 'c>) => unit

let fill: (t<'a, 'b, 'c>, 'a) => unit

let of_array: (kind<'a, 'b>, layout<'c>, array<'a>) => t<'a, 'b, 'c>

let unsafe_get: (t<'a, 'b, 'c>, int) => 'a

let unsafe_set: (t<'a, 'b, 'c>, int) => 'a
