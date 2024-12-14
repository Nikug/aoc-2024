import fs from "fs";

type Vector = [number, number];

interface Game {
  a: Vector;
  b: Vector;
  prize: Vector;
}

interface Solution {
  a: number;
  b: number;
}

const readFile = (filename: string): Game[] => {
  const lines = fs.readFileSync(filename, "utf8").split("\n");

  const games: Game[] = [];
  let game: Partial<Game> = {};
  for (const line of lines) {
    if (line.length === 0) {
      games.push({ ...game } as Game);
      game = {};
      continue;
    }

    const parts = line.split(":")[1].split(",");
    const x = parts[0].slice(3);
    const y = parts[1].slice(3);

    if (line.includes("Button A")) {
      game.a = [parseInt(x), parseInt(y)];
    } else if (line.includes("Button B")) {
      game.b = [parseInt(x), parseInt(y)];
    } else if (line.includes("Prize")) {
      game.prize = [parseInt(x), parseInt(y)];
    }
  }

  return games;
};

const solveGame = (game: Game): Solution => {
  const ax = game.a[0];
  const ay = game.a[1];
  const bx = game.b[0];
  const by = game.b[1];
  const cx = game.prize[0];
  const cy = game.prize[1];
  const a = (bx * cy - by * cx) / (-by * ax + bx * ay);
  const b = (cx - ax * a) / bx;

  return { a, b };
};

const main = () => {
  const games = readFile(process.argv[2]);
  const partTwoGames = games.map<Game>((game) => ({
    ...game,
    prize: [game.prize[0] + 10000000000000, game.prize[1] + 10000000000000],
  }));
  const solutions = partTwoGames.map(solveGame);
  const validSolutions = solutions.filter(
    ({ a, b }) =>
      Number.isInteger(a) &&
      Number.isInteger(b) &&
      // a <= 100 &&
      // b <= 100 &&
      a >= 0 &&
      b >= 0,
  );
  const result = validSolutions.reduce((sum, { a, b }) => sum + a * 3 + b, 0);
  console.log(result);
};

main();
