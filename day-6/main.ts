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

const hashWithDirection = (
  vector: [number, number],
  direction: [number, number],
) => {
  return `${vector[0]},${vector[1]} ${direction[0]},${direction[1]}`;
};

const readFile = (filename: string) => {
  const lines = fs.readFileSync(filename, "utf8").split("\n").slice(0, -1);
  return lines;
};

const getStartPoint = (map: string[]): [number, number] => {
  let startPoint: [number, number] = [0, 0];
  for (let y = 0; y < map.length; ++y) {
    for (let x = 0; x < map[y].length; ++x) {
      const char = map[y][x];
      if (char === "^") {
        startPoint = [x, y];
      }
    }
  }

  return startPoint;
};

const guard = (map: string[], startPoint: [number, number]) => {
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

  return visited;
};

const logMap = (map: string[]) => {
  map.forEach((row) => console.log(row));
  console.log();
};

const guard2 = (map: string[], startPoint: [number, number]) => {
  const visited = new Set<string>();
  visited.add(hashWithDirection(startPoint, directions.up));
  const pointsToCheck: { pos: [number, number]; dir: [number, number] }[] = [];
  pointsToCheck.push({ pos: startPoint, dir: directions.up });

  let direction = directions.up;

  let nextPoint = add(startPoint, direction);
  while (true) {
    visited.add(hashWithDirection(nextPoint, direction));
    pointsToCheck.push({ pos: nextPoint, dir: direction });

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

  let results: Record<string, [number, number]> = {};
  for (const point of pointsToCheck) {
    const obstructionPosition = add(point.pos, point.dir);
    if (equals(obstructionPosition, startPoint)) {
      continue;
    }

    if (
      obstructionPosition[1] < 0 ||
      obstructionPosition[1] >= map.length ||
      obstructionPosition[0] < 0 ||
      obstructionPosition[0] >= map[0].length
    ) {
      continue;
    }

    if (map[obstructionPosition[1]][obstructionPosition[0]] === "#") {
      continue;
    }

    const newMap = addObstruction(map, obstructionPosition);
    const newDirection = nextDirection(point.dir);
    const hasLoop = checkForLoop(newMap, point.pos, newDirection);
    if (hasLoop) {
      // logMap(newMap);
      results[hash(obstructionPosition)] = obstructionPosition;
    }
  }

  return Object.keys(results);
};

const addObstruction = (map: string[], position: [number, number]) => {
  const copy = [...map];

  let newRow = "";
  const previousRow = copy[position[1]];
  for (let i = 0; i < previousRow.length; ++i) {
    newRow += i === position[0] ? "#" : previousRow[i];
  }

  copy[position[1]] = newRow;
  return copy;
};

const checkForLoop = (
  map: string[],
  startPoint: [number, number],
  startDirection: [number, number],
) => {
  const visited = new Set<string>();
  visited.add(hashWithDirection(startPoint, startDirection));

  let direction = startDirection;

  let nextPoint = add(startPoint, direction);
  while (true) {
    const nextHash = hashWithDirection(nextPoint, direction);
    if (visited.has(nextHash)) {
      return true;
    }

    visited.add(nextHash);

    let potentialNextPoint = add(nextPoint, direction);
    if (
      potentialNextPoint[1] < 0 ||
      potentialNextPoint[1] >= map.length ||
      potentialNextPoint[0] < 0 ||
      potentialNextPoint[0] >= map[0].length
    ) {
      return false;
    }

    if (map[potentialNextPoint[1]][potentialNextPoint[0]] === "#") {
      direction = nextDirection(direction);
      potentialNextPoint = add(nextPoint, direction);
    }

    nextPoint = potentialNextPoint;
  }
};

const main = () => {
  const map = readFile(process.argv[2]);
  const startPoint = getStartPoint(map);
  const loops = guard2(map, startPoint);
  // console.log(loops);
  console.log(loops.length);
};

main();
