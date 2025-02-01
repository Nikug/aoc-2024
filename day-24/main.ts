import fs from "fs";

interface Input {
  id: string;
  value: boolean;
}

interface Gate {
  type: "AND" | "OR" | "XOR";
  input1: string;
  input2: string;
  output: string;
}

interface Component {
  output: string;
  value: boolean;
  configuration: Input | Gate;
}

const readFile = (filename: string) => {
  const lines = fs.readFileSync(filename, "utf8").split("\n").slice(0, -1);

  const inputs: Input[] = [];
  const gates: Gate[] = [];

  let readingInputs = true;
  for (const line of lines) {
    if (readingInputs) {
      if (line.length === 0) {
        readingInputs = false;
        continue;
      }

      const parts = line.split(": ");
      const input: Input = {
        id: parts[0],
        value: parts[1] === "1",
      };
      inputs.push(input);
    } else {
      const parts = line.split(" ");
      const gate: Gate = {
        type: parts[1] as Gate["type"],
        input1: parts[0],
        input2: parts[2],
        output: parts[4],
      };
      gates.push(gate);
    }
  }

  return { inputs, gates };
};

const simulate = (inputs: Input[], gates: Gate[]) => {
  const components: Record<string, Component> = {};
  inputs.forEach(
    (input) =>
      (components[input.id] = {
        output: input.id,
        value: input.value,
        configuration: input,
      }),
  );

  const unsolvedGates = [...gates];

  while (unsolvedGates.length > 0) {
    for (let i = 0; i < unsolvedGates.length; ++i) {
      const gate = unsolvedGates[i];
      const input1 = components[gate.input1];
      const input2 = components[gate.input2];
      if (!input1 || !input2) continue;

      let newValue = false;
      switch (gate.type) {
        case "AND":
          newValue = input1.value && input2.value;
          break;
        case "OR":
          newValue = input1.value || input2.value;
          break;
        case "XOR":
          newValue = input1.value !== input2.value;
          break;
      }

      components[gate.output] = {
        output: gate.output,
        value: newValue,
        configuration: gate,
      };
      unsolvedGates.splice(i, 1);
      --i;
    }
  }

  return components;
};

const getSolution = (components: Record<string, Component>) => {
  const zs = Object.keys(components)
    .filter((key) => key.startsWith("z"))
    .sort()
    .reverse();

  let result = "";
  zs.forEach((z) => {
    const value = components[z].value;
    result += value ? "1" : "0";
  });

  return parseInt(result, 2);
};

const main = () => {
  const { inputs, gates } = readFile(process.argv[2]);
  const simulationResult = simulate(inputs, gates);
  const result = getSolution(simulationResult);
  console.log(result);
};

main();
