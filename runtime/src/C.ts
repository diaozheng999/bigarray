import { invalid_arg } from "@rescript/std/lib/js/pervasives";
import { TypedArray } from "./drivers/TypedArray";

export class C<T> {
  readonly buffer: TypedArray<T>;

  dimensions: readonly number[];
  range: number[];

  readonly layout: number = 0;

  ctor = C;

  constructor(
    buffer: TypedArray<T>,
    dimensions: readonly number[],
    range?: number[],
  ) {
    this.buffer = buffer;
    this.dimensions = dimensions;
    this.range = range || Array(dimensions.length);
    if (!range) {
      dimensions.reduceRight(this.dimensionReducer, 1);
    }
  }

  byteSize() {
    return this.buffer.length * this.buffer.BYTES_PER_ELEMENT;
  }

  nthDim(n: number) {
    return this.dimensions[n];
  }

  get ndim() {
    return this.dimensions.length;
  }

  get kind() {
    return this.buffer.kind;
  }

  get0() {
    return this.buffer.at(0);
  }

  get1(i: number) {
    this.validateRange(i, 0);
    return this.unsafeGet1(i);
  }

  get2(i: number, j: number) {
    this.validateRange(i, 0);
    this.validateRange(j, 1);
    return this.unsafeGet2(i, j);
  }

  get3(i: number, j: number, k: number) {
    this.validateRange(i, 0);
    this.validateRange(j, 1);
    this.validateRange(k, 2);
    return this.unsafeGet3(i, j, k);
  }

  get(dims: number[]) {
    const idx = dims.reduce(this.accumulator, 0);
    return this.buffer.at(idx);
  }

  unsafeGet1(i: number) {
    return this.buffer.at(i);
  }

  unsafeGet2(i: number, j: number) {
    return this.buffer.at(i * this.range[0] + j);
  }

  unsafeGet3(i: number, j: number, k: number) {
    return this.buffer.at(i * this.range[0] + j * this.range[1] + k);
  }

  set0(v: T) {
    this.buffer.setValue(0, v);
  }

  set1(i: number, v: T) {
    this.validateRange(i, 0);
    this.unsafeSet1(i, v);
  }

  set2(i: number, j: number, v: T) {
    this.validateRange(i, 0);
    this.validateRange(j, 1);
    this.unsafeSet2(i, j, v);
  }

  set3(i: number, j: number, k: number, v: T) {
    this.validateRange(i, 0);
    this.validateRange(j, 1);
    this.validateRange(k, 2);
    this.unsafeSet3(i, j, k, v);
  }

  unsafeSet1(i: number, v: T) {
    this.buffer.setValue(i, v);
  }

  unsafeSet2(i: number, j: number, v: T) {
    this.buffer.setValue(i * this.range[0] + j, v);
  }

  unsafeSet3(i: number, j: number, k: number, v: T) {
    this.buffer.setValue(i * this.range[0] + j * this.range[1] + k, v);
  }

  set(dims: number[], v: T) {
    const idx = dims.reduce(this.accumulator, 0);
    this.buffer.setValue(idx, v);
  }

  sub(ofs: number, len: number) {
    if (!this.dimensions.length || ofs < 0 || ofs + len > this.dimensions[0]) {
      invalid_arg("Range out of bounds.");
    }

    let size = this.range[0];

    let begin = size * ofs;
    let end = size * (ofs + len);

    const newDimension = this.dimensions.slice();
    newDimension[0] = len;

    return new this.ctor(
      this.buffer.subarray(begin, end),
      newDimension,
      this.range,
    );
  }

  slice(dims: number[]) {
    const fixedLength = dims.length;
    const total = this.dimensions.length;
    if (!fixedLength) {
      return this;
    }
    if (fixedLength > total) {
      invalid_arg("Cannot slice a higher dimension.");
    }
    const begin = dims.slice();
    for (let i = fixedLength; i < total; ++i) {
      begin.push(0);
    }
    const start = begin.reduce(this.accumulator, 0);
    const end = this.getNextIdxInPlace(begin, fixedLength).reduce(
      this.accumulator,
      0,
    );
    return new this.ctor(
      this.buffer.subarray(start, end),
      this.dimensions.slice(fixedLength),
      this.range.slice(fixedLength),
    );
  }

  blit(other: C<T>) {
    this.buffer.set(other.buffer);
  }

  fill(value: T) {
    this.buffer.fill(value);
  }

  validateRange = (v: number, i: number) => {
    if (v < 0 || v >= this.dimensions[i]) {
      invalid_arg("Index out of bounds.");
    }
  };

  dimensionReducer = (acc: number, v: number, i: number) => {
    this.range[i] = acc;
    return acc * v;
  };

  accumulator = (acc: number, v: number, i: number) => {
    this.validateRange(v, i);
    return acc + this.range[i] * v;
  };

  getNextIdxInPlace = (idx: number[], digit: number) => {
    for (let i = digit - 1; i >= 0; --i) {
      if (!i || idx[i] + 1 < this.dimensions[i]) {
        ++idx[i];
        return idx;
      } else {
        idx[i] = 0;
      }
    }
    return idx;
  };
}
