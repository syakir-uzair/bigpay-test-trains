import {Navigation} from './navigation';
import {Output, TestCase} from './types';

const assert = require('node:assert');

const testCases: TestCase[] = [
  {
    title: 'Basic case',
    input: {
      edges: [
        {
          from: 'A',
          to: 'B',
          distance: 30,
        },
        {
          from: 'B',
          to: 'C',
          distance: 10,
        },
      ],
      packages: [{name: 'K1', weight: 5, from: 'A', to: 'C'}],
      trains: [{name: 'Q1', capacity: 6, start: 'B'}],
    },
    expectedOutput: [
      {
        W: 0,
        T: 'Q1',
        N1: 'B',
        P1: [],
        N2: 'A',
        P2: [],
      },
      {
        W: 30,
        T: 'Q1',
        N1: 'A',
        P1: ['K1'],
        N2: 'B',
        P2: [],
      },
      {
        W: 60,
        T: 'Q1',
        N1: 'B',
        P1: [],
        N2: 'C',
        P2: ['K1'],
      },
    ],
  },
];

function test() {
  for (const testCase of testCases) {
    let solution: Output = [];

    try {
      console.log('Running test case for:', testCase.title);
      const nav = new Navigation(testCase.input);
      solution = nav.solve();
      assert.deepEqual(solution, testCase.expectedOutput, testCase.title);
      console.log('Success!');
    } catch (e) {
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
