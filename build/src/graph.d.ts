import { Destination, Route } from './types';
export declare class Graph {
    adjList: Map<string, Route[]>;
    cache: Map<string, Map<string, Destination>>;
    constructor();
    addEdge(from: string, to: string, distance: number): void;
    dijkstra(start: string): Map<string, Destination>;
}
