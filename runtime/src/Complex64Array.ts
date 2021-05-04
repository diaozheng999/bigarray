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

  pack({ re, im }: Complex) {
    return [re, im];
  },

  creator: Float64Array,
});

export default Complex64Array;
