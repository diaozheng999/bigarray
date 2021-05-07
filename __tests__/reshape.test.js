const Genarray = require("../lib/js/src/genarray_for_testing.bs");
const Array0 = require("../lib/js/src/array0_for_testing.bs");
const Types = require("../lib/js/src/types.bs");

const Reshape = require("../lib/js/src/reshape_for_testing.bs");

/**
 * Fixes array indices for both
 */
function _l(array, idx) {
  if (array.layout) {
    let n_array = [];
    for (let i = idx.length - 1; i >= 0; --i) {
      n_array.push(idx[i] + 1);
    }
    return n_array;
  }
  return idx;
}

/**
 * Fixes array indices for both
 * @param {number} layout
 * @param {number[]} idx
 */
function _dim(layout, idx) {
  if (layout) {
    let n_array = [];
    for (let i = idx.length - 1; i >= 0; --i) {
      n_array.push(idx[i]);
    }
    return n_array;
  }
  return idx;
}

function _64(array, n) {
  switch (array.kind) {
    case Types.int64:
      return [0, n];
    case Types.complex32:
    case Types.complex64:
      return { re: n, im: 0 };
    default:
      return n;
  }
}

function __64_(array, n) {
  switch (array.kind) {
    case Types.int64:
      return [0, n >>> 0];
    case Types.int8_signed:
      if (n > 127) {
        return -256 + n;
      }
      return n;
    case Types.complex32:
    case Types.complex64:
      return { re: n, im: 0 };
    default:
      return n;
  }
}

function __64(array, n) {
  switch (array.kind) {
    case Types.int64:
      return [0, n >>> 0];

    case Types.complex32:
    case Types.complex64:
      return { re: n, im: 0 };
    default:
      return n;
  }
}

/**
 *
 * @param {require("@nasi/bigarray-runtime").C} array
 * @param {*} n
 * @param {*} v
 */
function fill(array, n, v) {
  for (let i = 0; i < n; ++i) {
    array.buffer.setValue(i, __64_(array, v || i));
  }
}
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
    label               | layout
    ${"c_layout"}       | ${Types.c_layout}
    ${"fortran_layout"} | ${Types.fortran_layout}
  `("layout $label", ({ layout }) => {
    test("valid reshape", () => {
      const array = Genarray.create(kind, layout, [3, 4, 5]);
      const array1 = Reshape.reshape(array, [20, 3]);
      expect(Genarray.size_in_bytes(array1)).toBe(
        Genarray.size_in_bytes(array)
      );
      expect(array.buffer.buffer).toBe(array1.buffer.buffer);
    });

    test("invalid reshape, less", () => {
      const array = Genarray.create(kind, layout, [3, 4, 5]);
      expect(() => Reshape.reshape(array, [20, 2])).toThrow();
    });

    test("invalid reshape, greater", () => {
      const array = Genarray.create(kind, layout, [3, 4, 5]);
      expect(() => Reshape.reshape(array, [61])).toThrow();
    });

    test("reshape0", () => {
      const array = Genarray.create(kind, layout, []);
      const array1 = Reshape.reshape_0(array);
      expect(Genarray.size_in_bytes(array)).toBe(Array0.size_in_bytes(array1));
    });
  });
});
