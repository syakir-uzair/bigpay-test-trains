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
        const item = this.heap[0];
        this.heap[0] = this.heap[this.heap.length - 1];
        this.heap.pop();
        this.heapifyDown();
        return item;
    }
    add(item) {
        this.heap.push(item);
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
        var _a, _b;
        const destinations = new Map();
        const minHeap = new MinHeap();
        const visited = new Set();
        this.adjList.forEach((_, to) => {
            destinations.set(start, {
                from: start,
                to,
                checkpoints: [],
                distance: Infinity,
            });
        });
        destinations.set(start, {
            from: start,
            to: start,
            checkpoints: [],
            distance: 0,
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
                    const newDistance = currentDistance + distance;
                    const destination = destinations.get(next);
                    const prevDestination = destinations.get(current);
                    const prevCheckpoints = (_a = prevDestination === null || prevDestination === void 0 ? void 0 : prevDestination.checkpoints) !== null && _a !== void 0 ? _a : [];
                    if (newDistance < ((_b = destination === null || destination === void 0 ? void 0 : destination.distance) !== null && _b !== void 0 ? _b : Infinity)) {
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
                            distance: newDistance,
                        });
                        minHeap.add({ to: next, distance: newDistance });
                    }
                }
            }
        }
        return destinations;
    }
}
function main() {
    const graph = new Graph();
    graph.addEdge('0', '1', 4);
    graph.addEdge('0', '2', 1);
    graph.addEdge('2', '1', 2);
    graph.addEdge('1', '3', 1);
    graph.addEdge('2', '3', 5);
    const start = '0';
    const destinations = graph.dijkstra(start);
    destinations.forEach((dest, from) => {
        console.log(`Distance from ${start} to ${from} is ${dest.distance}`, dest);
    });
}
main();
//# sourceMappingURL=index.js.map