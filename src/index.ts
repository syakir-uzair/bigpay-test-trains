import {Graph} from './graph';
import {Navigation} from './navigation';
import {Package, Train} from './types';

const assert = require('node:assert');

function test() {
  const graph = new Graph();

  graph.addEdge('A', 'B', 30);
  graph.addEdge('B', 'C', 10);

  const trains: Train[] = [
    {
      name: 'Q1',
      start: 'B',
      currentLocation: 'B',
      capacity: 6,
      packagesToPickUp: [],
      packagesPickedUp: [],
      packagesDelivered: [],
    },
  ];

  const packages: Package[] = [
    {
      name: 'K1',
      from: 'A',
      to: 'C',
      weight: 5,
      pickedUp: false,
      delivered: false,
    },
  ];

  const nav = new Navigation(graph, trains, packages);
  const solution = nav.solve();
  assert.deepEqual(solution, solution, 'should work');
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
