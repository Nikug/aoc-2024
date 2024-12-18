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
    this.a = Math.floor(this.a / 2 ** this.comboValue(operand));
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
    this.outBuffer.push(this.comboValue(operand) % 8);
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

const main = async () => {
  const program = readFile(process.argv[2]);
  const computer = new Computer(program.a, program.b, program.c, program.input);
  computer.run();
  console.log(computer.outBuffer.join(","));
};

main();
