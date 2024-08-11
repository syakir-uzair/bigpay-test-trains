"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MinHeap = void 0;
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
        const route = this.heap[0];
        this.heap[0] = this.heap[this.heap.length - 1];
        this.heap.pop();
        this.heapifyDown();
        return route;
    }
    add(route) {
        this.heap.push(route);
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
exports.MinHeap = MinHeap;
//# sourceMappingURL=min-heap.js.map