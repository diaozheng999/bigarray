import { C } from "./C";
import { TypedArray } from "./drivers/TypedArray";

const rotateDimension = (dims: readonly number[]) => {
  const ndims = [];
  for (let i = dims.length - 1; i >= 0; --i) {
    ndims.push(dims[i]);
  }
  return ndims;
};

export class Fortran<T> extends C<T> {
  ctor = Fortran;

  readonly layout = 1;

  constructor(
    buffer: TypedArray<T>,
    dimensions: readonly number[],
    range?: number[],
  ) {
    super(buffer, range ? dimensions : rotateDimension(dimensions), range);
  }

  nthDim(n: number) {
    return this.dimensions[this.dimensions.length - n - 1];
  }

  get1(i: number) {
    this.validateFortranRange(i);
    return this.unsafeGet1(i);
  }

  get2(i: number, j: number) {
    this.validateFortranRange(i, j);
    return this.unsafeGet2(i, j);
  }

  get3(i: number, j: number, k: number) {
    this.validateFortranRange(i, j, k);
    return this.unsafeGet3(i, j, k);
  }

  get(dims: number[]) {
    return super.get(this.rotate(dims));
  }

  unsafeGet1(i: number) {
    return super.unsafeGet1(i - 1);
  }

  unsafeGet2(i: number, j: number) {
    return super.unsafeGet2(j - 1, i - 1);
  }

  unsafeGet3(i: number, j: number, k: number) {
    return super.unsafeGet3(k - 1, j - 1, i - 1);
  }

  set1(i: number, v: T) {
    this.validateFortranRange(i);
    return this.unsafeSet1(i, v);
  }

  set2(i: number, j: number, v: T) {
    this.validateFortranRange(i, j);
    return this.unsafeSet2(i, j, v);
  }

  set3(i: number, j: number, k: number, v: T) {
    this.validateFortranRange(i, j, k);
    return this.unsafeSet3(i, j, k, v);
  }

  set(dims: number[], v: T) {
    return super.set(this.rotate(dims), v);
  }

  unsafeSet1(i: number, v: T) {
    return super.unsafeSet1(i - 1, v);
  }

  unsafeSet2(i: number, j: number, v: T) {
    return super.unsafeSet2(j - 1, i - 1, v);
  }

  unsafeSet3(i: number, j: number, k: number, v: T) {
    return super.unsafeSet3(k - 1, j - 1, i - 1, v);
  }

  slice1(n: number) {
    return super.slice1(n - 1);
  }

  slice2(n: number) {
    return super.slice2(n - 1);
  }

  slice(dims: number[]) {
    return super.slice(this.rotate(dims));
  }

  rotate = (dims: number[]) => {
    const ndims = [];
    for (let i = dims.length - 1; i >= 0; --i) {
      ndims.push(dims[i] - 1);
    }
    return ndims;
  };

  validateFortranRange = (...idx: number[]) => {
    let d = -1;
    for (let i = idx.length - 1; i >= 0; --i) {
      this.validateRange(idx[i] - 1, ++d);
    }
  };
}
