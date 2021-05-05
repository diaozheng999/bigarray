open Types

type t<'a, 'b, 'c> = Array3.t<'a, 'b, 'c>

let create: (kind<'a, 'b>, layout<'c>, int, int, int) => t<'a, 'b, 'c>

let dim1: t<'a, 'b, 'c> => int

let dim2: t<'a, 'b, 'c> => int

let dim3: t<'a, 'b, 'c> => int

let kind: t<'a, 'b, 'c> => kind<'a, 'b>

let layout: t<'a, 'b, 'c> => layout<'c>

let change_layout: (t<'a, 'b, 'c>, layout<'d>) => t<'a, 'b, 'd>

let size_in_bytes: t<'a, 'b, 'c> => int

let get: (t<'a, 'b, 'c>, int, int, int) => 'a

let set: (t<'a, 'b, 'c>, int, int, int, 'a) => unit

let sub_left: (t<'a, 'b, c_layout>, int, int) => unit

let sub_right: (t<'a, 'b, fortran_layout>, int, int) => unit

let slice_left_1: (t<'a, 'b, c_layout>, int, int) => Array1.t<'a, 'b, c_layout>

let slice_right_1: (t<'a, 'b, fortran_layout>, int, int) => Array1.t<'a, 'b, fortran_layout>

let slice_left_2: (t<'a, 'b, c_layout>, int) => Array2.t<'a, 'b, c_layout>

let slice_right_2: (t<'a, 'b, fortran_layout>, int) => Array2.t<'a, 'b, fortran_layout>

let blit: (t<'a, 'b, 'c>, t<'a, 'b, 'c>) => unit

let fill: (t<'a, 'b, 'c>, 'a) => unit

let of_array: (kind<'a, 'b>, layout<'c>, array<array<array<'a>>>) => t<'a, 'b, 'c>

let unsafe_get: (t<'a, 'b, 'c>, int, int) => 'a

let unsafe_set: (t<'a, 'b, 'c>, int, int) => 'a
