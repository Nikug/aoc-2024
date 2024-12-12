import fs from "fs";

const readFile = (filename: string): number[] => {
  const lines = fs.readFileSync(filename, "utf8").split("\n").slice(0, -1);
  const numbers = lines[0].split(" ").map((value) => parseInt(value));
  return numbers;
};

const evolve = (numbers: number[]): number[] => {
  const result: number[] = [];
  numbers.forEach((value) => {
    const valueString = value.toString();
    if (value === 0) {
      result.push(1);
    } else if (valueString.length % 2 === 0) {
      const part1 = valueString.slice(0, valueString.length / 2);
      const part2 = valueString.slice(valueString.length / 2);
      result.push(parseInt(part1));
      result.push(parseInt(part2));
    } else {
      result.push(value * 2024);
    }
  });

  return result;
};

const main = () => {
  const numbers = readFile(process.argv[2]);
  let newNumbers = numbers;
  for (let i = 0; i < 25; ++i) {
    newNumbers = evolve(newNumbers);
  }
  console.log(newNumbers.length);
};

main();
