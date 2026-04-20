/**
 * StadiumSaathi — Decision Engine (Backend)
 * ══════════════════════════════════════════
 * TOTAL_TIME = walking_time + waiting_time + congestion_penalty
 * This runs exclusively server-side to prevent client manipulation.
 */

// ── Stadium Layout Constants ─────────────────────────────────

export const FOOD_STALLS = [
  { id:"stall_a", name:"Stall A", zone:"North Concourse", gate:"Gate 1", foods:["biryani","snacks"],       emoji:"🍛"  },
  { id:"stall_b", name:"Stall B", zone:"East Concourse",  gate:"Gate 3", foods:["pizza","burger","snacks"],emoji:"🍕"  },
  { id:"stall_c", name:"Stall C", zone:"South Concourse", gate:"Gate 4", foods:["biryani","chai","snacks"],emoji:"🍛"  },
  { id:"stall_d", name:"Stall D", zone:"West Concourse",  gate:"Gate 6", foods:["burger","fries","drinks"],emoji:"🍔"  },
  { id:"stall_e", name:"Stall E", zone:"North Concourse", gate:"Gate 2", foods:["pizza","pasta","drinks"], emoji:"🍕"  },
  { id:"stall_f", name:"Stall F", zone:"East Concourse",  gate:"Gate 3", foods:["chai","samosa","snacks"], emoji:"☕"  },
];

export const RESTROOMS = [
  { id:"rr_g1", name:"Restroom near Gate 1", gate:"Gate 1", hasAccessibility:true  },
  { id:"rr_g2", name:"Restroom near Gate 2", gate:"Gate 2", hasAccessibility:false },
  { id:"rr_g3", name:"Restroom near Gate 3", gate:"Gate 3", hasAccessibility:true  },
  { id:"rr_g4", name:"Restroom near Gate 4", gate:"Gate 4", hasAccessibility:false },
  { id:"rr_g5", name:"Restroom near Gate 5", gate:"Gate 5", hasAccessibility:true  },
  { id:"rr_g6", name:"Restroom near Gate 6", gate:"Gate 6", hasAccessibility:false },
];

export const GATES = [
  { id:"gate_1", name:"Gate 1", zone:"North",      serves:["A1","A2","B1"],      transitAvailable:true,  transitType:"Metro" },
  { id:"gate_2", name:"Gate 2", zone:"North-East",  serves:["A2","B2","B3"],     transitAvailable:true,  transitType:"Bus"   },
  { id:"gate_3", name:"Gate 3", zone:"East",        serves:["B3","C1","C2"],     transitAvailable:false, transitType:null    },
  { id:"gate_4", name:"Gate 4", zone:"South",       serves:["C3","D1","D2"],     transitAvailable:true,  transitType:"Metro" },
  { id:"gate_5", name:"Gate 5", zone:"West",        serves:["D2","E1","E2"],     transitAvailable:true,  transitType:"Bus"   },
  { id:"gate_6", name:"Gate 6", zone:"South-West",  serves:["E2","F1","F2"],     transitAvailable:false, transitType:null    },
];

export const WALKING_TIMES_STALL = {
  "A1":{ stall_a:2,stall_b:7,stall_c:12,stall_d:10,stall_e:3,stall_f:6 },
  "A2":{ stall_a:2,stall_b:6,stall_c:11,stall_d:11,stall_e:3,stall_f:5 },
  "B1":{ stall_a:3,stall_b:4,stall_c:9, stall_d:9, stall_e:4,stall_f:3 },
  "B2":{ stall_a:3,stall_b:3,stall_c:8, stall_d:9, stall_e:4,stall_f:3 },
  "B3":{ stall_a:4,stall_b:3,stall_c:7, stall_d:8, stall_e:5,stall_f:3 },
  "C1":{ stall_a:5,stall_b:5,stall_c:5, stall_d:7, stall_e:6,stall_f:5 },
  "C2":{ stall_a:6,stall_b:5,stall_c:4, stall_d:6, stall_e:7,stall_f:5 },
  "C3":{ stall_a:7,stall_b:6,stall_c:3, stall_d:5, stall_e:8,stall_f:6 },
  "D1":{ stall_a:9,stall_b:8,stall_c:3, stall_d:4, stall_e:9,stall_f:8 },
  "D2":{ stall_a:9,stall_b:9,stall_c:4, stall_d:3, stall_e:9,stall_f:9 },
  "E1":{ stall_a:11,stall_b:9,stall_c:5,stall_d:2,stall_e:11,stall_f:9 },
  "E2":{ stall_a:12,stall_b:8,stall_c:6,stall_d:3,stall_e:12,stall_f:8 },
  "F1":{ stall_a:12,stall_b:7,stall_c:7,stall_d:4,stall_e:12,stall_f:7 },
  "F2":{ stall_a:11,stall_b:6,stall_c:8,stall_d:5,stall_e:11,stall_f:6 },
};

export const WALKING_TIMES_RESTROOM = {
  "A1":{ rr_g1:1,rr_g2:2,rr_g3:6, rr_g4:11,rr_g5:9, rr_g6:10 },
  "A2":{ rr_g1:2,rr_g2:1,rr_g3:5, rr_g4:10,rr_g5:8, rr_g6:9  },
  "B1":{ rr_g1:3,rr_g2:3,rr_g3:3, rr_g4:8, rr_g5:7, rr_g6:8  },
  "B2":{ rr_g1:4,rr_g2:3,rr_g3:2, rr_g4:7, rr_g5:6, rr_g6:7  },
  "B3":{ rr_g1:5,rr_g2:4,rr_g3:2, rr_g4:6, rr_g5:5, rr_g6:6  },
  "C1":{ rr_g1:6,rr_g2:6,rr_g3:4, rr_g4:5, rr_g5:4, rr_g6:5  },
  "C2":{ rr_g1:7,rr_g2:7,rr_g3:5, rr_g4:4, rr_g5:3, rr_g6:4  },
  "C3":{ rr_g1:8,rr_g2:8,rr_g3:6, rr_g4:3, rr_g5:3, rr_g6:3  },
  "D1":{ rr_g1:10,rr_g2:9,rr_g3:7,rr_g4:2,rr_g5:3, rr_g6:2  },
  "D2":{ rr_g1:11,rr_g2:10,rr_g3:8,rr_g4:2,rr_g5:2,rr_g6:2  },
  "E1":{ rr_g1:12,rr_g2:11,rr_g3:9,rr_g4:3,rr_g5:2,rr_g6:1  },
  "E2":{ rr_g1:12,rr_g2:12,rr_g3:10,rr_g4:4,rr_g5:3,rr_g6:2 },
  "F1":{ rr_g1:11,rr_g2:12,rr_g3:11,rr_g4:5,rr_g5:4,rr_g6:3 },
  "F2":{ rr_g1:10,rr_g2:11,rr_g3:12,rr_g4:6,rr_g5:5,rr_g6:4 },
};

export const EXIT_TIMES_FROM_BLOCK = {
  "A1":{ gate_1:1,gate_2:3,gate_3:8, gate_4:12,gate_5:11,gate_6:12 },
  "A2":{ gate_1:2,gate_2:2,gate_3:7, gate_4:11,gate_5:10,gate_6:11 },
  "B1":{ gate_1:3,gate_2:3,gate_3:5, gate_4:9, gate_5:8, gate_6:9  },
  "B2":{ gate_1:4,gate_2:3,gate_3:4, gate_4:8, gate_5:7, gate_6:8  },
  "B3":{ gate_1:5,gate_2:4,gate_3:3, gate_4:7, gate_5:6, gate_6:7  },
  "C1":{ gate_1:6,gate_2:6,gate_3:3, gate_4:6, gate_5:5, gate_6:6  },
  "C2":{ gate_1:7,gate_2:7,gate_3:4, gate_4:5, gate_5:4, gate_6:5  },
  "C3":{ gate_1:8,gate_2:8,gate_3:5, gate_4:4, gate_5:3, gate_6:4  },
  "D1":{ gate_1:10,gate_2:9,gate_3:6,gate_4:3,gate_5:3, gate_6:3  },
  "D2":{ gate_1:11,gate_2:10,gate_3:7,gate_4:2,gate_5:2,gate_6:2  },
  "E1":{ gate_1:12,gate_2:11,gate_3:8,gate_4:3,gate_5:2,gate_6:2  },
  "E2":{ gate_1:13,gate_2:12,gate_3:9,gate_4:4,gate_5:3,gate_6:2  },
  "F1":{ gate_1:13,gate_2:13,gate_3:10,gate_4:5,gate_5:4,gate_6:3 },
  "F2":{ gate_1:12,gate_2:12,gate_3:11,gate_4:6,gate_5:5,gate_6:4 },
};

export const CONGESTION_PENALTY = { low:0, medium:2, high:5, critical:10 };

// ── Core Formula ─────────────────────────────────────────────

export function calcTotalTime(walkTime, waitTime, density) {
  const penalty = CONGESTION_PENALTY[density] ?? 2;
  return walkTime + waitTime + penalty;
}

// ── Food Stall Decision ───────────────────────────────────────

export function decideFoodStall(block, preference, liveQueues, mobility = false) {
  const walkMap = WALKING_TIMES_STALL[block] || {};
  const pref    = (preference || 'any').toLowerCase();

  const candidates = FOOD_STALLS.filter(s => {
    if (pref === 'any') return true;
    return s.foods.some(f => f.includes(pref) || pref.includes(f));
  });

  const scored = candidates.map(s => {
    const live      = liveQueues?.[s.id] || {};
    const walkTime  = walkMap[s.id] ?? 8;
    const waitTime  = live.wait_min ?? 5;
    const density   = live.zone_density || 'medium';
    const total     = calcTotalTime(walkTime, waitTime, density);
    const penalty   = CONGESTION_PENALTY[density] ?? 2;
    return {
      id:s.id, name:s.name, emoji:s.emoji, zone:s.zone,
      gate:s.gate, foods:s.foods,
      walkTime, waitTime, density, congestionPenalty:penalty,
      totalTime:total,
      score: total,                    // lower = better
      savings: 0,                       // filled after sort
    };
  }).sort((a, b) => a.score - b.score);

  // Compute savings vs second-best
  if (scored.length >= 2) {
    scored[0].savings = scored[1].totalTime - scored[0].totalTime;
  }

  return scored;  // [best, second, ...]
}

// ── Restroom Decision ─────────────────────────────────────────

export function decideRestroom(block, liveRestrooms, mobility = false) {
  const walkMap = WALKING_TIMES_RESTROOM[block] || {};

  const candidates = RESTROOMS.filter(r => mobility ? r.hasAccessibility : true);

  const scored = candidates.map(r => {
    const live     = liveRestrooms?.[r.id] || {};
    const walkTime = walkMap[r.id] ?? 5;
    const waitTime = live.wait_min ?? 3;
    const density  = live.density  || 'medium';
    const occ      = live.occupancy ?? 50;
    const total    = calcTotalTime(walkTime, waitTime, density);
    const penalty  = CONGESTION_PENALTY[density] ?? 2;
    return {
      id:r.id, name:r.name, gate:r.gate,
      hasAccessibility:r.hasAccessibility,
      walkTime, waitTime, density, occ, congestionPenalty:penalty,
      totalTime:total, score:total, savings:0,
    };
  }).sort((a, b) => a.score - b.score);

  if (scored.length >= 2) {
    scored[0].savings = scored[1].totalTime - scored[0].totalTime;
  }
  return scored;
}

// ── Exit Decision ─────────────────────────────────────────────

export function decideExit(block, liveExits, mobility = false) {
  const walkMap = EXIT_TIMES_FROM_BLOCK[block] || {};

  const scored = GATES.map(g => {
    const live         = liveExits?.[g.id] || {};
    const walkTime     = walkMap[g.id] ?? 8;
    const delay        = live.delay_min ?? 5;
    const congestion   = live.congestion || 'medium';
    const penalty      = CONGESTION_PENALTY[congestion] ?? 2;
    const total        = calcTotalTime(walkTime, delay, congestion);
    const transit      = live.transit || null;
    return {
      id:g.id, name:g.name, zone:g.zone,
      transitAvailable:g.transitAvailable, transitType:g.transitType, transit,
      walkTime, delay, congestion, congestionPenalty:penalty,
      totalTime:total, score:total, savings:0,
    };
  }).sort((a, b) => a.score - b.score);

  if (scored.length >= 2) {
    scored[0].savings = scored[1].totalTime - scored[0].totalTime;
  }
  return scored;
}

// ── Safety Check ──────────────────────────────────────────────

export function detectSafetyAlerts(liveData) {
  const alerts = [];
  const density = liveData?.crowd_density || {};
  const exits   = liveData?.exits || {};

  Object.entries(density).forEach(([zone, lvl]) => {
    if (lvl === 'critical') {
      alerts.push({ type:'crowd', zone: zone.replace(/_/g,' '), level:'critical' });
    }
  });
  Object.entries(exits).forEach(([id, ex]) => {
    if (ex.congestion === 'critical') {
      alerts.push({ type:'exit', zone: ex.name, level:'critical' });
    }
  });
  return alerts;
}

// ── BigQuery Prediction Simulation ───────────────────────────
// Mimics what a BigQuery ML model would output based on
// historical crowd patterns for this match phase + time.

export function getPredictions(liveData) {
  const now  = new Date();
  const mins = now.getMinutes();
  const queues = liveData?.queues || {};

  const predictions = [];

  // Predict queue spikes at half-time (when next_break_min < 5)
  const breakIn = liveData?.match_status?.next_break_min ?? 99;
  if (breakIn <= 7) {
    predictions.push({
      type   : 'queue_spike',
      message: `Queue spike predicted in ${breakIn} min (half-time). Recommend visiting stalls NOW.`,
      urgency: 'high',
      eta_min: breakIn,
    });
  }

  // Predict exit surge (post-match phase)
  if (liveData?.match_status?.phase === 'POST_MATCH') {
    predictions.push({
      type   : 'exit_surge',
      message: 'Mass exit likely in next 10 min. Optimal window: wait 8 min then use Gate 4.',
      urgency: 'high',
      eta_min: 10,
    });
  }

  // Stall predicted to spike based on current trajectory
  const highWait = Object.entries(queues)
    .filter(([,d]) => (d.wait_min || 0) > 10)
    .map(([id]) => id);
  if (highWait.length > 0) {
    predictions.push({
      type   : 'avoid',
      message: `Stalls ${highWait.join(', ')} trending high. Consider alternatives.`,
      urgency: 'medium',
      eta_min: null,
    });
  }

  // Random crowd shift prediction (simulating BigQuery pattern model)
  if (mins % 3 === 0) {
    predictions.push({
      type   : 'density_shift',
      message: 'North Concourse crowd moving east — South Concourse clearing up.',
      urgency: 'low',
      eta_min: 5,
    });
  }

  return predictions;
}

// ── Impact Metrics ────────────────────────────────────────────
// Tracks cumulative efficiency gains across all decisions

export function calcImpactMetrics(sessions) {
  // sessions: array of { type, bestTotal, worstTotal }
  let waitSaved = 0, crowdAvoided = 0, routesOptimized = 0;

  sessions.forEach(s => {
    const saved = (s.worstTotal || 0) - (s.bestTotal || 0);
    if (saved > 0) waitSaved += saved;
    if (s.type === 'food' || s.type === 'restroom') crowdAvoided++;
    routesOptimized++;
  });

  return {
    waitTimeSavedMin    : waitSaved,
    crowdZonesAvoided   : crowdAvoided,
    routesOptimized     : routesOptimized,
    efficiencyScore     : routesOptimized > 0
      ? Math.min(99, Math.round((waitSaved / routesOptimized) * 10 + 50))
      : 0,
  };
}
