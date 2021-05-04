open Types

type t<'a, 'b, 'c> = Array0.t<'a, 'b, 'c>

let create: (kind<'a, 'b>, layout<'c>) => t<'a, 'b, 'c>
let kind: t<'a, 'b, 'c> => kind<'a, 'b>

let layout: t<'a, 'b, 'c> => layout<'c>

let change_layout: (t<'a, 'b, 'c>, layout<'d>) => t<'a, 'b, 'd>

let size_in_bytes: t<'a, 'b, 'c> => int

let get: t<'a, 'b, 'c> => 'a

let set: (t<'a, 'b, 'c>, 'a) => unit
let blit: (t<'a, 'b, 'c>, t<'a, 'b, 'c>) => unit

let fill: (t<'a, 'b, 'c>, t<'a, 'b, 'c>) => unit

let of_value: (kind<'a, 'b>, layout<'c>, 'a) => t<'a, 'b, 'c>
