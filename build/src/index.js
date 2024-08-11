"use strict";
class MinHeap {
    constructor() {
        this.heap = [];
    }
    // Helper Methods
    getLeftChildIndex(parentIndex) {
        return 2 * parentIndex + 1;
    }
    getRightChildIndex(parentIndex) {
        return 2 * parentIndex + 2;
    }
    getParentIndex(childIndex) {
        return Math.floor((childIndex - 1) / 2);
    }
    hasLeftChild(index) {
        return this.getLeftChildIndex(index) < this.heap.length;
    }
    hasRightChild(index) {
        return this.getRightChildIndex(index) < this.heap.length;
    }
    hasParent(index) {
        return this.getParentIndex(index) >= 0;
    }
    leftChild(index) {
        return this.heap[this.getLeftChildIndex(index)];
    }
    rightChild(index) {
        return this.heap[this.getRightChildIndex(index)];
    }
    parent(index) {
        return this.heap[this.getParentIndex(index)];
    }
    swap(indexOne, indexTwo) {
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
        const route = this.heap[0];
        this.heap[0] = this.heap[this.heap.length - 1];
        this.heap.pop();
        this.heapifyDown();
        return route;
    }
    add(route) {
        this.heap.push(route);
        this.heapifyUp();
    }
    heapifyUp() {
        let index = this.heap.length - 1;
        while (this.hasParent(index) &&
            this.parent(index).distance > this.heap[index].distance) {
            this.swap(this.getParentIndex(index), index);
            index = this.getParentIndex(index);
        }
    }
    heapifyDown() {
        let index = 0;
        while (this.hasLeftChild(index)) {
            let smallerChildIndex = this.getLeftChildIndex(index);
            if (this.hasRightChild(index) &&
                this.rightChild(index).distance < this.leftChild(index).distance) {
                smallerChildIndex = this.getRightChildIndex(index);
            }
            if (this.heap[index].distance < this.heap[smallerChildIndex].distance) {
                break;
            }
            else {
                this.swap(index, smallerChildIndex);
            }
            index = smallerChildIndex;
        }
    }
}
class Graph {
    constructor() {
        this.adjList = new Map();
        this.cache = new Map();
    }
    addEdge(from, to, distance) {
        const froms = this.adjList.get(from);
        const tos = this.adjList.get(to);
        if (froms) {
            froms.push({
                to,
                distance,
            });
        }
        else {
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
        }
        else {
            this.adjList.set(to, [
                {
                    to: from,
                    distance,
                },
            ]);
        }
    }
    dijkstra(start) {
        var _a, _b, _c;
        const destinations = new Map();
        const minHeap = new MinHeap();
        const visited = new Set();
        if (this.cache.has(start)) {
            return (_a = this.cache.get(start)) !== null && _a !== void 0 ? _a : new Map();
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
                const { to: current, distance: currentDistance } = min;
                if (visited.has(current)) {
                    continue;
                }
                visited.add(current);
                const neighbors = this.adjList.get(current) || [];
                for (const { to: next, distance } of neighbors) {
                    const newCumulativeDistance = currentDistance + distance;
                    const destination = destinations.get(next);
                    const prevDestination = destinations.get(current);
                    const prevCheckpoints = (_b = prevDestination === null || prevDestination === void 0 ? void 0 : prevDestination.checkpoints) !== null && _b !== void 0 ? _b : [];
                    if (newCumulativeDistance <
                        ((_c = destination === null || destination === void 0 ? void 0 : destination.cumulativeDistance) !== null && _c !== void 0 ? _c : Infinity)) {
                        const checkpoints = (prevDestination === null || prevDestination === void 0 ? void 0 : prevDestination.checkpoints.length)
                            ? [
                                ...prevCheckpoints,
                                {
                                    to: current,
                                    // since current distance is cumulative sum, deduct from last distance in checkpoints
                                    distance: currentDistance -
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
                        minHeap.add({ to: next, distance: newCumulativeDistance });
                    }
                }
            }
        }
        this.cache.set(start, destinations);
        return destinations;
    }
}
class Navigation {
    constructor(graph, trains, packages) {
        this.nearestTrainToPickUp = null;
        this.graph = graph;
        this.trains = trains;
        this.packages = packages;
        this.movements = [];
    }
    getCapableTrains(weight) {
        return this.trains.filter(train => train.capacity -
            train.packages.reduce((prev, cur) => prev + cur.weight, 0) >=
            weight);
    }
    findNearestPackageToPickUp(pack, capableTrains) {
        var _a;
        for (const train of capableTrains) {
            const destination = this.graph
                .dijkstra(train.currentLocation)
                .get(pack.from);
            if (!destination) {
                continue;
            }
            const cumulativeDistance = (_a = destination === null || destination === void 0 ? void 0 : destination.cumulativeDistance) !== null && _a !== void 0 ? _a : 0;
            if (this.nearestTrainToPickUp === null ||
                cumulativeDistance < this.nearestTrainToPickUp.distance) {
                this.nearestTrainToPickUp = {
                    train,
                    package: pack,
                    destination,
                    distance: cumulativeDistance,
                };
            }
        }
    }
    moveTrain(train, destination) {
        const checkpoints = destination.checkpoints;
        const trainMovements = this.movements.filter(mv => mv.train === train);
        const trainTimeTaken = trainMovements.length > 0
            ? trainMovements[trainMovements.length - 1].endTime
            : 0;
        let newTrainTimeTaken = trainTimeTaken + destination.distance;
        this.movements.push({
            startTime: trainTimeTaken,
            endTime: newTrainTimeTaken,
            train,
            from: destination.from,
            to: checkpoints.length ? checkpoints[0].to : destination.to,
            packagesPickedUp: [],
            packagesDelivered: [],
        });
        if (checkpoints.length) {
            for (let i = 0; i < checkpoints.length; i++) {
                newTrainTimeTaken += checkpoints[i].distance;
                this.movements.push({
                    startTime: trainTimeTaken,
                    endTime: newTrainTimeTaken,
                    train,
                    from: checkpoints[i].to,
                    to: i < checkpoints.length - 1 ? checkpoints[i + 1].to : destination.to,
                    packagesPickedUp: [],
                    packagesDelivered: [],
                });
            }
        }
        train.currentLocation = destination.to;
    }
    pickUpPackage(nearestTrainToPickUp) {
        const { train, destination } = nearestTrainToPickUp;
        this.moveTrain(train, destination);
        train.packages.push(nearestTrainToPickUp.package);
        nearestTrainToPickUp.package.pickedUp = true;
        this.nearestTrainToPickUp = null;
    }
    solve() {
        let i = 0;
        let unpickedUpPackages = this.packages.filter(pack => !pack.pickedUp);
        let undeliveredPackages = this.packages.filter(pack => !pack.delivered);
        while (undeliveredPackages.length > 0 &&
            unpickedUpPackages.length > 0 &&
            i++ < 10) {
            console.log('=====', undeliveredPackages, this.nearestTrainToPickUp);
            if (this.nearestTrainToPickUp) {
                this.pickUpPackage(this.nearestTrainToPickUp);
                this.nearestTrainToPickUp = null;
                break;
            }
            for (const pack of undeliveredPackages) {
                // Ensure that the trains have the capacity
                const capableTrains = this.getCapableTrains(pack.weight);
                this.findNearestPackageToPickUp(pack, capableTrains);
            }
            // No package can be picked up, deliver first
            if (!this.nearestTrainToPickUp) {
                break;
                // this.findNearestDestinationToDeliver();
            }
            unpickedUpPackages = this.packages.filter(pack => !pack.pickedUp);
            undeliveredPackages = this.packages.filter(pack => !pack.delivered);
        }
        return this.movements;
    }
}
function test() {
    const graph = new Graph();
    graph.addEdge('A', 'B', 30);
    graph.addEdge('B', 'C', 10);
    const trains = [
        {
            name: 'Q1',
            start: 'B',
            currentLocation: 'B',
            capacity: 6,
            packages: [],
        },
    ];
    const packages = [
        {
            name: 'K1',
            from: 'A',
            to: 'C',
            weight: 5,
            pickedUp: false,
            delivered: false,
        },
    ];
    const nav = new Navigation(graph, trains, packages);
    const solution = nav.solve();
    console.log(solution);
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
//# sourceMappingURL=index.js.map