type Route = {
    to: string;
    distance: number;
};
type Destination = {
    from: string;
    to: string;
    distance: number;
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
    add(item: Route): void;
    heapifyUp(): void;
    heapifyDown(): void;
}
declare class Graph {
    adjList: Map<string, Route[]>;
    constructor();
    addEdge(from: string, to: string, distance: number): void;
    dijkstra(start: string): Map<string, Destination>;
}
declare function main(): void;
