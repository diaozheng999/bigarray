import { int64, mk } from "@rescript/std/lib/js/caml_int64";
import Int32Array from "./Int32Array";
import { MakeStruct } from "./TwoElementStructArray";

const Int64Array = MakeStruct({
  unpack: mk,
  pack0(value: int64) {
    return value[1];
  },
  pack1(value: int64) {
    return value[0];
  },
  creator: Int32Array,
  kind: 10,
});

export default Int64Array;
