import { C } from "./C";
import { create } from ".";

function rotateForFortran(idx: number[]) {
  const n = [];
  for (let i = idx.length - 1; i >= 0; --i) {
    n.push(idx[i] + 1);
  }
  return n;
}

function rotateDimensionForFortran(idx: number[]) {
  const n = [];
  for (let i = idx.length - 1; i >= 0; --i) {
    n.push(idx[i]);
  }
  return n;
}

function getIdx(array: C<unknown>, idx: number[]) {
  return array.layout ? rotateForFortran(idx) : idx;
}

function wrapInt(value: number, min: number, max: number) {
  const delta = (value - min) % (max - min + 1);
  return min + delta;
}

function wrapFloat(value: number, min: number, max: number) {
  if (isNaN(value)) {
    return NaN;
  }
  if (value >= 0) {
    if (value < min) {
      return 0;
    }
    if (value > max) {
      return Infinity;
    }
  } else {
    if (value > -min) {
      return -0;
    }
    if (value < -max) {
      return -Infinity;
    }
  }
  return value;
}

function unpackValue(array: C<unknown>, value: any, wrap = true) {
  switch (array.buffer.kind) {
    case 0:
      if (wrap) {
        return wrapInt(value, -128, 127);
      }
      return value;
    case 1:
    case 2:
      if (wrap) {
        return wrapInt(value, 0, 255);
      }
      return value;
    case 3:
      if (wrap) {
        return wrapInt(value, -32768, 32767);
      }
      return value;
    case 4:
      if (wrap) {
        return wrapInt(value, 0, 65535);
      }
      return value;
    case 5:
    case 6:
    case 7:
      if (wrap) {
        return wrapInt(value, -2147483648, 2147483647);
      }
      return value;
    case 8:
      if (wrap) {
        return wrapFloat(value, 1.175494351e-38, 3.402823466e38);
      }
      return value;
    case 9:
      return {
        re: wrap ? wrapFloat(value, 1.175494351e-38, 3.402823466e38) : value,
        im: 0,
      };
    case 10: // Int64
      return [0, value >>> 0];
    case 11:
      return value;
    case 12:
      return { re: value, im: 0 };
    default:
      throw new TypeError("Unknown kind.");
  }
}

function compareValue(array: C<unknown>, unpacked: any, value: number) {
  switch (array.buffer.kind) {
    case 10:
      return unpacked[0] === 0 && unpacked[1] === value >>> 0;
    case 9:
    case 12:
      return unpacked.re === value && unpacked.im === value;
    default:
      return unpacked === value;
  }
}

function not(pass: boolean) {
  if (pass) {
    return " not";
  }
  return "";
}

function expectation(array: C<unknown>, value: number) {
  switch (array.buffer.kind) {
    case 10:
      return `${value}n`;
    case 9:
    case 12:
      return `${value} + 0.0i`;
    default:
      return `${value}`;
  }
}

function printResult(array: C<unknown>, value: any) {
  switch (array.buffer.kind) {
    case 10:
      const p = (BigInt(value[0]) << BigInt(32)) | BigInt(value[1]);
      return `${p}`;
    case 9:
    case 12:
      return `${value.re} + ${value.im}i`;
    default:
      return `${value}`;
  }
}

export function build(
  kind: number,
  layout: number,
  dimensions: number[],
  fill: number | Iterable<unknown> | ArrayLike<unknown>,
) {
  const value = create(
    kind,
    layout,
    layout ? rotateDimensionForFortran(dimensions) : dimensions,
  );
  if (typeof fill === "number") {
    for (let i = 0; i < fill; ++i) {
      value.buffer.setValue(i, unpackValue(i, 0));
    }
  } else {
    value.blitArray(Array.from(fill));
  }
  return value;
}

expect.extend({
  toHaveValueAt(array: C<unknown>, idx: number[], value: number) {
    const rotated = getIdx(array, idx);
    const unpacked: any = array.get(rotated);
    const pass = compareValue(array, unpacked, value);
    return {
      pass,
      message: () =>
        `expect array[${rotated.join(",")}] ${not(pass)}to be ${expectation(
          array,
          value,
        )}. Received ${printResult(array, value)}.`,
    };
  },
});

export const compat = {
  _l: getIdx,
  _dim(layout: number, idx: number[]) {
    return layout ? rotateDimensionForFortran(idx) : idx;
  },
  _64(array: C<unknown>, n: number) {
    return unpackValue(array, n, false);
  },
  __64_: unpackValue,
  __64(array: C<unknown>, n: number) {
    return unpackValue(array, n, false);
  },
};
