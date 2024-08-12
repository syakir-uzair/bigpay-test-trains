import {Graph} from './graph';
import {
  Destination,
  Movement,
  Output,
  Package,
  TestCase,
  Train,
  TrainDeliverQueue,
  TrainPickUpQueue,
} from './types';

export class Navigation {
  public graph: Graph;
  public trains: Train[];
  public packages: Package[];
  public bestTrainToPickUp: TrainPickUpQueue | null = null;
  public nearestDestinationToDeliver: TrainDeliverQueue | null = null;
  public movements: Movement[] = [];
  public packagesToPickUp: Map<string, Package[]> = new Map();

  constructor(input: TestCase['input']) {
    const graph = new Graph();

    for (const edge of input.edges) {
      graph.addEdge(edge.from, edge.to, edge.distance);
    }

    const trains: Train[] = input.trains.map(train => ({
      ...train,
      currentLocation: train.start,
      packagesToPickUp: [],
      packagesPickedUp: [],
      packagesDelivered: [],
    }));

    const packages: Package[] = input.packages.map(pack => ({
      ...pack,
      pickedUp: false,
      delivered: false,
    }));

    this.graph = graph;
    this.trains = trains;
    this.packages = packages;
  }

  getCapableTrains(weight: number) {
    return this.trains.filter(
      train =>
        train.capacity -
          [...train.packagesToPickUp, ...train.packagesPickedUp].reduce(
            (prev, cur) => prev + cur.weight,
            0
          ) >=
        weight
    );
  }

  findNextPackageToPickUp() {
    for (const pack of this.packages) {
      if (pack.pickedUp || pack.delivered) {
        continue;
      }

      // Ensure that the trains have the capacity
      const capableTrains = this.getCapableTrains(pack.weight);
      for (const train of capableTrains) {
        const destination = this.graph.getDestination(
          train.currentLocation,
          pack.from
        );

        const cumulativeDistance = destination?.cumulativeDistance ?? 0;
        if (
          this.bestTrainToPickUp === null ||
          cumulativeDistance <
            this.bestTrainToPickUp.destination.cumulativeDistance
        ) {
          this.bestTrainToPickUp = {
            train,
            package: pack,
            destination,
          };
        }
      }
    }
  }

  findNearestDestinationToDeliver() {
    for (const train of this.trains) {
      for (const packageToDeliver of [
        ...train.packagesToPickUp,
        ...train.packagesPickedUp,
      ]) {
        const destination = this.graph.getDestination(
          train.currentLocation,
          packageToDeliver.to
        );

        const cumulativeDistance = destination?.cumulativeDistance ?? 0;
        if (
          this.nearestDestinationToDeliver === null ||
          cumulativeDistance <
            this.nearestDestinationToDeliver.destination.cumulativeDistance
        ) {
          this.nearestDestinationToDeliver = {
            train,
            destination,
          };
        }
      }
    }
  }

  moveTrain(
    train: Train,
    destination: Destination,
    packagesToDeliver: Package[] = []
  ) {
    const checkpoints = destination.checkpoints;
    const trainMovements = this.movements.filter(mv => mv.train === train);
    let startTime =
      // get existing time taken by the train
      trainMovements.length > 0
        ? trainMovements[trainMovements.length - 1].endTime
        : 0;
    let endTime =
      startTime +
      (checkpoints.length ? checkpoints[0].distance : destination.distance);
    let packagesPickedUp: Package[] = [];

    if (train.packagesToPickUp.length) {
      // pick up package(s) scheduled in that location
      packagesPickedUp = train.packagesToPickUp;
      train.packagesPickedUp = packagesPickedUp;
      train.packagesToPickUp = [];
    }

    this.movements.push({
      startTime,
      endTime,
      train,
      from: destination.from,
      to: checkpoints.length ? checkpoints[0].to : destination.to,
      packagesPickedUp,
      packagesDelivered: [],
    });
    if (checkpoints.length) {
      for (let i = 0; i < checkpoints.length; i++) {
        startTime = endTime;
        endTime =
          startTime +
          (i < checkpoints.length - 1
            ? checkpoints[i + 1].distance
            : destination.distance);
        this.movements.push({
          startTime,
          endTime,
          train,
          from: checkpoints[i].to,
          to:
            i < checkpoints.length - 1 ? checkpoints[i + 1].to : destination.to,
          packagesPickedUp: [],
          packagesDelivered: [],
        });
      }
    }
    train.currentLocation = destination.to;

    if (packagesToDeliver.length) {
      this.movements[this.movements.length - 1].packagesDelivered =
        packagesToDeliver;
      train.packagesPickedUp = train.packagesPickedUp.filter(
        pack => !packagesToDeliver.includes(pack)
      );
      train.packagesDelivered.concat(packagesToDeliver);

      for (const pack of packagesToDeliver) {
        pack.delivered = true;
      }
    }
  }

  pickUpPackage(bestTrainToPickUp: TrainPickUpQueue) {
    const {train, destination} = bestTrainToPickUp;
    if (destination.cumulativeDistance) {
      this.moveTrain(train, destination);
    }
    // packages should only be picked up by the train on the next move
    train.packagesToPickUp.push(bestTrainToPickUp.package);
    // mark package as picked up
    bestTrainToPickUp.package.pickedUp = true;
    this.bestTrainToPickUp = null;
  }

  deliverPackage(nearestDestinationToDeliver: TrainDeliverQueue) {
    const {train, destination} = nearestDestinationToDeliver;
    const packagesToDeliver = [
      ...train.packagesToPickUp,
      ...train.packagesPickedUp,
    ].filter(pack => pack.to === destination.to);
    this.moveTrain(train, destination, packagesToDeliver);
  }

  calculate() {
    let unpickedUpPackages = this.packages.filter(pack => !pack.pickedUp);
    let undeliveredPackages = this.packages.filter(pack => !pack.delivered);

    while (undeliveredPackages.length > 0 && unpickedUpPackages.length > 0) {
      if (this.bestTrainToPickUp) {
        this.pickUpPackage(this.bestTrainToPickUp);
      }

      this.findNextPackageToPickUp();

      // If there is no package can be picked up, deliver first
      if (!this.bestTrainToPickUp) {
        this.findNearestDestinationToDeliver();

        if (this.nearestDestinationToDeliver) {
          this.deliverPackage(this.nearestDestinationToDeliver);
        } else {
          // something is wrong, break out of the loop
          break;
        }
      }

      unpickedUpPackages = this.packages.filter(pack => !pack.pickedUp);
      undeliveredPackages = this.packages.filter(pack => !pack.delivered);
    }
  }

  solve(): Output {
    try {
      this.calculate();

      // console.log(this.movements);
      return this.movements.map(mv => ({
        W: mv.startTime,
        T: mv.train.name,
        N1: mv.from,
        P1: mv.packagesPickedUp.map(pack => pack.name),
        N2: mv.to,
        P2: mv.packagesDelivered.map(pack => pack.name),
      }));
    } catch (e) {
      // console.log(e);

      return [];
    }
  }
}
