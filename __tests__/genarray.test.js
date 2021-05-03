const Genarray = require("../lib/js/src/genarray.bs");
const Types = require("../lib/js/src/types.bs");

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
      return BigInt(n);
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

describe.each`
  label               | kind                    | constructor      | size
  ${"Float32"}        | ${Types.float32}        | ${Float32Array}  | ${4}
  ${"Float64"}        | ${Types.float64}        | ${Float64Array}  | ${8}
  ${"Complex32"}      | ${Types.complex32}      | ${Array}         | ${4}
  ${"Complex64"}      | ${Types.complex64}      | ${Array}         | ${8}
  ${"Int8_signed"}    | ${Types.int8_signed}    | ${Int8Array}     | ${1}
  ${"Int8_unsigned"}  | ${Types.int8_unsigned}  | ${Uint8Array}    | ${1}
  ${"Int16_signed"}   | ${Types.int16_signed}   | ${Int16Array}    | ${2}
  ${"Int16_unsigned"} | ${Types.int16_unsigned} | ${Uint16Array}   | ${2}
  ${"Int"}            | ${Types.$$int}          | ${Int32Array}    | ${4}
  ${"Int32"}          | ${Types.int32}          | ${Int32Array}    | ${4}
  ${"Int64"}          | ${Types.int64}          | ${BigInt64Array} | ${8}
  ${"Nativeint"}      | ${Types.nativeint}      | ${Int32Array}    | ${4}
  ${"Char"}           | ${Types.$$char}         | ${Uint8Array}    | ${1}
`("array of $label", ({ label, kind, constructor, size }) => {
  test.each`
    layout_desc  | layout                  | dim_n | size   | dim             | a_dim
    ${"c"}       | ${Types.c_layout}       | ${1}  | ${10}  | ${[10]}         | ${[1]}
    ${"c"}       | ${Types.c_layout}       | ${0}  | ${0}   | ${[]}           | ${[]}
    ${"c"}       | ${Types.c_layout}       | ${4}  | ${180} | ${[5, 3, 2, 6]} | ${[36, 12, 6, 1]}
    ${"fortran"} | ${Types.fortran_layout} | ${1}  | ${10}  | ${[10]}         | ${[1]}
    ${"fortran"} | ${Types.fortran_layout} | ${0}  | ${0}   | ${[]}           | ${[]}
    ${"fortran"} | ${Types.fortran_layout} | ${4}  | ${180} | ${[5, 3, 2, 6]} | ${[1, 5, 15, 30]}
  `(
    "$layout_desc-layout constructor with dim $dim_n",
    ({ layout, size, dim, a_dim }) => {
      const array = Genarray.create(kind, layout, dim);

      expect(array.buffer).toBeInstanceOf(constructor);
      expect(array.buffer.length).toBe(size);
      expect(array.layout).toBe(layout);
      expect(array.kind).toBe(kind);
      expect(array.start).toBe(0);
      expect(array.size).toBe(size);
      expect(array.a_dims).toStrictEqual(a_dim);
    }
  );

  test.each`
    layout_desc  | layout                  | dim_n | len    | dim
    ${"c"}       | ${Types.c_layout}       | ${1}  | ${10}  | ${[10]}
    ${"c"}       | ${Types.c_layout}       | ${0}  | ${0}   | ${[]}
    ${"c"}       | ${Types.c_layout}       | ${4}  | ${180} | ${[5, 3, 2, 6]}
    ${"fortran"} | ${Types.fortran_layout} | ${1}  | ${10}  | ${[10]}
    ${"fortran"} | ${Types.fortran_layout} | ${0}  | ${0}   | ${[]}
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
    ${4}  | ${[5, 3, 2, 6]} | ${[36, 12, 6, 1]} | ${[1, 5, 15, 30]}
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
        expect(fortran_array.a_dims).toStrictEqual(a_dim_fortran);
        expect(fortran_array.buffer).toBe(c_array.buffer);
      });

      test("c -> c", () => {
        const c_array = Genarray.create(kind, Types.c_layout, dim);
        const c_array_2 = Genarray.change_layout(c_array, Types.c_layout);
        expect(c_array_2).not.toBe(c_array);
        expect(c_array_2.layout).toBe(Types.c_layout);
        expect(c_array_2.a_dims).toStrictEqual(a_dim_c);
        expect(c_array_2.buffer).toBe(c_array.buffer);
      });

      test("c -> fortran", () => {
        const fortran_array = Genarray.create(kind, Types.fortran_layout, dim);
        const c_array = Genarray.change_layout(fortran_array, Types.c_layout);
        expect(c_array).not.toBe(fortran_array);
        expect(c_array.layout).toBe(Types.c_layout);
        expect(c_array.a_dims).toStrictEqual(a_dim_c);
        expect(c_array.buffer).toBe(fortran_array.buffer);
      });

      test("fortran -> fortran", () => {
        const fortran_array = Genarray.create(kind, Types.fortran_layout, dim);
        const fortran_array_2 = Genarray.change_layout(
          fortran_array,
          Types.fortran_layout
        );
        expect(fortran_array_2).not.toBe(fortran_array);
        expect(fortran_array_2.layout).toBe(Types.fortran_layout);
        expect(fortran_array_2.a_dims).toStrictEqual(a_dim_fortran);
        expect(fortran_array_2.buffer).toBe(fortran_array.buffer);
      });
    }
  );

  describe("getters and setters", () => {
    let array;
    beforeEach(() => {
      array = Genarray.create(kind, Types.c_layout, [2, 3, 4]);
      for (let i = 0; i < 24; ++i) {
        array.buffer[i] = __64_(array, i);
      }

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
    
    test("fortran getter", () => {
      /*
      [ [ [ 0, 1 ]
          [ 2, 3 ]
          [ 4, 5 ] ],
        [ [ 6, 7 ],
          [ 8, 9 ],
          [ 10, 11 ] ],
        [ [ 12, 13 ],
          [ 14, 15 ],
          [ 16, 17 ] ],
        [ [ 18, 19 ],
          [ 20, 21 ],
          [ 22, 23 ] ] ]
      */
      const f_array = Genarray.change_layout(array, Types.fortran_layout);
      expect(Genarray.get(f_array, [1, 1, 1])).toStrictEqual(_64(f_array, 0));
      expect(Genarray.get(f_array, [1, 1, 2])).toStrictEqual(_64(f_array, 6));
      expect(Genarray.get(f_array, [1, 2, 1])).toStrictEqual(_64(f_array, 2));
      expect(Genarray.get(f_array, [2, 1, 1])).toStrictEqual(_64(f_array, 1));
      expect(Genarray.get(f_array, [2, 3, 4])).toStrictEqual(_64(f_array, 23));
    });

    test("c setter", () => {
      Genarray.set(array, [0, 0, 0], __64(array, 201));
      Genarray.set(array, [0, 0, 1], __64(array, 202));
      Genarray.set(array, [0, 1, 0], __64(array, 203));
      Genarray.set(array, [1, 0, 0], __64(array, 204));
      Genarray.set(array, [1, 2, 3], __64(array, 205));

      expect(array.buffer[0]).toStrictEqual(__64_(array, 201));
      expect(array.buffer[1]).toStrictEqual(__64_(array, 202));
      expect(array.buffer[4]).toStrictEqual(__64_(array, 203));
      expect(array.buffer[12]).toStrictEqual(__64_(array, 204));
      expect(array.buffer[17]).toStrictEqual(__64_(array, 17));
      expect(array.buffer[23]).toStrictEqual(__64_(array, 205));
    })

    test("fortran setter", () => {
      const f_array = Genarray.change_layout(array, Types.fortran_layout);
      Genarray.set(f_array, [1, 1, 1], __64(f_array, 201));
      Genarray.set(f_array, [1, 1, 2], __64(f_array, 202));
      Genarray.set(f_array, [1, 2, 1], __64(f_array, 203));
      Genarray.set(f_array, [2, 1, 1], __64(f_array, 204));
      Genarray.set(f_array, [2, 3, 4], __64(f_array, 205));

      expect(f_array.buffer[0]).toStrictEqual(__64_(f_array, 201));
      expect(f_array.buffer[1]).toStrictEqual(__64_(f_array, 204));
      expect(f_array.buffer[2]).toStrictEqual(__64_(f_array, 203));
      expect(f_array.buffer[6]).toStrictEqual(__64_(f_array, 202));
      expect(f_array.buffer[17]).toStrictEqual(__64_(f_array, 17));
      expect(f_array.buffer[23]).toStrictEqual(__64_(f_array, 205));
    })
  });
});