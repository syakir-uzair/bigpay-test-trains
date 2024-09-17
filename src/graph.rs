use std::collections::{HashMap, HashSet};

use crate::{destination::Destination, min_heap::MinHeap, route::Route};

pub struct Graph {
    pub adj_list: HashMap<String, Vec<Route>>,
    pub cache: HashMap<String, HashMap<String, Destination>>,
}

impl Graph {
    pub fn add_edge(&mut self, from: String, to: String, distance: i32) {
        self.adj_list.entry(from.clone()).and_modify(|froms| {
            froms.push(Route {
                to: to.clone(),
                distance: distance,
            })
        });
        self.adj_list.entry(to.clone()).and_modify(|tos| {
            tos.push(Route {
                to: from.clone(),
                distance: distance,
            })
        });
    }
    pub fn dijkstra(&mut self, start: String) -> HashMap<String, Destination> {
        match self.cache.get(&start) {
            Some(destinations) => {
                return destinations.clone();
            }
            None => {}
        }

        let mut destinations: HashMap<String, Destination> = HashMap::new();
        let mut min_heap = MinHeap::new();
        let mut visited: HashSet<String> = HashSet::new();

        for (to, _route) in self.adj_list.iter() {
            destinations.insert(
                start.clone(),
                Destination {
                    from: start.clone(),
                    to: to.clone(),
                    checkpoints: [].to_vec(),
                    distance: 0,
                    cumulative_distance: i32::MAX,
                },
            );
        }

        destinations.insert(
            start.clone(),
            Destination {
                from: start.clone(),
                to: start.clone(),
                checkpoints: [].to_vec(),
                distance: 0,
                cumulative_distance: 0,
            },
        );

        min_heap.add(Route {
            to: start.clone(),
            distance: 0,
        });

        while min_heap.heap.len() > 0 {
            let current: String;
            let current_distance: i32;
            match MinHeap::remove(&mut min_heap) {
                Some(min) => {
                    current = min.to;
                    current_distance = min.distance;
                }
                None => {
                    panic!("Minimum distance not found");
                }
            }

            if visited.contains(&current) {
                continue;
            }

            visited.insert(current.clone());

            let mut neighbours: Vec<Route> = [].to_vec();
            match self.adj_list.get(&current) {
                Some(routes) => {
                    neighbours = routes.clone();
                }
                None => {}
            }

            for neighbour in neighbours {
                let next = neighbour.to.clone();
                let distance = neighbour.distance;

                let new_cumulative_distance = current_distance + distance;
                let mut destination: Destination = Destination::new();
                let mut prev_destination: Destination = Destination::new();
                let mut prev_checkpoints: Vec<Route> = [].to_vec();
                match destinations.get(&next) {
                    Some(dest) => {
                        destination = dest.clone();
                    }
                    None => {}
                }
                match destinations.get(&current) {
                    Some(dest) => {
                        prev_destination = dest.clone();
                        prev_checkpoints = prev_destination.checkpoints.clone();
                    }
                    None => {}
                }

                if new_cumulative_distance < destination.cumulative_distance {
                    let mut checkpoints = [].to_vec();
                    if prev_destination.checkpoints.len() > 0 {
                        checkpoints = prev_checkpoints.clone();
                        checkpoints.push(Route {
                            to: current.clone(),
                            distance: current_distance
                                - prev_checkpoints[prev_checkpoints.len() - 1].distance,
                        })
                    } else if current != start {
                        checkpoints.push(Route {
                            to: current.clone(),
                            distance: current_distance,
                        });
                    }

                    destinations.insert(
                        next.clone(),
                        Destination {
                            from: start.clone(),
                            to: next.clone(),
                            checkpoints,
                            distance,
                            cumulative_distance: new_cumulative_distance,
                        },
                    );
                    min_heap.add(Route {
                        to: next.clone(),
                        distance: new_cumulative_distance,
                    });
                }
            }
        }

        self.cache.insert(start.clone(), destinations.clone());
        return destinations;
    }
}
