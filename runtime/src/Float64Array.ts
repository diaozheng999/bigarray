import { TypedArray } from "./TypedArray";

export default class Float64TypedArray
  extends Float64Array
  implements TypedArray<number> {
  static get [Symbol.species]() {
    return Float64TypedArray;
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
