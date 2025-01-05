import fs from "fs";

type Vector = [number, number];

const directions: Record<string, Vector> = {
  up: [0, -1],
  right: [1, 0],
  down: [0, 1],
  left: [-1, 0],
};

const add = (a: Vector, b: Vector): Vector => {
  return [a[0] + b[0], a[1] + b[1]];
};

const hash = (vector: Vector) => {
  return `${vector[0]},${vector[1]}`;
};

const readFile = (filename: string) => {
  const lines = fs.readFileSync(filename, "utf8").split("\n").slice(0, -1);
  return lines;
};

const getStartAndEnd = (lines: string[]) => {
  const width = lines[0].length;
  const height = lines.length;

  const positions = {
    start: [0, 0] as Vector,
    end: [0, 0] as Vector,
  };

  for (let y = 0; y < height; ++y) {
    for (let x = 0; x < width; ++x) {
      const char = lines[y][x];
      if (char === "S") {
        positions.start = [x, y];
      } else if (char === "E") {
        positions.end = [x, y];
      }
    }
  }

  return positions;
};

const goThroughTrack = (lines: string[], start: Vector): Vector[] => {
  let current = start;
  const steps: Vector[] = [start];
  const visited = new Set<string>();
  visited.add(hash(current));

  outer: while (true) {
    for (const direction in directions) {
      const next = add(current, directions[direction]);

      const char = lines[next[1]][next[0]];
      const vectorHash = hash(next);
      if (visited.has(vectorHash)) continue;

      if (char === "." || char === "E") {
        current = next;
        steps.push(current);
        visited.add(vectorHash);

        if (char === "E") {
          break outer;
        }
      }
    }
  }

  return steps;
};

const main = async () => {
  const lines = readFile(process.argv[2]);
  const { start, end } = getStartAndEnd(lines);
  const route = goThroughTrack(lines, start);
  console.log(route.length);
};

main();
