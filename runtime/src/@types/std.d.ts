declare module "@rescript/std/lib/js/caml_hash_primitive" {
  export function caml_hash_mix_int(state: number, int: number): number;
  export function caml_hash_mix_string(state: number, string: string): number;
  export function caml_hash_mix_final(state: number): number;
}

declare module "@rescript/std/lib/js/caml_int64" {
  export type int64 = [number, number];
  export function mk(lo: number, hi: number): int64;
  export const min_int: int64;
  export const max_int: int64;
  export const one: int64;
  export const zero: int64;
  export const neg_one: int64;
  export function of_int32(lo: number): int64;
  export function to_int32(n: int64): number;
  export function add(a: int64, b: int64): int64;
  export function neg(n: int64): int64;
  export function sub(a: int64, b: int64): int64;
  export function lsl_(n: int64, b: number): int64;
  export function lsr_(n: int64, b: number): int64;
  export function asr_(n: int64, b: number): int64;
  export function is_zero(n: int64): boolean;
  export function mul(a: int64, b: int64): int64;
  export function xor(a: int64, b: int64): int64;
  export function or_(a: int64, b: int64): int64;
  export function and_(a: int64, b: int64): int64;
  export function ge(a: int64, b: int64): boolean;
  export function eq(a: int64, b: int64): boolean;
  export function neq(a: int64, b: int64): boolean;
  export function lt(a: int64, b: int64): boolean;
  export function gt(a: int64, b: int64): boolean;
  export function le(a: int64, b: int64): boolean;
  export function equal_null(a: int64, b: int64 | null): boolean;
  export function equal_undefined(a: int64, b?: int64): boolean;
  export function equal_nullable(a: int64, b?: int64 | null): boolean;
  export function min(a: int64, b: int64): int64;
  export function max(a: int64, b: int64): int64;
  export function to_float(n: int64): number;
  export function of_float(n: number): int64;
  export function div(a: int64, b: int64): int64;
  export function mod_(a: int64, b: int64): int64;
  export function compare(a: int64, b: int64): number;
  export function float_of_bits(n: int64): number;
  export function bits_of_float(f: number): int64;
  export function div_mod(a: int64, b: int64): [int64, int64];
  export function to_hex(n: int64): string;
  export function to_string(n: int64): string;
}
