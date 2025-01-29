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

const main = () => {
  const edges = readFile(process.argv[2]);
  const nodes = buildNodes(edges);
  const sets = findSets(nodes);
  console.log(sets.size);
};

main();
