import fs from "fs";

type Vector = [number, number];

const directions = [
  [0, -1], // Up,
  [1, 0], // Right,
  [0, 1], // Down,
  [-1, 0], // Left,
];

const add = (a: Vector, b: Vector): Vector => {
  return [a[0] + b[0], a[1] + b[1]];
};

const readFile = (filename: string) => {
  const lines = fs.readFileSync(filename, "utf8").split("\n").slice(0, -1);

  const map: string[][] = [];
  let i = 0;
  for (; i < lines.length; ++i) {
    const line = lines[i];
    if (line.length === 0) {
      i++;
      break;
    }

    map.push(line.split(""));
  }

  let startPosition: Vector = [0, 0];
  outer: for (let y = 0; y < map.length; ++y) {
    for (let x = 0; x < map[y].length; ++x) {
      if (map[y][x] === "@") {
        startPosition = [x, y];
        break outer;
      }
    }
  }

  const steps: Vector[] = [];
  for (; i < lines.length; ++i) {
    const line = lines[i];
    for (let j = 0; j < line.length; ++j) {
      const char = line[j];
      if (char === "^") {
        steps.push([0, -1]);
      } else if (char === ">") {
        steps.push([1, 0]);
      } else if (char === "v") {
        steps.push([0, 1]);
      } else if (char === "<") {
        steps.push([-1, 0]);
      } else {
        throw new Error(`Invalid character ${char}`);
      }
    }
  }

  return { map, steps, start: startPosition };
};

const moveRobot = (
  position: Vector,
  step: Vector,
  map: string[][],
): { position: Vector; map: string[][] } => {
  const newPosition = add(position, step);
  const startChar = map[position[1]][position[0]];

  if (startChar !== "@") {
    throw new Error(`Invalid character ${startChar}`);
  }

  const mapChar = map[newPosition[1]][newPosition[0]];

  if (mapChar === "#") {
    return { position, map };
  } else if (mapChar === ".") {
    map[newPosition[1]][newPosition[0]] = startChar;
    map[position[1]][position[0]] = ".";
    return { position: newPosition, map };
  } else if (mapChar === "O") {
    const newMap = moveBox(newPosition, step, map);
    const newChar = newMap[newPosition[1]][newPosition[0]];
    if (newChar === ".") {
      newMap[newPosition[1]][newPosition[0]] = startChar;
      newMap[position[1]][position[0]] = ".";
      return { position: newPosition, map: newMap };
    } else if (newChar === "O") {
      return { position, map: newMap };
    } else {
      throw new Error("Illegal character: " + newChar);
    }
  } else {
    throw new Error("Illegal character: " + mapChar);
  }
};

const moveBox = (
  position: Vector,
  step: Vector,
  map: string[][],
): string[][] => {
  const mapChar = map[position[1]][position[0]];
  if (mapChar !== "O") {
    return map;
  }

  const newPosition = add(position, step);
  let newMap = [...map];
  let newChar = newMap[newPosition[1]][newPosition[0]];

  if (newChar === "O") {
    newMap = moveBox(newPosition, step, newMap);
  }

  newChar = newMap[newPosition[1]][newPosition[0]];
  if (newChar === "O") {
    return newMap;
  } else if (newChar === "#") {
    return newMap;
  } else if (newChar === ".") {
    newMap[newPosition[1]][newPosition[0]] = "O";
    newMap[position[1]][position[0]] = ".";
    return newMap;
  } else {
    throw new Error("Illegal character: " + newChar);
  }
};

const drawMap = (map: string[][]) => {
  for (const line of map) {
    console.log(line.join(""));
  }
};

const gps = (map: string[][]): number => {
  let sum = 0;
  for (let y = 0; y < map.length; ++y) {
    for (let x = 0; x < map[y].length; ++x) {
      if (map[y][x] === "O") {
        sum += y * 100 + x;
      }
    }
  }

  return sum;
};

const main = async () => {
  let { map, steps, start } = readFile(process.argv[2]);
  let robotPosition = start;
  for (const step of steps) {
    const { position, map: newMap } = moveRobot(robotPosition, step, map);
    robotPosition = position;
    map = newMap;
  }
  // drawMap(map);
  const result = gps(map);
  console.log(result);
};

main();
