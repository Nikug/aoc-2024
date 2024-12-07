import fs from "fs";

interface Equation {
  target: number;
  values: number[];
  operators: string[];
}

const readFile = (filename: string) => {
  const lines = fs.readFileSync(filename, "utf8").split("\n").slice(0, -1);

  const results: Equation[] = [];
  for (const line of lines) {
    const parts = line.split(":");
    const target = parseInt(parts[0]);
    const values = parts[1]
      .slice(1)
      .split(" ")
      .map((value) => parseInt(value));
    results.push({ target, values, operators: [] });
  }

  return results;
};

const reduceEquation = (equation: Equation, operator: string) => {
  const copy = { ...equation };
  switch (operator) {
    case "+":
      copy.values = [copy.values[0] + copy.values[1], ...copy.values.slice(2)];
      copy.operators = [...copy.operators, "+"];
      break;
    case "*":
      copy.values = [copy.values[0] * copy.values[1], ...copy.values.slice(2)];
      copy.operators = [...copy.operators, "*"];
      break;
    case "||":
      copy.values = [
        parseInt(`${copy.values[0]}${copy.values[1]}`),
        ...copy.values.slice(2),
      ];
      copy.operators = [...copy.operators, "||"];
      break;
    default:
      throw new Error("Invalid operator");
  }

  return copy;
};

const checkEquation = (equation: Equation): Equation | null => {
  const operations: { equation: Equation; operator: string }[] = [];
  operations.push({ equation, operator: "*" });
  operations.push({ equation, operator: "+" });
  operations.push({ equation, operator: "||" });
  while (operations.length > 0) {
    const operation = operations.pop()!;
    const newEquation = reduceEquation(operation.equation, operation.operator);

    // Over limit
    if (newEquation.values[0] > newEquation.target) {
      continue;
    }

    if (newEquation.values.length === 1) {
      // Correct colution
      if (newEquation.values[0] === newEquation.target) {
        return newEquation;
      }
      // Incorrect colution
      else {
        continue;
      }
    }

    operations.push({ equation: newEquation, operator: "*" });
    operations.push({ equation: newEquation, operator: "+" });
    operations.push({ equation: newEquation, operator: "||" });
  }

  return null;
};

const main = () => {
  const equations = readFile(process.argv[2]);
  const results = equations.map((equation) => checkEquation(equation));
  const result = results.reduce((acc: number, result: Equation | null) => {
    if (result) {
      return acc + result.target;
    }
    return acc;
  }, 0);

  console.log("valid equations", results.length);
  console.log(result);
};

main();
