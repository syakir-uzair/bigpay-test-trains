import { Route } from './types';
export declare class MinHeap {
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
