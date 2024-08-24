# bigpay-test-trains

## Setup

1. Install nvm https://github.com/nvm-sh/nvm.
1. Run `nvm i` to install NodeJS.
1. Run `npm i` to install packages.

## Test

1. Run `npm start` to compile and execute the tests.

## Solution

1. The graph calculation/navigation is based on Dijkstra's Algorithm with priority queue.
1. For navigation, it is based on dynamic programming, where all combinations will calculated and calculated state (trains' location and packages picked up / delivered by which train) will be cached.
1. With the same distance, routes with the least trains will be picked.
