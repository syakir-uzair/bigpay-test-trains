export type Route = {
  to: string;
  distance: number;
};

export type Destination = {
  from: string;
  to: string;
  distance: number;
  cumulativeDistance: number;
  checkpoints: Route[];
};

export type Train = {
  name: string;
  start: string;
  currentLocation: string;
  capacity: number;
  totalDistance: number;
  packagesToPickUp: Package[];
  packagesPickedUp: Package[];
  packagesDelivered: Package[];
};

export type Package = {
  name: string;
  from: string;
  to: string;
  weight: number;
  pickedUp: boolean;
  delivered: boolean;
};

export type TrainPickUpQueue = {
  train: Train;
  package: Package;
  destination: Destination;
};

export type TrainDeliverQueue = {
  train: Train;
  destination: Destination;
};

export type Movement = {
  startTime: number;
  endTime: number;
  train: Train;
  from: string;
  to: string;
  packagesPickedUp: Package[];
  packagesDelivered: Package[];
};

export type Input = {
  edges: {
    from: string;
    to: string;
    distance: number;
  }[];
  packages: {
    name: string;
    weight: number;
    from: string;
    to: string;
  }[];
  trains: {
    name: string;
    capacity: number;
    start: string;
  }[];
};

export type Output = {
  W: number;
  T: string;
  N1: string;
  P1: string[];
  N2: string;
  P2: string[];
}[];

export type TestCase = {
  title: string;
  input: Input;
  expectedOutput: Output;
};
