import fs from "fs";

interface Edge {
  start: string;
  end: string;
}

interface Node {
  id: string;
  nodes: Node[];
}

const readFile = (filename: string) => {
  const lines = fs.readFileSync(filename, "utf8").split("\n").slice(0, -1);
  const edges: Edge[] = [];
  lines.forEach((line) => {
    const parts = line.split("-");
    edges.push({ start: parts[0], end: parts[1] });
  });

  return edges;
};

const buildNodes = (edges: Edge[]) => {
  const nodes: Record<string, Node> = {};

  for (const edge of edges) {
    const startNode = nodes[edge.start] ?? { id: edge.start, nodes: [] };
    const endNode = nodes[edge.end] ?? { id: edge.end, nodes: [] };
    startNode.nodes.push(endNode);
    endNode.nodes.push(startNode);

    nodes[startNode.id] = startNode;
    nodes[endNode.id] = endNode;
  }

  return nodes;
};

const findSets = (nodes: Record<string, Node>) => {
  const foundSets = new Set<string>();

  for (const key in nodes) {
    if (!key.startsWith("t")) continue;
    const node = nodes[key];

    for (const child of node.nodes) {
      if (node.id === child.id) continue;

      for (const grandchild of child.nodes) {
        if (grandchild.id === child.id || grandchild.id === node.id) continue;

        for (const grandgrandchild of grandchild.nodes) {
          if (grandgrandchild.id === node.id) {
            const setId = [node.id, child.id, grandchild.id].sort().join(",");
            foundSets.add(setId);
          }
        }
      }
    }
  }

  return foundSets;
};

const longestString = (strings: string[]) => {
  let longest = "";
  for (const string of strings) {
    if (string.length > longest.length) longest = string;
  }

  return longest;
};

const verifyInterconnectivity = (set: string, nodes: Record<string, Node>) => {
  const ids = set.split(",");

  for (const id of ids) {
    const node = nodes[id];
    for (const id2 of ids) {
      if (id2 === id) continue;
      if (!node.nodes.some((n) => n.id === id2)) return false;
    }
  }

  return true;
};

const largestInterconnectedSet = (nodes: Record<string, Node>) => {
  const bestSets = new Set<string>();

  for (const key in nodes) {
    const node = nodes[key];
    const targetIds = new Set<string>(node.nodes.map((child) => child.id));
    targetIds.add(node.id);
    const results = new Set<string>();

    for (const child of node.nodes) {
      const matchingTargets = child.nodes.filter((grandchild) =>
        targetIds.has(grandchild.id),
      );
      matchingTargets.push(child);

      const ids = matchingTargets.map((t) => t.id);
      results.add(ids.sort().join(","));
    }

    const best = longestString([...results]);
    bestSets.add(best);
  }

  const bestList = Array.from(bestSets);
  let bestSet = "";
  for (const setToCheck of bestList) {
    if (setToCheck.length < bestSet.length) continue;
    if (verifyInterconnectivity(setToCheck, nodes)) {
      bestSet = setToCheck;
    }
  }

  return bestSet;
};

const main = () => {
  console.time("runtime");
  const edges = readFile(process.argv[2]);
  const nodes = buildNodes(edges);
  // const sets = findSets(nodes);
  // console.log(sets.size);

  const result = largestInterconnectedSet(nodes);
  console.log(result);
  console.timeEnd("runtime");
};

main();
