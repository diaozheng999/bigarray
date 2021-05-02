open Types

type buffer<'ml_kind, 'elt_kind>

type t<'ml_kind, 'elt_kind, 'layout> = {
  buffer: buffer<'ml_kind, 'elt_kind>,
  layout: 'layout,
  start: int,
  end: int,
}

@new external float32: int => buffer<float, float32_elt> = "Float32Array"

@new external float64: int => buffer<float, float64_elt> = "Float64Array"

@val external complex32: int => buffer<Complex.t, complex32_elt> = "Array"

@val external complex64: int => buffer<Complex.t, complex64_elt> = "Array"

@new external int8_signed: int => buffer<int, int8_signed_elt> = "Int8Array"

@new external int8_unsigned: int => buffer<int, int8_unsigned_elt> = "Uint8Array"

@new external int16_signed: int => buffer<int, int16_signed_elt> = "Int16Array"

@new external int16_unsigned: int => buffer<int, int16_unsigned_elt> = "Uint16Array"

@new external int: int => buffer<int, int_elt> = "Int32Array"

@new external int32: int => buffer<int32, int32_elt> = "Int32Array"

@new external int64: int => buffer<int64, int64_elt> = "BigInt64Array"

@new external nativeint: int => buffer<int32, nativeint_elt> = "Int32Array"

@new external char: int => buffer<char, int8_unsigned_elt> = "Int64Array"
