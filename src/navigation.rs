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

    pub fn get_cache_key(
        trains: HashMap<String, Train>,
        packages: HashMap<String, Package>,
    ) -> String {
        let mut train_locations: Vec<(String, String)> = [].to_vec();
        for (train_name, train) in trains {
            train_locations.push((train_name, train.current_location));
        }
        train_locations.sort_by(|(train_a, _), (train_b, _)| train_a.cmp(train_b));

        let mut packages_to_be_picked_up: Vec<(String, String)> = [].to_vec();
        let mut packages_picked_up: Vec<(String, String)> = [].to_vec();
        let mut packages_delivered: Vec<(String, String)> = [].to_vec();

        for (package_name, pack) in packages {
            if pack.delivered_by != "" {
                packages_delivered.push((package_name.clone(), pack.delivered_by.clone()));
            }
            if pack.picked_up_by != "" {
                packages_picked_up.push((package_name.clone(), pack.picked_up_by.clone()));
            }
            if pack.to_be_picked_up != "" {
                packages_to_be_picked_up.push((package_name.clone(), pack.to_be_picked_up.clone()));
            }
        }
        packages_to_be_picked_up.sort_by(|(package_a, _), (package_b, _)| package_a.cmp(package_b));
        packages_picked_up.sort_by(|(package_a, _), (package_b, _)| package_a.cmp(package_b));
        packages_delivered.sort_by(|(package_a, _), (package_b, _)| package_a.cmp(package_b));

        let train_locations_cache_key =
            train_locations
                .into_iter()
                .fold(String::new(), |acc, (train, location)| {
                    if acc == "" {
                        return format!("{}:{}", train, location);
                    }
                    format!("{},{}:{}", acc, train, location)
                });
        let packages_to_be_picked_up_cache_key =
            packages_to_be_picked_up
                .into_iter()
                .fold(String::new(), |acc, (package, train)| {
                    if acc == "" {
                        return format!("{}:{}", package, train);
                    }
                    format!("{},{}:{}", acc, package, train)
                });
        let packages_picked_up_cache_key =
            packages_picked_up
                .into_iter()
                .fold(String::new(), |acc, (package, train)| {
                    if acc == "" {
                        return format!("{}:{}", package, train);
                    }
                    format!("{},{}:{}", acc, package, train)
                });
        let packages_delivered_cache_key =
            packages_delivered
                .into_iter()
                .fold(String::new(), |acc, (package, train)| {
                    if acc == "" {
                        return format!("{}:{}", package, train);
                    }
                    format!("{},{}:{}", acc, package, train)
                });
        format!(
            "{};{};{};{}",
            train_locations_cache_key,
            packages_to_be_picked_up_cache_key,
            packages_picked_up_cache_key,
            packages_delivered_cache_key
        )
    }
}
