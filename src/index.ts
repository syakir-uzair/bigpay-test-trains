type Destination = {
  to: string;
  distance: number;
};

class Node {
  public value: Destination;
  public left: NullableNode;
  public right: NullableNode;
  public parent: NullableNode;

  constructor(value: Destination) {
    this.value = value;
    this.left = null;
    this.right = null;
    this.parent = null;
  }
}

type NullableNode = Node | null;

class DestinationPriorityQueue {
  public root: NullableNode;
  public lastNode: NullableNode;

  constructor() {
    this.root = null;
    this.lastNode = null;
  }

  insert(value: Destination) {
    const newNode = new Node(value);

    if (!this.root) {
      this.root = newNode;
      this.lastNode = newNode;
    } else {
      const parent = this.findInsertPosition();
      newNode.parent = parent;

      if (parent) {
        if (!parent.left) {
          parent.left = newNode;
        } else {
          parent.right = newNode;
        }
      }

      this.lastNode = newNode;
      this.bubbleUp(newNode);
    }
  }

  bubbleUp(node: Node) {
    while (node.parent && node.value.distance < node.parent.value.distance) {
      this.swap(node, node.parent);
      node = node.parent;
    }
  }

  swap(node1: Node, node2: Node) {
    [node1.value, node2.value] = [node2.value, node1.value];
  }

  findInsertPosition(): NullableNode {
    const queue: NullableNode[] = [this.root];
    while (queue.length) {
      const node = queue.shift();

      if (node) {
        if (!node.left || !node.right) {
          return node;
        }
        queue.push(node.left);
        queue.push(node.right);
      }
    }

    return null;
  }

  extractMin() {
    if (!this.root) {
      return null;
    }

    const minValue = this.root.value;
    if (this.root === this.lastNode) {
      this.root = null;
      this.lastNode = null;
    } else if (this.lastNode) {
      this.root.value = this.lastNode.value;
      this.removeLastNode();
      this.bubbleDown(this.root);
    }

    return minValue;
  }

  removeLastNode() {
    const queue: NullableNode[] = [this.root];
    let node: NullableNode = null;
    let parent: NullableNode = null;

    while (queue.length) {
      node = queue.shift() || null;

      if (node) {
        if (node.left) {
          queue.push(node.left);
        }
        if (node.right) {
          queue.push(node.right);
        }
      }

      if (queue.length) {
        parent = node;
      }
    }

    if (parent) {
      if (parent.right === this.lastNode) {
        parent.right = null;
      } else {
        parent.left = null;
      }
    }

    this.lastNode = parent;
  }

  bubbleDown(node: Node) {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      let smallest = node;
      if (node.left && node.left.value.distance < smallest.value.distance) {
        smallest = node.left;
      }
      if (node.right && node.right.value.distance < smallest.value.distance) {
        smallest = node.right;
      }

      if (smallest === node) {
        break;
      }

      this.swap(node, smallest);
      node = smallest;
    }
  }

  isEmpty() {
    return !this.root;
  }
}

class Graph {
  public adjList: Map<string, Destination[]>;

  constructor() {
    this.adjList = new Map();
  }

  addEdge(from: string, to: string, distance: number) {
    const froms = this.adjList.get(from);
    const tos = this.adjList.get(to);
    if (froms) {
      froms.push({
        to,
        distance,
      });
    } else {
      this.adjList.set(from, []);
    }
    if (tos) {
      tos.push({
        to: from,
        distance,
      });
    }
    if (!this.adjList.has(to)) {
      this.adjList.set(to, []);
    }
  }

  dijkstra(start: string) {
    const distances = new Map();
    const pq = new DestinationPriorityQueue();
    const visited = new Set();

    this.adjList.forEach((_, node) => {
      distances.set(node, Infinity);
    });

    distances.set(start, 0);
    pq.insert({
      to: start,
      distance: 0,
    });

    while (!pq.isEmpty()) {
      const min = pq.extractMin();

      if (min) {
        const {to: current, distance: currentDist} = min;

        if (visited.has(current)) {
          continue;
        }

        visited.add(current);

        const neighbors = this.adjList.get(current) || [];
        for (const {to: next, distance} of neighbors) {
          const newDist = currentDist + distance;

          if (newDist < distances.get(next)) {
            distances.set(next, newDist);
            pq.insert({to: next, distance: newDist});
          }
        }
      }
    }

    return distances;
  }
}

function main() {
  const graph = new Graph();

  graph.addEdge('0', '1', 4);
  graph.addEdge('0', '2', 1);
  graph.addEdge('2', '1', 2);
  graph.addEdge('1', '3', 1);
  graph.addEdge('2', '3', 5);

  const start = '1';
  const distances = graph.dijkstra(start);

  distances.forEach((distance, node) => {
    console.log(`Distance from node ${start} to node ${node} is ${distance}`);
  });
}

main();
