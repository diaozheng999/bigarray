import { TypedArray } from "./TypedArray";

import Int32TypedArray from "./Int32Array";

export default class NativeintArray
  extends Int32TypedArray
  implements TypedArray<number> {
  static get [Symbol.species]() {
    return NativeintArray;
  }
  readonly kind = 7;
}
