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

const distance = (a: Vector, b: Vector): number => {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
};

const hash = (vector: Vector) => {
  return `${vector[0]},${vector[1]}`;
};

const hashCheat = (start: Vector, end: Vector) => {
  return `${start[0]},${start[1]}:${end[0]},${end[1]}`;
};

const isInBounds = (vector: Vector, height: number, width: number) => {
  return (
    vector[0] >= 0 && vector[0] < width && vector[1] >= 0 && vector[1] < height
  );
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

const findCheats = (lines: string[], route: Vector[]) => {
  const routeHashes: Record<string, number> = {};
  route.forEach((point, i) => (routeHashes[hash(point)] = i));

  const cheats: Record<string, { vectors: Vector[]; saved: number }> = {};

  for (let i = 0; i < route.length - 2; i++) {
    const point = route[i];

    for (const direction in directions) {
      const next = add(point, directions[direction]);
      const char = lines[next[1]][next[0]];

      if (char === "#") {
        for (const innerDirection in directions) {
          const innerNext = add(next, directions[innerDirection]);
          const innerNextHash = hash(innerNext);
          const pointIndex = routeHashes[innerNextHash];
          if (pointIndex != null) {
            // Cheating takes two steps
            const diff = pointIndex - i - 2;

            // We have successfully cheated and saved time
            if (diff > 0) {
              const cheatHash = `${hash(next)}:${innerNextHash}`;
              cheats[cheatHash] = { vectors: [next, innerNext], saved: diff };
            }
          }
        }
      }
    }
  }

  return cheats;
};

const groupCheats = (
  cheats: Record<string, { vectors: Vector[]; saved: number }>,
) => {
  const grouped: Record<number, number> = {};
  for (const cheat in cheats) {
    const value = cheats[cheat];
    grouped[value.saved] = (grouped[value.saved] || 0) + 1;
  }

  return grouped;
};

const sumCheats = (groupedCheats: Record<number, number>): number => {
  let result = 0;
  for (const key in groupedCheats) {
    const saved = parseInt(key);
    if (saved >= 100) result += groupedCheats[key];
  }

  return result;
};

const findLongCheats = (route: Vector[]) => {
  const routeHashes: Record<string, number> = {};
  route.forEach((point, i) => (routeHashes[hash(point)] = i));
  const maxCheatLength = 20;
  const minimumSave = 50; // 50 for test, 100 for real input

  const cheats: Record<string, { vectors: Vector[]; saved: number }> = {};

  for (let start = 0; start < route.length - minimumSave; ++start) {
    for (let end = start + minimumSave; end < route.length; ++end) {
      const dist = distance(route[start], route[end]);

      if (dist > maxCheatLength) continue;

      const saved = end - start - dist;
      if (saved > 0) {
        const cheatHash = hashCheat(route[start], route[end]);
        if (cheats[cheatHash]) continue;
        cheats[cheatHash] = { vectors: [route[start], route[end]], saved };
      }
    }
  }

  return cheats;
};

const printCheats = (cheats: Record<number, number>) => {
  for (const key in cheats) {
    const saved = parseInt(key);
    if (saved >= 50) {
      console.log(cheats[key], "save", saved);
    }
  }
};

const main = async () => {
  const lines = readFile(process.argv[2]);
  const { start } = getStartAndEnd(lines);
  const route = goThroughTrack(lines, start);
  // const cheats = findCheats(lines, route);
  const cheats = findLongCheats(route);
  const grouped = groupCheats(cheats);
  const result = sumCheats(grouped);

  console.log(result);
};

main();
