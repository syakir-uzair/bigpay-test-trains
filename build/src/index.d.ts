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
declare class MinHeap {
    heap: Route[];
    constructor();
    getLeftChildIndex(parentIndex: number): number;
    getRightChildIndex(parentIndex: number): number;
    getParentIndex(childIndex: number): number;
    hasLeftChild(index: number): boolean;
    hasRightChild(index: number): boolean;
    hasParent(index: number): boolean;
    leftChild(index: number): Route;
    rightChild(index: number): Route;
    parent(index: number): Route;
    swap(indexOne: number, indexTwo: number): void;
    peek(): Route | null;
    remove(): Route | null;
    add(route: Route): void;
    heapifyUp(): void;
    heapifyDown(): void;
}
declare class Graph {
    adjList: Map<string, Route[]>;
    cache: Map<string, Map<string, Destination>>;
    constructor();
    addEdge(from: string, to: string, distance: number): void;
    dijkstra(start: string): Map<string, Destination>;
}
type Train = {
    name: string;
    start: string;
    currentLocation: string;
    capacity: number;
    packages: Package[];
};
type Package = {
    name: string;
    from: string;
    to: string;
    weight: number;
    pickedUp: boolean;
    delivered: boolean;
};
type TrainToPickup = {
    train: Train;
    package: Package;
    destination: Destination;
    distance: number;
};
type Movement = {
    startTime: number;
    endTime: number;
    train: Train;
    from: string;
    to: string;
    packagesPickedUp: Package[];
    packagesDelivered: Package[];
};
declare class Navigation {
    graph: Graph;
    trains: Train[];
    packages: Package[];
    nearestTrainToPickUp: TrainToPickup | null;
    movements: Movement[];
    constructor(graph: Graph, trains: Train[], packages: Package[]);
    getCapableTrains(weight: number): Train[];
    findNearestPackageToPickUp(pack: Package, capableTrains: Train[]): void;
    moveTrain(train: Train, destination: Destination): void;
    pickUpPackage(nearestTrainToPickUp: TrainToPickup): void;
    solve(): Movement[];
}
declare function test(): void;
