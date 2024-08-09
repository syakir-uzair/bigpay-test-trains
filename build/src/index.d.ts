type Destination = {
    to: string;
    distance: number;
};
declare class MinHeap {
    heap: Destination[];
    constructor();
    getLeftChildIndex(parentIndex: number): number;
    getRightChildIndex(parentIndex: number): number;
    getParentIndex(childIndex: number): number;
    hasLeftChild(index: number): boolean;
    hasRightChild(index: number): boolean;
    hasParent(index: number): boolean;
    leftChild(index: number): Destination;
    rightChild(index: number): Destination;
    parent(index: number): Destination;
    swap(indexOne: number, indexTwo: number): void;
    peek(): Destination | null;
    remove(): Destination | null;
    add(item: Destination): void;
    heapifyUp(): void;
    heapifyDown(): void;
}
declare class Graph {
    adjList: Map<string, Destination[]>;
    constructor();
    addEdge(from: string, to: string, distance: number): void;
    dijkstra(start: string): Map<any, any>;
}
declare function main(): void;
