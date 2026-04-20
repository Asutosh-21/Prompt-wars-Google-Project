/**
 * StadiumSaathi — Frontend Application (v2 — Backend-First)
 * ══════════════════════════════════════════════════════════
 * Architecture:
 *   Frontend → Cloud Run Backend → Gemini Pro + Firebase
 *
 * Features:
 *  • Backend API calls (no client-side key exposure)
 *  • Firebase Anonymous Auth
 *  • Real-time sidebar via polling / Firebase SDK
 *  • Decision Transparency Panel (Explainable AI)
 *  • Impact Metrics Dashboard
 *  • Voice Input (Web Speech API) + TTS Output
 *  • Multi-language (English / Hindi)
 *  • Predictive Intelligence banners (BigQuery simulation)
 *  • Pub/Sub live data simulation
 */

// ════════════════════════════════════════════════════════════
//  CONFIGURATION
// ════════════════════════════════════════════════════════════

// Firebase SDK config — replace placeholders with your real values from:
// Firebase Console → Project Settings → General → Your apps → SDK setup
// Leave as placeholders to run in Demo Mode (no Firebase needed)
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyA5Hi7rvFploy_gGeJ3pWINPveLzzburTk",
  authDomain: "prompt-war-virtual.firebaseapp.com",
  databaseURL: "https://prompt-war-virtual-default-rtdb.firebaseio.com",
  projectId: "prompt-war-virtual",
  storageBucket: "prompt-war-virtual.firebasestorage.app",
  messagingSenderId: "346029077661",
  appId: "1:346029077661:web:a2070aab9fa17c87c4d074",
};
const FIREBASE_READY = FIREBASE_CONFIG.apiKey !== "FIREBASE_API_KEY_PLACEHOLDER";

// Google Maps API key (optional — for real indoor/outdoor routing)
// Get from: https://console.cloud.google.com/apis/library/maps-backend.googleapis.com
// Leave empty to use built-in walking time decision engine
const GOOGLE_MAPS_KEY = "";

// ════════════════════════════════════════════════════════════
//  STADIUM LAYOUT (frontend copy — for sidebar rendering only)
//  Decision logic runs exclusively server-side.
// ════════════════════════════════════════════════════════════
const FOOD_STALLS = [
  { id:"stall_a", name:"Biryani House",    zone:"North Concourse", gate:"Gate 1", foods:["biryani","rice","curry"],          emoji:"🍛" },
  { id:"stall_b", name:"Pizza & Burger",   zone:"East Concourse",  gate:"Gate 3", foods:["pizza","burger","fries","snacks"],  emoji:"🍕" },
  { id:"stall_c", name:"Chai Tapri",       zone:"South Concourse", gate:"Gate 4", foods:["chai","samosa","kachori","snacks"],emoji:"☕" },
  { id:"stall_d", name:"South Indian",     zone:"West Concourse",  gate:"Gate 6", foods:["dosa","idli","vada","upma"],       emoji:"🥞" },
  { id:"stall_e", name:"Cold Drinks Corner",zone:"North Concourse", gate:"Gate 2", foods:["drinks","juice","water","lassi"],  emoji:"🥤" },
  { id:"stall_f", name:"Chaat & Sweets",   zone:"East Concourse",  gate:"Gate 3", foods:["chaat","pani puri","sweets","ice cream"],emoji:"🍡" },
];
const RESTROOMS = [
  { id:"rr_g1", name:"Gate 1 Restroom", gate:"Gate 1", hasAccessibility:true  },
  { id:"rr_g2", name:"Gate 2 Restroom", gate:"Gate 2", hasAccessibility:false },
  { id:"rr_g3", name:"Gate 3 Restroom", gate:"Gate 3", hasAccessibility:true  },
  { id:"rr_g4", name:"Gate 4 Restroom", gate:"Gate 4", hasAccessibility:false },
  { id:"rr_g5", name:"Gate 5 Restroom", gate:"Gate 5", hasAccessibility:true  },
  { id:"rr_g6", name:"Gate 6 Restroom", gate:"Gate 6", hasAccessibility:false },
];
const GATES = [
  { id:"gate_1", name:"Gate 1", zone:"North"     },
  { id:"gate_2", name:"Gate 2", zone:"North-East" },
  { id:"gate_3", name:"Gate 3", zone:"East"       },
  { id:"gate_4", name:"Gate 4", zone:"South"      },
  { id:"gate_5", name:"Gate 5", zone:"West"       },
  { id:"gate_6", name:"Gate 6", zone:"SW"         },
];
const WALKING_TIMES_STALL = {
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
const WALKING_TIMES_RESTROOM = {
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
const EXIT_TIMES = {
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
const CONGESTION_PENALTY = { low:0, medium:2, high:5, critical:10 };

// ════════════════════════════════════════════════════════════
//  APPLICATION STATE
// ════════════════════════════════════════════════════════════
const state = {
  user: { seat:'G24', block:'B2', foodPref:'any', mobility:false, },
  backendUrl: 'http://localhost:8080',
  backendOnline: false,
  uid: null,
  csrfToken: null,
  liveData: getDefaultLiveData(),
  chatHistory: [],
  isThinking: false,
  metricsVisible: false,
  metrics: { waitTimeSavedMin:0, crowdZonesAvoided:0, routesOptimized:0, efficiencyScore:0 },
  ttsEnabled: true,
  lastDecisionData: null,
};

function getDefaultLiveData() {
  return {
    queues: {
      stall_a:{ wait_min:15, zone_density:"high"   },
      stall_b:{ wait_min:5,  zone_density:"medium" },
      stall_c:{ wait_min:0,  zone_density:"low"    },
      stall_d:{ wait_min:3,  zone_density:"low"    },
      stall_e:{ wait_min:8,  zone_density:"medium" },
      stall_f:{ wait_min:2,  zone_density:"low"    },
    },
    restrooms: {
      rr_g1:{ occupancy:85, wait_min:8,  density:"high"   },
      rr_g2:{ occupancy:40, wait_min:2,  density:"low"    },
      rr_g3:{ occupancy:60, wait_min:4,  density:"medium" },
      rr_g4:{ occupancy:20, wait_min:0,  density:"low"    },
      rr_g5:{ occupancy:30, wait_min:1,  density:"low"    },
      rr_g6:{ occupancy:75, wait_min:6,  density:"high"   },
    },
    exits: {
      gate_1:{ congestion:"medium",  delay_min:6,  transit:"Metro - Platform 2" },
      gate_2:{ congestion:"high",    delay_min:14, transit:"Bus Bay C"          },
      gate_3:{ congestion:"low",     delay_min:2,  transit:null                 },
      gate_4:{ congestion:"low",     delay_min:3,  transit:"Metro - Platform 1" },
      gate_5:{ congestion:"medium",  delay_min:7,  transit:"Bus Bay A"          },
      gate_6:{ congestion:"critical",delay_min:18, transit:null                 },
    },
    crowd_density: {
      north:"medium", east:"high", south:"low", west:"low",
      north_concourse:"high", east_concourse:"medium",
      south_concourse:"low",  west_concourse:"low",
    },
    match_status:{ phase:"LIVE", score:"IND 187-4 (32)", inning:"1st Innings", next_break_min:8 },
  };
}

// ════════════════════════════════════════════════════════════
//  FIREBASE ANONYMOUS AUTH + REALTIME LISTENER
// ════════════════════════════════════════════════════════════
async function initFirebase() {
  if (!FIREBASE_READY) return;
  try {
    const { initializeApp }                         = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
    const { getAuth, signInAnonymously, onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
    const { getDatabase, ref, onValue }             = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js');

    const app  = initializeApp(FIREBASE_CONFIG);
    const auth = getAuth(app);
    const db   = getDatabase(app);

    // Anonymous sign-in
    await signInAnonymously(auth);
    onAuthStateChanged(auth, user => {
      if (user) {
        state.uid = user.uid;
        console.log('[Firebase Auth] Signed in anonymously:', user.uid);
        pulsePipelineStep('pipe-backend');
      }
    });

    // Live data listener
    onValue(ref(db, '/'), snap => {
      const data = snap.val();
      if (data) {
        state.liveData = data;
        refreshUI();
        console.log('[Firebase] Live data updated');
      }
    });
    console.log('[Firebase] Initialized ✓');
  } catch (e) {
    console.warn('[Firebase] Not configured — using in-memory simulation.', e.message);
  }
}

// ════════════════════════════════════════════════════════════
//  BACKEND API CALLS
// ════════════════════════════════════════════════════════════
async function checkBackend() {
  try {
    const res = await fetch(`${state.backendUrl}/health`, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      state.backendOnline = true;
      const badge = document.getElementById('mode-badge');
      if (badge) {
        badge.textContent = data.mode === 'demo' ? 'DEMO' : 'LIVE';
        badge.classList.toggle('live', data.mode !== 'demo');
      }
      setPipelineActive('pipe-backend', true);
      setPipelineActive('pipe-gemini', data.mode !== 'demo');
      // Fetch CSRF token for all subsequent POST requests
      try {
        const csrf = await fetch(`${state.backendUrl}/api/csrf-token`, { signal: AbortSignal.timeout(3000) });
        if (csrf.ok) { const t = await csrf.json(); state.csrfToken = t.csrfToken; }
      } catch { /* non-fatal */ }
      console.log('[Backend] Online ✓ mode:', data.mode);
      return true;
    }
  } catch {
    console.warn('[Backend] Offline — using in-memory fallback.');
    state.backendOnline = false;
  }
  return false;
}

function buildHeaders() {
  const h = { 'Content-Type': 'application/json' };
  if (state.uid)       h['X-User-ID']    = state.uid;
  if (state.csrfToken) h['X-CSRF-Token'] = state.csrfToken;
  return h;
}

async function apiChat(message) {
  if (!state.backendOnline) return null;
  pulsePipelineStep('pipe-gemini');
  const body = {
    message,
    block   : state.user.block,
    seat    : state.user.seat,
    foodPref: state.user.foodPref,
    mobility: state.user.mobility,
  };
  const res = await fetch(`${state.backendUrl}/api/chat`, {
    method:'POST', headers:buildHeaders(), body:JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`Backend HTTP ${res.status}`);
  return res.json();
}

async function apiDecision(type, extra = {}) {
  if (!state.backendOnline) return null;
  const body = { block:state.user.block, mobility:state.user.mobility, ...extra };
  const res = await fetch(`${state.backendUrl}/api/decision/${type}`, {
    method:'POST', headers:buildHeaders(), body:JSON.stringify(body),
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) return null;
  return res.json();
}

async function apiMetrics() {
  if (!state.backendOnline) return null;
  const res = await fetch(`${state.backendUrl}/api/metrics`, {
    headers:buildHeaders(), signal:AbortSignal.timeout(5000),
  });
  if (!res.ok) return null;
  return res.json();
}

async function apiPredictions() {
  if (!state.backendOnline) return null;
  const res = await fetch(`${state.backendUrl}/api/predictions`, {
    headers:buildHeaders(), signal:AbortSignal.timeout(5000),
  });
  if (!res.ok) return null;
  return res.json();
}

async function apiLiveData() {
  if (!state.backendOnline) return null;
  const res = await fetch(`${state.backendUrl}/api/data`, {
    headers:buildHeaders(), signal:AbortSignal.timeout(5000),
  });
  if (!res.ok) return null;
  return res.json();
}

// ════════════════════════════════════════════════════════════
//  LOCAL DECISION ENGINE (fallback when backend offline)
// ════════════════════════════════════════════════════════════
function localDecideFood(pref) {
  const block = state.user.block;
  const walkMap = WALKING_TIMES_STALL[block] || {};
  const p = (pref || state.user.foodPref || 'any').toLowerCase();

  return FOOD_STALLS
    .filter(s => p === 'any' || s.foods.some(f => f.includes(p) || p.includes(f)))
    .map(s => {
      const live = state.liveData.queues?.[s.id] || {};
      const walk = walkMap[s.id] ?? 8;
      const wait = live.wait_min ?? 5;
      const den  = live.zone_density || 'medium';
      const pen  = CONGESTION_PENALTY[den] || 0;
      return { ...s, walkTime:walk, waitTime:wait, density:den, congestionPenalty:pen, totalTime:walk+wait+pen };
    })
    .sort((a,b) => a.totalTime - b.totalTime);
}

function localDecideRestroom() {
  const block = state.user.block;
  const walkMap = WALKING_TIMES_RESTROOM[block] || {};
  return RESTROOMS
    .filter(r => !state.user.mobility || r.hasAccessibility)
    .map(r => {
      const live = state.liveData.restrooms?.[r.id] || {};
      const walk = walkMap[r.id] ?? 5;
      const wait = live.wait_min ?? 3;
      const den  = live.density || 'medium';
      const occ  = live.occupancy ?? 50;
      const pen  = CONGESTION_PENALTY[den] || 0;
      return { ...r, walkTime:walk, waitTime:wait, density:den, occ, congestionPenalty:pen, totalTime:walk+wait+pen };
    })
    .sort((a,b) => a.totalTime - b.totalTime);
}

function localDecideExit() {
  const block = state.user.block;
  const walkMap = EXIT_TIMES[block] || {};
  return GATES.map(g => {
    const live = state.liveData.exits?.[g.id] || {};
    const walk = walkMap[g.id] ?? 8;
    const del  = live.delay_min ?? 5;
    const cong = live.congestion || 'medium';
    const pen  = CONGESTION_PENALTY[cong] || 0;
    return { ...g, walkTime:walk, delay:del, congestion:cong, congestionPenalty:pen,
             totalTime:walk+del+pen, transit:live.transit||null };
  }).sort((a,b) => a.totalTime - b.totalTime);
}

function localDetectSafety() {
  const d = state.liveData.crowd_density || {};
  const e = state.liveData.exits || {};
  const alerts = [];
  Object.entries(d).forEach(([z,l]) => { if(l==='critical') alerts.push(z.replace(/_/g,' ')); });
  Object.entries(e).forEach(([,ex]) => { if(ex.congestion==='critical') alerts.push(ex.name||''); });
  return alerts;
}

// ════════════════════════════════════════════════════════════
//  LOCAL RESPONSE BUILDER (full demo mode — no backend)
// ════════════════════════════════════════════════════════════
function buildLocalResponse(message) {
  const q = message.toLowerCase();
  const safety = localDetectSafety();
  const safetyNote = safety.length ? `\n\n<div class="safety-block">🚨 <strong>Safety Alert:</strong> Critical congestion at ${safety[0]}. Avoid this zone.</div>` : '';
  const breakIn = state.liveData.match_status?.next_break_min ?? 99;
  const predictiveTip = breakIn <= 7
    ? `\n\n💡 **Predictive Alert:** Half-time in ${breakIn} min — queues will spike. Move now!`
    : '';

  if (/(biryani|pizza|burger|chai|samosa|dosa|idli|chaat|pani puri|snack|drink|juice|lassi|water|food|eat|hungry|khana|khaana|milegi|stall)/i.test(q)) {
    const item = q.match(/biryani|pizza|burger|chai|samosa|dosa|idli|chaat|drink|juice|lassi/i)?.[0] || 'food';
    const ranked = localDecideFood(item);
    const best = ranked[0]; const alt = ranked[1];
    if (!best) return "No matching stalls found right now.";
    const decisionData = { type:'food', ranked };
    state.lastDecisionData = decisionData;
    trackMetrics('food', best.totalTime, ranked[ranked.length-1]?.totalTime || best.totalTime);
    return `**Best Option: ${best.emoji} ${best.name}**\n\n**Decision Math:**\n• ${best.walkTime}m walk + ${best.waitTime}m wait + ${best.congestionPenalty}m congestion = **${best.totalTime} min total**\n\n${alt ? `**Why not ${alt.name}?** → ${alt.walkTime} + ${alt.waitTime} + ${alt.congestionPenalty} = ${alt.totalTime} min (${alt.totalTime - best.totalTime > 0 ? alt.totalTime - best.totalTime + ' min slower' : 'similar'})\n\n` : ''}<div class="nav-action">🧭 Head to ${best.gate} corridor → follow signs to ${best.zone}${best.density !== 'low' ? ' · Side passage recommended (main plaza crowded)' : ' · Clear path ahead!'}</div>${safetyNote}${predictiveTip}`;
  }

  if (/(restroom|toilet|washroom|bathroom|sulabh|shauchalay)/i.test(q)) {
    const ranked = localDecideRestroom();
    const best = ranked[0]; const alt = ranked[1];
    state.lastDecisionData = { type:'restroom', ranked };
    trackMetrics('restroom', best?.totalTime || 0, ranked[ranked.length-1]?.totalTime || 0);
    return `**Best Option: 🚻 ${best?.name || 'Nearest Restroom'}**\n\n**Decision Math:**\n• ${best?.walkTime}m walk + ${best?.waitTime}m wait + ${best?.congestionPenalty}m congestion = **${best?.totalTime} min total**\n• Occupancy: **${best?.occ}%**${state.user.mobility ? '\n♿ Accessible route via elevator confirmed.' : ''}\n\n${alt ? `**Avoid ${alt.name}** — ${alt.occ}% full, ${alt.totalTime} min total\n\n` : ''}<div class="nav-action">🧭 Head to ${best?.gate} → follow blue 🚻 signs</div>${safetyNote}`;
  }

  if (/(exit|leave|go home|out|nikalna|nikaalo|ghar|bahar)/i.test(q)) {
    const ranked = localDecideExit();
    const best = ranked[0]; const alt = ranked[1];
    state.lastDecisionData = { type:'exit', ranked };
    trackMetrics('exit', best?.totalTime || 0, ranked[ranked.length-1]?.totalTime || 0);
    return `**Best Exit: 🚪 ${best?.name}** (${best?.zone})\n\n**Decision Math:**\n• ${best?.walkTime}m walk + ${best?.delay}m delay + ${best?.congestionPenalty}m congestion = **${best?.totalTime} min total**\n${best?.transit ? `• 🚇 Transit: **${best.transit}**` : '• No transit nearby — street exit'}\n\n${alt ? `**Alternative: ${alt.name}** → ${alt.totalTime} min total | ${alt.congestion}\n\n` : ''}<div class="nav-action">🧭 From Block ${state.user.block} → ${best?.zone} exit signs → ${best?.name}</div>\n\n💡 **Tip:** ${best?.congestion === 'low' ? '✅ Gate is clear — exit now!' : `⏳ Wait ${Math.min(best?.delay||5, 8)} min to avoid peak surge.`}${safetyNote}`;
  }

  if (/(crowd|busy|density|congest|bheed|bhid|jaam)/i.test(q)) {
    const d = state.liveData.crowd_density || {};
    const low  = Object.entries(d).filter(([,v])=>v==='low').map(([k])=>k.replace(/_/g,' '));
    const high = Object.entries(d).filter(([,v])=>v==='high'||v==='critical').map(([k])=>k.replace(/_/g,' '));
    return `**🔥 Live Crowd Status**\n\n🟢 **Clear zones:** ${low.join(', ') || 'None currently'}\n🔴 **Crowded zones:** ${high.join(', ') || 'All moderate'}\n\n<div class="nav-action">🧭 ${low[0] ? `Head to ${low[0]} — least congested right now.` : 'Move freely — all zones at moderate density.'}</div>`;
  }

  if (/(transit|metro|bus|home|transport|cab|auto|ola|uber|rickshaw|ghar|station)/i.test(q)) {
    const ranked = localDecideExit().filter(g => g.transit);
    const best = ranked[0];
    if (!best) return "Aapke block ke paas koi transit option nahi hai. Gate 1 ke baas se cab ya auto le sakte ho.";
    return `**🚇 Best Transit from Block ${state.user.block}**\n\n• Exit via **${best.name}** → ${best.transit}\n• ${best.walkTime} min walk · ${best.delay} min delay · **${best.congestion}** congestion\n\n<div class="nav-action">🧭 Exit via ${best.name} → ${best.transit}</div>\n\n💡 Tip: Leave ${best.congestion === 'low' ? 'now for smooth boarding' : 'in 8–10 min after final whistle to avoid peak'}.`;
  }

  return `I'm your real-time stadium AI! I can help with:\n\n🍛 **"Where can I get biryani?"**\n🚻 **"Which restroom is free?"**\n🚪 **"How should I exit safely?"**\n🗺️ **"Where is it least crowded?"**\n🚇 **"How do I get home?"**\n\nWhat do you need right now?`;
}

// ════════════════════════════════════════════════════════════
//  METRICS TRACKING
// ════════════════════════════════════════════════════════════
function trackMetrics(type, bestTotal, worstTotal) {
  const saved = Math.max(0, worstTotal - bestTotal);
  state.metrics.waitTimeSavedMin  += saved;
  state.metrics.crowdZonesAvoided += (type !== 'exit') ? 1 : 0;
  state.metrics.routesOptimized   += 1;
  const routes = state.metrics.routesOptimized;
  state.metrics.efficiencyScore = routes > 0
    ? Math.min(99, Math.round((state.metrics.waitTimeSavedMin / routes) * 10 + 50))
    : 0;
  renderMetrics();
}

async function refreshMetrics() {
  const data = await apiMetrics();
  if (data?.metrics) {
    state.metrics = data.metrics;
    renderMetrics();
  }
}

function renderMetrics() {
  const m = state.metrics;
  const el = (id) => document.getElementById(id);
  if (el('m-wait-saved'))     el('m-wait-saved').textContent     = `${m.waitTimeSavedMin} min`;
  if (el('m-crowd-avoided'))  el('m-crowd-avoided').textContent  = m.crowdZonesAvoided;
  if (el('m-routes'))         el('m-routes').textContent         = m.routesOptimized;
  if (el('m-efficiency-val')) el('m-efficiency-val').textContent = m.efficiencyScore;
}

// ════════════════════════════════════════════════════════════
//  DECISION TRANSPARENCY PANEL
// ════════════════════════════════════════════════════════════
function showDecisionPanel(ranked, type) {
  if (!ranked || ranked.length < 2) return;
  const panel = document.getElementById('decision-panel');
  const content = document.getElementById('dp-content');
  if (!panel || !content) return;

  const top3 = ranked.slice(0, 3);
  content.innerHTML = top3.map((opt, i) => `
    <div class="dp-option ${i === 0 ? 'best' : 'alt'}">
      <div class="dp-opt-name">
        ${opt.emoji || (type==='restroom'?'🚻':'🚪')} ${opt.name}
        ${i === 0 ? '<span class="badge badge-low">✓ Best</span>' : ''}
      </div>
      <div class="dp-row"><span>Walk</span><span>${opt.walkTime ?? opt.walk ?? '?'} min</span></div>
      <div class="dp-row"><span>${type==='exit'?'Delay':'Wait'}</span><span>${opt.waitTime ?? opt.delay ?? 0} min</span></div>
      <div class="dp-row"><span>Congestion penalty</span><span>+${opt.congestionPenalty ?? 0} min</span></div>
      <div class="dp-total">Total: ${opt.totalTime} min ${i > 0 && ranked[0] ? `(+${opt.totalTime - ranked[0].totalTime} vs best)` : ''}</div>
    </div>
  `).join('');

  panel.classList.remove('hidden');
  panel.scrollIntoView({ behavior:'smooth', block:'nearest' });
}

function hideDecisionPanel() {
  document.getElementById('decision-panel')?.classList.add('hidden');
}

// ════════════════════════════════════════════════════════════
//  PREDICTION BANNER
// ════════════════════════════════════════════════════════════
function showPrediction(prediction) {
  const banner = document.getElementById('prediction-banner');
  const text   = document.getElementById('prediction-text');
  const icon   = document.getElementById('prediction-icon');
  if (!banner || !text) return;

  const icons = { queue_spike:'⏰', exit_surge:'🚨', avoid:'⚠️', density_shift:'🔀' };
  icon.textContent = icons[prediction.type] || '🔮';
  text.textContent = prediction.message;
  banner.classList.remove('hidden');

  // Show BigQuery step active
  setPipelineActive('pipe-bq', true);
  pulsePipelineStep('pipe-bq');

  // Auto-dismiss low urgency after 8s
  if (prediction.urgency === 'low') {
    setTimeout(() => banner.classList.add('hidden'), 8000);
  }
}

async function pollPredictions() {
  const data = await apiPredictions();
  if (data?.predictions?.length) {
    showPrediction(data.predictions[0]);
  } else {
    // Local prediction
    const breakIn = state.liveData.match_status?.next_break_min ?? 99;
    if (breakIn <= 7 && breakIn > 0) {
      showPrediction({ type:'queue_spike', message:`⏰ Queue spike predicted in ${breakIn} min (half-time). Visit stalls NOW to beat the rush!`, urgency:'high' });
    }
    const criticals = localDetectSafety();
    if (criticals.length) {
      showPrediction({ type:'exit_surge', message:`🚨 Critical congestion at ${criticals[0]}. Avoid this zone entirely.`, urgency:'high' });
    }
  }
}

// ════════════════════════════════════════════════════════════
//  VOICE INPUT / OUTPUT — Google Cloud TTS + Web Speech fallback
// ════════════════════════════════════════════════════════════
let recognition  = null;
let isRecording  = false;
let _cachedVoices = [];

// ── Google Cloud TTS config (set your API key in modal or .env) ──
// If key is present → uses Google Cloud TTS (neural voices)
// If no key        → falls back to Web Speech API (browser built-in)
const GTTS_CONFIG = {
  apiKey : '',          // set via setGoogleTTSKey()
  enabled: false,
  // Neural voice models — best Indian quality
  voices: {
    'en': { languageCode:'en-IN', name:'en-IN-Neural2-A', ssmlGender:'FEMALE' },
    },
  // Fallback Standard voices if Neural quota exceeded
  fallback: {
    'en': { languageCode:'en-IN', name:'en-IN-Wavenet-A', ssmlGender:'FEMALE' },
    },
};

function setGoogleTTSKey(key) {
  if (key && key.length > 10) {
    GTTS_CONFIG.apiKey  = key;
    GTTS_CONFIG.enabled = true;
    console.log('[Google TTS] API key set — Neural voices enabled ✓');
  }
}

// ── Google Cloud TTS API call ─────────────────────────────────
async function speakWithGoogleTTS(text) {
  const voiceCfg = GTTS_CONFIG.voices.en;
  const body = {
    input:       { text },
    voice:       voiceCfg,
    audioConfig: {
      audioEncoding : 'MP3',
      speakingRate  : 0.92,
      pitch         : 0.0,
      effectsProfileId: ['headphone-class-device'],
    },
  };

  try {
    const res = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GTTS_CONFIG.apiKey}`,
      { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) }
    );

    if (!res.ok) {
      // Neural quota exceeded — try Wavenet fallback
      if (res.status === 429 || res.status === 400) {
        return await speakWithGoogleTTSFallback(text);
      }
      throw new Error(`Google TTS HTTP ${res.status}`);
    }

    const data = await res.json();
    const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
    audio.volume = 1;
    audio.play();
    console.log('[Google TTS] Playing Neural voice:', voiceCfg.name);
  } catch (err) {
    console.warn('[Google TTS] Failed, falling back to Web Speech:', err.message);
    speakWithWebSpeech(text);
  }
}

async function speakWithGoogleTTSFallback(text) {
  const voiceCfg = GTTS_CONFIG.fallback.en;
  const body = {
    input:       { text },
    voice:       voiceCfg,
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate : 0.92,
      pitch        : 0.0,
    },
  };
  try {
    const res  = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GTTS_CONFIG.apiKey}`,
      { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) }
    );
    const data = await res.json();
    new Audio(`data:audio/mp3;base64,${data.audioContent}`).play();
    console.log('[Google TTS] Playing Wavenet fallback:', voiceCfg.name);
  } catch (err) {
    console.warn('[Google TTS] Wavenet also failed:', err.message);
    speakWithWebSpeech(text);
  }
}

// ── Web Speech API fallback ───────────────────────────────────
function loadVoices() {
  return new Promise(resolve => {
    const v = window.speechSynthesis.getVoices();
    if (v.length > 0) { _cachedVoices = v; return resolve(v); }
    window.speechSynthesis.onvoiceschanged = () => {
      _cachedVoices = window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = null;
      resolve(_cachedVoices);
    };
  });
}

if (window.speechSynthesis) {
  loadVoices().then(voices => {
    const enVoices = voices.filter(v => v.lang === 'en-IN').map(v => v.name);
    console.log('[WebSpeech] Indian EN voices:', enVoices.join(', ') || 'none');
  });
}

function pickBestWebVoice(voices) {
  return voices.find(v => v.lang === 'en-IN' && /google/i.test(v.name))
      || voices.find(v => v.lang === 'en-IN' && /microsoft/i.test(v.name))
      || voices.find(v => v.lang === 'en-IN')
      || voices.find(v => v.lang === 'en-GB')
      || voices.find(v => v.lang.startsWith('en'))
      || null;
}

function speakWithWebSpeech(text) {
  if (!window.speechSynthesis) return;

  function doSpeak(voices) {
    window.speechSynthesis.cancel();
    const voice = pickBestWebVoice(voices);
    const utt   = new SpeechSynthesisUtterance(text);
    if (voice) {
      utt.voice = voice;
      utt.lang  = voice.lang;
      console.log('[WebSpeech] Using voice:', voice.name, voice.lang);
    } else {
      utt.lang = 'en-IN';
      console.warn('[WebSpeech] No matching voice, using en-IN');
    }
    utt.rate   = 0.90;
    utt.pitch  = 1.0;
    utt.volume = 1;
    utt.onerror = e => console.warn('[WebSpeech] Error:', e.error);
    window.speechSynthesis.speak(utt);
  }

  if (_cachedVoices.length > 0) doSpeak(_cachedVoices);
  else loadVoices().then(doSpeak);
}

// ── Main TTS entry point ──────────────────────────────────────
function speakResponse(text) {
  if (!state.ttsEnabled) return;

  // Clean text — strip markdown, HTML, emojis for natural speech
  const clean = text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[\u2022\u2192\u23F0\u{1F300}-\u{1FFFF}]/gu, '')
    .replace(/#+\s/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .slice(0, 300);

  if (!clean) return;

  if (GTTS_CONFIG.enabled && GTTS_CONFIG.apiKey) speakWithGoogleTTS(clean);
  else speakWithWebSpeech(clean);
}

// ── Speech Recognition (STT) ──────────────────────────────────
function initVoice() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    document.getElementById('voice-btn')?.setAttribute('title', 'Voice not supported in this browser');
    return;
  }
  recognition = new SpeechRecognition();
  recognition.continuous     = false;
  recognition.interimResults = false;
  recognition.lang = 'en-IN';

  recognition.onresult = (e) => {
    const transcript = e.results[0][0].transcript;
    document.getElementById('chat-input').value = transcript;
    stopRecording();
    handleSend();
  };
  recognition.onerror = (e) => {
    console.warn('[STT] Error:', e.error);
    stopRecording();
  };
  recognition.onend = () => stopRecording();
}

function startRecording() {
  if (!recognition) return;
  recognition.lang = 'en-IN';
  try {
    recognition.start();
    isRecording = true;
    document.getElementById('voice-btn')?.classList.add('recording');
  } catch (e) {
    console.warn('[STT] Start error:', e.message);
  }
}

function stopRecording() {
  isRecording = false;
  document.getElementById('voice-btn')?.classList.remove('recording');
  try { recognition?.stop(); } catch {}
}

// ════════════════════════════════════════════════════════════
//  PUB/SUB SIMULATOR (frontend — supplements backend)
// ════════════════════════════════════════════════════════════
function startPubSubSimulator() {
  setInterval(async () => {
    // Try to pull fresh data from backend first
    const backendData = await apiLiveData();
    if (backendData?.data) {
      state.liveData = backendData.data;
    } else {
      // Local simulation
      const d = state.liveData;
      Object.keys(d.queues || {}).forEach(id => {
        const delta = Math.floor(Math.random()*5)-2;
        d.queues[id].wait_min = Math.max(0,(d.queues[id].wait_min||0)+delta);
        const w = d.queues[id].wait_min;
        d.queues[id].zone_density = w===0?'low':w<5?'low':w<10?'medium':'high';
      });
      Object.keys(d.restrooms || {}).forEach(id => {
        const delta = Math.floor(Math.random()*10)-5;
        d.restrooms[id].occupancy = Math.min(100,Math.max(0,(d.restrooms[id].occupancy||0)+delta));
        const occ = d.restrooms[id].occupancy;
        d.restrooms[id].wait_min = Math.floor(occ/15);
        d.restrooms[id].density  = occ<40?'low':occ<70?'medium':occ<90?'high':'critical';
      });
      const levels = ['low','medium','high','critical'];
      Object.keys(d.exits || {}).forEach(id => {
        const cur  = levels.indexOf(d.exits[id].congestion||'medium');
        const next = Math.max(0,Math.min(3,cur+(Math.random()<0.25?(Math.random()<0.5?1:-1):0)));
        d.exits[id].congestion = levels[next];
        d.exits[id].delay_min  = [2,7,14,22][next];
      });
      if ((d.match_status?.next_break_min ?? 0) > 0) d.match_status.next_break_min--;
    }
    refreshUI();
    await pollPredictions();
  }, 20000);
  console.log('[PubSub] Frontend simulator started ✓');
}

// ════════════════════════════════════════════════════════════
//  CHAT — SEND & RECEIVE
// ════════════════════════════════════════════════════════════
async function handleSend() {
  const input = document.getElementById('chat-input');
  const text  = input.value.trim();
  if (!text || state.isThinking) return;

  input.value = '';
  input.style.height = 'auto';
  state.isThinking = true;
  document.getElementById('send-btn').disabled = true;

  showWelcome(false);
  addMessage('user', text);
  showTyping();
  hideDecisionPanel();

  try {
    let aiText, decisionData = null, predictions = [];

    if (state.backendOnline) {
      // ── Backend path ─────────────────────────────
      const res = await apiChat(text);
      if (res?.ok) {
        aiText = res.response;
        if (res.safetyAlerts?.length)    localDetectSafety(); // already shown in response
        if (res.predictions?.length)     showPrediction(res.predictions[0]);

        // Pull decision data for transparency panel
        const q = text.toLowerCase();
        if (/(biryani|pizza|burger|food|eat|drink|snack|chai|hungry)/i.test(q)) {
          const food = q.match(/biryani|pizza|burger|chai|snack|drink/i)?.[0] || state.user.foodPref;
          const dec  = await apiDecision('food', { preference: food });
          if (dec?.ok) decisionData = { type:'food', ranked:[dec.best,...(dec.alternatives||[])] };
        } else if (/(restroom|toilet|washroom)/i.test(q)) {
          const dec = await apiDecision('restroom');
          if (dec?.ok) decisionData = { type:'restroom', ranked:[dec.best,...(dec.alternatives||[])] };
        } else if (/(exit|leave|go home)/i.test(q)) {
          const dec = await apiDecision('exit');
          if (dec?.ok) decisionData = { type:'exit', ranked:[dec.best,...(dec.alternatives||[])] };
        }

        if (!decisionData && res.mode === 'demo') {
          aiText = buildLocalResponse(text);
          decisionData = state.lastDecisionData;
        }
      }
    }

    if (!aiText) {
      // ── Local fallback ────────────────────────────
      aiText = buildLocalResponse(text);
      decisionData = state.lastDecisionData;
    }

    hideTyping();
    addMessage('ai', aiText);
    speakResponse(aiText);

    // Show Decision Transparency Panel
    if (decisionData?.ranked) {
      showDecisionPanel(decisionData.ranked, decisionData.type);
    }

    // Refresh metrics from backend
    await refreshMetrics();

  } catch (err) {
    hideTyping();
    const fallback = buildLocalResponse(text);
    addMessage('ai', `${fallback}\n\n<span style="font-size:0.7rem;color:var(--text-muted)">[Backend error: ${err.message} — showing local response]</span>`);
    if (state.lastDecisionData?.ranked) showDecisionPanel(state.lastDecisionData.ranked, state.lastDecisionData.type);
    console.error('[Chat]', err);
  }

  state.isThinking = false;
  document.getElementById('send-btn').disabled = false;
  document.getElementById('chat-input').focus();
}

// ════════════════════════════════════════════════════════════
//  CHAT UI
// ════════════════════════════════════════════════════════════
function showWelcome(show) {
  const w = document.getElementById('chat-welcome');
  const m = document.getElementById('chat-messages');
  if (w) w.style.display = show ? 'flex'  : 'none';
  if (m) m.style.display = show ? 'none'  : 'flex';
}

function addMessage(role, text) {
  showWelcome(false);
  const msgs = document.getElementById('chat-messages');
  const isAI = role === 'ai';
  const div  = document.createElement('div');
  div.className = `msg ${isAI ? 'ai' : 'user'}`;
  div.innerHTML = `
    <div class="msg-avatar ${isAI ? 'ai' : 'usr'}" aria-hidden="true">${isAI ? '🤖' : '👤'}</div>
    <div class="msg-body">
      <div class="msg-name">${isAI ? 'StadiumSaathi AI' : 'You'}</div>
      <div class="msg-bubble">${renderMarkdown(text)}</div>
    </div>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
  state.chatHistory.push({ role, text });
}

function showTyping() {
  showWelcome(false);
  const msgs = document.getElementById('chat-messages');
  const div  = document.createElement('div');
  div.id = 'typing-indicator';
  div.className = 'msg ai msg-typing';
  div.innerHTML = `
    <div class="msg-avatar ai" aria-hidden="true">🤖</div>
    <div class="msg-body">
      <div class="msg-name">StadiumSaathi AI</div>
      <div class="msg-bubble">
        <span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>
      </div>
    </div>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function hideTyping() { document.getElementById('typing-indicator')?.remove(); }

function renderMarkdown(text) {
  // Handle pre-rendered HTML blocks (nav-action, safety-block)
  const parts = text.split(/(<div class="[^"]*">[\s\S]*?<\/div>)/g);
  return parts.map(part => {
    if (part.startsWith('<div')) return part;
    return part
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')
      .replace(/\*(.*?)\*/g,'<em>$1</em>')
      .replace(/^→ (.*?)$/gm,'<div class="nav-action">🧭 $1</div>')
      .replace(/\n{2,}/g,'</p><p>')
      .replace(/\n/g,'<br>')
      .replace(/^(.+)$/,'<p>$1</p>');
  }).join('');
}

// ════════════════════════════════════════════════════════════
//  SIDEBAR RENDERING
// ════════════════════════════════════════════════════════════
function refreshUI() {
  renderQueueList();
  renderRestroomList();
  renderHeatmap();
  renderGateList();
  renderMatchStatus();
  renderTicker();
}

function getWaitClass(wait) { return wait <= 5 ? 'wait-low' : wait <= 12 ? 'wait-medium' : 'wait-high'; }

function renderQueueList() {
  const el      = document.getElementById('queue-list');
  if (!el) return;
  const liveQ   = state.liveData.queues || {};
  const block   = state.user.block;
  const walkMap = WALKING_TIMES_STALL[block] || {};

  const stalls = FOOD_STALLS.map(s => ({
    ...s, live:liveQ[s.id]||{}, walk:walkMap[s.id]||8,
  })).sort((a,b) => {
    const ta = (a.live.wait_min||0) + a.walk;
    const tb = (b.live.wait_min||0) + b.walk;
    return ta - tb;
  });

  el.innerHTML = stalls.map(s => {
    const wait = s.live.wait_min ?? 5;
    const den  = s.live.zone_density || 'medium';
    const pct  = Math.min(100, (wait / 20) * 100);
    return `
    <div class="stall-row" role="button" tabindex="0"
         aria-label="${s.name}: ${s.walk} min walk, ${wait} min wait"
         onclick="window.askAbout('${s.foods[0]}')">
      <span class="stall-emoji">${s.emoji}</span>
      <div class="stall-info">
        <div class="stall-name">${s.name}</div>
        <div class="stall-meta">${s.walk}m walk · ${den}</div>
        <div class="queue-bar-bg"><div class="queue-bar-fill ${den}" style="width:${pct}%"></div></div>
      </div>
      <div class="stall-wait ${getWaitClass(wait)}">${wait}<span style="font-size:.6rem;font-weight:400">m</span></div>
    </div>`;
  }).join('');
}

function renderRestroomList() {
  const el = document.getElementById('restroom-list');
  if (!el) return;
  const liveRR  = state.liveData.restrooms || {};
  const block   = state.user.block;
  const walkMap = WALKING_TIMES_RESTROOM[block] || {};

  const sorted = RESTROOMS
    .filter(r => !state.user.mobility || r.hasAccessibility)
    .map(r => ({ ...r, live:liveRR[r.id]||{}, walk:walkMap[r.id]||5 }))
    .sort((a,b) => ((a.live.wait_min||0)+a.walk) - ((b.live.wait_min||0)+b.walk))
    .slice(0,4);

  el.innerHTML = sorted.map(r => {
    const occ = r.live.occupancy ?? 50;
    const den = r.live.density   || 'medium';
    return `
    <div class="stall-row" role="status" aria-label="${r.name}: ${r.walk} min walk, ${occ}% occupied">
      <span class="stall-emoji">🚻</span>
      <div class="stall-info">
        <div class="stall-name">${r.name}${r.hasAccessibility?' ♿':''}</div>
        <div class="stall-meta">${r.walk}m walk · ${occ}% full</div>
        <div class="queue-bar-bg"><div class="queue-bar-fill ${den}" style="width:${occ}%"></div></div>
      </div>
      <span class="badge badge-${den}">${den}</span>
    </div>`;
  }).join('');
}

function renderHeatmap() {
  const el   = document.getElementById('heatmap-grid');
  if (!el) return;
  const dens = state.liveData.crowd_density || {};
  const zones = [
    {key:'north',label:'North'},{key:'east',label:'East'},
    {key:'south',label:'South'},{key:'west',label:'West'},
    {key:'north_concourse',label:'N.Concourse'},{key:'east_concourse',label:'E.Concourse'},
    {key:'south_concourse',label:'S.Concourse'},{key:'west_concourse',label:'W.Concourse'},
  ];
  el.innerHTML = zones.map(z => {
    const lvl = dens[z.key] || 'low';
    return `<div class="heat-cell ${lvl}" role="status" aria-label="${z.label}: ${lvl}">${z.label}<br><small>${lvl}</small></div>`;
  }).join('');
}

function renderGateList() {
  const el = document.getElementById('gate-list');
  if (!el) return;
  const exits  = state.liveData.exits || {};
  const block  = state.user.block;
  const sorted = GATES.map(g => ({
    ...g, live:exits[g.id]||{}, walk:EXIT_TIMES[block]?.[g.id]||8,
  })).sort((a,b) => {
    const lvl = {low:0,medium:1,high:2,critical:3};
    return (lvl[a.live.congestion]||0) - (lvl[b.live.congestion]||0);
  });

  el.innerHTML = sorted.map(g => {
    const cong  = g.live.congestion || 'low';
    const delay = g.live.delay_min ?? 5;
    return `<div class="gate-row" role="status" aria-label="${g.name}: ${cong} congestion">
      <div><div class="gate-name">${g.name}</div><div class="gate-delay">${g.walk}m walk · ${delay}m delay</div></div>
      <span class="badge badge-${cong}">${cong}</span>
    </div>`;
  }).join('');
}

function renderMatchStatus() {
  const ms = state.liveData.match_status || {};
  const el = (id) => document.getElementById(id);
  if (el('match-score'))  el('match-score').textContent  = ms.score  || '—';
  if (el('match-inning')) el('match-inning').textContent = ms.inning || '—';
  if (el('match-break'))  el('match-break').textContent  = `Break in ${ms.next_break_min ?? '?'} min`;
}

function renderTicker() {
  const el      = document.getElementById('ticker-text');
  if (!el) return;
  const safety  = localDetectSafety();
  const ms      = state.liveData.match_status || {};
  if (safety.length) {
    el.textContent = `⚠️ SAFETY — Critical congestion at ${safety[0]}. Follow AI routing.`;
    el.style.color = 'var(--accent-red)';
    document.getElementById('live-ticker')?.style.setProperty('border-color','rgba(255,77,109,.3)');
  } else {
    el.style.color = '';
    document.getElementById('live-ticker')?.style.removeProperty('border-color');
    const stalls = localDecideFood('any');
    el.textContent = `🏏 ${ms.score || 'IND vs AUS'} · Break in ${ms.next_break_min ?? '?'} min · Best pick: ${stalls[0]?.name || '—'} (${stalls[0]?.waitTime ?? 0}m wait)`;
  }
}

function renderProfileSummary() {
  const { seat, block, foodPref, mobility } = state.user;
  const el = (id) => document.getElementById(id);
  if (el('user-chip-seat'))  el('user-chip-seat').textContent  = seat  || '—';
  if (el('user-chip-block')) el('user-chip-block').textContent = block || '—';
  if (el('ps-seat'))   el('ps-seat').textContent   = seat     || '—';
  if (el('ps-block'))  el('ps-block').textContent  = block    || '—';
  if (el('ps-food'))   el('ps-food').textContent   = foodPref || 'any';
  if (el('ps-mobility')) el('ps-mobility').classList.toggle('hidden', !mobility);
}

// ════════════════════════════════════════════════════════════
//  PIPELINE VISUAL
// ════════════════════════════════════════════════════════════
function setPipelineActive(id, active) {
  document.getElementById(id)?.classList.toggle('active', active);
}
function pulsePipelineStep(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add('pulsing');
  setTimeout(() => el.classList.remove('pulsing'), 2000);
}

// ════════════════════════════════════════════════════════════
//  ONBOARDING & PROFILE
// ════════════════════════════════════════════════════════════
function setupModal() {
  document.getElementById('start-btn')?.addEventListener('click', () => {
    const backendUrl = document.getElementById('backend-url-input')?.value.trim() || 'http://localhost:8080';
    const gTTSKey    = document.getElementById('gtts-key-input')?.value.trim()    || '';
    const seat       = document.getElementById('seat-input')?.value.trim()        || 'G24';
    const block      = document.getElementById('block-select')?.value             || 'B2';
    const foodPref   = document.getElementById('food-pref-select')?.value         || 'any';
    const mobility   = document.getElementById('mobility-toggle')?.checked        || false;

    state.backendUrl    = backendUrl.replace(/\/$/, '');
    state.user.seat     = seat;
    state.user.block    = block;
    state.user.foodPref = foodPref;
    state.user.mobility = mobility;
    // Enable Google Cloud TTS Neural voices if key provided
    if (gTTSKey) setGoogleTTSKey(gTTSKey);

    document.getElementById('modal-overlay').style.display = 'none';

    if (recognition) recognition.lang = 'en-IN';

    renderProfileSummary();
    refreshUI();

    // Check backend, then greet
    checkBackend().then(online => {
      setTimeout(() => {
        addMessage('ai', `Welcome! 🏟️ You're in **Block ${block}**, Seat **${seat}**.\n\nI'm connected to ${online ? '**live backend data**' : '**local simulation**'} — ${online ? 'Gemini Pro is ready!' : 'running in Demo Mode.'}\n\nTry asking: *"Where can I get biryani?"*`);
      }, 600);
    });
  });

}

function setupEventListeners() {
  // Change profile
  document.getElementById('change-profile-btn')?.addEventListener('click', () => {
    document.getElementById('modal-overlay').style.display = 'flex';
  });
  document.getElementById('user-chip')?.addEventListener('click', () => {
    document.getElementById('modal-overlay').style.display = 'flex';
  });

  // Metrics toggle
  document.getElementById('metrics-toggle-btn')?.addEventListener('click', () => {
    const bar = document.getElementById('metrics-bar');
    const btn = document.getElementById('metrics-toggle-btn');
    const show = bar?.classList.toggle('hidden');
    btn?.classList.toggle('active', !show);
    if (!show) refreshMetrics();
  });


  // Prediction dismiss
  document.getElementById('prediction-dismiss')?.addEventListener('click', () => {
    document.getElementById('prediction-banner')?.classList.add('hidden');
  });

  // Decision panel close
  document.getElementById('dp-close')?.addEventListener('click', hideDecisionPanel);

  // Voice button
  document.getElementById('voice-btn')?.addEventListener('click', () => {
    if (isRecording) { stopRecording(); } else { startRecording(); }
  });

  // Chat input
  const input = document.getElementById('chat-input');
  input?.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 110) + 'px';
  });
  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  });
  document.getElementById('send-btn')?.addEventListener('click', handleSend);

  // Quick action buttons
  document.querySelectorAll('.quick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const q = btn.dataset.query;
      if (q) { document.getElementById('chat-input').value = q; handleSend(); }
    });
    btn.addEventListener('keydown', (e) => { if (e.key==='Enter'||e.key===' ') btn.click(); });
  });
}

// Global stall click helper
window.askAbout = (food) => {
  document.getElementById('chat-input').value = `Where can I get ${food} right now?`;
  handleSend();
};

// ════════════════════════════════════════════════════════════
//  BOOT
// ════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', async () => {
  setupModal();
  setupEventListeners();
  initVoice();

  // Pre-render sidebars before modal closes
  refreshUI();

  // Firebase (async)
  await initFirebase();

  // Pub/Sub polling simulator
  startPubSubSimulator();

  // Initial pipeline state
  setPipelineActive('pipe-backend', false);
  setPipelineActive('pipe-gemini',  false);
  setPipelineActive('pipe-bq',      false);

  console.log('🏟️ StadiumSaathi v2 booted — Backend-First Architecture');
});
