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
      const array = Array0.create(kind, layout);
      expect(Array0.kind(array)).toBe(kind);
      expect(Array0.size_in_bytes(array)).toBe(size);
      expect(Array0.layout(array)).toBe(layout);
    });

    test("get", () => {
      const array = T.build(kind, layout, [], [192]);
      expect(Array0.get(array)).toHaveWrappedValueOf(array, 192);
    });

    test("set", () => {
      const array = Array0.create(kind, layout);
      Array0.set(array, T.unpackValue(array, 107, false));
      expect(array).toHaveValueAt([], 107);
    });

    test("blit", () => {
      const array = Array0.create(kind, layout);
      const blitter = T.build(kind, layout, [], [103]);
      Array0.blit(array, blitter);
      expect(array).toHaveValueAt([], 103);
    });

    test("blit self", () => {
      const array = T.build(kind, layout, [], [102]);
      Array0.blit(array, array);
      expect(array).toHaveValueAt([], 102);
    });

    test("fill", () => {
      const array = Array0.create(kind, layout);
      Array0.fill(array, T.unpackValue(array, 93));
      expect(array).toHaveValueAt([], 93);
    });

    test("change layout, same", () => {
      const array = T.build(kind, layout, [], [12]);
      const array2 = Array0.change_layout(array, layout);
      expect(array2.layout).toBe(layout);
      expect(array2.kind).toBe(kind);
      expect(array2.buffer).toBe(array.buffer);
      expect(array2).toHaveValueAt([], 12);
    });

    test("change layout, different", () => {
      const array = T.build(kind, +!layout, [], [12]);
      const array2 = Array0.change_layout(array, layout);
      expect(array2.layout).toBe(layout);
      expect(array2.kind).toBe(kind);
      expect(array2.buffer).toBe(array.buffer);
      expect(array2).toHaveValueAt([], 12);
    });

    test("of_value", () => {
      const array = Array0.of_value(kind, layout, T.unpackValue(kind, 5));
      expect(array).toHaveValueAt([], 5);
    });
  });
});
