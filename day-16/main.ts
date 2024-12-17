import fs from "fs";
import Heap from "heap";
type Vector = [number, number];

type Direction = "up" | "down" | "left" | "right";

interface Node {
  nodes: Node[];
  position: Vector;
  fromDirection: Direction;
  cost: number;
}

interface VisitedNode {
  node: Node;
  previous: VisitedNode | null;
  cost: number;
}

const directions: Record<string, Vector> = {
  up: [0, -1],
  right: [1, 0],
  down: [0, 1],
  left: [-1, 0],
};

const getAllowedDirections = (direction: Direction): Direction[] => {
  switch (direction) {
    case "up":
      return ["up", "left", "right"];
    case "down":
      return ["down", "left", "right"];
    case "left":
      return ["left", "up", "down"];
    case "right":
      return ["right", "up", "down"];
    default:
      throw new Error(`Invalid direction ${direction}`);
  }
};

const getDirectionChar = (direction: Direction): string => {
  switch (direction) {
    case "up":
      return "^";
    case "down":
      return "v";
    case "left":
      return "<";
    case "right":
      return ">";
    default:
      throw new Error(`Invalid direction ${direction}`);
  }
};

const hashNode = (node: Node): string => {
  return `${node.position[0]},${node.position[1]}:${node.fromDirection}:${node.cost}`;
};

const hashPosition = (node: Node): string => {
  return `${node.position[0]},${node.position[1]}`;
};

const add = (a: Vector, b: Vector): Vector => {
  return [a[0] + b[0], a[1] + b[1]];
};

const isInBounds = (a: Vector, width: number, height: number): boolean => {
  return a[0] >= 0 && a[0] < width && a[1] >= 0 && a[1] < height;
};

const readFile = (filename: string): string[] => {
  const lines = fs.readFileSync(filename, "utf8").split("\n").slice(0, -1);
  return lines;
};

const createNodes = (map: string[]) => {
  const height = map.length;
  const width = map[0].length;
  let start: Vector = [0, 0];
  let end: Vector = [0, 0];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (map[y][x] === "S") {
        start = [x, y];
      } else if (map[y][x] === "E") {
        end = [x, y];
      }
    }
  }

  const resultNodes: Node[] = [];
  const foundNodes = new Map<string, Node>();
  const nodes: Node[] = [
    {
      nodes: [],
      position: start,
      fromDirection: "right",
      cost: 0,
    },
  ];

  while (nodes.length > 0) {
    const node = nodes.pop()!;
    if (foundNodes.has(hashNode(node))) {
      continue;
    } else {
      foundNodes.set(hashNode(node), node);
    }

    if (node.position[0] === end[0] && node.position[1] === end[1]) {
      resultNodes.push(node);
      continue;
    }

    const allowedDirections = getAllowedDirections(node.fromDirection);

    for (const direction of allowedDirections) {
      const checkPosition = add(node.position, directions[direction]);

      if (!isInBounds(checkPosition, width, height)) {
        continue;
      }

      const char = map[checkPosition[1]][checkPosition[0]];
      if (char === "." || char === "E") {
        const newNode: Node = {
          position: checkPosition,
          fromDirection: direction as Direction,
          cost: 1 + (direction === node.fromDirection ? 0 : 1000),
          nodes: [],
        };

        nodes.push(newNode);
        const hash = hashNode(newNode);
        if (foundNodes.has(hash)) {
          node.nodes.push(foundNodes.get(hash)!);
          continue;
        }

        node.nodes.push(newNode);
      }
    }

    resultNodes.push(node);
  }

  // resultNodes.map((node) =>
  //   console.log(
  //     hashNode(node),
  //     "->",
  //     node.nodes.map((n) => `${hashNode(n)} - ${n.cost}`),
  //   ),
  // );

  return { nodes: resultNodes, start, end };
};

const shortestPath = (node: Node, end: Vector, map: string[]) => {
  const visited: Record<string, VisitedNode> = {
    [hashNode(node)]: { previous: null, cost: 0, node },
  };

  let endNode: VisitedNode | null = null;

  const nodes: Heap<VisitedNode> = new Heap((a, b) => a.cost - b.cost);
  nodes.push({ node, previous: null, cost: 0 });
  while (nodes.size() > 0) {
    const node = nodes.pop()!;

    if (node.node.position[0] === end[0] && node.node.position[1] === end[1]) {
      if (!endNode || node.cost < endNode.cost) {
        endNode = node;
      }
    }

    node.node.nodes.forEach((nextNode) => {
      const newNode: VisitedNode = {
        previous: { ...node },
        cost: node.cost + nextNode.cost,
        node: nextNode,
      };

      const hash = hashNode(nextNode);
      if (!visited[hash] || visited[hash].cost > newNode.cost) {
        visited[hash] = newNode;
        nodes.push(newNode);
        // drawPath(map, newNode);
      }
    });
  }

  return endNode;
};

const drawPath = (map: string[], node: VisitedNode) => {
  const nodes: Record<string, string> = {};
  let previous: VisitedNode | null = node.previous;
  while (previous) {
    nodes[previous.node.position.join(",")] = getDirectionChar(
      previous.node.fromDirection,
    );
    previous = previous.previous;
  }

  for (let y = 0; y < map.length; y++) {
    let line = "";
    for (let x = 0; x < map[y].length; x++) {
      const foundNode = nodes[`${x},${y}`];
      const char = foundNode ? foundNode : map[y][x];
      line += char;
    }

    console.log(line);
  }
};

const main = async () => {
  const lines = readFile(process.argv[2]);
  const { nodes, start, end } = createNodes(lines);
  const startNode = nodes.find(
    (node) => node.position[0] === start[0] && node.position[1] === start[1],
  )!;
  const endNode = shortestPath(startNode, end, lines);
  // drawPath(lines, endNode!);
  console.log(endNode!.cost);
};

main();
