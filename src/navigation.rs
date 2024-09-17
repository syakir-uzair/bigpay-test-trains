use std::collections::HashMap;

use crate::{graph::Graph, movement::Movement, package::Package, train::Train};

pub struct Navigation {
    pub graph: Graph,
    pub trains: HashMap<String, Train>,
    pub packages: HashMap<String, Package>,
    pub cache: HashMap<String, Vec<Movement>>,
}

impl Navigation {
    pub fn new() -> Navigation {
        Navigation {
            graph: Graph::new(),
            trains: HashMap::new(),
            packages: HashMap::new(),
            cache: HashMap::new(),
        }
    }
}
