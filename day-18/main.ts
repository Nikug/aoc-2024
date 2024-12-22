import fs from "fs";
import Heap from "heap";
type Vector = [number, number];

interface Node {
  position: Vector;
  cost: number;
  previousNodes: Node[]
}

const directions: Record<string, Vector> = {
  up: [0, -1],
  right: [1, 0],
  down: [0, 1],
  left: [-1, 0],
};

const add = (a: Vector, b: Vector): Vector => {
  return [a[0] + b[0], a[1] + b[1]];
};

const euclideanDistance = (a: Vector, b: Vector): number => {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
}

const manhattanDistance = (a: Vector, b: Vector): number => {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
}

const chebyshevDistance = (a: Vector, b: Vector): number => {
  return Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));
}

const hash = (position: Vector) => {
  return position.join(",")
}

const isInBounds = (a: Vector, width: number, height: number): boolean => {
  return a[0] >= 0 && a[0] <= width && a[1] >= 0 && a[1] <= height;
};

const readFile = (filename: string): Vector[] => {
  const lines = fs.readFileSync(filename, "utf8").split("\n").slice(0, -1);
  const values = lines.map((line) => line.split(",")).map(([first, second]) => [parseInt(first), parseInt(second)] as Vector);
  return values;
};

const shortestPath = (start: Vector, end: Vector, height: number, width: number, blocks: Record<string, Vector>) => {
  const startNode: Node = {
    position: start,
    cost: 0,
    previousNodes: []
  };

  const visited: Record<string, Node> = {
    [hash(startNode.position)]: startNode,
  };

  let endNode: Node | null = null;

  const nodes: Heap<Node> = new Heap((a, b) => (a.cost + euclideanDistance(a.position, end)) - (b.cost + euclideanDistance(b.position, end)));
  nodes.push(startNode);

  while (nodes.size() > 0) {
    const node = nodes.pop()!;

    if (node.position[0] === end[0] && node.position[1] === end[1]) {
      if (!endNode) {
        endNode = node;
        break;
      }
    }

    for (const direction of Object.values(directions)) {
      const checkPosition = add(node.position, direction);
      const inBounds = isInBounds(checkPosition, width, height);
      const isBlocked = blocks[hash(checkPosition)]

      if (!inBounds || isBlocked) {
        continue;
      }

      const nextNode: Node = {
        cost: node.cost + 1,
        previousNodes: [...node.previousNodes, node],
        position: checkPosition,
      };

      const nextNodeHash = hash(nextNode.position);
      if (!visited[nextNodeHash]) {
        visited[nextNodeHash] = nextNode;
        nodes.push(nextNode);
      } else if (visited[nextNodeHash].cost > nextNode.cost) {
        visited[nextNodeHash] = nextNode;
        nodes.push(nextNode);
      }
    }
  }

  return endNode;
};

const drawMap = (node: Node, blocks: Record<string, Vector>, width: number, height: number) => {
  const nodes: Record<string, Node> = {}
  node.previousNodes.forEach((prev) => nodes[hash(prev.position)] = prev);

  for (let y = 0; y <= height; y++) {
    let line = "";
    for (let x = 0; x <= width; x++) {
      const position = hash([x, y])
      let char = ".";
      if (nodes[position]) char = "o";
      if (blocks[position]) char = "#";
      line += char;
    }

    console.log(line)
  }
}

const canFindPath = (start: Vector, end: Vector, height: number, width: number, blocks: Vector[]) => {
  return (value: number) => {
    const blockRecord: Record<string, Vector> = {}
    blocks.forEach((block, i) => i < value ? blockRecord[hash(block)] = block : null);
    return shortestPath(start, end, height, width, blockRecord) != null
  }
}

const binarySearch = (start: number, end: number, checkFunction: ((value: number) => boolean)) => {
  while (true) {
    const middle = start + Math.floor((end - start) / 2)

    if (middle === start || middle === end) {
      return middle
    }

    if (checkFunction(middle)) {
      start = middle
    } else {
      end = middle
    }
  }
}

const main = async () => {
  const blocks = readFile(process.argv[2]);
  const isTest = process.argv[2].includes("test")

  const setup = isTest
    ? { start: [0, 0] as Vector, end: [6, 6] as Vector, width: 6, height: 6, blocksToCheck: 12, }
    : { start: [0, 0] as Vector, end: [70, 70] as Vector, width: 70, height: 70, blocksToCheck: 1024, }

  // const blockRecord: Record<string, Vector> = {}
  // blocks.forEach((block, i) => i < setup.blocksToCheck ? blockRecord[hash(block)] = block : null);
  //
  // const endNode = shortestPath(setup.start, setup.end, setup.height, setup.width, blockRecord)
  //
  // drawMap(endNode!, blockRecord, setup.width, setup.height)

  const check = canFindPath(setup.start, setup.end, setup.height, setup.width, blocks)
  const firstBlocking = binarySearch(setup.blocksToCheck, blocks.length, check)
  const result = blocks[firstBlocking]

  console.log(result);
};

main();
