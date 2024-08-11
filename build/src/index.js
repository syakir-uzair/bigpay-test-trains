"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graph_1 = require("./graph");
const assert = require('node:assert');
class Navigation {
    constructor(graph, trains, packages) {
        this.nearestTrainToPickUp = null;
        this.nearestDestinationToDeliver = null;
        this.movements = [];
        this.packagesToPickUp = new Map();
        this.graph = graph;
        this.trains = trains;
        this.packages = packages;
    }
    getCapableTrains(weight) {
        return this.trains.filter(train => train.capacity -
            [...train.packagesToPickUp, ...train.packagesPickedUp].reduce((prev, cur) => prev + cur.weight, 0) >=
            weight);
    }
    findNearestPackageToPickUp(undeliveredPackages) {
        var _a;
        for (const pack of undeliveredPackages) {
            // Ensure that the trains have the capacity
            const capableTrains = this.getCapableTrains(pack.weight);
            for (const train of capableTrains) {
                const destination = this.graph
                    .dijkstra(train.currentLocation)
                    .get(pack.from);
                if (!destination) {
                    continue;
                }
                const cumulativeDistance = (_a = destination === null || destination === void 0 ? void 0 : destination.cumulativeDistance) !== null && _a !== void 0 ? _a : 0;
                if (this.nearestTrainToPickUp === null ||
                    cumulativeDistance <
                        this.nearestTrainToPickUp.destination.cumulativeDistance) {
                    this.nearestTrainToPickUp = {
                        train,
                        package: pack,
                        destination,
                    };
                }
            }
        }
    }
    findNearestDestinationToDeliver() {
        var _a;
        for (const train of this.trains) {
            for (const packageToDeliver of [
                ...train.packagesToPickUp,
                ...train.packagesPickedUp,
            ]) {
                const destination = this.graph
                    .dijkstra(train.currentLocation)
                    .get(packageToDeliver.to);
                if (!destination) {
                    continue;
                }
                const cumulativeDistance = (_a = destination === null || destination === void 0 ? void 0 : destination.cumulativeDistance) !== null && _a !== void 0 ? _a : 0;
                if (this.nearestDestinationToDeliver === null ||
                    cumulativeDistance <
                        this.nearestDestinationToDeliver.destination.cumulativeDistance) {
                    this.nearestDestinationToDeliver = {
                        train,
                        destination,
                    };
                }
            }
        }
    }
    moveTrain(train, destination, packagesToDeliver = []) {
        const checkpoints = destination.checkpoints;
        const trainMovements = this.movements.filter(mv => mv.train === train);
        let startTime = 
        // get existing time taken by the train
        trainMovements.length > 0
            ? trainMovements[trainMovements.length - 1].endTime
            : 0;
        let endTime = startTime + destination.distance;
        let packagesPickedUp = [];
        if (train.packagesToPickUp.length) {
            // pick up package(s) scheduled in that location
            packagesPickedUp = train.packagesToPickUp;
            train.packagesPickedUp = packagesPickedUp;
            train.packagesToPickUp = [];
        }
        this.movements.push({
            startTime,
            endTime,
            train,
            from: destination.from,
            to: checkpoints.length ? checkpoints[0].to : destination.to,
            packagesPickedUp,
            packagesDelivered: [],
        });
        if (checkpoints.length) {
            for (let i = 0; i < checkpoints.length; i++) {
                startTime = endTime;
                endTime = startTime + checkpoints[i].distance;
                this.movements.push({
                    startTime,
                    endTime,
                    train,
                    from: checkpoints[i].to,
                    to: i < checkpoints.length - 1 ? checkpoints[i + 1].to : destination.to,
                    packagesPickedUp: [],
                    packagesDelivered: [],
                });
            }
        }
        train.currentLocation = destination.to;
        if (packagesToDeliver.length) {
            this.movements[this.movements.length - 1].packagesDelivered =
                packagesToDeliver;
            train.packagesPickedUp = train.packagesPickedUp.filter(pack => !packagesToDeliver.includes(pack));
            train.packagesDelivered.concat(packagesToDeliver);
            for (const pack of packagesToDeliver) {
                pack.delivered = true;
            }
        }
    }
    pickUpPackage(nearestTrainToPickUp) {
        const { train, destination } = nearestTrainToPickUp;
        this.moveTrain(train, destination);
        // packages should only be picked up by the train on the next move
        train.packagesToPickUp.push(nearestTrainToPickUp.package);
        // mark package as picked up
        nearestTrainToPickUp.package.pickedUp = true;
        this.nearestTrainToPickUp = null;
    }
    deliverPackage(nearestDestinationToDeliver) {
        const { train, destination } = nearestDestinationToDeliver;
        const packagesToDeliver = [
            ...train.packagesToPickUp,
            ...train.packagesPickedUp,
        ].filter(pack => pack.to === destination.to);
        this.moveTrain(train, destination, packagesToDeliver);
    }
    solve() {
        let i = 0;
        let unpickedUpPackages = this.packages.filter(pack => !pack.pickedUp && !pack.delivered);
        let undeliveredPackages = this.packages.filter(pack => !pack.delivered);
        while (undeliveredPackages.length > 0 &&
            unpickedUpPackages.length > 0 &&
            i++ < 10) {
            if (this.nearestTrainToPickUp) {
                this.pickUpPackage(this.nearestTrainToPickUp);
            }
            this.findNearestPackageToPickUp(unpickedUpPackages);
            // If there is no package can be picked up, deliver first
            if (!this.nearestTrainToPickUp) {
                this.findNearestDestinationToDeliver();
                if (this.nearestDestinationToDeliver) {
                    this.deliverPackage(this.nearestDestinationToDeliver);
                }
                break;
            }
            unpickedUpPackages = this.packages.filter(pack => !pack.pickedUp && !pack.delivered);
            undeliveredPackages = this.packages.filter(pack => !pack.delivered);
        }
        return this.movements;
    }
}
function test() {
    const graph = new graph_1.Graph();
    graph.addEdge('A', 'B', 30);
    graph.addEdge('B', 'C', 10);
    const trains = [
        {
            name: 'Q1',
            start: 'B',
            currentLocation: 'B',
            capacity: 6,
            packagesToPickUp: [],
            packagesPickedUp: [],
            packagesDelivered: [],
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
    assert.deepEqual(solution, solution, 'should work');
    // console.log(solution);
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