import fs from "fs";

const readFile = (filename: string) => {
  const lines = fs.readFileSync(filename, "utf8").split("\n").slice(0, -1);
  const towels = lines[0].split(", ");
  const arrangements = lines.slice(2);

  return { towels, arrangements };
};

const solveArrangement = (
  arrangement: string,
  start: number,
  currentSolution: string,
  solutions: Record<string, string>,
): string | null => {
  for (let i = arrangement.length; i > start; i--) {
    const part = arrangement.slice(start, i);
    if (solutions[part]) {
      const newSolution = currentSolution + part;

      if (newSolution === arrangement) {
        return newSolution;
      }

      if (!solutions[newSolution] || part === newSolution) {
        solutions[newSolution] = newSolution;

        const result = solveArrangement(arrangement, i, newSolution, solutions);
        if (result) return result;
      }
    }
  }

  return null;
};

interface Solution {
  parts: string[];
}

const hashSolution = (solution: string[]): string => solution.join(",");

const solveArrangementAllPossibilities = (
  arrangement: string,
  start: number,
  currentSolution: string[],
  solutions: Record<string, Record<string, string[]>>,
  towels: Set<string>,
): string[] | null => {
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
          solutions[newSolutionString] = { [hash]: newSolution };
          shouldRecurse = true;
        } else if (!solutions[newSolutionString][hash]) {
          solutions[newSolutionString][hash] = newSolution;
          shouldRecurse = true;
        } else if (towels.has(part)) {
          shouldRecurse = true;
        }

        if (shouldRecurse) {
          solveArrangementAllPossibilities(
            arrangement,
            i,
            newSolution,
            solutions,
            towels,
          );
        }
      }
    }
  }

  return null;
};

const solveAllPossibilities = (
  arrangement: string,
  solution: string,
  towels: Record<string, number>,
  solutions: number,
): number => {
  if (arrangement.length === 0) {
    return 1;
  }

  const towelsToCheck = Object.keys(towels);
  for (const towel of towelsToCheck) {
    if (arrangement.startsWith(towel)) {
      solution += towel;
      if (!towels[solution]) {
        towels[solution] = 1;
      }

      const solved = solveAllPossibilities(
        arrangement.slice(towel.length),
        solution,
        towels,
        solutions,
      );
      if (solved) {
        towels[towel]++;
      }
    }
  }

  return 0;
};

const solveArrangements = (towels: string[], arrangements: string[]) => {
  const solutions: Record<string, string> = {};
  towels.forEach((towel) => (solutions[towel] = towel));

  const solutions2: Record<string, Record<string, string[]>> = {};
  towels.forEach((towel) => (solutions2[towel] = { [towel]: [towel] }));

  const results: string[] = [];

  for (const arrangement of arrangements) {
    // const result = solveArrangement(arrangement, 0, "", solutions);
    console.log("solving", arrangement);
    solveArrangementAllPossibilities(
      arrangement,
      0,
      [],
      solutions2,
      new Set(towels),
    );
  }

  const foundSolutions = arrangements
    .map((arrangement) => solutions2[arrangement])
    .filter(Boolean);
  foundSolutions.forEach((solution) => results.push(...Object.keys(solution)));

  return results;
};

const getUniqueTowels = (towels: string[]) => {
  const unique: string[] = [];
  for (let i = 0; i < towels.length; ++i) {
    const others = towels.toSpliced(i, 1);
    const solutions: Record<string, string> = {};
    others.forEach((towel) => (solutions[towel] = towel));
    const result = solveArrangement(towels[i], 0, "", solutions);
    if (!result) unique.push(towels[i]);
  }

  return unique;
};

const getUniqueTowelLayers = (towels: string[]) => {
  let copy = [...towels];
  const result: string[][] = [];
  while (copy.length > 0) {
    const unique = getUniqueTowels(copy);
    result.push(unique);
    const set = new Set(unique);
    copy = copy.filter((towel) => !set.has(towel));
  }

  return result;
};

const allTowelArrangements = (
  current: string,
  towels: string[],
  results: number,
  cache: Record<string, number>,
): number => {
  if (cache[current] !== undefined) {
    return cache[current];
  }

  let localResults = 0;
  for (const towel of towels) {
    if (current.startsWith(towel)) {
      // Valid solution
      if (current.length === towel.length) {
        localResults += 1;
      }

      // Recurse
      const result = allTowelArrangements(
        current.slice(towel.length),
        towels,
        results,
        cache,
      );
      localResults += result;
    }
  }

  cache[current] = localResults;

  return localResults + results;
};

const main = async () => {
  const { towels, arrangements } = readFile(process.argv[2]);
  let result = 0;
  const cache: Record<string, number> = {};
  for (const arrangement of arrangements) {
    result += allTowelArrangements(arrangement, towels, 0, cache);
  }
  console.log(result);
};

main();
