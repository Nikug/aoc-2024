import fs from "fs";

const readFile = (filename: string): [number[], number[]] => {
  const lines = fs.readFileSync(filename, "utf8").split("\n");

  const left: number[] = [];
  const right: number[] = [];
  for (const line of lines) {
    const result = line.split("   ");
    if (result.length !== 2) continue;
    left.push(parseInt(result[0]));
    right.push(parseInt(result[1]));
  }

  return [left, right];
};

const main = () => {
  const [left, right] = readFile(process.argv[2] ?? "test.txt");
  left.sort();
  right.sort();

  const distances: number[] = [];
  for (let i = 0; i < left.length; ++i) {
    distances[i] = Math.abs(left[i] - right[i]);
  }

  const result = distances.reduce((sum, value) => sum + value, 0);

  console.log(result);
};

const main2 = () => {
  const [left, right] = readFile(process.argv[2] ?? "test.txt");

  const rightDict: Record<number, number> = {};
  right.forEach((value) => {
    if (rightDict[value]) rightDict[value] += 1;
    else rightDict[value] = 1;
  });

  const result = left.reduce((acc, value) => {
    const appearanceCount = rightDict[value] ?? 0;
    acc += value * appearanceCount;
    return acc;
  }, 0);

  console.log(result);
};

main2();
