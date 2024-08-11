"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const navigation_1 = require("./navigation");
const assert = require('node:assert');
const testCases = [
    {
        title: 'Basic case',
        input: {
            edges: [
                { from: 'A', to: 'B', distance: 30 },
                { from: 'B', to: 'C', distance: 10 },
            ],
            packages: [{ name: 'K1', weight: 5, from: 'A', to: 'C' }],
            trains: [{ name: 'Q1', capacity: 6, start: 'B' }],
        },
        expectedOutput: [
            { W: 0, T: 'Q1', N1: 'B', P1: [], N2: 'A', P2: [] },
            { W: 30, T: 'Q1', N1: 'A', P1: ['K1'], N2: 'B', P2: [] },
            { W: 60, T: 'Q1', N1: 'B', P1: [], N2: 'C', P2: ['K1'] },
        ],
    },
    {
        title: 'Invalid package starting location',
        input: {
            edges: [
                { from: 'A', to: 'B', distance: 30 },
                { from: 'B', to: 'C', distance: 10 },
            ],
            packages: [{ name: 'K1', weight: 5, from: 'X', to: 'C' }],
            trains: [{ name: 'Q1', capacity: 6, start: 'B' }],
        },
        expectedOutput: [],
    },
    {
        title: 'Invalid package destination',
        input: {
            edges: [
                { from: 'A', to: 'B', distance: 30 },
                { from: 'B', to: 'C', distance: 10 },
            ],
            packages: [{ name: 'K1', weight: 5, from: 'A', to: 'X' }],
            trains: [{ name: 'Q1', capacity: 6, start: 'B' }],
        },
        // train is still able to pick up the package
        expectedOutput: [{ W: 0, T: 'Q1', N1: 'B', P1: [], N2: 'A', P2: [] }],
    },
    {
        title: 'Insufficient train capacity',
        input: {
            edges: [
                { from: 'A', to: 'B', distance: 30 },
                { from: 'B', to: 'C', distance: 10 },
            ],
            packages: [{ name: 'K1', weight: 5, from: 'A', to: 'C' }],
            trains: [{ name: 'Q1', capacity: 1, start: 'B' }],
        },
        expectedOutput: [],
    },
    {
        title: 'Should utilize fastest route even with more checkpoints',
        input: {
            edges: [
                { from: 'A', to: 'B', distance: 40 },
                { from: 'A', to: 'C', distance: 10 },
                { from: 'B', to: 'C', distance: 20 },
                { from: 'B', to: 'D', distance: 10 },
                { from: 'C', to: 'D', distance: 50 },
            ],
            packages: [{ name: 'K1', weight: 5, from: 'A', to: 'D' }],
            trains: [{ name: 'Q1', capacity: 5, start: 'B' }],
        },
        expectedOutput: [
            { W: 0, T: 'Q1', N1: 'B', P1: [], N2: 'C', P2: [] },
            { W: 20, T: 'Q1', N1: 'C', P1: [], N2: 'A', P2: [] },
            { W: 30, T: 'Q1', N1: 'A', P1: ['K1'], N2: 'C', P2: [] },
            { W: 40, T: 'Q1', N1: 'C', P1: [], N2: 'B', P2: [] },
            { W: 60, T: 'Q1', N1: 'B', P1: [], N2: 'D', P2: ['K1'] },
        ],
    },
];
function test() {
    for (const testCase of testCases) {
        let solution = [];
        try {
            console.log('Running test case for:', testCase.title);
            const nav = new navigation_1.Navigation(testCase.input);
            solution = nav.solve();
            assert.deepEqual(solution, testCase.expectedOutput, testCase.title);
            console.log('Success!');
        }
        catch (e) {
            console.error('Failed!');
            console.log('Expected:', testCase.expectedOutput);
            console.log('Received:', solution);
        }
    }
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