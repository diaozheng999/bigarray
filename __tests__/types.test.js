const Types = require("../lib/js/src/types.bs");

test.each`
  label               | kind                    | size
  ${"Float32"}        | ${Types.float32}        | ${4}
  ${"Float64"}        | ${Types.float64}        | ${8}
  ${"Complex32"}      | ${Types.complex32}      | ${8}
  ${"Complex64"}      | ${Types.complex64}      | ${16}
  ${"Int8_signed"}    | ${Types.int8_signed}    | ${1}
  ${"Int8_unsigned"}  | ${Types.int8_unsigned}  | ${1}
  ${"Int16_signed"}   | ${Types.int16_signed}   | ${2}
  ${"Int16_unsigned"} | ${Types.int16_unsigned} | ${2}
  ${"Int"}            | ${Types.$$int}          | ${4}
  ${"Int32"}          | ${Types.int32}          | ${4}
  ${"Int64"}          | ${Types.int64}          | ${8}
  ${"Nativeint"}      | ${Types.nativeint}      | ${4}
  ${"Char"}           | ${Types.$$char}         | ${1}
`("test expect size for $label", ({ kind, size }) => {
  expect(Types.kind_size_in_bytes(kind)).toBe(size);
});
