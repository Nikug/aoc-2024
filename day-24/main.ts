import fs from "fs";

interface Input {
  id: string;
  value: boolean;
}

interface Gate {
  type: "AND" | "OR" | "XOR";
  inputX: string;
  inputY: string;
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
        inputX: parts[0].startsWith("x") ? parts[0] : parts[2],
        inputY: parts[2].startsWith("y") ? parts[2] : parts[0],
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
      })
  );

  const unsolvedGates = [...gates];

  while (unsolvedGates.length > 0) {
    for (let i = 0; i < unsolvedGates.length; ++i) {
      const gate = unsolvedGates[i];
      const input1 = components[gate.inputX];
      const input2 = components[gate.inputY];
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

// x00 XOR y00  -> z00
// x01 XOR y01  -> AAA
// x00 AND y00 -> BBB
// AAA XOR BBB -> z01

// x01 AND y01 -> CCC
// AAA AND BBB -> DDD
// CCC OR DDD -> EEE

// Allowed outputs are only XOR and 1 OR

const fixGates = (inputs: Input[], gates: Gate[]) => {
  const inputMap = inputs.reduce<Record<string, Input>>((acc, input) => ({ ...acc, [input.id]: input }), {});

  let carry: Gate | null = null;
  for (let i = 0; i < 44; ++i) {
    console.log("Checking bit", i);
    const paddedNumber = i.toString().padStart(2, "0");
    const inputX = inputMap[`x${paddedNumber}`];
    const inputY = inputMap[`y${paddedNumber}`];

    // Check half adder
    if (carry === null) {
      const outputGate = gates.find(
        (gate) =>
          gate.type === "XOR" &&
          gate.inputX === inputX.id &&
          gate.inputY === inputY.id &&
          gate.output === `z${paddedNumber}`
      );

      const carryGate = gates.find(
        (gate) => gate.inputX === inputX.id && gate.inputY === inputY.id && gate.type === "AND"
      );
      if (outputGate && carryGate) {
        carry = carryGate;
      } else {
        console.log("Something wrong", carryGate, outputGate);
        return;
      }
    }
    // Check full adder
    else {
      const inputXor = gates.find(
        (gate) => gate.inputX === inputX.id && gate.inputY === inputY.id && gate.type === "XOR"
      );
      const inputAnd = gates.find(
        (gate) => gate.inputX === inputX.id && gate.inputY === inputY.id && gate.type === "AND"
      );

      if (!inputXor) {
        console.log("missing input xor");
        return;
      }

      if (!inputAnd) {
        console.log("missing input and");
        return;
      }

      const inputXorAndCarryXor = gates.find(
        (gate) =>
          (gate.inputX === inputXor!.output || gate.inputX === carry!.output) &&
          (gate.inputY === inputXor!.output || gate.inputY === carry!.output) &&
          gate.type === "XOR"
      );
      const inputXorAndCarryAnd = gates.find(
        (gate) =>
          (gate.inputX === inputXor!.output || gate.inputX === carry!.output) &&
          (gate.inputY === inputXor!.output || gate.inputY === carry!.output) &&
          gate.type === "AND"
      );

      if (!inputXorAndCarryXor) {
        console.log("missing input xor and carry xor");
        console.log("inputXor", inputXor);
        console.log("carry", carry);
        return;
      }

      if (!inputXorAndCarryAnd) {
        console.log("missing input xor and carry and");
        return;
      }

      const nextCarry = gates.find(
        (gate) =>
          (gate.inputX === inputXorAndCarryAnd!.output || gate.inputX === inputAnd!.output) &&
          (gate.inputY === inputXorAndCarryAnd!.output || gate.inputY === inputAnd!.output) &&
          gate.type === "OR"
      );

      if (!nextCarry) {
        console.log("missing next carry");
        console.log("input xor and carry and", inputXorAndCarryAnd);
        console.log("input xor and carry xor", inputXorAndCarryXor);
        console.log("input and", inputAnd);
        console.log("previous carry", carry);
        return;
      }

      if (nextCarry.output.startsWith("z") && i !== 43) {
        console.log("incorrect next carry", nextCarry);
        console.log("input xor and carry and", inputXorAndCarryAnd);
        console.log("input xor and carry xor", inputXorAndCarryXor);
        console.log("input and", inputAnd);
        return;
      }

      carry = nextCarry;
    }
  }
};

// Swaps:
// 1. z08, mvb
// 2. rds, jss
// 3. z18, wss
// 4. z23, bmn

const main = () => {
  const { inputs, gates } = readFile(process.argv[2]);
  // const simulationResult = simulate(inputs, gates);
  // const result = getSolution(simulationResult);
  // console.log(result);

  fixGates(inputs, gates);
  console.log(["z08", "mvb", "rds", "jss", "z18", "wss", "z23", "bmn"].sort().join(","));
};

main();
