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

interface Solution {
  parts: string[];
}

const hashSolution = (solution: string[]): string => solution.join(",")

const solveArrangementAllPossibilities = (arrangement: string, start: number, currentSolution: string[], solutions: Record<string, Record<string, string[]>>, towels: Set<string>): string[] | null => {
  for (let i = arrangement.length; i > start; i--) {
    const part = arrangement.slice(start, i);
    if (solutions[part]) {
      for (const solution of Object.values(solutions[part])) {
        let shouldRecurse = false;
        const newSolution = [...currentSolution, ...solution];
        const newSolutionString = newSolution.join("");
        const hash = hashSolution(newSolution);

        if (newSolutionString.length > arrangement.length) {
          return null;
        }

        if (!solutions[newSolutionString]) {
          solutions[newSolutionString] = { [hash]: newSolution }
          shouldRecurse = true
        } else if (!solutions[newSolutionString][hash]) {
          solutions[newSolutionString][hash] = newSolution
          shouldRecurse = true
        } else if (towels.has(part)) {
          shouldRecurse = true
        }

        if (shouldRecurse) {
          solveArrangementAllPossibilities(arrangement, i, newSolution, solutions, towels);
        }
      }

    }
  }

  return null
}

const solveArrangements = (towels: string[], arrangements: string[]) => {
  const solutions: Record<string, string> = {}
  towels.forEach(towel => solutions[towel] = towel)

  const solutions2: Record<string, Record<string, string[]>> = {}
  towels.forEach(towel => solutions2[towel] = ({ [towel]: [towel] }))

  const results: string[] = []

  for (const arrangement of arrangements) {
    // const result = solveArrangement(arrangement, 0, "", solutions);
    console.log("solving", arrangement)
    solveArrangementAllPossibilities(arrangement, 0, [], solutions2, new Set(towels))
  }

  const foundSolutions = arrangements.map(arrangement => solutions2[arrangement]).filter(Boolean)
  foundSolutions.forEach(solution => results.push(...Object.keys(solution)))

  return results
}

const main = async () => {
  const { towels, arrangements } = readFile(process.argv[2]);
  const result = solveArrangements(towels, arrangements)
  console.log(result.length)
};

main();
