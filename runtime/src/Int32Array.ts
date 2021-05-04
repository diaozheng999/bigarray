import { TypedArray } from "./TypedArray";

export default class Int32TypedArray
  extends Int32Array
  implements TypedArray<number> {
  static get [Symbol.species]() {
    return Int32TypedArray;
  }
  at(idx: number) {
    return this[idx];
  }
  setValue(idx: number, value: number) {
    this[idx] = value;
  }
  // @ts-expect-error
  declare subarray: (begin?: number, end?: number) => TypedArray<number>;
}
