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

export { C, Fortran }

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

export function changeLayout<T>(item: C<T>, layout: number) {
  if (layout !== item.layout) {
    return new wrappers[layout](item.buffer, item.dimensions, item.range);
  }
  return item;
}
