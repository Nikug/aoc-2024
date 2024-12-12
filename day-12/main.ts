import fs from "fs";

type Vector = [number, number];

const directions: Vector[] = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
];

interface Block {
  position: Vector;
  fences: number;
}

interface Field {
  letter: string;
  blocks: Record<string, Block>;
  sides: number;
}

const readFile = (filename: string): string[] => {
  const lines = fs.readFileSync(filename, "utf8").split("\n").slice(0, -1);
  return lines;
};

const hash = (vector: Vector) => {
  return `${vector[0]},${vector[1]}`;
};

const add = (a: Vector, b: Vector): Vector => {
  return [a[0] + b[0], a[1] + b[1]];
};

const isInBounds = (width: number, height: number, vector: Vector) => {
  return (
    vector[0] >= 0 && vector[0] < width && vector[1] >= 0 && vector[1] < height
  );
};

const findField = (
  start: Vector,
  map: string[],
  visited: Set<string>,
): Field | null => {
  if (visited.has(hash(start))) return null;

  const height = map.length;
  const width = map[0].length;

  const field: Field = {
    letter: map[start[1]][start[0]],
    blocks: {},
    sides: 0,
  };

  const positions: Vector[] = [start];
  while (positions.length) {
    const position = positions.pop()!;
    const positionHash = hash(position);

    if (visited.has(positionHash)) continue;
    visited.add(positionHash);

    let fences = 4;
    for (const direction of directions) {
      const neighbour = add(position, direction);
      if (!isInBounds(width, height, neighbour)) continue;

      const neighbourLetter = map[neighbour[1]][neighbour[0]];
      if (neighbourLetter === field.letter) {
        positions.push(neighbour);
        fences--;
      }
    }

    field.blocks[positionHash] = {
      position,
      fences,
    };
  }

  return field;
};

const findAllFields = (map: string[]) => {
  const height = map.length;
  const width = map[0].length;
  const visited = new Set<string>();

  const fields: Field[] = [];

  for (let y = 0; y < height; ++y) {
    for (let x = 0; x < width; ++x) {
      const field = findField([x, y], map, visited);
      if (field) fields.push(field);
    }
  }

  return fields;
};

const fieldSpecs = (field: Field): { area: number; fences: number } => {
  return {
    area: Object.keys(field.blocks).length,
    fences: Object.values(field.blocks).reduce(
      (acc, block) => acc + block.fences,
      0,
    ),
  };
};

const fieldBounds = (field: Field) => {
  const blocks = Object.values(field.blocks);
  let minX = blocks[0].position[0];
  let minY = blocks[0].position[1];
  let maxX = blocks[0].position[0];
  let maxY = blocks[0].position[1];

  blocks.forEach((block) => {
    if (block.position[0] < minX) minX = block.position[0];
    if (block.position[0] > maxX) maxX = block.position[0];
    if (block.position[1] < minY) minY = block.position[1];
    if (block.position[1] > maxY) maxY = block.position[1];
  });

  return { minX, minY, maxX, maxY };
};

const calculateFieldSides = (field: Field, map: string[]) => {
  const { minX, minY, maxX, maxY } = fieldBounds(field);
  const height = map.length;
  const width = map[0].length;

  const calculateSides = (
    x: number,
    y: number,
    direction: Vector,
    state: { isSide: boolean },
  ) => {
    let newIsSide = false;
    const positionHash = hash([x, y]);
    const neighbour = add([x, y], direction);

    if (field.blocks[positionHash] && !isInBounds(width, height, neighbour)) {
      newIsSide = true;
    } else if (
      field.blocks[positionHash] &&
      map[neighbour[1]][neighbour[0]] !== field.letter
    ) {
      newIsSide = true;
    } else {
      newIsSide = false;
    }

    if (newIsSide && !state.isSide) {
      field.sides += 1;
    }

    state.isSide = newIsSide;
  };

  // For every horizontal line in bounds
  for (let y = minY; y <= maxY; ++y) {
    // Check above and below blocks
    for (const direction of [directions[0], directions[2]]) {
      const state = { isSide: false };
      // For every block in line
      for (let x = minX; x <= maxX; ++x) {
        calculateSides(x, y, direction, state);
      }
    }
  }

  // For every vertical line in bounds
  for (let x = minX; x <= maxX; ++x) {
    // Check left and right blocks
    for (const direction of [directions[1], directions[3]]) {
      const state = { isSide: false };
      // For every block in line
      for (let y = minY; y <= maxY; ++y) {
        calculateSides(x, y, direction, state);
      }
    }
  }

  return field;
};

const main = () => {
  const map = readFile(process.argv[2]);
  const fields = findAllFields(map);
  let result = 0;
  // fields.forEach((field) => {
  //   const { area, fences } = fieldSpecs(field);
  //   // console.log(field.letter, ":", area, fences);
  //   result += area * fences;
  // });

  fields.forEach((field) => {
    const newField = calculateFieldSides(field, map);
    const { area } = fieldSpecs(newField);
    // console.log(
    //   newField.letter,
    //   area,
    //   "*",
    //   newField.sides,
    //   "=",
    //   newField.sides * area,
    // );
    result += newField.sides * area;
  });
  console.log(result);
};

main();
