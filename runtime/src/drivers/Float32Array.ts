import { TypedArray } from "./TypedArray";

export default class Float32TypedArray
  extends Float32Array
  implements TypedArray<number> {
  static get [Symbol.species]() {
    return Float32TypedArray;
  }
  readonly kind = 8;
  at(idx: number) {
    return this[idx];
  }
  setValue(idx: number, value: number) {
    this[idx] = value;
  }
  // @ts-expect-error
  declare subarray: (begin?: number, end?: number) => TypedArray<number>;
}
