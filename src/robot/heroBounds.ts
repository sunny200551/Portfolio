// Walkable rectangle on the plain grey platform floor (front-left 45-50%):
// In robot space (x: left-right, z: front-back on platform)
export const HERO_WALKABLE_BOUNDS = {
  minX: -1.65,
  maxX: -0.10,
  minZ: 0.15,
  maxZ: 1.15,
};

// Panel footprints (no-go areas for robots on platform):
export const HERO_PANEL_FOOTPRINTS = [
  { id: 'pane1_blue', minX: 0.0, maxX: 1.70, minZ: -1.10, maxZ: 0.10 },
  { id: 'pane3_navy', minX: 0.45, maxX: 1.80, minZ: -0.50, maxZ: 0.60 },
  { id: 'pane4_orange', minX: 0.05, maxX: 0.70, minZ: -0.20, maxZ: 0.25 },
];

