import { Complex } from "./Complex64Array";
import Float32Array from "./Float32Array";
import { MakeStruct } from "./TwoElementStructArray";

const Complex32Array = MakeStruct({
  unpack(re: number, im: number) {
    return { re, im };
  },
  pack0({ re }: Complex) {
    return re;
  },
  pack1({ im }: Complex) {
    return im;
  },
  creator: Float32Array,
});

export default Complex32Array;
