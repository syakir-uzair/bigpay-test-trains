use std::collections::{HashMap, HashSet};

use crate::{
    destination::Destination, graph::Graph, input::Input, movement::Movement, package::Package,
    train::Train,
};

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
            if pack.to_be_picked_up_by != "" {
                packages_to_be_picked_up
                    .push((package_name.clone(), pack.to_be_picked_up_by.clone()));
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
    pub fn get_capable_trains(
        pack: Package,
        packages: HashMap<String, Package>,
        trains: HashMap<String, Train>,
    ) -> Vec<Train> {
        let mut capable_trains: Vec<Train> = [].to_vec();
        for (_, train) in trains {
            let mut train_packages = train.packages_to_pick_up.clone();
            for package_picked_up in train.packages_picked_up.clone() {
                train_packages.push(package_picked_up);
            }
            let packages_total_weight: i32 = train_packages.into_iter().fold(0, |acc, package| {
                let weight = match packages.get(&package) {
                    Some(item) => item.weight,
                    None => {
                        panic!("Package not found.");
                    }
                };
                acc + weight
            });
            let train_capacity_left = train.capacity - packages_total_weight;

            if train_capacity_left >= pack.weight {
                capable_trains.push(train.clone());
            }
        }

        capable_trains
    }
    pub fn get_packages_to_deliver(
        train: Train,
        packages: HashMap<String, Package>,
        to: String,
    ) -> Vec<String> {
        let mut packages_to_deliver: Vec<String> = [].to_vec();

        for package_name in train.packages_to_pick_up {
            match packages.get(&package_name) {
                Some(package) => {
                    if package.to == to {
                        packages_to_deliver.push(package_name.clone());
                    }
                }
                None => {
                    panic!("package not found");
                }
            }
        }

        for package_name in train.packages_picked_up {
            match packages.get(&package_name) {
                Some(package) => {
                    if package.to == to {
                        packages_to_deliver.push(package_name);
                    }
                }
                None => {
                    panic!("package not found");
                }
            }
        }
        packages_to_deliver
    }

    pub fn move_train(
        train: Train,
        destination: Destination,
        packages: HashMap<String, Package>,
        movements: Vec<Movement>,
    ) -> (Vec<Movement>, Vec<String>, Vec<String>) {
        let checkpoints = destination.checkpoints;
        let mut new_movements = movements.clone();
        let mut train_movements: Vec<Movement> = [].to_vec();
        for movement in new_movements.clone() {
            if movement.train == train.name {
                train_movements.push(movement);
            }
        }

        let mut start_time = 0;
        if train_movements.len() > 0 {
            start_time = train_movements[train_movements.len() - 1].end_time;
        }

        let mut end_time = start_time + destination.distance;
        if checkpoints.len() > 0 {
            end_time = start_time + checkpoints[0].distance;
        }

        let mut packages_picked_up: Vec<String> = vec![];
        let mut packages_delivered: Vec<String> = vec![];
        if destination.cumulative_distance == 0 {
            return (
                new_movements.clone(),
                packages_picked_up.clone(),
                packages_delivered.clone(),
            );
        }

        for package in train.packages_to_pick_up.clone() {
            packages_picked_up.push(package);
        }

        let mut to = destination.to;
        if checkpoints.len() > 0 {
            to = checkpoints[0].to.clone();
        }

        let packages_to_deliver =
            Navigation::get_packages_to_deliver(train.clone(), packages.clone(), to.clone());

        new_movements.push(Movement {
            start_time,
            end_time,
            from: destination.from,
            to: to.clone(),
            train: train.name.clone(),
            packages_picked_up: packages_picked_up.clone(),
            packages_delivered: packages_to_deliver.clone(),
        });

        for package in packages_to_deliver.clone() {
            packages_delivered.push(package);
        }

        let mut i = 0;
        let checkpoints_len = checkpoints.len();
        for checkpoint in checkpoints.clone() {
            let start_time = end_time;
            let mut end_time = start_time + destination.distance;
            if i < checkpoints_len - 1 {
                end_time = start_time + checkpoints[i + 1].distance;
            }
            i += 1;

            let packages_to_deliver =
                Navigation::get_packages_to_deliver(train.clone(), packages.clone(), to.clone());
            new_movements.push(Movement {
                start_time,
                end_time,
                train: train.name.clone(),
                from: checkpoint.to.clone(),
                to: to.clone(),
                packages_picked_up: vec![],
                packages_delivered: packages_to_deliver.clone(),
            });
            for package in packages_to_deliver.clone() {
                packages_delivered.push(package);
            }
        }

        // TODO: Package and Train update. Should pass outside
        return (
            new_movements.clone(),
            packages_picked_up.clone(),
            packages_delivered.clone(),
        );
    }
    pub fn get_longest_distance_in_movements(movements: Vec<Movement>) -> i32 {
        let mut longest_distance = 0;
        for movement in movements.clone() {
            if movement.end_time > longest_distance {
                longest_distance = movement.end_time
            }
        }
        longest_distance
    }
    pub fn get_number_of_trains(movements: Vec<Movement>) -> i32 {
        let mut trains: HashSet<String> = HashSet::new();
        for movement in movements.clone() {
            if !trains.contains(&movement.train) {
                trains.insert(movement.train.clone());
            }
        }
        trains.len() as i32
    }
    pub fn calculate(
        &mut self,
        trains: HashMap<String, Train>,
        packages: HashMap<String, Package>,
        movements: Vec<Movement>,
    ) -> Vec<Movement> {
        let mut min_distance: i32 = i32::max_value();
        let mut min_trains: i32 = i32::max_value();
        let mut best_movements: Vec<Movement> = movements.clone();
        let cache_key = Navigation::get_cache_key(trains.clone(), packages.clone());
        match self.cache.get(&cache_key) {
            Some(movements) => {
                return movements.clone();
            }
            None => {}
        }

        let mut queue: Vec<(String, String, bool)> = vec![];

        for (_, package) in packages.clone() {
            if package.to_be_picked_up_by != ""
                || package.picked_up_by != ""
                || package.delivered_by != ""
            {
                continue;
            }

            let capable_trains =
                Navigation::get_capable_trains(package.clone(), packages.clone(), trains.clone());
            for train in capable_trains.clone() {
                queue.push((train.name.clone(), package.name.clone(), true));
            }
        }

        for (_, train) in trains.clone() {
            for package_name in train.packages_to_pick_up {
                queue.push((train.name.clone(), package_name.clone(), false));
            }
            for package_name in train.packages_picked_up {
                queue.push((train.name.clone(), package_name.clone(), false));
            }
        }

        for (train_name, package_name, to_pick_up) in queue {
            let mut new_trains = trains.clone();
            let mut new_packages = packages.clone();
            let mut new_train = match new_trains.get(&train_name) {
                Some(train) => train.clone(),
                None => panic!("Train not found"),
            };
            let mut new_package = match new_packages.get(&package_name) {
                Some(package) => package.clone(),
                None => panic!("Package not found"),
            };
            let destination = self
                .graph
                .get_destination(new_train.current_location.clone(), new_package.to.clone());
            if to_pick_up {
                self.graph
                    .get_destination(new_train.current_location.clone(), new_package.from.clone());
            }

            let (new_movements, packages_picked_up, packages_delivered) = Navigation::move_train(
                new_train.clone(),
                destination.clone(),
                packages.clone(),
                movements.clone(),
            );

            if destination.cumulative_distance > 0 {
                new_train.current_location = destination.to;
                new_train.total_distance += destination.cumulative_distance;
            }

            if to_pick_up {
                new_train.packages_to_pick_up.push(new_package.name.clone());
                new_package.to_be_picked_up_by = new_train.name.clone();
            }

            for package_name in packages_picked_up {
                new_train.packages_to_pick_up = vec![];
                new_train.packages_picked_up.push(package_name.clone());
                if new_package.name == package_name {
                    new_package.to_be_picked_up_by = "".to_string();
                    new_package.picked_up_by = new_train.name.clone();
                } else {
                    let package = match new_packages.get(&package_name) {
                        Some(package) => package.clone(),
                        None => panic!("Package not found"),
                    };

                    new_packages.insert(
                        package_name.clone(),
                        Package {
                            name: package_name.clone(),
                            from: package.from.clone(),
                            to: package.to.clone(),
                            weight: package.weight,
                            to_be_picked_up_by: "".to_string(),
                            picked_up_by: new_train.name.clone(),
                            delivered_by: package.delivered_by.clone(),
                        },
                    );
                }
            }

            for package_name in packages_delivered {
                let mut train_new_packages_picked_up: Vec<String> = vec![];
                for package_picked_up in new_train.packages_picked_up.clone() {
                    if package_picked_up != package_name {
                        train_new_packages_picked_up.push(package_picked_up);
                    }
                }
                new_train.packages_picked_up = train_new_packages_picked_up.clone();
                new_train.packages_delivered.push(package_name.clone());
                if new_package.name == package_name {
                    new_package.picked_up_by = "".to_string();
                    new_package.delivered_by = new_train.name.clone();
                } else {
                    let package = match new_packages.get(&package_name) {
                        Some(package) => package.clone(),
                        None => panic!("Package not found"),
                    };

                    new_packages.insert(
                        package_name.clone(),
                        Package {
                            name: package_name.clone(),
                            from: package.from.clone(),
                            to: package.to.clone(),
                            weight: package.weight,
                            to_be_picked_up_by: "".to_string(),
                            picked_up_by: new_train.name.clone(),
                            delivered_by: package.delivered_by.clone(),
                        },
                    );
                }
            }

            new_trains.insert(new_train.name.clone(), new_train.clone());
            new_packages.insert(new_package.name.clone(), new_package.clone());

            let all_movements = self.calculate(
                new_trains.clone(),
                new_packages.clone(),
                new_movements.clone(),
            );
            let longest_train_distance =
                Navigation::get_longest_distance_in_movements(all_movements.clone());
            let number_of_trains = Navigation::get_number_of_trains(all_movements.clone());
            if longest_train_distance < min_distance
                || (longest_train_distance == min_distance && number_of_trains < min_trains)
            {
                min_distance = longest_train_distance;
                min_trains = number_of_trains;
                best_movements = all_movements.clone();
            }
        }
        self.cache.insert(cache_key.clone(), best_movements.clone());
        return best_movements;
    }
}
