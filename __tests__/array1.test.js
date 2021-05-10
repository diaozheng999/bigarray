const Array1 = require("../lib/js/src/array1_for_testing.bs");
const Types = require("../lib/js/src/types.bs");

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
    describe("create", () => {
      test("size 0", () => {
        const array = Array1.create(kind, layout, 0);
        expect(Array1.dim(array)).toBe(0);
        expect(Array1.kind(array)).toBe(kind);
        expect(Array1.layout(array)).toBe(layout);
        expect(Array1.size_in_bytes(array)).toBe(0);
      });

      test("normal size", () => {
        const array = Array1.create(kind, layout, 5);
        expect(Array1.dim(array)).toBe(5);
        expect(Array1.kind(array)).toBe(kind);
        expect(Array1.layout(array)).toBe(layout);
        expect(Array1.size_in_bytes(array)).toBe(5 * size);
      });
    });

    test("change_layout same", () => {
      const array = T.build(kind, layout, [5], 5);
      const array2 = Array1.change_layout(array, layout);
      expect(array2.buffer).toBe(array.buffer);
      expect(array2).toHaveValueAt([0], 0);
      expect(array2).toHaveValueAt([1], 1);
      expect(array2).toHaveValueAt([2], 2);
      expect(array2).toHaveValueAt([3], 3);
      expect(array2).toHaveValueAt([4], 4);
    });

    test("change_layout different", () => {
      const array = T.build(kind, +!layout, [5], 5);
      const array2 = Array1.change_layout(array, layout);
      expect(array2.buffer).toBe(array.buffer);
      expect(array2).toHaveValueAt([0], 0);
      expect(array2).toHaveValueAt([1], 1);
      expect(array2).toHaveValueAt([2], 2);
      expect(array2).toHaveValueAt([3], 3);
      expect(array2).toHaveValueAt([4], 4);
    });

    test("of_array", () => {
      const array = Array1.of_array(
        kind,
        layout,
        T.map(kind, [1, 2, 3, 4, 5, 6])
      );
      expect(array).toHaveBuffer([1, 2, 3, 4, 5, 6]);
    });

    test("sub all", () => {
      const array = T.build(kind, layout, [5], 5);
      const array1 = Array1.sub(array, 0, 5);
      expect(array1).toHaveBuffer(array);
    });

    test("sub some", () => {
      const array = T.build(kind, layout, [5], 5);
      const array1 = Array1.sub(array, 1, 4);
      expect(array).toHaveBufferInRange(1, 5, array1);
    });
  });

  describe.each`
    method
    ${"get"}
    ${"unsafe_get"}
  `("$method", ({ method }) => {
    test("c_layout", () => {
      const array = T.build(kind, Types.c_layout, [5], 5);
      expect(Array1[method](array, 0)).toHaveValueOf(array, 0);
      expect(Array1[method](array, 1)).toHaveValueOf(array, 1);
      expect(Array1[method](array, 2)).toHaveValueOf(array, 2);
      expect(Array1[method](array, 3)).toHaveValueOf(array, 3);
      expect(Array1[method](array, 4)).toHaveValueOf(array, 4);
    });

    test("fortran_layout", () => {
      const array = T.build(kind, Types.fortran_layout, [5], 5);
      expect(Array1[method](array, 1)).toHaveValueOf(array, 0);
      expect(Array1[method](array, 2)).toHaveValueOf(array, 1);
      expect(Array1[method](array, 3)).toHaveValueOf(array, 2);
      expect(Array1[method](array, 4)).toHaveValueOf(array, 3);
      expect(Array1[method](array, 5)).toHaveValueOf(array, 4);
    });
  });

  describe("bounds and errors", () => {
    test("get c_layout bounds", () => {
      const array = T.build(kind, Types.c_layout, [5], 5);
      expect(() => Array1.get(array, -1)).toThrow();
      expect(() => Array1.get(array, 0)).not.toThrow();
      expect(() => Array1.get(array, 1)).not.toThrow();
      expect(() => Array1.get(array, 4)).not.toThrow();
      expect(() => Array1.get(array, 5)).toThrow();
      expect(() => Array1.get(array, 6)).toThrow();
    });

    test("set c_layout bounds", () => {
      const array = T.build(kind, Types.c_layout, [5], 5);
      const value = T.unpackValue(array, 107);
      expect(() => Array1.set(array, -1, value)).toThrow();
      expect(() => Array1.set(array, 0, value)).not.toThrow();
      expect(() => Array1.set(array, 1, value)).not.toThrow();
      expect(() => Array1.set(array, 4, value)).not.toThrow();
      expect(() => Array1.set(array, 5, value)).toThrow();
      expect(() => Array1.set(array, 6, value)).toThrow();
    });

    test("get fortran_layout bounds", () => {
      const array = T.build(kind, Types.fortran_layout, [5], 5);
      expect(() => Array1.get(array, -1)).toThrow();
      expect(() => Array1.get(array, 0)).toThrow();
      expect(() => Array1.get(array, 1)).not.toThrow();
      expect(() => Array1.get(array, 4)).not.toThrow();
      expect(() => Array1.get(array, 5)).not.toThrow();
      expect(() => Array1.get(array, 6)).toThrow();
    });

    test("set fortran_layout bounds", () => {
      const array = T.build(kind, Types.fortran_layout, [5], 5);
      const value = T.unpackValue(array, 107);
      expect(() => Array1.set(array, -1, value)).toThrow();
      expect(() => Array1.set(array, 0, value)).toThrow();
      expect(() => Array1.set(array, 1, value)).not.toThrow();
      expect(() => Array1.set(array, 4, value)).not.toThrow();
      expect(() => Array1.set(array, 5, value)).not.toThrow();
      expect(() => Array1.set(array, 6, value)).toThrow();
    });
  });

  describe.each`
    method
    ${"set"}
    ${"unsafe_set"}
  `("$method", ({ method }) => {
    test("c_layout", () => {
      const array = T.build(kind, Types.c_layout, [5], 5);
      Array1[method](array, 1, T.unpackValue(array, 107));
      expect(array).toHaveValueAt([0], 0);
      expect(array).toHaveValueAt([1], 107);
      expect(array).toHaveValueAt([2], 2);
      expect(array).toHaveValueAt([3], 3);
      expect(array).toHaveValueAt([4], 4);
    });

    test("fortran_layout", () => {
      const array = T.build(kind, Types.fortran_layout, [5], 5);
      Array1[method](array, 1, T.unpackValue(array, 107));
      expect(array).toHaveValueAt([0], 107);
      expect(array).toHaveValueAt([1], 1);
      expect(array).toHaveValueAt([2], 2);
      expect(array).toHaveValueAt([3], 3);
      expect(array).toHaveValueAt([4], 4);
    });
  });
});
