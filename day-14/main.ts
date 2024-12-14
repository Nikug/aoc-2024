import fs from "fs";

type Vector = [number, number];

interface Robot {
  position: Vector;
  velocity: Vector;
}

const add = (a: Vector, b: Vector): Vector => {
  return [a[0] + b[0], a[1] + b[1]];
};

const multiply = (a: Vector, b: number): Vector => {
  return [a[0] * b, a[1] * b];
};

const wrap = (a: Vector, limit: Vector): Vector => {
  let newX = a[0] % limit[0];
  while (newX < 0) newX += limit[0];

  let newY = a[1] % limit[1];
  while (newY < 0) newY += limit[1];

  return [newX, newY];
};

const readFile = (filename: string): Robot[] => {
  const lines = fs.readFileSync(filename, "utf8").split("\n").slice(0, -1);
  const robots: Robot[] = [];
  for (const line of lines) {
    const [positions, velocities] = line.split(" ");
    const position = positions.split(",");
    const velocity = velocities.split(",");
    const robot: Robot = {
      position: [parseInt(position[0].slice(2)), parseInt(position[1])],
      velocity: [parseInt(velocity[0].slice(2)), parseInt(velocity[1])],
    };

    robots.push(robot);
  }
  return robots;
};

const simulateRobot = (robot: Robot, limits: Vector, steps: number) => {
  robot.position = wrap(
    add(robot.position, multiply(robot.velocity, steps)),
    limits,
  );
  return robot;
};

const drawRobots = (robots: Robot[], limits: Vector) => {
  const robotPositions: Record<string, number> = {};
  robots.forEach((robot) => {
    const hash = robot.position.join(",");
    if (robotPositions[hash]) robotPositions[hash]++;
    else robotPositions[hash] = 1;
  });

  for (let y = 0; y < limits[1]; ++y) {
    let line = "";
    for (let x = 0; x < limits[0]; ++x) {
      if (robotPositions[x + "," + y]) line += "X";
      else line += " ";
    }

    console.log(line);
  }
};

const chekForLine = (robots: Robot[], limits: Vector) => {
  const robotPositions: Record<string, number> = {};
  robots.forEach((robot) => {
    const hash = robot.position.join(",");
    if (robotPositions[hash]) robotPositions[hash]++;
    else robotPositions[hash] = 1;
  });

  for (let y = 0; y < limits[1]; ++y) {
    let inALine = 0;
    for (let x = 0; x < limits[0]; ++x) {
      if (robotPositions[x + "," + y]) {
        inALine++;
      } else {
        inALine = 0;
      }

      if (inALine > 20) {
        return true;
      }
    }
  }

  return false;
};

const waitForKeyPress = () => {
  return new Promise((resolve) => {
    process.stdin.resume();
    process.stdin.once("data", (data) => {
      process.stdin.pause();
      resolve(data.toString());
    });
  });
};

const main = async () => {
  const limits: Vector = [101, 103];
  const center: Vector = [(limits[0] - 1) / 2, (limits[1] - 1) / 2];
  const seconds = 100;
  const robots = readFile(process.argv[2]);

  let i = 1;
  while (i < 10000) {
    // await waitForKeyPress();
    robots.forEach((robot) => simulateRobot(robot, limits, 1));
    if (chekForLine(robots, limits)) {
      console.log("Seconds elapsed", i);
      drawRobots(robots, limits);
    }
    i++;
  }

  // const quadrants = {
  //   topLeft: 0,
  //   topRight: 0,
  //   bottomLeft: 0,
  //   bottomRight: 0,
  // };
  //
  // robots.forEach((robot) => {
  //   if (robot.position[0] < center[0] && robot.position[1] < center[1]) {
  //     quadrants.topLeft++;
  //   } else if (robot.position[0] < center[0] && robot.position[1] > center[1]) {
  //     quadrants.bottomLeft++;
  //   } else if (robot.position[0] > center[0] && robot.position[1] < center[1]) {
  //     quadrants.topRight++;
  //   } else if (robot.position[0] > center[0] && robot.position[1] > center[1]) {
  //     quadrants.bottomRight++;
  //   }
  // });

  // console.log(quadrants);
  // const result =
  //   quadrants.topLeft *
  //   quadrants.topRight *
  //   quadrants.bottomLeft *
  //   quadrants.bottomRight;
  // console.log(result);
};

main();
