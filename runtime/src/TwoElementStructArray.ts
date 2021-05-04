import { TypedArray, TypedArrayConstructor } from "./TypedArray";

export interface Pack<T, U> {
  unpack(lo: U, hi: U): T;
  pack0(value: T): U;
  pack1(value: T): U;
  creator: TypedArrayConstructor<U>;
}

export function MakeStruct<T, U>({unpack, pack0, pack1, creator}: Pack<T, U>) {
  return class Struct implements TypedArray<T> {
    static BYTES_PER_ELEMENT = creator.BYTES_PER_ELEMENT * 2;
    static get [Symbol.species]() {
      return Struct;
    }

    readonly byteLength: number;
    readonly byteOffset: number;
    readonly buffer: ArrayBufferLike;
    readonly length: number;

    view: TypedArray<U>;

    constructor(length: number);
    constructor(buffer: ArrayBufferLike, byteOffset: number, length: number);
    constructor(
      arg0: number | ArrayBufferLike,
      byteOffset?: number,
      length?: number,
    ) {
      if (typeof arg0 === "number") {
        this.view = this.construct(arg0);
        this.length = arg0;
      } else {
        this.view = this.constructWithBuffer(arg0, byteOffset || 0, length || 0);
        this.length = length || 0;
      }
      this.byteLength = this.view.byteLength;
      this.byteOffset = this.view.byteOffset;
      this.buffer = this.view.buffer;
    }

    constructWithBuffer = (
      buffer: ArrayBufferLike,
      byteOffset: number,
      length: number,
    ) => {
      return new creator(buffer, byteOffset, length << 1);
    };
    construct = (length: number) => {
      return new creator(length << 1);
    };

    at(idx: number): T {
      const i = idx << 1;
      const lo = this.view.at(i);
      const hi = this.view.at(i + 1);
      return unpack(lo, hi);
    }

    subarray(begin?: number, end?: number) {
      const start = begin || 0;
      const byteOffset = creator.BYTES_PER_ELEMENT * (start << 1);
      const length = (end || this.length) - start;
      return new Struct(this.buffer, byteOffset + this.byteOffset, length);
    }

    set(array: any, offset?: number) {
      const ofs = offset ? offset << 1 : 0;
      if (typeof array.view !== "undefined") {
        this.view.set(array.view, ofs);
      } else {
        throw TypeError("Cannot set an array of different type.");
      }
    }

    setValue(idx: number, value: T) {
      const i = idx << 1;
      this.view.setValue(i, pack0(value));
      this.view.setValue(i + 1, pack1(value));
    }

  }
}
