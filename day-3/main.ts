import fs from "fs";

type State =
  | "instruction"
  | "firstNumber"
  | "secondNumber"
  | "readChar"
  | "disabled";

const readFile = (filename: string): string[] => {
  const lines = fs.readFileSync(filename, "utf8").split("\n").slice(0, -1);

  return lines;
};

const parser = (input: string): [number, number][] => {
  const result: [number, number][] = [];

  let instruction = "";
  let firstNumber = "";
  let secondNumber = "";
  let expectedChar = "";
  let steps = 0;
  let state: State = "instruction";
  let nextState: State = "instruction";

  const reset = () => {
    instruction = "";
    firstNumber = "";
    secondNumber = "";
    expectedChar = "";
    state = "instruction";
    steps = 0;
  };

  const logState = () => {
    console.log("instruction", instruction);
    console.log("firstNumber", firstNumber);
    console.log("secondNumber", secondNumber);
    console.log("expectedChar", expectedChar);
    console.log("state", state);
    console.log("steps", steps);
    console.log("nextState", nextState);
    console.log("---");
  };

  for (let i = 0; i < input.length; ++i) {
    steps += 1;
    switch (state) {
      case "instruction":
        instruction += input[i];
        if (instruction.length === 3 && instruction === "mul") {
          expectedChar = "(";
          state = "readChar";
          nextState = "firstNumber";
        } else if (instruction.length > 3) {
          i -= steps - 1;
          reset();
        }
        break;
      case "firstNumber":
        if (
          input[i] === "," &&
          firstNumber.length > 0 &&
          firstNumber.length <= 3
        ) {
          state = "secondNumber";
          break;
        }

        if (firstNumber.length > 3) {
          i -= steps - 1;
          reset();
          break;
        }

        if (!isNaN(parseInt(input[i]))) {
          firstNumber += input[i];
        } else {
          i -= steps - 1;
          reset();
        }
        break;
      case "secondNumber":
        if (
          input[i] === ")" &&
          secondNumber.length > 0 &&
          secondNumber.length <= 3
        ) {
          state = "instruction";
          result.push([parseInt(firstNumber), parseInt(secondNumber)]);
          reset();
          break;
        }

        if (secondNumber.length > 3) {
          i -= steps - 1;
          reset();
          break;
        }

        if (!isNaN(parseInt(input[i]))) {
          secondNumber += input[i];
        } else {
          i -= steps - 1;
          reset();
        }
        break;
      case "readChar":
        if (input[i] === expectedChar) {
          state = nextState;
        } else {
          i -= steps - 1;
          reset();
        }
        break;
      default:
        throw new Error("Illegal state");
    }
    // logState();
  }
  return result;
};

const parser2 = (input: string): [number, number][] => {
  const result: [number, number][] = [];

  let instruction = "";
  let firstNumber = "";
  let secondNumber = "";
  let expectedChar = "";
  let steps = 0;
  let state: State = "instruction";
  let nextState: State = "instruction";

  const reset = () => {
    instruction = "";
    firstNumber = "";
    secondNumber = "";
    expectedChar = "";
    state = "instruction";
    steps = 0;
  };

  const logState = () => {
    console.log("state", state);
    console.log("buffer", instruction, firstNumber, secondNumber);
    console.log("steps", steps);
    console.log("---");
  };

  for (let i = 0; i < input.length; ++i) {
    steps += 1;
    switch (state) {
      case "instruction":
        instruction += input[i];
        if (instruction.length === 3 && instruction === "mul") {
          expectedChar = "(";
          state = "readChar";
          nextState = "firstNumber";
        } else if (instruction.length === 7 && instruction === "don't()") {
          state = "disabled";
          instruction = "";
        } else if (instruction.length > 7) {
          i -= steps - 1;
          reset();
        }
        break;
      case "disabled":
        instruction += input[i];
        if (instruction.length === 4 && instruction === "do()") {
          reset();
          break;
        } else if (instruction.length > 4) {
          i -= steps - 1;
          reset();
          state = "disabled";
        }

        break;
      case "firstNumber":
        if (
          input[i] === "," &&
          firstNumber.length > 0 &&
          firstNumber.length <= 3
        ) {
          state = "secondNumber";
          break;
        }

        if (firstNumber.length > 3) {
          i -= steps - 1;
          reset();
          break;
        }

        if (!isNaN(parseInt(input[i]))) {
          firstNumber += input[i];
        } else {
          i -= steps - 1;
          reset();
        }
        break;
      case "secondNumber":
        if (
          input[i] === ")" &&
          secondNumber.length > 0 &&
          secondNumber.length <= 3
        ) {
          state = "instruction";
          result.push([parseInt(firstNumber), parseInt(secondNumber)]);
          reset();
          break;
        }

        if (secondNumber.length > 3) {
          i -= steps - 1;
          reset();
          break;
        }

        if (!isNaN(parseInt(input[i]))) {
          secondNumber += input[i];
        } else {
          i -= steps - 1;
          reset();
        }
        break;
      case "readChar":
        if (input[i] === expectedChar) {
          state = nextState;
        } else {
          i -= steps - 1;
          reset();
        }
        break;
      default:
        throw new Error("Illegal state");
    }
    // logState();
  }
  return result;
};

const main = () => {
  const data = readFile(process.argv[2]);

  const results = parser2(data.join(""));

  const finalResult = results.reduce(
    (acc, result) => (acc += result[0] * result[1]),
    0,
  );

  console.log(finalResult);
};

main();
