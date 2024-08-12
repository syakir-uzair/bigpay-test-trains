import {Navigation} from './navigation';
import {Output, TestCase} from './types';

const assert = require('node:assert');

const testCases: TestCase[] = [
  {
    title: 'Basic case',
    input: {
      edges: [
        {from: 'A', to: 'B', distance: 30},
        {from: 'B', to: 'C', distance: 10},
      ],
      packages: [{name: 'K1', weight: 5, from: 'A', to: 'C'}],
      trains: [{name: 'Q1', capacity: 6, start: 'B'}],
    },
    expectedOutput: [
      {W: 0, T: 'Q1', N1: 'B', P1: [], N2: 'A', P2: []},
      {W: 30, T: 'Q1', N1: 'A', P1: ['K1'], N2: 'B', P2: []},
      {W: 60, T: 'Q1', N1: 'B', P1: [], N2: 'C', P2: ['K1']},
    ],
  },
  {
    title: 'Invalid package starting location',
    input: {
      edges: [
        {from: 'A', to: 'B', distance: 30},
        {from: 'B', to: 'C', distance: 10},
      ],
      packages: [{name: 'K1', weight: 5, from: 'X', to: 'C'}],
      trains: [{name: 'Q1', capacity: 6, start: 'B'}],
    },
    expectedOutput: [],
  },
  {
    title: 'Invalid package destination',
    input: {
      edges: [
        {from: 'A', to: 'B', distance: 30},
        {from: 'B', to: 'C', distance: 10},
      ],
      packages: [{name: 'K1', weight: 5, from: 'A', to: 'X'}],
      trains: [{name: 'Q1', capacity: 6, start: 'B'}],
    },
    // train is still able to pick up the package
    expectedOutput: [{W: 0, T: 'Q1', N1: 'B', P1: [], N2: 'A', P2: []}],
  },
  {
    title: 'Insufficient train capacity',
    input: {
      edges: [
        {from: 'A', to: 'B', distance: 30},
        {from: 'B', to: 'C', distance: 10},
      ],
      packages: [{name: 'K1', weight: 5, from: 'A', to: 'C'}],
      trains: [{name: 'Q1', capacity: 1, start: 'B'}],
    },
    expectedOutput: [],
  },
  {
    title: 'Should deliver multiple packages if capacity is sufficient',
    input: {
      edges: [
        {from: 'A', to: 'B', distance: 30},
        {from: 'B', to: 'C', distance: 10},
      ],
      packages: [
        {name: 'K1', weight: 5, from: 'A', to: 'C'},
        {name: 'K2', weight: 5, from: 'A', to: 'C'},
        {name: 'K3', weight: 5, from: 'A', to: 'C'},
      ],
      trains: [{name: 'Q1', capacity: 15, start: 'B'}],
    },
    expectedOutput: [
      {W: 0, T: 'Q1', N1: 'B', P1: [], N2: 'A', P2: []},
      {W: 30, T: 'Q1', N1: 'A', P1: ['K1', 'K2', 'K3'], N2: 'B', P2: []},
      {W: 60, T: 'Q1', N1: 'B', P1: [], N2: 'C', P2: ['K1', 'K2', 'K3']},
    ],
  },
  {
    title: 'Should utilize fastest route even with more checkpoints',
    input: {
      edges: [
        // its faster to go from to B via C, and faster to go to D via both B and C
        {from: 'A', to: 'B', distance: 40},
        {from: 'A', to: 'C', distance: 10},
        {from: 'B', to: 'C', distance: 20},
        {from: 'B', to: 'D', distance: 10},
        {from: 'C', to: 'D', distance: 50},
      ],
      packages: [{name: 'K1', weight: 5, from: 'A', to: 'D'}],
      trains: [{name: 'Q1', capacity: 5, start: 'B'}],
    },
    expectedOutput: [
      {W: 0, T: 'Q1', N1: 'B', P1: [], N2: 'C', P2: []},
      {W: 20, T: 'Q1', N1: 'C', P1: [], N2: 'A', P2: []},
      {W: 30, T: 'Q1', N1: 'A', P1: ['K1'], N2: 'C', P2: []},
      {W: 40, T: 'Q1', N1: 'C', P1: [], N2: 'B', P2: []},
      {W: 60, T: 'Q1', N1: 'B', P1: [], N2: 'D', P2: ['K1']},
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
}

test();
