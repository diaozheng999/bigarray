import { TypedArray } from "./TypedArray";

export default class Uint8TypedArray
  extends Uint8Array
  implements TypedArray<number> {
  static get [Symbol.species]() {
    return Uint8TypedArray;
  }
  readonly kind: number = 1;
  at(idx: number) {
    return this[idx];
  }
  setValue(idx: number, value: number) {
    this[idx] = value;
  }
  // @ts-expect-error
  declare subarray: (begin?: number, end?: number) => TypedArray<number>;
}
