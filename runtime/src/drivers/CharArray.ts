import { TypedArray } from "./TypedArray";
import Uint8TypedArray from './Uint8Array';

export default class CharArray
  extends Uint8TypedArray
  implements TypedArray<number> {
  static get [Symbol.species]() {
    return Uint8TypedArray;
  }
  readonly kind = 2;
}
