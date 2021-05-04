import Float64Array from "./Float64Array";
import { MakeStruct } from "./TwoElementStructArray";

export interface Complex {
  re: number;
  im: number;
}

const Complex64Array = MakeStruct({
  unpack(re: number, im: number) {
    return { re, im };
  },
  pack0({ re }: Complex) {
    return re;
  },
  pack1({ im }: Complex) {
    return im;
  },
  creator: Float64Array,
  kind: 12,
});

export default Complex64Array;
