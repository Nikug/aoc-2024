import fs from "fs";

class Computer {
  private a: number;
  private b: number;
  private c: number;
  private buffer: number[];
  private pointer: number = 0;

  outBuffer: number[] = [];

  constructor(a: number, b: number, c: number, input: number[]) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.buffer = input;
  }

  run() {
    while (this.pointer < this.buffer.length) {
      // console.log(this.b);
      const operation = this.buffer[this.pointer];
      const operand = this.buffer[this.pointer + 1];

      if (operation == null || operand == null) {
        return;
      }

      let shouldIncreasePointer = true;
      switch (operation) {
        case 0: {
          this.adv(operation, operand);
          break;
        }
        case 1: {
          this.bxl(operation, operand);
          break;
        }
        case 2: {
          this.bst(operation, operand);
          break;
        }
        case 3: {
          shouldIncreasePointer = this.jnz(operation, operand);
          break;
        }
        case 4: {
          this.bxc(operation, operand);
          break;
        }
        case 5: {
          this.out(operation, operand);
          break;
        }
        case 6: {
          this.bdv(operation, operand);
          break;
        }
        case 7: {
          this.cdv(operation, operand);
          break;
        }
      }

      if (shouldIncreasePointer) {
        this.pointer += 2;
      }
    }
  }

  private adv(_operation: number, operand: number) {
    this.a = Math.trunc(this.a / 2 ** this.comboValue(operand));
  }

  private bxl(_operation: number, operand: number) {
    this.b = this.b ^ operand;
  }

  private bst(_operation: number, operand: number) {
    this.b = this.comboValue(operand) % 8;
  }

  private jnz(_operation: number, operand: number): boolean {
    if (this.a === 0) return true;

    this.pointer = operand;
    return false;
  }

  private bxc(_operation: number, _operand: number) {
    this.b = this.b ^ this.c;
  }

  private out(_operation: number, operand: number) {
    this.outBuffer.push(Math.abs(this.comboValue(operand) % 8));
  }

  private bdv(_operation: number, operand: number) {
    this.b = Math.floor(this.a / 2 ** this.comboValue(operand));
  }

  private cdv(_operation: number, operand: number) {
    this.c = Math.floor(this.a / 2 ** this.comboValue(operand));
  }

  private comboValue(operand: number) {
    if (operand >= 0 && operand <= 3) {
      return operand;
    } else if (operand === 4) {
      return this.a;
    } else if (operand === 5) {
      return this.b;
    } else if (operand === 6) {
      return this.c;
    }

    return 0;
  }
}

const readFile = (filename: string) => {
  const lines = fs.readFileSync(filename, "utf8").split("\n").slice(0, -1);
  const a = parseInt(lines[0].split(": ")[1]);
  const b = parseInt(lines[1].split(": ")[1]);
  const c = parseInt(lines[2].split(": ")[1]);
  const input = lines[4]
    .split(": ")[1]
    .split(",")
    .map((value) => parseInt(value));

  return { a, b, c, input };
};

const checkSomeNumbers = () => {
  for (let i = 0; i < 2 ** 8; i++) {
    let a = i;
    let line: number[] = [];
    while (a > 0) {
      let b = a % 8 ^ 2;
      b = (b ^ (a >> b) ^ 3) % 8;
      line.push(b);
      a = a >> 3;
    }
    console.log("A:", i, "B:", line);
  }
};

const getIncorrectIndex = (a: number[], b: number[]) => {
  for (let i = a.length - 1; i >= 0; i--) {
    if (a[i] !== b[i]) {
      return a.length - 1 - i;
    }
  }
  return -1;
};

const getIncorrectIndex2 = (a: number[], b: number[]) => {
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return i;
    }
  }
  return -1;
};

const getIncorrectIndex3 = (a: number[], b: number[]) => {
  for (let i = a.length - 1; i >= 0; i--) {
    if (a[i] !== b[i]) {
      return i;
    }
  }
  return -1;
};

const calculateCorrectInput = (target: number[]) => {
  let input = "1000000000000000".split("").map((value) => Number(value));
  let index = 0;
  while (true) {
    // console.log("running");
    const computer = new Computer(Number("0o" + input.join("")), 0, 0, target);
    computer.run();
    const output = computer.outBuffer;
    index = getIncorrectIndex(output, target);

    if (index === -1) {
      break;
    }

    if (index >= 16) {
      index = 0;
    }

    input[index] += 1;
    while (input[index] > 7) {
      input[index] = 0;
      index -= 1;
      input[index] += 1;
    }

    // console.log(input.join(""));
  }

  console.log(input);
};

const findA = (value: number[], index: number, target: number[]) => {
  if (index >= 16) return false;

  const simulate = (values: number[]) => {
    const computerInput = Number(`0o${values.join("")}`);
    const computer = new Computer(computerInput, 0, 0, target);
    computer.run();
    return computer.outBuffer;
  };

  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const newValue = value.toSpliced(value.length - index - 1, 2, i, j);
      const result = simulate(newValue);

      console.log(newValue.join(""), result.join(""));

      let diffIndex = getIncorrectIndex2(result, target);
      console.log(diffIndex);
      if (diffIndex === -1) {
        console.log("result", newValue);
      }

      if (diffIndex % 2 === 1) {
        diffIndex -= 1;
      }

      if (diffIndex > index) {
        const result = findA(newValue, diffIndex, target);
        if (result) return true;
      }
    }
  }

  return false;
};

const findA2 = (target: number[]) => {
  const simulate = (value: number) => {
    const computer = new Computer(value, 0, 0, target);
    computer.run();
    return computer.outBuffer;
  };

  let a = 0;
  let index = target.length - 1;
  while (true) {
    const result = simulate(a);
    const diffIndex = getIncorrectIndex3(result, target);

    if (diffIndex === -1 && target.length === result.length) {
      break;
    }

    if (diffIndex < index) {
      a *= 8;
      index -= 1;
    } else {
      a += 1;
    }
  }

  console.log(a);
  const computer = new Computer(a, 0, 0, target);
  computer.run();
  const out = computer.outBuffer;
  console.log(out.join(","), "=", target.join(","));
};

const simulate = (value: number, input: number[]) => {
  const computer = new Computer(value, 0, 0, input);
  computer.run();
  return computer.outBuffer;
};

const findA3 = (
  target: number[],
  index: number,
  value: number,
): number | null => {
  for (let i = 0; i < 8; i++) {
    const result = simulate(value * 8 + i, target);
    const diffIndex = getIncorrectIndex2(result, target.slice(index));
    if (diffIndex === -1) {
      if (index === 0) {
        return value * 8 + i;
      }
      const newResult = findA3(target, index - 1, value * 8 + i);
      if (newResult) return newResult;
    }
  }

  return null;
};

const findA4 = (program: number[], target: number[]): number => {
  var aStart = target.length === 1 ? 0 : 8 * findA4(program, target.slice(1));

  while (true) {
    const result = simulate(aStart, program);
    const diffIndex = getIncorrectIndex2(result, target);
    if (diffIndex === -1) break;
    aStart++;
  }

  return aStart;
};

const main = async () => {
  const program = readFile(process.argv[2]);
  // const target = program.input.join("");
  // findA2(program.input);
  const result = findA3(program.input, program.input.length - 1, 0);
  console.log(result);
  // const result = findA4(program.input, program.input);
  // console.log(result);

  // const initial = Array(16).fill(0);
  // initial[0] = 1;
  // findA(initial, 0, program.input);
  // calculateCorrectInput(program.input);

  // const a = 35_184_372_088_832;
  // const a = 218_474_976_710_656;
  // const a = 27575648;
  // const a = 0o1000000000000000;
  // const a = 36067;
  //

  // const a = 0o1000000000000000;
  // const computer = new Computer(a, program.b, program.c, program.input);
  // computer.run();
  // const result = computer.outBuffer.join(",");
  //
  // console.log(result);
};

main();
// checkSomeNumbers();
