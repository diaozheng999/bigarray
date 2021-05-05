import { C } from "./C";
import { typed } from "./drivers";
import { Fortran } from "./fortran";

export {
  CharArray,
  Complex32Array,
  Complex64Array,
  Float32Array,
  Float64Array,
  Int16Array,
  Int32Array,
  Int64Array,
  Int8Array,
  IntArray,
  NativeintArray,
  Uint16Array,
  Uint8Array,
} from "./drivers";

export { C, Fortran };

const wrappers: typeof C[] = [C, Fortran];

export function create(kind: number, layout: number, dims: number[]) {
  let n = 1;
  let l = dims.length;
  for (let i = 0; i < l; ++i) {
    n *= dims[i];
  }

  const buffer = new typed[kind](n);
  return new wrappers[layout](buffer, dims);
}

export function createVariadic(
  kind: number,
  layout: number,
  ...dims: number[]
) {
  return create(kind, layout, dims);
}

export function changeLayout<T>(item: C<T>, layout: number) {
  if (layout !== item.layout) {
    return new wrappers[layout](item.buffer, item.dimensions, item.range);
  }
  return item;
}

export function constant(kind: number, layout: number, value: unknown) {
  const array = create(kind, layout, []);
  array.set0(value);
  return array;
}

export function from(kind: number, layout: number, values: unknown[]) {
  const array = create(kind, layout, [values.length]);
  array.blitArray(values);
  return array;
}

export function from2(kind: number, layout: number, values: unknown[][]) {
  const m = values.length;
  const n = values[0].length;

  const array = create(kind, layout, [m, n]);

  for (let i = 0; i < m; ++i) {
    for (let j = 0; j < n; ++j) {
      array.unsafeSet2(i + layout, j + layout, values[i][j]);
    }
  }

  return array;
}

export function from3(kind: number, layout: number, values: unknown[][][]) {
  const m = values.length;
  const n = values[0].length;
  const p = values[0][0].length;

  const array = create(kind, layout, [m, n, p]);

  for (let i = 0; i < m; ++i) {
    for (let j = 0; j < n; ++j) {
      for (let k = 0; k < p; ++k) {
        array.unsafeSet3(i + layout, j + layout, k + layout, values[i][j][k]);
      }
    }
  }

  return array;
}
