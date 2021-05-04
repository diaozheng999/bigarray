import CharArray from "./CharArray";
import Complex32Array from "./Complex32Array";
import Complex64Array from "./Complex64Array";
import Float32Array from "./Float32Array";
import Float64Array from "./Float64Array";
import Int16Array from "./Int16Array";
import Int32Array from "./Int32Array";
import Int64Array from "./Int64Array";
import Int8Array from "./Int8Array";
import IntArray from "./IntArray";
import NativeintArray from "./NativeintArray";
import { TypedArrayConstructor } from "./TypedArray";
import Uint16Array from "./Uint16Array";
import Uint8Array from "./Uint8Array";

export const typed: TypedArrayConstructor<unknown>[] = [
  Int8Array,
  Uint8Array,
  CharArray,
  Int16Array,
  Uint16Array,
  IntArray,
  Int32Array,
  NativeintArray,
  Float32Array,
  Complex32Array,
  Int64Array,
  Float64Array,
  Complex64Array,
];

export {
  Int8Array,
  Uint8Array,
  CharArray,
  Int16Array,
  Uint16Array,
  IntArray,
  Int32Array,
  NativeintArray,
  Float32Array,
  Complex32Array,
  Int64Array,
  Float64Array,
  Complex64Array,
};
