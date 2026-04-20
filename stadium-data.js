// ============================================================
// StadiumSaathi — Stadium Layout & Seed Data
// ============================================================

export const STADIUM = {
  name: "Rajiv Gandhi International Stadium",
  capacity: 55000,
  blocks: ["A1","A2","B1","B2","B3","C1","C2","C3","D1","D2","E1","E2","F1","F2"],
  gates: ["Gate 1","Gate 2","Gate 3","Gate 4","Gate 5","Gate 6"],
};

// ── Food Stalls ─────────────────────────────────────────────
export const FOOD_STALLS = [
  { id: "stall_a", name: "Stall A",  zone: "North Concourse", gate: "Gate 1", foods: ["biryani","snacks"],      emoji: "🍛" },
  { id: "stall_b", name: "Stall B",  zone: "East Concourse",  gate: "Gate 3", foods: ["pizza","burger","snacks"],emoji: "🍕" },
  { id: "stall_c", name: "Stall C",  zone: "South Concourse", gate: "Gate 4", foods: ["biryani","chai","snacks"],emoji: "🍛" },
  { id: "stall_d", name: "Stall D",  zone: "West Concourse",  gate: "Gate 6", foods: ["burger","fries","drinks"],emoji: "🍔" },
  { id: "stall_e", name: "Stall E",  zone: "North Concourse", gate: "Gate 2", foods: ["pizza","pasta","drinks"], emoji: "🍕" },
  { id: "stall_f", name: "Stall F",  zone: "East Concourse",  gate: "Gate 3", foods: ["chai","samosa","snacks"], emoji: "☕" },
];

// Walking times (minutes) from each block to each stall
export const WALKING_TIMES_STALL = {
  "A1": { stall_a:2, stall_b:7, stall_c:12, stall_d:10, stall_e:3, stall_f:6 },
  "A2": { stall_a:2, stall_b:6, stall_c:11, stall_d:11, stall_e:3, stall_f:5 },
  "B1": { stall_a:3, stall_b:4, stall_c:9,  stall_d:9,  stall_e:4, stall_f:3 },
  "B2": { stall_a:3, stall_b:3, stall_c:8,  stall_d:9,  stall_e:4, stall_f:3 },
  "B3": { stall_a:4, stall_b:3, stall_c:7,  stall_d:8,  stall_e:5, stall_f:3 },
  "C1": { stall_a:5, stall_b:5, stall_c:5,  stall_d:7,  stall_e:6, stall_f:5 },
  "C2": { stall_a:6, stall_b:5, stall_c:4,  stall_d:6,  stall_e:7, stall_f:5 },
  "C3": { stall_a:7, stall_b:6, stall_c:3,  stall_d:5,  stall_e:8, stall_f:6 },
  "D1": { stall_a:9, stall_b:8, stall_c:3,  stall_d:4,  stall_e:9, stall_f:8 },
  "D2": { stall_a:9, stall_b:9, stall_c:4,  stall_d:3,  stall_e:9, stall_f:9 },
  "E1": { stall_a:11,stall_b:9, stall_c:5,  stall_d:2,  stall_e:11,stall_f:9 },
  "E2": { stall_a:12,stall_b:8, stall_c:6,  stall_d:3,  stall_e:12,stall_f:8 },
  "F1": { stall_a:12,stall_b:7, stall_c:7,  stall_d:4,  stall_e:12,stall_f:7 },
  "F2": { stall_a:11,stall_b:6, stall_c:8,  stall_d:5,  stall_e:11,stall_f:6 },
};

// ── Restrooms ────────────────────────────────────────────────
export const RESTROOMS = [
  { id: "rr_g1", name: "Restroom near Gate 1", gate: "Gate 1", hasAccessibility: true },
  { id: "rr_g2", name: "Restroom near Gate 2", gate: "Gate 2", hasAccessibility: false },
  { id: "rr_g3", name: "Restroom near Gate 3", gate: "Gate 3", hasAccessibility: true },
  { id: "rr_g4", name: "Restroom near Gate 4", gate: "Gate 4", hasAccessibility: false },
  { id: "rr_g5", name: "Restroom near Gate 5", gate: "Gate 5", hasAccessibility: true },
  { id: "rr_g6", name: "Restroom near Gate 6", gate: "Gate 6", hasAccessibility: false },
];

export const WALKING_TIMES_RESTROOM = {
  "A1": { rr_g1:1, rr_g2:2, rr_g3:6,  rr_g4:11, rr_g5:9,  rr_g6:10 },
  "A2": { rr_g1:2, rr_g2:1, rr_g3:5,  rr_g4:10, rr_g5:8,  rr_g6:9  },
  "B1": { rr_g1:3, rr_g2:3, rr_g3:3,  rr_g4:8,  rr_g5:7,  rr_g6:8  },
  "B2": { rr_g1:4, rr_g2:3, rr_g3:2,  rr_g4:7,  rr_g5:6,  rr_g6:7  },
  "B3": { rr_g1:5, rr_g2:4, rr_g3:2,  rr_g4:6,  rr_g5:5,  rr_g6:6  },
  "C1": { rr_g1:6, rr_g2:6, rr_g3:4,  rr_g4:5,  rr_g5:4,  rr_g6:5  },
  "C2": { rr_g1:7, rr_g2:7, rr_g3:5,  rr_g4:4,  rr_g5:3,  rr_g6:4  },
  "C3": { rr_g1:8, rr_g2:8, rr_g3:6,  rr_g4:3,  rr_g5:3,  rr_g6:3  },
  "D1": { rr_g1:10,rr_g2:9, rr_g3:7,  rr_g4:2,  rr_g5:3,  rr_g6:2  },
  "D2": { rr_g1:11,rr_g2:10,rr_g3:8,  rr_g4:2,  rr_g5:2,  rr_g6:2  },
  "E1": { rr_g1:12,rr_g2:11,rr_g3:9,  rr_g4:3,  rr_g5:2,  rr_g6:1  },
  "E2": { rr_g1:12,rr_g2:12,rr_g3:10, rr_g4:4,  rr_g5:3,  rr_g6:2  },
  "F1": { rr_g1:11,rr_g2:12,rr_g3:11, rr_g4:5,  rr_g5:4,  rr_g6:3  },
  "F2": { rr_g1:10,rr_g2:11,rr_g3:12, rr_g4:6,  rr_g5:5,  rr_g6:4  },
};

// ── Gates & Exit Data ─────────────────────────────────────────
export const GATES = [
  { id: "gate_1", name: "Gate 1", zone: "North", serves: ["A1","A2","B1"],         transitAvailable: true,  transitType:"Metro" },
  { id: "gate_2", name: "Gate 2", zone: "North-East", serves: ["A2","B2","B3"],    transitAvailable: true,  transitType:"Bus"   },
  { id: "gate_3", name: "Gate 3", zone: "East",  serves: ["B3","C1","C2"],         transitAvailable: false, transitType:null    },
  { id: "gate_4", name: "Gate 4", zone: "South", serves: ["C3","D1","D2"],         transitAvailable: true,  transitType:"Metro" },
  { id: "gate_5", name: "Gate 5", zone: "West",  serves: ["D2","E1","E2"],         transitAvailable: true,  transitType:"Bus"   },
  { id: "gate_6", name: "Gate 6", zone: "South-West", serves: ["E2","F1","F2"],    transitAvailable: false, transitType:null    },
];

export const EXIT_TIMES_FROM_BLOCK = {
  "A1": { gate_1:1, gate_2:3, gate_3:8,  gate_4:12, gate_5:11, gate_6:12 },
  "A2": { gate_1:2, gate_2:2, gate_3:7,  gate_4:11, gate_5:10, gate_6:11 },
  "B1": { gate_1:3, gate_2:3, gate_3:5,  gate_4:9,  gate_5:8,  gate_6:9  },
  "B2": { gate_1:4, gate_2:3, gate_3:4,  gate_4:8,  gate_5:7,  gate_6:8  },
  "B3": { gate_1:5, gate_2:4, gate_3:3,  gate_4:7,  gate_5:6,  gate_6:7  },
  "C1": { gate_1:6, gate_2:6, gate_3:3,  gate_4:6,  gate_5:5,  gate_6:6  },
  "C2": { gate_1:7, gate_2:7, gate_3:4,  gate_4:5,  gate_5:4,  gate_6:5  },
  "C3": { gate_1:8, gate_2:8, gate_3:5,  gate_4:4,  gate_5:3,  gate_6:4  },
  "D1": { gate_1:10,gate_2:9, gate_3:6,  gate_4:3,  gate_5:3,  gate_6:3  },
  "D2": { gate_1:11,gate_2:10,gate_3:7,  gate_4:2,  gate_5:2,  gate_6:2  },
  "E1": { gate_1:12,gate_2:11,gate_3:8,  gate_4:3,  gate_5:2,  gate_6:2  },
  "E2": { gate_1:13,gate_2:12,gate_3:9,  gate_4:4,  gate_5:3,  gate_6:2  },
  "F1": { gate_1:13,gate_2:13,gate_3:10, gate_4:5,  gate_5:4,  gate_6:3  },
  "F2": { gate_1:12,gate_2:12,gate_3:11, gate_4:6,  gate_5:5,  gate_6:4  },
};

// ── Congestion Penalties (minutes added to total time) ────────
export const CONGESTION_PENALTY = { low: 0, medium: 2, high: 5, critical: 10 };

// ── Initial Firebase Seed Data ────────────────────────────────
export const INITIAL_FIREBASE_DATA = {
  queues: {
    stall_a: { name:"Stall A", wait_min:15, zone_density:"high"   },
    stall_b: { name:"Stall B", wait_min:5,  zone_density:"medium" },
    stall_c: { name:"Stall C", wait_min:0,  zone_density:"low"    },
    stall_d: { name:"Stall D", wait_min:3,  zone_density:"low"    },
    stall_e: { name:"Stall E", wait_min:8,  zone_density:"medium" },
    stall_f: { name:"Stall F", wait_min:2,  zone_density:"low"    },
  },
  restrooms: {
    rr_g1: { name:"Gate 1 Restroom", occupancy:85, capacity:100, wait_min:8,  density:"high"   },
    rr_g2: { name:"Gate 2 Restroom", occupancy:40, capacity:100, wait_min:2,  density:"low"    },
    rr_g3: { name:"Gate 3 Restroom", occupancy:60, capacity:100, wait_min:4,  density:"medium" },
    rr_g4: { name:"Gate 4 Restroom", occupancy:20, capacity:100, wait_min:0,  density:"low"    },
    rr_g5: { name:"Gate 5 Restroom", occupancy:30, capacity:100, wait_min:1,  density:"low"    },
    rr_g6: { name:"Gate 6 Restroom", occupancy:75, capacity:100, wait_min:6,  density:"high"   },
  },
  exits: {
    gate_1: { name:"Gate 1", congestion:"medium", delay_min:6,  transit:"Metro - Platform 2" },
    gate_2: { name:"Gate 2", congestion:"high",   delay_min:14, transit:"Bus Bay C"          },
    gate_3: { name:"Gate 3", congestion:"low",    delay_min:2,  transit:null                 },
    gate_4: { name:"Gate 4", congestion:"low",    delay_min:3,  transit:"Metro - Platform 1" },
    gate_5: { name:"Gate 5", congestion:"medium", delay_min:7,  transit:"Bus Bay A"          },
    gate_6: { name:"Gate 6", congestion:"critical",delay_min:18,transit:null                 },
  },
  crowd_density: {
    north:"medium", east:"high", south:"low", west:"low",
    north_concourse:"high", east_concourse:"medium",
    south_concourse:"low",  west_concourse:"low",
  },
  match_status: {
    phase: "LIVE",           // PRE_MATCH | LIVE | HALF_TIME | POST_MATCH
    score: "IND 187-4 (32)",
    inning: "1st Innings",
    next_break_min: 8,
  }
};
