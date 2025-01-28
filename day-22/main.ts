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

const generatePriceAndChangeLists = (value: number, count: number) => {
  const priceList: number[] = [];
  const changeList: number[] = [];

  let newValue = value;
  priceList.push(newValue % 10);

  for (let i = 0; i < count; ++i) {
    newValue = calculateNext(newValue);
    priceList.push(newValue % 10);
    changeList.push(priceList[i + 1] - priceList[i]);
  }

  return { priceList, changeList };
};

const createPriceChangeSequenceLookup = (
  prices: number[],
  changeList: number[],
) => {
  const lookup: Record<string, number> = {};

  for (let i = 3; i < changeList.length; ++i) {
    const hash = `${changeList[i - 3]},${changeList[i - 2]},${changeList[i - 1]},${changeList[i]}`;
    if (!lookup[hash]) lookup[hash] = prices[i + 1];
  }

  return lookup;
};

const uniqueSequences = (lookups: Record<string, number>[]) => {
  const unique = new Set<string>();
  for (const lookup of lookups) {
    for (const key in lookup) {
      unique.add(key);
    }
  }

  return Array.from(unique);
};

const sequenceValue = (sequence: string, lookups: Record<string, number>[]) => {
  let sum = 0;
  for (const lookup of lookups) {
    sum += lookup[sequence] ?? 0;
  }

  return sum;
};

const findBestSequence = (
  sequences: string[],
  lookups: Record<string, number>[],
) => {
  let best = 0;
  let bestSequence = "";
  for (const sequence of sequences) {
    const value = sequenceValue(sequence, lookups);
    if (value > best) {
      best = value;
      bestSequence = sequence;
    }
  }

  return { value: best, sequence: bestSequence };
};

const main = () => {
  console.time("runtime");
  const numbers = readFile(process.argv[2]);

  const lookups: Record<string, number>[] = [];
  for (const value of numbers) {
    const { priceList, changeList } = generatePriceAndChangeLists(value, 2000);
    const sequenceLookup = createPriceChangeSequenceLookup(
      priceList,
      changeList,
    );
    lookups.push(sequenceLookup);
  }

  const unique = uniqueSequences(lookups);
  const { value, sequence } = findBestSequence(unique, lookups);
  console.log(sequence, value);
  console.timeEnd("runtime");
};

main();
