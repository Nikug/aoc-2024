import fs from "fs";

const readFile = (filename: string) => {
  const lines = fs.readFileSync(filename, "utf8").split("\n").slice(0, -1);

  const keys: number[][] = [];
  const locks: number[][] = [];

  for (let i = 0; i < lines.length; i += 8) {
    let isLock = false;
    const schema = Array(5).fill(-1);
    for (let j = 0; j < 8; j++) {
      const line = lines[i + j];

      if (!line) continue;

      if (j === 0 && line === "#####") {
        isLock = true;
      }

      for (let k = 0; k < 6; k++) {
        if (line[k] === "#") {
          schema[k] += 1;
        }
      }
    }

    if (isLock) {
      locks.push(schema);
    } else {
      keys.push(schema);
    }
  }

  return { keys, locks };
};

const keyFitsLock = (key: number[], lock: number[]) => {
  for (let i = 0; i < key.length; ++i) {
    if (key[i] + lock[i] > 5) {
      return false;
    }
  }

  return true;
};

const checkKeysAndLocks = (keys: number[][], locks: number[][]) => {
  let matches = 0;
  for (const key of keys) {
    for (const lock of locks) {
      if (keyFitsLock(key, lock)) {
        matches++;
      }
    }
  }

  return matches;
};

const main = () => {
  const { keys, locks } = readFile(process.argv[2]);
  const result = checkKeysAndLocks(keys, locks);
  console.log(result);
};

main();
