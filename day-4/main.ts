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
      checker.read(input[y][x], x, y);
      reverseChecker.read(input[y][x], x, y);
    }

    checker.clearBuffer();
    reverseChecker.clearBuffer();
  }

  // Vertical
  for (let x = 0; x < input[0].length; ++x) {
    for (let y = 0; y < input.length; ++y) {
      checker.read(input[y][x], x, y);
      reverseChecker.read(input[y][x], x, y);
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
      checker.read(input[y][x], x, y);
      reverseChecker.read(input[y][x], x, y);
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
      checker.read(input[y][x], x, y);
      reverseChecker.read(input[y][x], x, y);
      x++;
      y--;
    }
    checker.clearBuffer();
    reverseChecker.clearBuffer();
  }

  return checker.matches + reverseChecker.matches;
};

const xmasFinder = (input: string[], target: string) => {
  const checker = new Checker(target);
  const reverseChecker = new Checker(target.split("").reverse().join(""));

  const height = input.length;
  const width = input[0].length;
  const allStarts = width + height - 1;

  // Diagonal - Down right
  for (let start = 0; start < allStarts; ++start) {
    let x = Math.max(0, start - height + 1);
    let y = Math.max(0, height - start - 1);
    while (x < width && y < height) {
      checker.read(input[y][x], x, y);
      reverseChecker.read(input[y][x], x, y);
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
      checker.read(input[y][x], x, y);
      reverseChecker.read(input[y][x], x, y);
      x++;
      y--;
    }
    checker.clearBuffer();
    reverseChecker.clearBuffer();
  }

  const middlePoints = checker.locationMatches.map((locations) => locations[1]);
  const reverseMiddlePoints = reverseChecker.locationMatches.map(
    (locations) => locations[1],
  );

  const results: Record<string, number> = {};
  [...middlePoints, ...reverseMiddlePoints].forEach((point) => {
    const key = `${point[0]},${point[1]}`;
    if (results[key]) {
      results[key] += 1;
    } else {
      results[key] = 1;
    }
  });

  return Object.values(results).filter((result) => result === 2).length;
};

// Checker - Receives input stream, matches it against target
class Checker {
  private target: string;
  private buffer: string = "";
  private locationBuffer: [number, number][] = [];
  private index: number = 0;
  matches: number = 0;
  locationMatches: [number, number][][] = [];

  constructor(target: string) {
    this.target = target;
  }

  read(char: string, x: number, y: number) {
    if (this.target[this.index] === char) {
      this.buffer += char;
      this.index += 1;
      this.locationBuffer.push([x, y]);

      if (this.buffer === this.target) {
        this.matches += 1;
        this.locationMatches.push([...this.locationBuffer]);
        this.clearBuffer();
      }
    } else {
      if (char === this.target[0]) {
        this.buffer = char;
        this.index = 1;
        this.locationBuffer = [[x, y]];
      } else {
        this.clearBuffer();
      }
    }
  }

  clearBuffer() {
    this.index = 0;
    this.buffer = "";
    this.locationBuffer = [];
  }
}

const main = () => {
  const data = readFile(process.argv[2]);
  // const result = stepper(data, "XMAS");
  const result = xmasFinder(data, "MAS");
  console.log(result);
};

main();
