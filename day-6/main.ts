import fs from "fs";

const directions = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0],
} satisfies Record<string, [number, number]>;

const nextDirection = (direction: [number, number]) => {
  if (direction[0] === 0 && direction[1] === -1) {
    return directions.right;
  }
  if (direction[0] === 0 && direction[1] === 1) {
    return directions.left;
  }
  if (direction[0] === -1 && direction[1] === 0) {
    return directions.up;
  }
  if (direction[0] === 1 && direction[1] === 0) {
    return directions.down;
  }

  throw new Error("illegal direction given");
};

const add = (
  vector1: [number, number],
  vector2: [number, number],
): [number, number] => {
  return [vector1[0] + vector2[0], vector1[1] + vector2[1]];
};

const equals = (vector1: [number, number], vector2: [number, number]) => {
  return vector1[0] === vector2[0] && vector1[1] === vector2[1];
};

const hash = (vector: [number, number]) => {
  return `${vector[0]},${vector[1]}`;
};

const readFile = (filename: string) => {
  const lines = fs.readFileSync(filename, "utf8").split("\n").slice(0, -1);
  return lines;
};

const guard = (map: string[]) => {
  let startPoint: [number, number] = [0, 0];
  for (let y = 0; y < map.length; ++y) {
    for (let x = 0; x < map[y].length; ++x) {
      const char = map[y][x];
      if (char === "^") {
        startPoint = [x, y];
      }
    }
  }

  const visited = new Set<string>();
  visited.add(hash(startPoint));

  let direction = directions.up;

  let nextPoint = add(startPoint, direction);
  while (true) {
    visited.add(hash(nextPoint));

    let potentialNextPoint = add(nextPoint, direction);
    if (
      potentialNextPoint[1] < 0 ||
      potentialNextPoint[1] >= map.length ||
      potentialNextPoint[0] < 0 ||
      potentialNextPoint[0] >= map[0].length
    ) {
      break;
    }

    if (map[potentialNextPoint[1]][potentialNextPoint[0]] === "#") {
      direction = nextDirection(direction);
      potentialNextPoint = add(nextPoint, direction);
    }

    nextPoint = potentialNextPoint;
  }

  return visited
};

const main = () => {
  const map = readFile(process.argv[2]);
  const visited = guard(map);
  console.log(visited.size)
};

main();
