const Genarray = require("../lib/js/src/genarray_for_testing.bs");
const Types = require("../lib/js/src/types.bs");

const Runtime = require("@nasi/bigarray-runtime");

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
  label               | kind                    | constructor               | size
  ${"Float32"}        | ${Types.float32}        | ${Runtime.Float32Array}   | ${4}
  ${"Float64"}        | ${Types.float64}        | ${Runtime.Float64Array}   | ${8}
  ${"Complex32"}      | ${Types.complex32}      | ${Runtime.Complex32Array} | ${8}
  ${"Complex64"}      | ${Types.complex64}      | ${Runtime.Complex64Array} | ${16}
  ${"Int8_signed"}    | ${Types.int8_signed}    | ${Runtime.Int8Array}      | ${1}
  ${"Int8_unsigned"}  | ${Types.int8_unsigned}  | ${Runtime.Uint8Array}     | ${1}
  ${"Int16_signed"}   | ${Types.int16_signed}   | ${Runtime.Int16Array}     | ${2}
  ${"Int16_unsigned"} | ${Types.int16_unsigned} | ${Runtime.Uint16Array}    | ${2}
  ${"Int"}            | ${Types.$$int}          | ${Runtime.Int32Array}     | ${4}
  ${"Int32"}          | ${Types.int32}          | ${Runtime.Int32Array}     | ${4}
  ${"Int64"}          | ${Types.int64}          | ${Runtime.Int64Array}     | ${8}
  ${"Nativeint"}      | ${Types.nativeint}      | ${Runtime.Int32Array}     | ${4}
  ${"Char"}           | ${Types.$$char}         | ${Runtime.Uint8Array}     | ${1}
`("array of $label", ({ kind, constructor, size }) => {
  test.each`
    layout_desc  | layout                  | dim_n | len    | dim             | a_dim
    ${"c"}       | ${Types.c_layout}       | ${1}  | ${10}  | ${[10]}         | ${[1]}
    ${"c"}       | ${Types.c_layout}       | ${0}  | ${1}   | ${[]}           | ${[]}
    ${"c"}       | ${Types.c_layout}       | ${4}  | ${180} | ${[5, 3, 2, 6]} | ${[36, 12, 6, 1]}
    ${"fortran"} | ${Types.fortran_layout} | ${1}  | ${10}  | ${[10]}         | ${[1]}
    ${"fortran"} | ${Types.fortran_layout} | ${0}  | ${1}   | ${[]}           | ${[]}
    ${"fortran"} | ${Types.fortran_layout} | ${4}  | ${180} | ${[5, 3, 2, 6]} | ${[30, 15, 5, 1]}
  `(
    "$layout_desc-layout constructor with dim $dim_n",
    ({ layout, len, dim, a_dim }) => {
      const array = Genarray.create(kind, layout, dim);

      expect(array.buffer).toBeInstanceOf(constructor);
      expect(array.buffer.length).toBe(len);
      expect(Genarray.layout(array)).toBe(layout);
      expect(Genarray.kind(array)).toBe(kind);
      expect(Genarray.size_in_bytes(array)).toBe(size * len);
      expect(array.range).toStrictEqual(a_dim);
    }
  );

  test.each`
    layout_desc  | layout                  | dim_n | len    | dim
    ${"c"}       | ${Types.c_layout}       | ${1}  | ${10}  | ${[10]}
    ${"c"}       | ${Types.c_layout}       | ${0}  | ${1}   | ${[]}
    ${"c"}       | ${Types.c_layout}       | ${4}  | ${180} | ${[5, 3, 2, 6]}
    ${"fortran"} | ${Types.fortran_layout} | ${1}  | ${10}  | ${[10]}
    ${"fortran"} | ${Types.fortran_layout} | ${0}  | ${1}   | ${[]}
    ${"fortran"} | ${Types.fortran_layout} | ${4}  | ${180} | ${[5, 3, 2, 6]}
  `(
    "$layout_desc-layout constructor with dim $dim_n",
    ({ layout, len, dim }) => {
      const array = Genarray.create(kind, layout, dim);
      expect(Genarray.size_in_bytes(array)).toBe(size * len);
    }
  );

  describe.each`
    dim_n | dim             | a_dim_c           | a_dim_fortran
    ${0}  | ${[]}           | ${[]}             | ${[]}
    ${1}  | ${[10]}         | ${[1]}            | ${[1]}
    ${4}  | ${[5, 3, 2, 6]} | ${[36, 12, 6, 1]} | ${[30, 15, 5, 1]}
  `(
    "layout conversion in dimension-$dim_n",
    ({ dim, a_dim_c, a_dim_fortran }) => {
      test("c -> fortran", () => {
        const c_array = Genarray.create(kind, Types.c_layout, dim);
        const fortran_array = Genarray.change_layout(
          c_array,
          Types.fortran_layout
        );
        expect(fortran_array).not.toBe(c_array);
        expect(fortran_array.layout).toBe(Types.fortran_layout);
        expect(fortran_array.range).toStrictEqual(a_dim_c);
        expect(fortran_array.buffer).toBe(c_array.buffer);
      });

      test("c -> c", () => {
        const c_array = Genarray.create(kind, Types.c_layout, dim);
        const c_array_2 = Genarray.change_layout(c_array, Types.c_layout);
        expect(c_array_2).toBe(c_array);
        expect(c_array_2.layout).toBe(Types.c_layout);
        expect(c_array_2.range).toStrictEqual(a_dim_c);
        expect(c_array_2.buffer).toBe(c_array.buffer);
      });

      test("fortran -> c", () => {
        const fortran_array = Genarray.create(kind, Types.fortran_layout, dim);
        const c_array = Genarray.change_layout(fortran_array, Types.c_layout);
        expect(c_array).not.toBe(fortran_array);
        expect(c_array.layout).toBe(Types.c_layout);
        expect(c_array.range).toStrictEqual(a_dim_fortran);
        expect(c_array.buffer).toBe(fortran_array.buffer);
      });

      test("fortran -> fortran", () => {
        const fortran_array = Genarray.create(kind, Types.fortran_layout, dim);
        const fortran_array_2 = Genarray.change_layout(
          fortran_array,
          Types.fortran_layout
        );
        expect(fortran_array_2).toBe(fortran_array);
        expect(fortran_array_2.layout).toBe(Types.fortran_layout);
        expect(fortran_array_2.range).toStrictEqual(a_dim_fortran);
        expect(fortran_array_2.buffer).toBe(fortran_array.buffer);
      });
    }
  );

  describe("getters and setters", () => {
    let array;
    beforeEach(() => {
      array = Genarray.create(kind, Types.c_layout, [2, 3, 4]);
      fill(array, 24);
    });

    test("c getter 0-dim", () => {
      const array = Genarray.create(kind, Types.c_layout, []);
      fill(array, 1, 10);
      expect(Genarray.get(array, [])).toStrictEqual(_64(array, 10));
    });

    test("c getter", () => {
      /*
      [ [ [0, 1, 2, 3],
          [4, 5, 6, 7],
          [8, 9, 10, 11] ],
        [ [12, 13, 14, 15],
          [16, 17, 18, 19],
          [20, 21, 22, 23] ] ]
      */
      expect(Genarray.get(array, [0, 0, 0])).toStrictEqual(_64(array, 0));
      expect(Genarray.get(array, [0, 0, 1])).toStrictEqual(_64(array, 1));
      expect(Genarray.get(array, [0, 1, 0])).toStrictEqual(_64(array, 4));
      expect(Genarray.get(array, [1, 0, 0])).toStrictEqual(_64(array, 12));
      expect(Genarray.get(array, [1, 2, 3])).toStrictEqual(_64(array, 23));
    });

    test("fortran getter 0-dim", () => {
      const array = Genarray.create(kind, Types.fortran_layout, []);
      fill(array, 1, 10);
      expect(Genarray.get(array, [])).toStrictEqual(_64(array, 10));
    });

    test("fortran getter", () => {
      const f_array = Genarray.change_layout(array, Types.fortran_layout);
      expect(Genarray.get(f_array, [1, 1, 1])).toStrictEqual(_64(f_array, 0));
      expect(Genarray.get(f_array, [2, 1, 1])).toStrictEqual(_64(f_array, 1));
      expect(Genarray.get(f_array, [1, 2, 1])).toStrictEqual(_64(f_array, 4));
      expect(Genarray.get(f_array, [1, 1, 2])).toStrictEqual(_64(f_array, 12));
      expect(Genarray.get(f_array, [4, 3, 2])).toStrictEqual(_64(f_array, 23));
    });

    test("c setter", () => {
      Genarray.set(array, [0, 0, 0], __64(array, 201));
      Genarray.set(array, [0, 0, 1], __64(array, 202));
      Genarray.set(array, [0, 1, 0], __64(array, 203));
      Genarray.set(array, [1, 0, 0], __64(array, 204));
      Genarray.set(array, [1, 2, 3], __64(array, 205));

      expect(array.buffer.at(0)).toStrictEqual(__64_(array, 201));
      expect(array.buffer.at(1)).toStrictEqual(__64_(array, 202));
      expect(array.buffer.at(4)).toStrictEqual(__64_(array, 203));
      expect(array.buffer.at(12)).toStrictEqual(__64_(array, 204));
      expect(array.buffer.at(17)).toStrictEqual(__64_(array, 17));
      expect(array.buffer.at(23)).toStrictEqual(__64_(array, 205));
    });

    test("fortran setter", () => {
      const f_array = Genarray.change_layout(array, Types.fortran_layout);
      Genarray.set(f_array, [1, 1, 1], __64(f_array, 201));
      Genarray.set(f_array, [2, 1, 1], __64(f_array, 202));
      Genarray.set(f_array, [1, 2, 1], __64(f_array, 203));
      Genarray.set(f_array, [1, 1, 2], __64(f_array, 204));
      Genarray.set(f_array, [4, 3, 2], __64(f_array, 205));

      expect(f_array.buffer.at(0)).toStrictEqual(__64_(f_array, 201));
      expect(f_array.buffer.at(1)).toStrictEqual(__64_(f_array, 202));
      expect(f_array.buffer.at(4)).toStrictEqual(__64_(f_array, 203));
      expect(f_array.buffer.at(12)).toStrictEqual(__64_(f_array, 204));
      expect(f_array.buffer.at(17)).toStrictEqual(__64_(f_array, 17));
      expect(f_array.buffer.at(23)).toStrictEqual(__64_(f_array, 205));
    });
  });

  describe.each`
    label                  | layout                  | sub
    ${"c sub_left"}        | ${Types.c_layout}       | ${"sub_left"}
    ${"fortran sub_right"} | ${Types.fortran_layout} | ${"sub_right"}
  `("$label", ({ layout, sub }) => {
    test("0", () => {
      const array = Genarray.create(kind, layout, []);
      expect(() => Genarray[sub](array, 0, 1)).toThrow();
    });
    test("1", () => {
      const array = Genarray.create(kind, layout, [10]);
      fill(array, 10);
      const slice = Genarray[sub](array, 2, 3);
      expect(slice.buffer.buffer).toBe(array.buffer.buffer);
      expect(slice.buffer.length).toBe(3);
      expect(slice.buffer.byteOffset).toBe(2 * size);

      if (layout === Types.fortran_layout) {
        expect(Genarray.get(slice, [1])).toStrictEqual(
          Genarray.get(array, [3])
        );
      } else {
        expect(Genarray.get(slice, [0])).toStrictEqual(
          Genarray.get(array, [2])
        );
      }
    });

    test("multi-dimension", () => {
      const array = Genarray.create(kind, layout, [5, 6, 7]);
      fill(array, 210);
      const slice = Genarray[sub](array, 2, 3);
      expect(slice.buffer.buffer).toBe(array.buffer.buffer);

      if (layout === Types.fortran_layout) {
        expect(Genarray.get(slice, [2, 3, 1])).toStrictEqual(
          Genarray.get(array, [2, 3, 3])
        );
      } else {
        expect(Genarray.get(slice, [0, 1, 2])).toStrictEqual(
          Genarray.get(array, [2, 1, 2])
        );
      }
    });

    test("double slice", () => {
      const array = Genarray.create(kind, layout, [8, 8, 8]);
      fill(array, 512);
      const slice1 = Genarray[sub](array, 2, 4);
      const slice2 = Genarray[sub](slice1, 2, 2);
      expect(slice2.buffer.buffer).toBe(array.buffer.buffer);
      expect(slice2.buffer.byteOffset).toBe(256 * size);
      if (layout === Types.fortran_layout) {
        expect(Genarray.get(slice2, [2, 3, 1])).toStrictEqual(
          Genarray.get(array, [2, 3, 5])
        );
      } else {
        expect(Genarray.get(slice2, [0, 1, 2])).toStrictEqual(
          Genarray.get(array, [4, 1, 2])
        );
      }
    });
  });

  describe.each`
    label                    | layout                  | slice
    ${"c slice_left"}        | ${Types.c_layout}       | ${"slice_left"}
    ${"fortran slice_right"} | ${Types.fortran_layout} | ${"slice_right"}
  `("$label", ({ layout, slice }) => {
    test("slicing 0 dimensions", () => {
      const array = Genarray.create(kind, layout, []);
      const sliced = Genarray[slice](array, []);
      expect(Genarray.size_in_bytes(sliced)).toBe(size);
      Genarray.set(sliced, [], __64_(sliced, 107));
      expect(Genarray.get(array, [])).toStrictEqual(__64(array, 107));
    });

    test("slicing empty dimension", () => {
      const array = Genarray.create(kind, layout, _dim(layout, [3, 4, 5]));
      const sliced = Genarray[slice](array, []);
      expect(Genarray.size_in_bytes(sliced)).toBe(60 * size);
      Genarray.set(sliced, _l(sliced, [0, 1, 2]), __64_(sliced, 117));
      expect(Genarray.get(array, _l(array, [0, 1, 2]))).toStrictEqual(
        __64(array, 117)
      );
    });

    test("slicing all dimensions", () => {
      const array = Genarray.create(kind, layout, _dim(layout, [3, 4, 5]));
      const sliced = Genarray[slice](array, _l(array, [0, 1, 2]));
      Genarray.set(sliced, [], __64_(sliced, 117));
      expect(Genarray.size_in_bytes(sliced)).toBe(size);
      expect(Genarray.get(array, _l(array, [0, 1, 2]))).toStrictEqual(
        __64(array, 117)
      );
    });

    test("slicing some dimensions", () => {
      const array = Genarray.create(kind, layout, _dim(layout, [3, 4, 5]));
      const sliced = Genarray[slice](array, _l(array, [0, 1]));
      Genarray.set(sliced, _l(array, [2]), __64_(sliced, 117));
      expect(Genarray.size_in_bytes(sliced)).toBe(5 * size);
      expect(Genarray.get(array, _l(array, [0, 1, 2]))).toStrictEqual(
        __64(array, 117)
      );
    });
  });

  describe.each`
    label        | layout                  | d
    ${"c"}       | ${Types.c_layout}       | ${"left"}
    ${"fortran"} | ${Types.fortran_layout} | ${"right"}
  `("$label layout fill", ({ layout, d }) => {
    test("fill normally", () => {
      const array = Genarray.create(kind, layout, _dim(layout, [2, 3, 4]));
      Genarray.fill(array, __64_(array, 107));
      const res = __64(array, 107);
      for (let i = 0; i < 24; ++i) {
        expect(array.buffer.at(i)).toStrictEqual(res);
      }
    });
    test("fill sub", () => {
      const array = Genarray.create(kind, layout, _dim(layout, [2, 3, 4]));
      const sub = Genarray[`sub_${d}`](array, 0, 1);
      Genarray.fill(array, __64_(array, 2));
      Genarray.fill(sub, __64_(array, 107));
      const res0 = __64(array, 2);
      const res1 = __64(array, 107);

      expect(Genarray.get(array, _l(array, [0, 0, 0]))).toStrictEqual(res1);
      expect(Genarray.get(array, _l(array, [1, 0, 0]))).toStrictEqual(res0);
    });

    test("fill slice", () => {
      const array = Genarray.create(kind, layout, _dim(layout, [2, 3, 4]));
      const sub = Genarray[`slice_${d}`](array, _l(array, [1, 1]));
      Genarray.fill(array, __64_(array, 2));
      Genarray.fill(sub, __64_(array, 107));
      const res0 = __64(array, 2);
      const res1 = __64(array, 107);

      expect(Genarray.get(array, _l(array, [0, 0, 0]))).toStrictEqual(res0);
      expect(Genarray.get(array, _l(array, [1, 0, 0]))).toStrictEqual(res0);
      expect(Genarray.get(array, _l(array, [1, 1, 0]))).toStrictEqual(res1);
      expect(Genarray.get(array, _l(array, [1, 1, 3]))).toStrictEqual(res1);
      expect(Genarray.get(array, _l(array, [1, 2, 0]))).toStrictEqual(res0);
      expect(Genarray.get(array, _l(array, [1, 2, 3]))).toStrictEqual(res0);
    });
  });
  describe.each`
    label        | layout                  | d
    ${"c"}       | ${Types.c_layout}       | ${"left"}
    ${"fortran"} | ${Types.fortran_layout} | ${"right"}
  `("$label layout blit", ({ layout, d }) => {
    test("blit diff 0-dim", () => {
      const a = Genarray.create(kind, layout, []);
      const b = Genarray.create(kind, layout, []);
      Genarray.fill(a, __64_(a, 117));
      Genarray.blit(b, a);
      expect(Genarray.get(b, [])).toStrictEqual(__64(b, 117));
    });

    test("blit slice", () => {
      const a = Genarray.create(kind, layout, _dim(layout, [2, 3, 4]));
      const row = Genarray.create(kind, layout, _dim(layout, [3, 4]));
      const slice0 = Genarray[`slice_${d}`](a, _l(a, [0]));
      Genarray.fill(row, __64_(row, 107));
      Genarray.blit(slice0, row);
      const slice1 = Genarray[`slice_${d}`](a, _l(a, [1]));
      Genarray.fill(row, __64_(row, 117));
      Genarray.blit(slice1, row);

      const res0 = __64(row, 107);
      const res1 = __64(row, 117);

      expect(Genarray.get(a, _l(a, [0, 0, 0]))).toStrictEqual(res0);
      expect(Genarray.get(a, _l(a, [0, 1, 2]))).toStrictEqual(res0);
      expect(Genarray.get(a, _l(a, [0, 2, 3]))).toStrictEqual(res0);
      expect(Genarray.get(a, _l(a, [1, 0, 0]))).toStrictEqual(res1);
      expect(Genarray.get(a, _l(a, [1, 1, 2]))).toStrictEqual(res1);
      expect(Genarray.get(a, _l(a, [1, 2, 3]))).toStrictEqual(res1);
    });
  });
});
