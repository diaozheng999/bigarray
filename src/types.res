type float32_elt = Float32_elt
type float64_elt = Float64_elt
type int8_signed_elt = Int8_signed_elt
type int8_unsigned_elt = Int8_unsigned_elt
type int16_signed_elt = Int16_signed_elt
type int16_unsigned_elt = Int16_unsigned_elt
type int32_elt = Int32_elt
type int64_elt = Int64_elt
type int_elt = Int_elt
type nativeint_elt = Nativeint_elt
type complex32_elt = Complex32_elt
type complex64_elt = Complex64_elt

type rec kind<'a, 'b> =
  | Int8_signed: kind<int, int8_signed_elt>
  | Int8_unsigned: kind<int, int8_unsigned_elt>
  | Char: kind<char, int8_unsigned_elt>
  | Int16_signed: kind<int, int16_signed_elt>
  | Int16_unsigned: kind<int, int16_unsigned_elt>
  | Int: kind<int, int_elt>
  | Int32: kind<int32, int32_elt>
  | Nativeint: kind<int32, nativeint_elt>
  | Float32: kind<float, float32_elt>
  | Complex32: kind<Complex.t, complex32_elt>
  | Int64: kind<int64, int64_elt>
  | Float64: kind<float, float64_elt>
  | Complex64: kind<Complex.t, complex64_elt>

let float32 = Float32

let float64 = Float64

let complex32 = Complex32

let complex64 = Complex64

let int8_signed = Int8_signed

let int8_unsigned = Int8_unsigned

let int16_signed = Int16_signed

let int16_unsigned = Int16_unsigned

let int = Int

let int32 = Int32

let int64 = Int64

let nativeint = Nativeint

let char = Char

exception Unknown_kind

external unsafe_expose_int_tag_of: kind<'a, 'b> => int = "%identity"

let kind_size_in_bytes = (kind) => switch unsafe_expose_int_tag_of(kind) {
  | 0
  | 1
  | 2 => 1
  | 3
  | 4 => 2
  | 5
  | 6
  | 7
  | 8
  | 9 => 3
  | 10
  | 11
  | 12 => 4
  | _ => raise(Unknown_kind)
}

type c_layout = C_layout_typ

type fortran_layout = Fortran_layout_typ

type rec layout<'a> = 
  | C_layout: layout<c_layout>
  | Fortran_layout: layout<fortran_layout>
