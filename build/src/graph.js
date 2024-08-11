"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Graph = void 0;
const min_heap_1 = require("./min-heap");
class Graph {
    constructor() {
        this.adjList = new Map();
        this.cache = new Map();
    }
    addEdge(from, to, distance) {
        const froms = this.adjList.get(from);
        const tos = this.adjList.get(to);
        if (froms) {
            froms.push({ to, distance });
        }
        else {
            this.adjList.set(from, [{ to, distance }]);
        }
        if (tos) {
            tos.push({ to: from, distance });
        }
        else {
            this.adjList.set(to, [{ to: from, distance }]);
        }
    }
    dijkstra(start) {
        var _a, _b, _c;
        const destinations = new Map();
        const minHeap = new min_heap_1.MinHeap();
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
        minHeap.add({ to: start, distance: 0 });
        while (minHeap.heap.length) {
            const min = minHeap.remove();
            // typescript undefined handling
            if (!min) {
                break;
            }
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
                if (newCumulativeDistance < ((_c = destination === null || destination === void 0 ? void 0 : destination.cumulativeDistance) !== null && _c !== void 0 ? _c : Infinity)) {
                    const checkpoints = (prevDestination === null || prevDestination === void 0 ? void 0 : prevDestination.checkpoints.length)
                        ? [
                            ...prevCheckpoints,
                            {
                                to: current,
                                // since current distance is cumulative sum, deduct from final checkpoint distance
                                distance: currentDistance -
                                    prevCheckpoints[prevCheckpoints.length - 1].distance,
                            },
                        ]
                        : current !== start
                            ? [{ to: current, distance: currentDistance }]
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
        this.cache.set(start, destinations);
        return destinations;
    }
}
exports.Graph = Graph;
//# sourceMappingURL=graph.js.map