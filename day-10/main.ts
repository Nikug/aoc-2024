import fs from "fs";

interface Trail {
  value: number;
  path: [number, number][];
}

const directions = [
  [-1, 0], // Up
  [0, 1], // Right
  [1, 0], // Down
  [0, -1], // Left
];

const readFile = (filename: string): number[][] => {
  const lines = fs.readFileSync(filename, "utf8").split("\n").slice(0, -1);
  const numbers = lines.map((line) =>
    line.split("").map((value) => parseInt(value)),
  );
  return numbers;
};

const findStartPositions = (map: number[][]): [number, number][] => {
  const positions: [number, number][] = [];

  for (let y = 0; y < map.length; ++y) {
    for (let x = 0; x < map[y].length; ++x) {
      if (map[y][x] === 0) {
        positions.push([x, y]);
      }
    }
  }

  return positions;
};

const findTrailheads = (map: number[][], startPosition: [number, number]) => {
  const trails: Trail[] = [
    { value: 0, path: [[startPosition[0], startPosition[1]]] },
  ];

  const foundHeads: Set<string> = new Set();

  const results: Trail[] = [];

  while (trails.length > 0) {
    const trail = trails.pop()!;

    if (trail.value === 9) {
      const hash = trail.path.at(-1)!.join(",");
      if (foundHeads.has(hash)) {
        continue;
      }

      results.push(trail);
      foundHeads.add(hash);
      continue;
    }

    const lastPosition = trail.path[trail.path.length - 1];

    for (const direction of directions) {
      const checkPosition: [number, number] = [
        lastPosition[0] + direction[0],
        lastPosition[1] + direction[1],
      ];

      // Out of bounds
      if (
        checkPosition[0] < 0 ||
        checkPosition[0] >= map[0].length ||
        checkPosition[1] < 0 ||
        checkPosition[1] >= map.length
      ) {
        continue;
      }

      const newValue = map[checkPosition[1]][checkPosition[0]];

      if (newValue === trail.value + 1) {
        trails.push({ value: newValue, path: [...trail.path, checkPosition] });
      }
    }
  }

  return results;
};

const findTrails = (map: number[][], startPositions: [number, number][]) => {
  const results: Trail[] = [];
  for (const start of startPositions) {
    const trails = findTrailheads(map, start);
    results.push(...trails);
  }

  return results;
};

const main = () => {
  const lines = readFile(process.argv[2]);
  const startPositions = findStartPositions(lines);
  const results = findTrails(lines, startPositions);
  console.log(results.length);
};

main();
