import { TypedArray } from "./TypedArray";

export default class Int8TypedArray
  extends Int8Array
  implements TypedArray<number> {
  static get [Symbol.species]() {
    return Int8TypedArray;
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
