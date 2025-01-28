import fs from "fs";

const readFile = (filename: string) => {
  const lines = fs.readFileSync(filename, "utf8").split("\n").slice(0, -1);
  return lines.map((line) => parseInt(line));
};

const calculateNext = (value: number): number => {
  let newValue = value;
  const multiplied = newValue << 6;
  newValue ^= multiplied;
  newValue &= 16777215;

  const divided = newValue >> 5;
  newValue ^= divided;
  newValue &= 16777215;

  const multiplied2 = newValue << 11;
  newValue ^= multiplied2;
  newValue &= 16777215;

  return newValue;
};

const calculateTimes = (value: number, count: number): number => {
  let newValue = value;
  for (let i = 0; i < count; ++i) {
    newValue = calculateNext(newValue);
  }

  return newValue;
};

const main = () => {
  const numbers = readFile(process.argv[2]);

  const results: number[] = [];
  for (const value of numbers) {
    const result = calculateTimes(value, 2000);
    results.push(result);
  }

  const sum = results.reduce((sum, value) => sum + value, 0);
  console.log(sum);
};

main();
