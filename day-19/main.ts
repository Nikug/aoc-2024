import fs from "fs";

const readFile = (filename: string) => {
  const lines = fs.readFileSync(filename, "utf8").split("\n").slice(0, -1);
  const towels = lines[0].split(", ")
  const arrangements = lines.slice(2)

  return { towels, arrangements }
};

const solveArrangement = (arrangement: string, start: number, currentSolution: string, solutions: Record<string, string>): string | null => {
  for (let i = arrangement.length; i > start; i--) {
    const part = arrangement.slice(start, i);
    if (solutions[part]) {
      const newSolution = currentSolution + part;

      if (newSolution === arrangement) {
        return newSolution;
      }

      if (!solutions[newSolution] || part === newSolution) {
        solutions[newSolution] = newSolution

        const result = solveArrangement(arrangement, i, newSolution, solutions);
        if (result) return result
      }


    }
  }

  return null
}

const solveArrangements = (towels: string[], arrangements: string[]) => {
  const solutions: Record<string, string> = {}
  towels.forEach(towel => solutions[towel] = towel)

  const results: string[] = []

  for (const arrangement of arrangements) {
    const result = solveArrangement(arrangement, 0, "", solutions);
    if (result) results.push(result)
  }

  return results
}

const main = async () => {
  const { towels, arrangements } = readFile(process.argv[2]);
  const result = solveArrangements(towels, arrangements)
  console.log(result.length)
};

main();
