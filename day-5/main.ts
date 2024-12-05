import fs from "fs";

const readFile = (filename: string) => {
  const lines = fs.readFileSync(filename, "utf8").split("\n").slice(0, -1);

  const orderRules: Record<number, number[]> = {};
  let i = 0;
  for (; i < lines.length; ++i) {
    const line = lines[i];
    if (line === "") break;

    const values = line.split("|").map((value) => parseInt(value));
    if (orderRules[values[0]]) {
      orderRules[values[0]].push(values[1]);
    } else {
      orderRules[values[0]] = [values[1]];
    }
  }

  i += 1;

  const pages: number[][] = [];
  for (; i < lines.length; ++i) {
    const line = lines[i];
    pages.push(line.split(",").map((value) => parseInt(value)));
  }

  return { orderRules, pages };
};

const checkOrder = (rules: Record<number, number[]>, page: number[]) => {
  for (let i = 0; i < page.length; ++i) {
    const rule = rules[page[i]];
    if (!rule) continue;

    for (const ruleNumber of rule) {
      for (let j = 0; j < i; ++j) {
        if (page[j] === ruleNumber) {
          return false;
        }
      }
    }
  }

  return true;
};

const main = () => {
  const { orderRules, pages } = readFile(process.argv[2]);
  const validPages = pages.filter((page) => checkOrder(orderRules, page));
  const result = validPages.reduce(
    (acc, page) => acc + page[Math.floor(page.length / 2)],
    0,
  );
  console.log(result);
};

main();
