use std::time::Instant;

use crate::input::Input;
use crate::navigation::Navigation;

pub mod destination;
pub mod graph;
pub mod input;
pub mod min_heap;
pub mod movement;
pub mod navigation;
pub mod package;
pub mod route;
pub mod train;

fn main() {
    let start = Instant::now();
    let mut navigation = Navigation::new(Input {
        edges: vec![
            ("E1".to_string(), "A".to_string(), "X".to_string(), 10),
            ("E2".to_string(), "B".to_string(), "X".to_string(), 10),
            ("E3".to_string(), "C".to_string(), "X".to_string(), 10),
            ("E4".to_string(), "D".to_string(), "X".to_string(), 10),
            ("E5".to_string(), "E".to_string(), "X".to_string(), 10),
            ("E6".to_string(), "F".to_string(), "X".to_string(), 10),
        ],
        packages: vec![
            ("K1".to_string(), 5, "X".to_string(), "D".to_string()),
            ("K2".to_string(), 5, "X".to_string(), "E".to_string()),
            ("K3".to_string(), 5, "X".to_string(), "F".to_string()),
        ],
        trains: vec![
            ("Q1".to_string(), 15, "A".to_string()),
            ("Q2".to_string(), 15, "B".to_string()),
            ("Q3".to_string(), 15, "C".to_string()),
        ],
    });
    let movements = navigation.calculate(
        navigation.trains.clone(),
        navigation.packages.clone(),
        vec![],
    );
    let duration = start.elapsed();

    println!("Movements: {:#?}", movements);
    println!("Duration: {:?}", duration);
    println!("Run `cargo t` to test all cases");
}
