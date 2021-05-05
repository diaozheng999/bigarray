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
    return super.get1(i - 1);
  }

  get2(i: number, j: number) {
    return super.get2(j - 1, i - 1);
  }

  get3(i: number, j: number, k: number) {
    return super.get3(k - 1, j - 1, i - 1);
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
    return super.set1(i - 1, v);
  }

  set2(i: number, j: number, v: T) {
    return super.set2(j - 1, i - 1, v);
  }

  set3(i: number, j: number, k: number, v: T) {
    return super.set3(k - 1, j - 1, i - 1, v);
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
}
