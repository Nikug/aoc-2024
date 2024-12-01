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
  console.log(process.argv);
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

main();
