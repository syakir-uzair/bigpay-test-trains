type Destination = {
  to: string;
  distance: number;
};

class MinHeap {
  public heap: Destination[];

  constructor() {
    this.heap = [];
  }

  // Helper Methods
  getLeftChildIndex(parentIndex: number) {
    return 2 * parentIndex + 1;
  }
  getRightChildIndex(parentIndex: number) {
    return 2 * parentIndex + 2;
  }
  getParentIndex(childIndex: number) {
    return Math.floor((childIndex - 1) / 2);
  }
  hasLeftChild(index: number) {
    return this.getLeftChildIndex(index) < this.heap.length;
  }
  hasRightChild(index: number) {
    return this.getRightChildIndex(index) < this.heap.length;
  }
  hasParent(index: number) {
    return this.getParentIndex(index) >= 0;
  }
  leftChild(index: number) {
    return this.heap[this.getLeftChildIndex(index)];
  }
  rightChild(index: number) {
    return this.heap[this.getRightChildIndex(index)];
  }
  parent(index: number) {
    return this.heap[this.getParentIndex(index)];
  }

  swap(indexOne: number, indexTwo: number) {
    const temp = this.heap[indexOne];
    this.heap[indexOne] = this.heap[indexTwo];
    this.heap[indexTwo] = temp;
  }

  peek() {
    if (this.heap.length === 0) {
      return null;
    }
    return this.heap[0];
  }

  remove() {
    if (this.heap.length === 0) {
      return null;
    }
    const item = this.heap[0];
    this.heap[0] = this.heap[this.heap.length - 1];
    this.heap.pop();
    this.heapifyDown();
    return item;
  }

  add(item: Destination) {
    this.heap.push(item);
    this.heapifyUp();
  }

  heapifyUp() {
    let index = this.heap.length - 1;
    while (
      this.hasParent(index) &&
      this.parent(index).distance > this.heap[index].distance
    ) {
      this.swap(this.getParentIndex(index), index);
      index = this.getParentIndex(index);
    }
  }

  heapifyDown() {
    let index = 0;
    while (this.hasLeftChild(index)) {
      let smallerChildIndex = this.getLeftChildIndex(index);
      if (
        this.hasRightChild(index) &&
        this.rightChild(index).distance < this.leftChild(index).distance
      ) {
        smallerChildIndex = this.getRightChildIndex(index);
      }
      if (this.heap[index].distance < this.heap[smallerChildIndex].distance) {
        break;
      } else {
        this.swap(index, smallerChildIndex);
      }
      index = smallerChildIndex;
    }
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
      this.adjList.set(from, [
        {
          to,
          distance,
        },
      ]);
    }
    if (tos) {
      tos.push({
        to: from,
        distance,
      });
    } else {
      this.adjList.set(to, [
        {
          to: from,
          distance,
        },
      ]);
    }
  }

  dijkstra(start: string) {
    const distances = new Map();
    const minHeap = new MinHeap();
    const visited = new Set();

    this.adjList.forEach((to, from) => {
      console.log(from, to);
    });

    this.adjList.forEach((_, to) => {
      distances.set(to, Infinity);
    });

    distances.set(start, 0);
    minHeap.add({
      to: start,
      distance: 0,
    });

    while (minHeap.heap.length) {
      const min = minHeap.remove();

      if (min) {
        const {to: current, distance: currentDistance} = min;

        if (visited.has(current)) {
          continue;
        }

        visited.add(current);

        const neighbors = this.adjList.get(current) || [];
        for (const {to: next, distance} of neighbors) {
          const newDistance = currentDistance + distance;

          if (newDistance < distances.get(next)) {
            distances.set(next, newDistance);
            minHeap.add({to: next, distance: newDistance});
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
