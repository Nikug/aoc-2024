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

  let result = 0;
  for (const code of codes) {
    const result1 = solve(code, numbers);
    const result2 = result1.flatMap((code) => solve(code, directions));
    const result3 = result2.flatMap((code) => solve(code, directions));
    const min = minimumSolution(result3);
    const complexity = min * parseInt(code.slice(0, -1));
    result += complexity;
  }

  console.log(result);
};

main();
