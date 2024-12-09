import fs from "fs";

interface File {
  id: number;
  startIndex: number;
  size: number;
}

interface FreeSpace {
  startIndex: number;
  size: number;
}

const readFile = (filename: string) => {
  const lines = fs.readFileSync(filename, "utf8").split("\n").slice(0, -1);

  return lines[0];
};

const calculateFiles = (data: string) => {
  let id = 0;
  let index = 0;
  let isFile = true;

  const files: File[] = [];
  const freeSpace: FreeSpace[] = [];

  for (let i = 0; i < data.length; ++i) {
    const size = parseInt(data[i]);
    if (isFile) {
      files.push({ id, startIndex: index, size });
      id += 1;
    } else {
      freeSpace.push({ startIndex: index, size });
    }

    isFile = !isFile;
    index += size;
  }

  return { files, freeSpace };
};

const consolidate = (files: File[], freeSpace: FreeSpace[]) => {
  const lastFile = files.at(-1)!;
  const maxSize = lastFile.startIndex + lastFile.size;

  const getFile = (startIndex: number, size: number): File[] => {
    const newFiles: File[] = [];
    while (size > 0) {
      const lastFile = files.at(-1);
      if (!lastFile) return newFiles;

      if (lastFile.size > size) {
        lastFile.size -= size;
        newFiles.push({ id: lastFile.id, startIndex, size });
        size = 0;
      } else if (lastFile.size === size) {
        const file = files.pop()!;
        newFiles.push({ id: file.id, startIndex, size });
        size = 0;
      } else {
        const file = files.pop()!;
        newFiles.push({ id: file.id, startIndex, size: file.size });
        size -= file.size;
        startIndex += file.size;
      }
    }

    return newFiles;
  };

  const spaceFillingFiles: File[] = [];
  let shouldBreak = false;
  for (let i = 0; i < freeSpace.length; ++i) {
    const space = freeSpace[i];
    const lastFileStart = files.at(-1)!.startIndex;

    if (space.startIndex + space.size >= lastFileStart) {
      space.size = lastFileStart - space.startIndex - 1;
      shouldBreak = true;
    }

    const newFiles = getFile(space.startIndex, space.size);
    spaceFillingFiles.push(...newFiles);

    if (shouldBreak) break;
  }

  const data: number[] = [];

  let fileIndex = 0;
  let spaceIndex = 0;
  let index = 0;
  while (index < maxSize) {
    const file = files[fileIndex];
    const space = spaceFillingFiles[spaceIndex];

    if (file && file.startIndex === index) {
      data.push(...Array(file.size).fill(file.id));
      fileIndex += 1;
      index += file.size;
    } else if (space && space.startIndex === index) {
      data.push(...Array(space.size).fill(space.id));
      spaceIndex += 1;
      index += space.size;
    } else {
      index += 1;
    }
  }

  return data;
};

const checksum = (data: number[]) => {
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum += i * data[i];
  }
  return sum;
};

const main = () => {
  const data = readFile(process.argv[2]);
  const { files, freeSpace } = calculateFiles(data);
  const consolidatedData = consolidate(files, freeSpace);
  const result = checksum(consolidatedData);
  console.log(result);
};

main();
