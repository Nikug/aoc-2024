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

const moveScaledRobot = (
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
  } else if (mapChar === "[" || mapChar === "]") {
    const newMap = moveScaledBox(newPosition, step, map);
    const newChar = newMap[newPosition[1]][newPosition[0]];
    if (newChar === ".") {
      newMap[newPosition[1]][newPosition[0]] = startChar;
      newMap[position[1]][position[0]] = ".";
      return { position: newPosition, map: newMap };
    } else if (newChar === "[" || newChar === "]") {
      return { position, map: newMap };
    } else {
      throw new Error("Illegal character: " + newChar);
    }
  } else {
    throw new Error("Illegal character: " + mapChar);
  }
};

const checkVerticalPush = (
  position: Vector,
  step: Vector,
  map: string[][],
): boolean => {
  let positions = [position];

  while (positions.length > 0) {
    const newPosition = positions.pop()!;
    const boxPosition = newPosition;
    let boxPosition2 = newPosition;

    if (map[newPosition[1]][newPosition[0]] === "[") {
      boxPosition2 = add(newPosition, [1, 0]);
    } else if (map[newPosition[1]][newPosition[0]] === "]") {
      boxPosition2 = add(newPosition, [-1, 0]);
    }

    const nextPosition = add(boxPosition, step);
    const nextPosition2 = add(boxPosition2, step);

    const nextChar = map[nextPosition[1]][nextPosition[0]];
    const nextChar2 = map[nextPosition2[1]][nextPosition2[0]];

    if (nextChar === "[" || nextChar === "]") {
      positions.push(nextPosition);
    }

    if (nextChar2 === "[" || nextChar2 === "]") {
      positions.push(nextPosition2);
    }

    if (nextChar === "#" || nextChar2 === "#") {
      return false;
    }
  }

  return true;
};

const moveScaledBox = (
  position: Vector,
  step: Vector,
  map: string[][],
): string[][] => {
  const mapChar = map[position[1]][position[0]];
  if (mapChar !== "[" && mapChar !== "]") {
    return map;
  }

  // Horizontal movement
  if (step[0] !== 0) {
    const boxStart = position;
    const boxEnd = add(boxStart, step);
    const newPosition = add(boxEnd, step);
    let newMap = [...map];
    let newChar = newMap[newPosition[1]][newPosition[0]];

    if (newChar === "[" || newChar === "]") {
      newMap = moveScaledBox(newPosition, step, newMap);
    }

    newChar = newMap[newPosition[1]][newPosition[0]];
    if (newChar === "[" || newChar === "]") {
      return newMap;
    } else if (newChar === "#") {
      return newMap;
    } else if (newChar === ".") {
      const startChar = newMap[boxStart[1]][boxStart[0]];
      const endChar = newMap[boxEnd[1]][boxEnd[0]];
      newMap[boxStart[1]][boxStart[0]] = ".";
      newMap[boxEnd[1]][boxEnd[0]] = startChar;
      newMap[newPosition[1]][newPosition[0]] = endChar;
      return newMap;
    } else {
      throw new Error("Illegal character: " + newChar);
    }
  }
  // Vertical movement
  else if (step[1] !== 0) {
    // Check two positions
    const originalPosition = position;
    let originalPosition2 = position;

    const newPosition = add(position, step);
    let newPosition2 = newPosition;

    if (mapChar === "[") {
      newPosition2 = add(newPosition, [1, 0]);
      originalPosition2 = add(originalPosition, [1, 0]);
    } else if (mapChar === "]") {
      newPosition2 = add(newPosition, [-1, 0]);
      originalPosition2 = add(originalPosition, [-1, 0]);
    }

    let newMap = [...map];
    let newChar = newMap[newPosition[1]][newPosition[0]];
    let newChar2 = newMap[newPosition2[1]][newPosition2[0]];

    if (!checkVerticalPush(position, step, map)) {
      return newMap;
    }

    if (newChar === "[" || newChar === "]") {
      newMap = moveScaledBox(newPosition, step, newMap);
    }

    newChar = newMap[newPosition[1]][newPosition[0]];
    newChar2 = newMap[newPosition2[1]][newPosition2[0]];
    if (newChar2 === "[" || newChar2 === "]") {
      newMap = moveScaledBox(newPosition2, step, newMap);
    }

    newChar = newMap[newPosition[1]][newPosition[0]];
    newChar2 = newMap[newPosition2[1]][newPosition2[0]];
    if (
      newChar === "[" ||
      newChar === "]" ||
      newChar2 === "[" ||
      newChar2 === "]"
    ) {
      return newMap;
    } else if (newChar === "#" || newChar2 === "#") {
      return newMap;
    } else if (newChar === "." && newChar2 === ".") {
      const box1 = newMap[originalPosition[1]][originalPosition[0]];
      const box2 = newMap[originalPosition2[1]][originalPosition2[0]];

      newMap[originalPosition[1]][originalPosition[0]] = ".";
      newMap[originalPosition2[1]][originalPosition2[0]] = ".";
      newMap[newPosition[1]][newPosition[0]] = box1;
      newMap[newPosition2[1]][newPosition2[0]] = box2;

      return newMap;
    } else {
      throw new Error("Illegal character: " + newChar);
    }
  }

  throw new Error("Something went wrong");
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
      if (map[y][x] === "O" || map[y][x] === "[") {
        sum += y * 100 + x;
      }
    }
  }

  return sum;
};

const scaleMap = (map: string[][]) => {
  const newMap: string[][] = [];
  for (const line of map) {
    const newLine: string[] = [];
    for (const char of line) {
      if (char === "#") {
        newLine.push("#");
        newLine.push("#");
      } else if (char === "O") {
        newLine.push("[");
        newLine.push("]");
      } else if (char === ".") {
        newLine.push(".");
        newLine.push(".");
      } else if (char === "@") {
        newLine.push("@");
        newLine.push(".");
      }
    }

    newMap.push(newLine);
  }

  let startPosition: Vector = [0, 0];
  outer: for (let y = 0; y < newMap.length; ++y) {
    for (let x = 0; x < newMap[y].length; ++x) {
      if (newMap[y][x] === "@") {
        startPosition = [x, y];
        break outer;
      }
    }
  }

  return { map: newMap, start: startPosition };
};

const main = async () => {
  let { map, steps, start } = readFile(process.argv[2]);
  let robotPosition = start;
  // for (const step of steps) {
  //   const { position, map: newMap } = moveRobot(robotPosition, step, map);
  //   robotPosition = position;
  //   map = newMap;
  // }
  // drawMap(map);
  // const result = gps(map);
  // console.log(result);

  let { map: scaledMap, start: scaledStart } = scaleMap(map);
  robotPosition = scaledStart;

  for (const step of steps) {
    const { position, map: newMap } = moveScaledRobot(
      robotPosition,
      step,
      scaledMap,
    );
    robotPosition = position;
    scaledMap = newMap;
  }
  // drawMap(scaledMap);
  const result = gps(scaledMap);
  console.log(result);
};

main();
