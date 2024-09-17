pub struct Train {
    pub name: String,
    pub start: String,
    pub current_location: String,
    pub capacity: String,
    pub total_distance: i32,
    pub packages_to_pick_up: Vec<String>,
    pub packages_picked_up: Vec<String>,
    pub packages_delivered: Vec<String>,
}
