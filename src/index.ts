type Route = {
  to: string;
  distance: number;
};

type Destination = {
  from: string;
  to: string;
  distance: number;
  cumulativeDistance: number;
  checkpoints: Route[];
};

class MinHeap {
  public heap: Route[];

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

  add(item: Route) {
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
  public adjList: Map<string, Route[]>;
  public cache: Map<string, Map<string, Destination>>;

  constructor() {
    this.adjList = new Map();
    this.cache = new Map();
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

  dijkstra(start: string): Map<string, Destination> {
    const destinations = new Map<string, Destination>();
    const minHeap = new MinHeap();
    const visited = new Set<string>();

    if (this.cache.has(start)) {
      return this.cache.get(start) ?? new Map();
    }

    this.adjList.forEach((_, to) => {
      destinations.set(start, {
        from: start,
        to,
        checkpoints: [],
        distance: 0,
        cumulativeDistance: Infinity,
      });
    });

    destinations.set(start, {
      from: start,
      to: start,
      checkpoints: [],
      distance: 0,
      cumulativeDistance: 0,
    });

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
          const newCumulativeDistance = currentDistance + distance;
          const destination = destinations.get(next);
          const prevDestination = destinations.get(current);
          const prevCheckpoints = prevDestination?.checkpoints ?? [];
          if (
            newCumulativeDistance <
            (destination?.cumulativeDistance ?? Infinity)
          ) {
            const checkpoints = prevDestination?.checkpoints.length
              ? [
                  ...prevCheckpoints,
                  {
                    to: current,
                    // since current distance is cumulative sum, deduct from last distance in checkpoints
                    distance:
                      currentDistance -
                      prevCheckpoints[prevCheckpoints.length - 1].distance,
                  },
                ]
              : current !== start
                ? [
                    {
                      to: current,
                      distance: currentDistance,
                    },
                  ]
                : [];

            destinations.set(next, {
              from: start,
              to: next,
              checkpoints,
              distance,
              cumulativeDistance: newCumulativeDistance,
            });
            minHeap.add({to: next, distance: newCumulativeDistance});
          }
        }
      }
    }

    this.cache.set(start, destinations);

    return destinations;
  }
}

type Train = {
  name: string;
  start: string;
  currentLocation: string;
  capacity: number;
};

type Package = {
  name: string;
  from: string;
  to: string;
  weight: number;
  delivered: boolean;
};

type TrainPackage = {
  train: Train;
  package: Package;
  distance: number;
};

function solve(graph: Graph, trains: Train[], packages: Package[]) {
  const deliveredPackages = [];
  let i = 0;
  let nearestTrainPackage: TrainPackage | null = null;

  while (deliveredPackages.length < packages.length && i++ < 10) {
    const undeliveredPackages = packages.filter(pack => !pack.delivered);
    console.log('=====', nearestTrainPackage);

    if (nearestTrainPackage) {
      break;
    }

    for (const pack of undeliveredPackages) {
      for (const train of trains) {
        const destination = graph
          .dijkstra(train.currentLocation)
          .get(pack.from);
        const cumulativeDistance = destination?.cumulativeDistance ?? 0;
        if (
          nearestTrainPackage === null ||
          cumulativeDistance < nearestTrainPackage.distance
        ) {
          nearestTrainPackage = {
            train,
            package: pack,
            distance: cumulativeDistance,
          };
        }
      }
    }
  }
}

function test() {
  const graph = new Graph();

  graph.addEdge('A', 'B', 30);
  graph.addEdge('B', 'C', 10);

  const trains: Train[] = [
    {
      name: 'Q1',
      start: 'B',
      currentLocation: 'B',
      capacity: 6,
    },
  ];

  const packages: Package[] = [
    {
      name: 'K1',
      from: 'A',
      to: 'C',
      weight: 5,
      delivered: false,
    },
  ];

  solve(graph, trains, packages);

  // const start = 'A';
  // const destinations = graph.dijkstra(start);

  // destinations.forEach((dest, from) => {
  //   console.log(
  //     `Distance from ${start} to ${from} is ${dest.cumulativeDistance}`,
  //     dest
  //   );
  // });
}

// function main() {
//   // const graph = new Graph();
//   // graph.addEdge('0', '1', 4);
//   // graph.addEdge('0', '2', 1);
//   // graph.addEdge('2', '1', 2);
//   // graph.addEdge('1', '3', 1);
//   // graph.addEdge('2', '3', 5);
//   // const start = '0';
//   // const destinations = graph.dijkstra(start);
//   // destinations.forEach((dest, from) => {
//   //   console.log(
//   //     `Distance from ${start} to ${from} is ${dest.cumulativeDistance}`,
//   //     dest
//   //   );
//   // });
// }

// main();
test();
