const Array0 = require("../lib/js/src/array0_for_testing.bs");
const Types = require("../lib/js/src/types.bs");
const Runtime = require("@nasi/bigarray-runtime");

const T = require("@nasi/bigarray-runtime/lib/TestingLibrary");

describe.each`
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
`("kind $label", ({ kind, size }) => {
  describe.each`
    label        | layout                  | d
    ${"c"}       | ${Types.c_layout}       | ${"left"}
    ${"fortran"} | ${Types.fortran_layout} | ${"right"}
  `("layout $label", ({ layout }) => {
    test("create", () => {
      let array = Array0.create(kind, layout);
      expect(array.kind).toBe(kind);
      expect(Array0.size_in_bytes(array)).toBe(size);
      expect(array.layout).toBe(layout);
    });

    test("get", () => {
      let array = T.build(kind, layout, [], [192]);
      expect(Array0.get(array)).toHaveValueOf(array, 192);
    });

  });
});
