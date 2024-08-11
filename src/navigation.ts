import {Graph} from './graph';
import {
  Destination,
  Movement,
  Package,
  Train,
  TrainDeliverQueue,
  TrainPickUpQueue,
} from './types';

export class Navigation {
  public graph: Graph;
  public trains: Train[];
  public packages: Package[];
  public nearestTrainToPickUp: TrainPickUpQueue | null = null;
  public nearestDestinationToDeliver: TrainDeliverQueue | null = null;
  public movements: Movement[] = [];
  public packagesToPickUp: Map<string, Package[]> = new Map();

  constructor(graph: Graph, trains: Train[], packages: Package[]) {
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

  findNearestPackageToPickUp(undeliveredPackages: Package[]) {
    for (const pack of undeliveredPackages) {
      // Ensure that the trains have the capacity
      const capableTrains = this.getCapableTrains(pack.weight);
      for (const train of capableTrains) {
        const destination = this.graph
          .dijkstra(train.currentLocation)
          .get(pack.from);

        if (!destination) {
          continue;
        }

        const cumulativeDistance = destination?.cumulativeDistance ?? 0;
        if (
          this.nearestTrainToPickUp === null ||
          cumulativeDistance <
            this.nearestTrainToPickUp.destination.cumulativeDistance
        ) {
          this.nearestTrainToPickUp = {
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
        const destination = this.graph
          .dijkstra(train.currentLocation)
          .get(packageToDeliver.to);

        if (!destination) {
          continue;
        }

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
    let endTime = startTime + destination.distance;
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
        endTime = startTime + checkpoints[i].distance;
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

  pickUpPackage(nearestTrainToPickUp: TrainPickUpQueue) {
    const {train, destination} = nearestTrainToPickUp;
    this.moveTrain(train, destination);
    // packages should only be picked up by the train on the next move
    train.packagesToPickUp.push(nearestTrainToPickUp.package);
    // mark package as picked up
    nearestTrainToPickUp.package.pickedUp = true;
    this.nearestTrainToPickUp = null;
  }

  deliverPackage(nearestDestinationToDeliver: TrainDeliverQueue) {
    const {train, destination} = nearestDestinationToDeliver;
    const packagesToDeliver = [
      ...train.packagesToPickUp,
      ...train.packagesPickedUp,
    ].filter(pack => pack.to === destination.to);
    this.moveTrain(train, destination, packagesToDeliver);
  }

  solve() {
    let i = 0;
    let unpickedUpPackages = this.packages.filter(
      pack => !pack.pickedUp && !pack.delivered
    );
    let undeliveredPackages = this.packages.filter(pack => !pack.delivered);

    while (
      undeliveredPackages.length > 0 &&
      unpickedUpPackages.length > 0 &&
      i++ < 10
    ) {
      if (this.nearestTrainToPickUp) {
        this.pickUpPackage(this.nearestTrainToPickUp);
      }

      this.findNearestPackageToPickUp(unpickedUpPackages);

      // If there is no package can be picked up, deliver first
      if (!this.nearestTrainToPickUp) {
        this.findNearestDestinationToDeliver();

        if (this.nearestDestinationToDeliver) {
          this.deliverPackage(this.nearestDestinationToDeliver);
        }

        break;
      }

      unpickedUpPackages = this.packages.filter(
        pack => !pack.pickedUp && !pack.delivered
      );
      undeliveredPackages = this.packages.filter(pack => !pack.delivered);
    }

    return this.movements;
  }
}
