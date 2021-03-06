import { TypedArray, TypedArrayConstructor } from "./TypedArray";

export interface Pack<T, U> {
  unpack(lo: U, hi: U): T;
  pack0(value: T): U;
  pack1(value: T): U;
  creator: TypedArrayConstructor<U>;
  kind: number;
}

export function MakeStruct<T, U>({
  unpack,
  pack0,
  pack1,
  creator,
  kind,
}: Pack<T, U>) {
  return class Struct implements TypedArray<T> {
    static BYTES_PER_ELEMENT = creator.BYTES_PER_ELEMENT * 2;
    static get [Symbol.species]() {
      return Struct;
    }

    readonly byteLength: number;
    readonly byteOffset: number;
    readonly buffer: ArrayBufferLike;
    readonly length: number;
    readonly kind = kind;
    readonly BYTES_PER_ELEMENT = Struct.BYTES_PER_ELEMENT;

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
        this.view = this.constructWithBuffer(
          arg0,
          byteOffset || 0,
          length || 0,
        );
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

    subarray(begin: number, end: number) {
      const start = begin;
      const byteOffset = creator.BYTES_PER_ELEMENT * (start << 1);
      const length = end - start;
      return new Struct(this.buffer, byteOffset + this.byteOffset, length);
    }

    set(array: any) {
      if (typeof array.view !== "undefined") {
        this.view.set(array.view);
      } else {
        const len = array.length;
        for (let i = 0; i < len; ++i) {
          this.setValue(i, array[i]);
        }
      }
    }

    setValue(idx: number, value: T) {
      const i = idx << 1;
      this.view.setValue(i, pack0(value));
      this.view.setValue(i + 1, pack1(value));
    }

    fill(value: T) {
      const even = pack0(value);
      const odd = pack1(value);
      for (let i = 0; i < this.view.length; i += 2) {
        this.view.setValue(i, even);
        this.view.setValue(i + 1, odd);
      }
    }
  };
}
