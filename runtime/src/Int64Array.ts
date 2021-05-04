import { int64, mk } from "@rescript/std/lib/js/caml_int64";
import Int32Array from "./Int32Array";
import { MakeStruct } from "./TwoElementStructArray";

const Int64Array = MakeStruct({
  unpack: mk,
  pack([hi, lo]: int64) {
    return [lo, hi];
  },
  creator: Int32Array,
});

export default Int64Array;
