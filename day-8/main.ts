import fs from "fs";

const readFile = (filename: string) => {
  const lines = fs.readFileSync(filename, "utf8").split("\n").slice(0, -1);
  const antennas: Record<string, [number, number][]> = {};

  for (let y = 0; y < lines.length; ++y) {
    for (let x = 0; x < lines[y].length; ++x) {
      const char = lines[y][x];
      if (char === ".") continue;
      if (antennas[char]) {
        antennas[char].push([x, y]);
      } else {
        antennas[char] = [[x, y]];
      }
    }
  }

  return { width: lines[0].length, height: lines.length, antennas };
};

const sub = (
  vector: [number, number],
  vector2: [number, number],
): [number, number] => {
  return [vector[0] - vector2[0], vector[1] - vector2[1]];
};

const add = (
  vector: [number, number],
  vector2: [number, number],
): [number, number] => {
  return [vector[0] + vector2[0], vector[1] + vector2[1]];
};

const equal = (
  vector: [number, number],
  vector2: [number, number],
): boolean => {
  return vector[0] === vector2[0] && vector[1] === vector2[1];
};

const logMap = (
  width: number,
  height: number,
  antennas: Record<string, [number, number][]>,
  antinodes: Record<string, [number, number][]>,
) => {
  const checkNode = (
    position: [number, number],
    record: Record<string, [number, number][]>,
  ): string | null => {
    for (const key in record) {
      const value = record[key].find(
        (value) => value[0] === position[0] && value[1] === position[1],
      );
      if (value) return key;
    }

    return null;
  };

  for (let y = 0; y < height; ++y) {
    let line = "";
    for (let x = 0; x < width; ++x) {
      let char = ".";
      const antenna = checkNode([x, y], antennas);
      const antinode = checkNode([x, y], antinodes);
      if (antenna) char = antenna;
      if (antinode) char = "#";
      line += char;
    }
    console.log(line);
  }
};

const calculateAntinodes = (antenna: string, positions: [number, number][]) => {
  const antinodes: Record<string, [number, number][]> = { [antenna]: [] };
  for (let i = 0; i < positions.length - 1; ++i) {
    for (let j = i + 1; j < positions.length; ++j) {
      const difference = sub(positions[i], positions[j]);
      const node1 = add(positions[i], difference);
      const node2 = sub(positions[j], difference);

      antinodes[antenna].push(node1, node2);
    }
  }

  return antinodes;
};

const main = () => {
  const { width, height, antennas } = readFile(process.argv[2]);
  const antinodes = Object.entries(antennas)
    .map(([antenna, positions]) => calculateAntinodes(antenna, positions))
    .reduce((acc, antinodes) => Object.assign(acc, antinodes), {});
  // logMap(width, height, antennas, antinodes);

  const validAndUniqueAntinodes = new Set<string>();
  Object.values(antinodes)
    .flatMap((antinodes) => antinodes)
    .filter((position) => {
      if (
        position[0] < 0 ||
        position[0] >= width ||
        position[1] < 0 ||
        position[1] >= height
      )
        return false;
      return true;
    })
    .forEach((position) => validAndUniqueAntinodes.add(position.join(",")));

  console.log(validAndUniqueAntinodes.size);
};

main();
