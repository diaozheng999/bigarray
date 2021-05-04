import { TypedArray } from "./TypedArray";

import Int32TypedArray from "./Int32Array";

export default class IntArray
  extends Int32TypedArray
  implements TypedArray<number> {
  static get [Symbol.species]() {
    return IntArray;
  }
  readonly kind = 5;
}
