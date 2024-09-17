use std::collections::HashMap;

use crate::{graph::Graph, input::Input, movement::Movement, package::Package, train::Train};

pub struct Navigation {
    pub graph: Graph,
    pub trains: HashMap<String, Train>,
    pub packages: HashMap<String, Package>,
    pub cache: HashMap<String, Vec<Movement>>,
}

impl Navigation {
    pub fn new(input: Input) -> Navigation {
        let mut graph = Graph::new();
        let mut trains: HashMap<String, Train> = HashMap::new();
        let mut packages: HashMap<String, Package> = HashMap::new();

        for (_name, from, to, distance) in input.edges {
            graph.add_edge(from, to, distance);
        }

        for (name, capacity, start) in input.trains {
            trains.insert(name.clone(), Train::new(name.clone(), capacity, start));
        }

        for (name, weight, from, to) in input.packages {
            packages.insert(name.clone(), Package::new(name, weight, from, to));
        }

        Navigation {
            graph,
            trains,
            packages,
            cache: HashMap::new(),
        }
    }
}
