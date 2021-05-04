import { TypedArray } from "./TypedArray";

export default class Uint16TypedArray
  extends Uint16Array
  implements TypedArray<number> {
  static get [Symbol.species]() {
    return Uint16TypedArray;
  }
  readonly kind = 4;
  at(idx: number) {
    return this[idx];
  }
  setValue(idx: number, value: number) {
    this[idx] = value;
  }
  // @ts-expect-error
  declare subarray: (begin?: number, end?: number) => TypedArray<number>;
}
