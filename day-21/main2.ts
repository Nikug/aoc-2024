import fs from "fs";

const readFile = (filename: string) => {
  const lines = fs.readFileSync(filename, "utf8").split("\n").slice(0, -1);
  return lines;
};

const xPosition = (number: string) => {
  switch (number) {
    case "1":
    case "4":
    case "7":
      return 0;
    case "0":
    case "2":
    case "5":
    case "8":
      return 1;
    case "A":
    case "3":
    case "6":
    case "9":
      return 2;
    default:
      return -1;
  }
};

const yPosition = (number: string) => {
  switch (number) {
    case "0":
    case "A":
      return 3;
    case "1":
    case "2":
    case "3":
      return 2;
    case "4":
    case "5":
    case "6":
      return 1;
    case "7":
    case "8":
    case "9":
      return 0;
    default:
      return -1;
  }
};

const doorSequence = (start: string, end: string) => {
  let order = ["<", "v", "^", ">"];

  if (start === end) return "A";
  if (
    ("0A".includes(start) && "147".includes(end)) ||
    ("0A".includes(end) && "147".includes(start))
  ) {
    order = ["^", ">", "v", "<"];
  }

  const stepsUpDown = yPosition(end) - yPosition(start);
  const stepsLeftRight = xPosition(end) - xPosition(start);
  let sequence = "";

  for (const direction of order) {
    if (direction === "<" && stepsLeftRight < 0) {
      sequence += direction.repeat(Math.abs(stepsLeftRight));
    } else if (direction === ">" && stepsLeftRight > 0) {
      sequence += direction.repeat(Math.abs(stepsLeftRight));
    } else if (direction === "^" && stepsUpDown < 0) {
      sequence += direction.repeat(Math.abs(stepsUpDown));
    } else if (direction === "v" && stepsUpDown > 0) {
      sequence += direction.repeat(Math.abs(stepsUpDown));
    }
  }

  return sequence + "A";
};

const keypad: Record<string, Record<string, string>> = {
  "<": {
    ">": ">>A",
    A: ">>^A",
    "^": ">^A",
    v: ">A",
  },
  ">": {
    "<": "<<A",
    A: "^A",
    v: "<A",
    "^": "<^A",
  },
  "^": {
    v: "vA",
    A: ">A",
    ">": "v>A",
    "<": "v<A",
  },
  v: {
    "^": "^A",
    A: "^>A",
    "<": "<A",
    ">": ">A",
  },
  A: {
    "<": "v<<A",
    ">": "vA",
    "^": "<A",
    v: "<vA",
  },
};

const keypadCost = (start: string, end: string, steps: number): number => {
  let sequence = "";

  if (start === end) {
    sequence = "A";
  } else {
    sequence = keypad[start][end];
  }

  if (steps === 1) {
    return sequence.length;
  } else {
    return calculateCost(sequence, steps - 1);
  }
};

const cache: Record<string, number> = {};
const cacheKey = (code: string, steps: number) => `${code} - ${steps}`;

const calculateCost = (code: string, steps: number): number => {
  const key = cacheKey(code, steps);
  if (cache[key]) return cache[key];

  let result = 0;
  code = "A" + code;
  for (let i = 0; i < code.length - 1; ++i) {
    result += keypadCost(code[i], code[i + 1], steps);
  }

  cache[key] = result;

  return result;
};

const calculateComplexity = (code: string, steps: number) => {
  let sequence = "";
  code = "A" + code;

  for (let i = 0; i < code.length - 1; ++i) {
    sequence += doorSequence(code[i], code[i + 1]);
  }

  const cost = calculateCost(sequence, steps);
  const codeNumber = parseInt(code.slice(1, -1));
  return cost * codeNumber;
};

const main = () => {
  const codes = readFile(process.argv[2]);
  const steps = 25;
  let result = 0;
  for (const code of codes) {
    const complexity = calculateComplexity(code, steps);
    console.log(code, complexity);
    result += complexity;
  }

  console.log(result);
};

main();
