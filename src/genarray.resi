open Types

type t<'ml_kind, 'elt_kind, 'layout>

let create: (kind<'a, 'b>, layout<'c>, array<int>) => t<'a, 'b, 'c>

let num_dims: t<'a, 'b, 'c> => int

let nth_dim: (t<'a, 'b, 'c>, int) => int

let kind: t<'a, 'b, 'c> => kind<'a, 'b>

let layout: t<'a, 'b, 'c> => layout<'c>

let change_layout: (t<'a, 'b, 'c>, layout<'d>) => t<'a, 'b, 'd>

let size_in_bytes: t<'a, 'b, 'c> => int

let get: (t<'a, 'b, 'c>, array<int>) => 'a

let set: (t<'a, 'b, 'c>, array<int>, 'a) => unit
