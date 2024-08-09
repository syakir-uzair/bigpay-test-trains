type Destination = {
    to: string;
    distance: number;
};
declare class Node {
    value: Destination;
    left: NullableNode;
    right: NullableNode;
    parent: NullableNode;
    constructor(value: Destination);
}
type NullableNode = Node | null;
declare class DestinationPriorityQueue {
    root: NullableNode;
    lastNode: NullableNode;
    constructor();
    insert(value: Destination): void;
    bubbleUp(node: Node): void;
    swap(node1: Node, node2: Node): void;
    findInsertPosition(): NullableNode;
    extractMin(): Destination | null;
    removeLastNode(): void;
    bubbleDown(node: Node): void;
    isEmpty(): boolean;
}
declare class Graph {
    adjList: Map<string, Destination[]>;
    constructor();
    addEdge(from: string, to: string, distance: number): void;
    dijkstra(start: string): Map<any, any>;
}
declare function main(): void;
