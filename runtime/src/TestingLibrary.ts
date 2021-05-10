import { create } from ".";
import { C } from "./C";
import { TypedArray } from "./drivers/TypedArray";

function rotateForFortran(idx: number[]) {
  const n = [];
  for (let i = idx.length - 1; i >= 0; --i) {
    n.push(idx[i] + 1);
  }
  return n;
}

function rotateDimensionForFortran(idx: readonly number[]) {
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

function kindOf(v: C<unknown> | TypedArray<unknown> | number): number {
  if (typeof v === "number") {
    return v;
  }
  return v.kind;
}

export function unpackValue(
  kind: C<unknown> | TypedArray<unknown> | number,
  value: any,
  wrap = true,
) {
  switch (kindOf(kind)) {
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

export function map(kind: number, values: number[], wrap?: boolean) {
  return values.map((n) => unpackValue(kind, n, wrap));
}

function compareValue(array: C<unknown>, unpacked: any, value: number) {
  switch (array.buffer.kind) {
    case 10:
      return unpacked[0] === 0 && unpacked[1] === value >>> 0;
    case 9:
    case 12:
      return unpacked.re === value && unpacked.im === 0;
    default:
      return unpacked === value;
  }
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
  if (typeof value === "undefined") {
    return `<undefined>`;
  }
  switch (array.buffer.kind) {
    case 10:
      if (typeof value[0] === "undefined") {
        return `<undefined>`;
      }
      const p = (BigInt(value[0]) << BigInt(32)) | BigInt(value[1]);
      return p.toString();
    case 9:
    case 12:
      if (typeof value.re === "undefined") {
        return `<undefined>`;
      }
      return `${value.re} + ${value.im}i`;
    default:
      return `${value}`;
  }
}

function isIterable<T>(
  value: Iterable<T> | ArrayLike<T>,
): value is ArrayLike<T> {
  return "length" in value;
}

export function fill(
  array: C<unknown>,
  values: number | Iterable<number> | ArrayLike<number>,
) {
  if (typeof values === "number") {
    for (let i = 0; i < values; ++i) {
      array.buffer.setValue(i, unpackValue(array, i));
    }
  } else if (isIterable(values)) {
    for (let i = 0; i < values.length; ++i) {
      array.buffer.setValue(i, unpackValue(array, values[i]));
    }
  } else {
    let i = 0;
    for (const value of values) {
      array.buffer.setValue(i++, unpackValue(array, value));
    }
  }
}

export function build(
  kind: number,
  layout: number,
  dimensions: number[],
  values: number | Iterable<number> | ArrayLike<number>,
) {
  const value = create(
    kind,
    layout,
    layout ? rotateDimensionForFortran(dimensions) : dimensions,
  );
  fill(value, values);
  return value;
}

export function printKind(kind: number) {
  return [
    "Int8_signed",
    "Int8_unsigned",
    "Char",
    "Int16_signed",
    "Int16_unsigned",
    "Int",
    "Int32",
    "Nativeint",
    "Float32",
    "Complex32",
    "Int64",
    "Complex64",
  ][kind];
}

export function printLayout(layout: number) {
  return ["C_layout", "Fortran_layout"][layout];
}

export function printDimensions(a: C<unknown>) {
  const dim = a.layout ? rotateDimensionForFortran(a.dimensions) : a.dimensions;
  return `[${dim.join(", ")}]`;
}

export function printArray(a: C<unknown>) {
  let result = `Bigarray (${printKind(a.buffer.kind)}, ${printLayout(
    a.layout,
  )})`;

  result += `\n  Dimensions: ${printDimensions(a)}\n  Buffer (${a.length}):`;
  for (let i = 0; i < a.length; ++i) {
    result += `\n    ${i}: ${printResult(a, a.buffer.at(i))}`;
  }

  if (!a.length) {
    result += "\n <empty>";
  }

  return result;
}

function checkBuffer1(
  buffer1: ArrayBufferLike,
  buffer2: ArrayBufferLike,
  offset1: number,
  offset2: number,
  len: number,
) {
  const p = new Uint8Array(buffer1, offset1);
  const q = new Uint8Array(buffer2, offset2);
  for (let i = 0; i < len; ++i) {
    if (p[i] !== q[i]) {
      return i;
    }
  }
  return;
}

function checkBuffer(
  array: C<unknown>,
  values: number[],
  start: number,
  end: number,
) {
  for (let i = start; i < end; ++i) {
    if (!compareValue(array, array.buffer.at(i), values[i])) {
      return i;
    }
  }
  return;
}

function asArray(array: C<unknown>, start: number, end: number) {
  let a = [];
  for (let i = start; i < end; ++i) {
    a.push(array.buffer.at(i));
  }
  return a;
}

function buf(
  clr: jest.MatcherColorFn,
  buffer: ArrayBufferLike,
  start: number,
  idx: number,
) {
  const b = new Uint8Array(buffer, start);
  const s = Array.from(b).map((n) => n.toString(16).padStart(2, "0"));
  return `${clr`0x${s[idx]}`} (Buffer: [${clr`${s.join(" ")}`}])`;
}

function matchBuffer(
  matcher: jest.MatcherContext,
  received: C<unknown>,
  expected: number[] | C<unknown>,
  start: number,
  end: number,
  hint: () => string,
) {
  let len = end - start;
  if (expected.length !== len) {
    return {
      pass: matcher.isNot,
      message: () => `${hint()}

Provided array doesn't match length.

Expected: ${matcher.utils.printExpected(len)}
Received: (length ${matcher.utils.printReceived(
        expected.length,
      )}) ${matcher.utils.printReceived(expected)}`,
    };
  }
  if (received.length < len) {
    return {
      pass: matcher.isNot,
      message: () => `${hint()}

Provided Bigarray contains less than expected slice.

Expected: ${matcher.utils.printExpected(len)}
Received: (length ${matcher.utils.printReceived(received.length)})

${printArray(received)}`,
    };
  }

  if (expected instanceof C) {
    const result = checkBuffer1(
      received.buffer.buffer,
      expected.buffer.buffer,
      received.buffer.byteOffset + start * received.buffer.BYTES_PER_ELEMENT,
      expected.buffer.byteOffset,
      (end - start) * received.buffer.BYTES_PER_ELEMENT,
    );
    if (matcher.isNot) {
      return {
        pass: result === undefined,
        message() {
          return `${hint()}

Received the same array.

Expected
========
${matcher.utils.EXPECTED_COLOR`${printArray(expected)}`}

Received
========
${matcher.utils.RECEIVED_COLOR`${printArray(received)}`}
`;
        },
      };
    } else {
      return {
        pass: result === undefined,
        message() {
          return `${hint()}
          
Byte ${matcher.utils.printReceived(result)} differs:

Expected: ${buf(
            matcher.utils.EXPECTED_COLOR,
            expected.buffer.buffer,
            expected.buffer.byteOffset,
            result!,
          )}
Received: ${buf(
            matcher.utils.RECEIVED_COLOR,
            received.buffer.buffer,
            received.buffer.byteOffset,
            result!,
          )}

${printArray(received)}`;
        },
      };
    }
  }

  const result = checkBuffer(received, expected, start, end);

  if (matcher.isNot) {
    return {
      pass: result === undefined,
      message() {
        return `${hint()}

Received the same array.

Expected: ${matcher.utils.printExpected(expected)}
Received: ${matcher.utils.printReceived(asArray(received, start, end))}

${printArray(received)}
`;
      },
    };
  } else {
    return {
      pass: result === undefined,
      message() {
        return `${hint()}

Index ${matcher.utils.printReceived(result)} differs:

Expected: ${matcher.utils.printExpected(
          unpackValue(received, expected[result!], false),
        )}
Received: ${matcher.utils.printReceived(received.buffer.at(result!))}

${printArray(received)}`;
      },
    };
  }
}

expect.extend({
  toHaveValueAt(array: C<unknown>, idx: number[], value: number) {
    const rotated = getIdx(array, idx);
    const unpacked: any = array.get(rotated);
    const pass = compareValue(array, unpacked, value);
    const options: jest.MatcherHintOptions = {
      isNot: this.isNot,
      promise: this.promise,
    };
    return {
      pass,
      message: () => {
        const hint = this.utils.matcherHint(
          "toHaveValueAt",
          `array[${rotated.join(", ")}]`,
          expectation(array, value),
          options,
        );
        return `${hint}

Expected: ${this.utils.printExpected(unpackValue(array, value, false))}
Received: ${this.utils.printReceived(unpacked)}

${printArray(array)}`;
      },
    };
  },
  toHaveValueOf(received: unknown, array: C<unknown>, expected: number) {
    const pass = compareValue(array, received, expected);
    const options: jest.MatcherHintOptions = {
      isNot: this.isNot,
      promise: this.promise,
    };
    return {
      pass,
      message: () => {
        const receivedValue = printResult(array, received);
        const expectedValue = expectation(array, expected);
        const hint = this.utils.matcherHint(
          "toHaveValueOf",
          receivedValue,
          expectedValue,
          options,
        );

        return `${hint}

Expected: ${this.utils.printExpected(unpackValue(array, expected, false))}
Received: ${this.utils.printReceived(received)}

${printArray(array)}`;
      },
    };
  },

  toHaveWrappedValueOf(received: unknown, array: C<unknown>, expected: number) {
    const pass = this.equals(received, unpackValue(array, expected));
    const options: jest.MatcherHintOptions = {
      isNot: this.isNot,
      promise: this.promise,
    };
    return {
      pass,
      message: () => {
        const receivedValue = printResult(array, received);
        const expectedValue = expectation(array, expected);
        const hint = this.utils.matcherHint(
          "toHaveWrappedValueOf",
          receivedValue,
          expectedValue,
          options,
        );

        return `${hint}

Expected: ${this.utils.printExpected(unpackValue(array, expected))}
Received: ${this.utils.printReceived(received)}

${printArray(array)}`;
      },
    };
  },

  toHaveBufferInRange(
    received: C<unknown>,
    start: number,
    end: number,
    expected: number[] | C<unknown>,
  ) {
    const options = { isNot: this.isNot, promise: this.promise };
    const hint = () =>
      this.utils.matcherHint(
        "toHaveBufferInRange",
        `array.slice(${start}, ${end})`,
        `[${expected instanceof Array ? expected.join(", ") : "expected"}]`,
        options,
      );
    return matchBuffer(this, received, expected, start, end, hint);
  },

  toHaveBuffer(received: C<unknown>, expected: number[] | C<unknown>) {
    const options = { isNot: this.isNot, promise: this.promise };
    const hint = () =>
      this.utils.matcherHint(
        "toHaveBuffer",
        `array`,
        `[${expected instanceof Array ? expected.join(", ") : "expected"}]`,
        options,
      );
    return matchBuffer(this, received, expected, 0, expected.length, hint);
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
