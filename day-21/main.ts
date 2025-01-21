import fs from "fs";
import Heap from "heap";
import { start } from "repl";

type Vector = [number, number];

type InputMap = Record<string, Record<string, string[]>>;

interface Node {
  cost: number;
  vector: Vector;
  path: string[];
}

const directions: Record<string, Vector> = {
  "^": [0, -1],
  ">": [1, 0],
  v: [0, 1],
  "<": [-1, 0],
};

const hash = (vector: Vector) => {
  return `${vector[0]},${vector[1]}`;
};

const add = (a: Vector, b: Vector): Vector => {
  return [a[0] + b[0], a[1] + b[1]];
};

const isInBounds = (vector: Vector, height: number, width: number) => {
  return (
    vector[0] >= 0 && vector[0] < width && vector[1] >= 0 && vector[1] < height
  );
};

const manhattanDistance = (a: Vector, b: Vector): number => {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
};

const readFile = (filename: string) => {
  const lines = fs.readFileSync(filename, "utf8").split("\n").slice(0, -1);
  return lines;
};

const generateDirectionInputs = (schema: string[][]): InputMap => {
  const inputs: InputMap = {};

  const inputPositions: Record<string, Vector> = {};
  for (let y = 0; y < schema.length; ++y) {
    for (let x = 0; x < schema[y].length; ++x) {
      const char = schema[y][x];
      if (char === " ") continue;
      inputPositions[char] = [x, y];
    }
  }

  for (const start in inputPositions) {
    for (const end in inputPositions) {
      if (start === end || start === " " || end === " ") continue;
      const startPosition = inputPositions[start];
      const endPosition = inputPositions[end];
      const steps = shortestPaths(schema, startPosition, endPosition);

      if (inputs[start]) {
        inputs[start][end] = steps;
      } else {
        inputs[start] = { [end]: steps };
      }
    }
  }

  return inputs;
};

const calculateDistancesToA = (inputPositions: Record<string, Vector>) => {
  const distances: Record<string, number> = {};
  const a = inputPositions.A;

  for (const key in inputPositions) {
    distances[key] = Math.sqrt(
      Math.pow(a[0] - inputPositions[key][0], 2) +
        Math.pow(a[1] - inputPositions[key][1], 2),
    );
  }

  return distances;
};

const shortestPath = (
  map: string[][],
  start: Vector,
  end: Vector,
  distancesToA: Record<string, number>,
): string[] => {
  const visited = new Set<string>();
  visited.add(hash(start));
  const nodes = new Heap<Node>((a, b) => a.cost - b.cost);
  nodes.push({ cost: 0, vector: start, path: [] });

  while (nodes.size() > 0) {
    const node = nodes.pop()!;

    if (hash(node.vector) === hash(end)) {
      return node.path;
    }

    for (const direction in directions) {
      const nextPosition = add(node.vector, directions[direction]);
      if (!isInBounds(nextPosition, map.length, map[0].length)) continue;

      const char = map[nextPosition[1]][nextPosition[0]];
      if (char === " ") continue;

      const newCost = 1;

      const nextNode: Node = {
        cost: node.cost + newCost,
        vector: nextPosition,
        path: [...node.path, direction],
      };
      nodes.push(nextNode);
    }
  }

  return [];
};

const codeToInputs = (code: string, inputMap: InputMap) => {
  let result = "";
  let previousKey = "A";
  for (let i = 0; i < code.length; ++i) {
    const char = code[i];

    if (char === previousKey) {
      result += "A";
      continue;
    }

    const input = inputMap[previousKey][char];

    if (input === undefined) {
      console.log(inputMap);
      throw new Error(`No input found: previous=${previousKey}, next=${char}`);
    }

    result += input + "A";
    previousKey = char;
  }

  return result;
};

const solve = (code: string, inputMap: InputMap) => {
  let results: string[] = [""];
  let previousKey = "A";
  for (let i = 0; i < code.length; ++i) {
    const char = code[i];

    if (char === previousKey) {
      results = results.map((result) => (result += "A"));
      continue;
    }

    const inputs = inputMap[previousKey][char];

    results = results.flatMap((result) =>
      inputs.map((input) => result + input + "A"),
    );

    previousKey = char;
  }

  return results;
};

// Calculate all paths within manhattan distance
const shortestPaths = (
  map: string[][],
  start: Vector,
  end: Vector,
): string[] => {
  const visited = new Set<string>();
  visited.add(hash(start));
  const nodes = new Heap<Node>((a, b) => a.cost - b.cost);
  nodes.push({ cost: 0, vector: start, path: [] });

  const results: string[] = [];
  const limit = manhattanDistance(start, end);

  while (nodes.size() > 0) {
    const node = nodes.pop()!;

    if (node.cost > limit) continue;

    if (hash(node.vector) === hash(end)) {
      results.push(node.path.join(""));
      continue;
    }

    for (const direction in directions) {
      const nextPosition = add(node.vector, directions[direction]);
      if (!isInBounds(nextPosition, map.length, map[0].length)) continue;

      const char = map[nextPosition[1]][nextPosition[0]];
      if (char === " ") continue;

      const newCost = 1;

      const nextNode: Node = {
        cost: node.cost + newCost,
        vector: nextPosition,
        path: [...node.path, direction],
      };
      nodes.push(nextNode);
    }
  }

  return results;
};

const calculateComplexity = (code: string, steps: string) => {
  console.log(code, parseInt(code.slice(0, -1)), steps.length);
  return steps.length * parseInt(code.slice(0, -1));
};

const minimumSolution = (solutions: string[]) => {
  let length = Infinity;
  for (const solution of solutions) {
    if (solution.length < length) length = solution.length;
  }

  return length;
};

const costs: Record<string, number> = {
  "A^": 2,
  "A<": 4,
  Av: 3,
  "A>": 2,
  AA: 1,

  "^A": 2,
  "^<": 3,
  "^v": 2,
  "^>": 3,
  "^^": 1,

  ">A": 2,
  "><": 3,
  ">v": 2,
  ">>": 1,
  ">^": 3,

  vA: 3,
  "v<": 2,
  vv: 1,
  "v>": 2,
  "v^": 2,

  "<A": 4,
  "<<": 1,
  "<v": 2,
  "<>": 3,
  "<^": 3,
};

const cost = (solution: string) => {
  let total = 0;
  for (let i = 0; i < solution.length - 1; i++) {
    const part = solution[i] + solution[i + 1];
    total += costs[part];
  }

  return total;
};

const findBestCost = (solutions: string[]) => {
  let bestSolution: string | null = null;
  let bestCost = Infinity;

  for (const solution of solutions) {
    const currentCost = cost(solution);
    if (currentCost < bestCost) {
      bestCost = currentCost;
      bestSolution = solution;
    }
  }

  return bestSolution;
};

const findBestCosts = (solutions: string[]) => {
  let bestSolutions: string[] = [];
  let bestCost = Infinity;

  for (const solution of solutions) {
    const currentCost = cost(solution);
    if (currentCost === bestCost) bestSolutions.push(solution);
    else if (currentCost < bestCost) {
      bestCost = currentCost;
      bestSolutions.push(solution);
    }
  }

  return bestSolutions;
};

const findBestCostsCompressed = (solutions: Record<string, number>[]) => {
  let bestSolutions: Record<string, number>[] = [];
  let bestCost = Infinity;

  for (const solution of solutions) {
    const currentCost = compressedToLength(solution);
    if (currentCost === bestCost) bestSolutions.push(solution);
    else if (currentCost < bestCost) {
      bestCost = currentCost;
      bestSolutions = [solution];
    }
  }

  return bestSolutions;
};

const generateBestDirectionInputs = (inputMap: InputMap) => {
  const result: InputMap = {};
  for (const first in inputMap) {
    result[first] = {};
    for (const second in inputMap[first]) {
      const allInputs = inputMap[first][second];
      const bestInput = findBestCost(allInputs);
      result[first][second] = [bestInput!];
    }
  }

  return result;
};

const solveCompressed = (input: Record<string, number>, inputMap: InputMap) => {
  const output: Record<string, number> = {};
  for (const key in input) {
    const count = input[key];
    const steps = "A" + (inputMap[key[0]][key[1]]?.[0] ?? "") + "A";
    for (let i = 0; i < steps.length - 1; ++i) {
      const newKey = steps[i] + steps[i + 1];
      if (output[newKey]) output[newKey] += count;
      else output[newKey] = count;
    }
  }

  return output;
};

const solveCompressed2 = (
  input: Record<string, number>,
  inputMap: InputMap,
) => {
  const output: Record<string, number> = {};
  for (const key in input) {
    let newInputs = [""];
    const count = input[key];
    for (let j = 0; j < key.length - 1; ++j) {
      const inputKey = key[j] + key[j + 1];

      const possibleSteps = inputMap[inputKey[0]][inputKey[1]] ?? [""];

      newInputs = newInputs.flatMap((result) =>
        possibleSteps.map((steps) => result + steps + "A"),
      );
    }

    newInputs = newInputs.map((input) => input.slice(0, -1));
    const bestInput = findBestCost(newInputs);

    const compressedNewInput = compress2(bestInput!);
    for (const newKey in compressedNewInput) {
      if (output[newKey]) output[newKey] += count;
      else output[newKey] = count;
    }
  }

  return output;
};

const compress2 = (input: string): Record<string, number> => {
  const result: Record<string, number> = {};
  const parts = input.split("A");

  for (const part of parts) {
    const key = "A" + part + "A";
    if (result[key]) result[key] += 1;
    else result[key] = 1;
  }

  return result;
};

const compress = (input: string): Record<string, number> => {
  const output: Record<string, number> = {};

  for (let i = 0; i < input.length - 1; ++i) {
    const newKey = input[i] + input[i + 1];
    if (output[newKey]) output[newKey] += 1;
    else output[newKey] = 1;
  }

  return output;
};

const compressedToLength = (input: Record<string, number>) => {
  return (
    Object.entries(input).reduce(
      (acc, [key, value]) => acc + (key.length - 1) * value,
      0,
    ) - 1
  );
};

const countCharacters = (input: string) => {
  const result: Record<string, number> = {};
  for (let i = 0; i < input.length; ++i) {
    if (result[input[i]]) result[input[i]] += 1;
    else result[input[i]] = 1;
  }

  const sorted = Object.entries(result).sort((a, b) => b[1] - a[1]);
  return sorted.reduce(
    (acc, entry) => {
      acc[entry[0]] = entry[1];
      return acc;
    },
    {} as Record<string, number>,
  );
};

const sortObjectKeys = (obj: Record<string, number>) => {
  const result: Record<string, number> = {};
  Object.keys(obj)
    .sort()
    .forEach((key) => (result[key] = obj[key]));
  return result;
};

const main = () => {
  const codes = readFile(process.argv[2]);

  const numberpad = [
    ["7", "8", "9"],
    ["4", "5", "6"],
    ["1", "2", "3"],
    [" ", "0", "A"],
  ];

  const directionPad = [
    [" ", "^", "A"],
    ["<", "v", ">"],
  ];

  const numbers = generateDirectionInputs(numberpad);
  const directions = generateDirectionInputs(directionPad);
  // const bestDirections = generateBestDirectionInputs(directions);
  const bestDirections = {
    "^": { A: [">"], "<": ["<v"], v: ["v"], ">": ["v>"] },
    A: { "^": ["<"], "<": ["v<<"], v: ["<v"], ">": ["v"] },
    "<": { "^": ["^>"], A: [">>^"], v: [">"], ">": [">>"] },
    v: { "^": ["^"], A: ["^>"], "<": ["<"], ">": [">"] },
    ">": { "^": ["<^"], A: ["^"], "<": ["<<"], v: ["<"] },
  };

  console.log(bestDirections);

  const robotCount = 25;

  let result = 0;
  for (const code of codes) {
    // Generate numberpad solutions
    let solution = solve(code, numbers);

    // Solve one round regurarly before compressing
    solution = solution.flatMap((code) => solve(code, bestDirections));
    const bestSolutions = findBestCosts(solution);
    let compressed = solution.map(compress2);
    solution = [findBestCost(solution)!];

    // Solve rest of the rounds
    for (let i = 0; i < robotCount - 1; ++i) {
      // solution = solve(solution[0], bestDirections);
      // const best = findBestCost(solution)!;
      // solution = [best];

      // Solve all compressed, then select the best ones for next round
      compressed = compressed.map((c) => solveCompressed2(c, bestDirections));
      // compressed = findBestCostsCompressed(compressed);
    }

    compressed = findBestCostsCompressed(compressed);

    const codeValue = parseInt(code.slice(0, -1));
    const min = compressedToLength(compressed[0]);
    const complexity = min * codeValue;
    result += complexity;
  }

  console.log(result);
};

main();
