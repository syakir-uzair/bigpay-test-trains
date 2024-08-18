import {Graph} from './graph';
import {Destination, Input, Movement, Output, Package, Train} from './types';

export class Navigation {
  public graph: Graph = new Graph();
  public trains: Map<string, Train> = new Map();
  public packages: Map<string, Package> = new Map();

  constructor(input: Input) {
    for (const edge of input.edges) {
      this.graph.addEdge(edge.from, edge.to, edge.distance);
    }

    for (const train of input.trains) {
      this.trains.set(train.name, {
        ...train,
        currentLocation: train.start,
        totalDistance: 0,
        packagesToPickUp: [],
        packagesPickedUp: [],
        packagesDelivered: [],
      });
    }

    for (const pack of input.packages) {
      this.packages.set(pack.name, {
        ...pack,
        toBePickedUpBy: '',
        pickedUpBy: '',
        deliveredBy: '',
      });
    }
  }

  cloneTrains(trains: Map<string, Train>): Map<string, Train> {
    const newTrains: Map<string, Train> = new Map();

    for (const [name, train] of trains) {
      newTrains.set(name, {
        ...train,
        packagesToPickUp: [...train.packagesToPickUp],
        packagesPickedUp: [...train.packagesPickedUp],
        packagesDelivered: [...train.packagesDelivered],
      });
    }

    return newTrains;
  }

  clonePackages(packages: Map<string, Package>): Map<string, Package> {
    const newPackages: Map<string, Package> = new Map();

    for (const [name, pack] of packages) {
      newPackages.set(name, {...pack});
    }

    return newPackages;
  }

  getOrFail<T>(name: string, map: Map<string, T>): T {
    const item = map.get(name);

    if (!item) {
      throw new Error(`${name} not found`);
    }

    return item;
  }

  getCapableTrains(
    pack: Package,
    packages: Map<string, Package>,
    trains: Map<string, Train>
  ): Train[] {
    const capableTrains: Train[] = [];

    for (const [, train] of trains) {
      const trainPackages = [
        ...train.packagesToPickUp,
        ...train.packagesPickedUp,
      ];
      const packagesTotalWeight = trainPackages.reduce((prev, cur) => {
        const pack = this.getOrFail<Package>(cur, packages);
        return prev + pack.weight;
      }, 0);
      const trainCapacityLeft = train.capacity - packagesTotalWeight;

      if (trainCapacityLeft >= pack.weight) {
        capableTrains.push(train);
      }
    }

    return capableTrains;
  }

  moveTrain(
    train: Train,
    destination: Destination,
    packages: Map<string, Package>,
    movements: Movement[]
  ): Movement[] {
    const checkpoints = destination.checkpoints;
    const newMovements = [...movements];
    const trainMovements = newMovements.filter(mv => mv.train === train.name);
    let startTime =
      // get existing time taken by the train
      trainMovements.length > 0
        ? trainMovements[trainMovements.length - 1].endTime
        : 0;
    let endTime =
      startTime +
      (checkpoints.length ? checkpoints[0].distance : destination.distance);

    const newPackagesPickedUp: string[] = [...train.packagesToPickUp];
    if (newPackagesPickedUp.length) {
      // pick up package(s) scheduled in that location
      train.packagesPickedUp = [
        ...train.packagesPickedUp,
        ...newPackagesPickedUp,
      ];
      train.packagesToPickUp = [];

      for (const packageName of train.packagesPickedUp) {
        const pack = this.getOrFail<Package>(packageName, packages);
        pack.toBePickedUpBy = '';
        pack.pickedUpBy = train.name;
      }
    }

    if (destination.cumulativeDistance) {
      newMovements.push({
        startTime,
        endTime,
        train: train.name,
        from: destination.from,
        to: checkpoints.length ? checkpoints[0].to : destination.to,
        packagesPickedUp: newPackagesPickedUp,
        packagesDelivered: [],
      });
      for (let i = 0; i < checkpoints.length; i++) {
        startTime = endTime;
        endTime =
          startTime +
          (i < checkpoints.length - 1
            ? checkpoints[i + 1].distance
            : destination.distance);
        newMovements.push({
          startTime,
          endTime,
          train: train.name,
          from: checkpoints[i].to,
          to:
            i < checkpoints.length - 1 ? checkpoints[i + 1].to : destination.to,
          packagesPickedUp: [],
          packagesDelivered: [],
        });
      }
      train.currentLocation = destination.to;
      train.totalDistance += destination.cumulativeDistance;
    }

    const packagesToDeliver: string[] = [];
    for (const packageName of [
      ...train.packagesToPickUp,
      ...train.packagesPickedUp,
    ]) {
      const pack = this.getOrFail<Package>(packageName, packages);
      // console.log(
      //   '((((package to deliver before processing',
      //   pack,
      //   train.currentLocation
      // );
      if (pack.to === train.currentLocation) {
        packagesToDeliver.push(packageName);
        pack.deliveredBy = train.name;
      }
      // console.log(
      //   '((((package to deliver after processing',
      //   pack,
      //   train.currentLocation
      // );
    }

    if (packagesToDeliver.length) {
      newMovements[newMovements.length - 1].packagesDelivered = [
        ...packagesToDeliver,
      ];
      train.packagesPickedUp = train.packagesPickedUp.filter(
        pack => !packagesToDeliver.includes(pack)
      );
      train.packagesDelivered = [
        ...train.packagesDelivered,
        ...packagesToDeliver,
      ];
    }

    return newMovements;
  }

  calculate(
    trains: Map<string, Train>,
    packages: Map<string, Package>,
    movements: Movement[]
  ): {
    totalDistance: number;
    movements: Movement[];
  } {
    let minDistance = Infinity;
    let bestMovements: Movement[] = movements;
    let totalCombinations = 0;

    for (const [, pack] of packages) {
      // console.log('------- package first check', pack);
      if (pack.toBePickedUpBy || pack.pickedUpBy || pack.deliveredBy) {
        continue;
      }

      const capableTrains = this.getCapableTrains(pack, packages, trains);
      for (const train of capableTrains) {
        const newTrains = this.cloneTrains(trains);
        const newPackages = this.clonePackages(packages);
        const newTrain = this.getOrFail<Train>(train.name, newTrains);
        const newPackage = this.getOrFail<Package>(pack.name, newPackages);
        // console.log('====train before pickup', newTrain);
        // console.log('====package before pickup', newPackage);
        const destination = this.graph.getDestination(
          newTrain.currentLocation,
          newPackage.from
        );
        const newMovements = this.moveTrain(
          newTrain,
          destination,
          newPackages,
          movements
        );
        newTrain.packagesToPickUp = [
          ...newTrain.packagesToPickUp,
          newPackage.name,
        ];
        newPackage.toBePickedUpBy = newTrain.name;
        // console.log('====movements after pickup', newMovements);
        // console.log('====train after pickup', newTrain);
        // console.log('====package after pickup', newPackage);

        // Recursively calculate until all packages are picked up or delivered
        const {totalDistance: additionalDistance, movements: allMovements} =
          this.calculate(newTrains, newPackages, newMovements);
        const newTotalDistance =
          destination.cumulativeDistance + additionalDistance;
        if (newTotalDistance < minDistance) {
          minDistance = newTotalDistance;
          bestMovements = [...allMovements];
        }
        totalCombinations++;
      }
    }

    for (const [, train] of trains) {
      for (const packageName of [
        ...train.packagesToPickUp,
        ...train.packagesPickedUp,
      ]) {
        const newTrains = this.cloneTrains(trains);
        const newPackages = this.clonePackages(packages);
        const newTrain = this.getOrFail<Train>(train.name, newTrains);
        const newPackage = this.getOrFail<Package>(packageName, newPackages);
        // console.log('))))train before deliver', newTrain);
        // console.log('))))package before deliver', newPackage);
        const destination = this.graph.getDestination(
          newTrain.currentLocation,
          newPackage.to
        );
        const newMovements = this.moveTrain(
          newTrain,
          destination,
          newPackages,
          movements
        );
        // console.log('))))movements after deliver', newMovements);
        // console.log('))))train after deliver', newTrain);
        // console.log('))))package after deliver', newPackage);

        // Recursively calculate until all packages are picked up or delivered
        const {totalDistance: additionalDistance, movements: allMovements} =
          this.calculate(newTrains, newPackages, newMovements);
        const newTotalDistance =
          destination.cumulativeDistance + additionalDistance;
        if (newTotalDistance < minDistance) {
          minDistance = newTotalDistance;
          bestMovements = [...allMovements];
        }
        totalCombinations++;
      }
    }

    // If no combinations left, it could mean either:
    if (totalCombinations === 0) {
      const undeliveredPackages: string[] = [];
      for (const [, pack] of packages) {
        // console.log('______ 0 combo', pack);
        if (!pack.deliveredBy) {
          undeliveredPackages.push(pack.name);
        }
      }

      // All packages are delivered
      if (undeliveredPackages.length === 0) {
        return {
          totalDistance: 0,
          movements: bestMovements,
        };
        // Or something is wrong
      } else {
        throw new Error('No solution found');
      }
    }

    return {
      totalDistance: minDistance,
      movements: bestMovements,
    };
  }

  solve(): Output {
    try {
      const {movements} = this.calculate(this.trains, this.packages, []);

      // console.log(this.movements);
      return movements.map(mv => ({
        W: mv.startTime,
        T: mv.train,
        N1: mv.from,
        P1: mv.packagesPickedUp,
        N2: mv.to,
        P2: mv.packagesDelivered,
      }));
    } catch (e) {
      console.log(e);

      return [];
    }
  }
}
