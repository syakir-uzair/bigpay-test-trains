# bigpay-test-trains

## Setup

1. Install nvm https://github.com/nvm-sh/nvm.
1. Run `nvm i` to install NodeJS.
1. Run `npm i` to install packages.

## Test

1. Run `npm start` to compile and execute the tests.

## Solution

1. The graph calculation/navigation is based on Dijkstra's Algorithm with priority queue.
1. For navigation, packages are looped to find the fastest train that can complete the delivery, including the delivery of the train's picked up packages.
1. At the same, all picked up packages are looped to find the nearest destination to delivery.
1. If its nearer to pick up, the train scheduled to pick up will move first. Otherwise, the train scheduled for delivery will move first.
1. Trains with more capacity will always be prioritized.
1. Recalculation mentioned in number 2 and number 3 will rerun after every move is made.
