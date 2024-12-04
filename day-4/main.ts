import fs from "fs";

const readFile = (filename: string): string[] => {
  const lines = fs.readFileSync(filename, "utf8").split("\n").slice(0, -1);

  return lines;
};

// Stepper - steps through the matrix in all different ways
const stepper = (input: string[], target: string) => {
  const checker = new Checker(target);
  const reverseChecker = new Checker(target.split("").reverse().join(""));

  // Horizontal
  for (let y = 0; y < input.length; ++y) {
    for (let x = 0; x < input[y].length; ++x) {
      checker.read(input[y][x]);
      reverseChecker.read(input[y][x]);
    }

    checker.clearBuffer();
    reverseChecker.clearBuffer();
  }

  // Vertical
  for (let x = 0; x < input[0].length; ++x) {
    for (let y = 0; y < input.length; ++y) {
      checker.read(input[y][x]);
      reverseChecker.read(input[y][x]);
    }

    checker.clearBuffer();
    reverseChecker.clearBuffer();
  }

  const height = input.length;
  const width = input[0].length;
  const allStarts = width + height - 1;

  // Diagonal - Down right
  for (let start = 0; start < allStarts; ++start) {
    let x = Math.max(0, start - height + 1);
    let y = Math.max(0, height - start - 1);
    while (x < width && y < height) {
      checker.read(input[y][x]);
      reverseChecker.read(input[y][x]);
      x++;
      y++;
    }
    checker.clearBuffer();
    reverseChecker.clearBuffer();
  }

  // Diagonal - Up right
  for (let start = 0; start < allStarts; ++start) {
    let x = Math.max(0, width - start - 1);
    let y = Math.min(height - 1, allStarts - start - 1);
    while (x < width && y >= 0) {
      checker.read(input[y][x]);
      reverseChecker.read(input[y][x]);
      x++;
      y--;
    }
    checker.clearBuffer();
    reverseChecker.clearBuffer();
  }

  return checker.matches + reverseChecker.matches;
};

// Checker - Receives input stream, matches it against target
class Checker {
  private target: string;
  private buffer: string = "";
  private index: number = 0;
  matches: number = 0;

  constructor(target: string) {
    this.target = target;
  }

  read(char: string) {
    if (this.target[this.index] === char) {
      this.buffer += char;
      this.index += 1;

      if (this.buffer === this.target) {
        this.matches += 1;
        this.clearBuffer();
      }
    } else {
      if (char === this.target[0]) {
        this.buffer = char;
        this.index = 1;
      } else {
        this.clearBuffer();
      }
    }
  }

  clearBuffer() {
    this.index = 0;
    this.buffer = "";
  }
}

const main = () => {
  const data = readFile(process.argv[2]);
  const result = stepper(data, "XMAS");
  console.log(result);
};

main();
