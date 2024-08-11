import { Graph } from './graph';
import { Destination, Movement, Package, Train, TrainDeliverQueue, TrainPickUpQueue } from './types';
export declare class Navigation {
    graph: Graph;
    trains: Train[];
    packages: Package[];
    nearestTrainToPickUp: TrainPickUpQueue | null;
    nearestDestinationToDeliver: TrainDeliverQueue | null;
    movements: Movement[];
    packagesToPickUp: Map<string, Package[]>;
    constructor(graph: Graph, trains: Train[], packages: Package[]);
    getCapableTrains(weight: number): Train[];
    findNearestPackageToPickUp(undeliveredPackages: Package[]): void;
    findNearestDestinationToDeliver(): void;
    moveTrain(train: Train, destination: Destination, packagesToDeliver?: Package[]): void;
    pickUpPackage(nearestTrainToPickUp: TrainPickUpQueue): void;
    deliverPackage(nearestDestinationToDeliver: TrainDeliverQueue): void;
    solve(): Movement[];
}
