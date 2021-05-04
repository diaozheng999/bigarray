export interface TypedArrayConstructor<T> {
  new (length: number): TypedArray<T>;
  new (
    buffer: ArrayBufferLike,
    byteOffset: number,
    length: number,
  ): TypedArray<T>;
  BYTES_PER_ELEMENT: number;
}

export interface TypedArray<T> {
  readonly kind: number;
  readonly buffer: ArrayBufferLike;
  readonly byteLength: number;
  readonly byteOffset: number;
  readonly length: number;
  readonly BYTES_PER_ELEMENT: number;
  at(idx: number): T;
  subarray(begin?: number, end?: number): TypedArray<T>;
  set(array: ArrayLike<T> | TypedArray<T>, offset?: number): void;
  setValue(idx: number, value: T): void;
}
