/**
 * StadiumSaathi — Express Server (Cloud Run)
 * ═══════════════════════════════════════════
 * Routes: /api/chat · /api/decision/* · /api/data · /api/metrics · /health
 * Security: Helmet · CORS · Rate-limiting · Input sanitization · CSRF
 */

import 'dotenv/config';
import crypto          from 'crypto';
import express         from 'express';
import cors            from 'cors';
import helmet          from 'helmet';
import rateLimit       from 'express-rate-limit';
import xss             from 'xss';
import admin           from 'firebase-admin';

import { initGemini, callGemini }      from './gemini-service.js';
import { INITIAL_FIREBASE_DATA }       from './seed-data.js';
import {
  decideFoodStall, decideRestroom, decideExit,
  detectSafetyAlerts, getPredictions, calcImpactMetrics,
} from './decision-engine.js';

// ── Environment ───────────────────────────────────────────────
const PORT         = process.env.PORT || 8080;
const GEMINI_KEY   = process.env.GEMINI_API_KEY;
const PROJECT_ID   = process.env.FIREBASE_PROJECT_ID;
const DATABASE_URL = process.env.FIREBASE_DATABASE_URL;
const ALLOWED_ORIG = (process.env.ALLOWED_ORIGINS || '*').split(',').map(s => s.trim());
const IS_DEMO      = !GEMINI_KEY;

// ── Firebase Admin Init ───────────────────────────────────────
let db = null;

function initFirebaseAdmin() {
  if (!PROJECT_ID && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.warn('[Firebase Admin] No credentials — using in-memory simulation.');
    return;
  }
  try {
    // Option B: individual env vars (Cloud Run / no JSON file)
    const credential = process.env.FIREBASE_PRIVATE_KEY
      ? admin.credential.cert({
          projectId:   PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey:  process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        })
      : admin.credential.applicationDefault();

    admin.initializeApp({ credential, databaseURL: DATABASE_URL, projectId: PROJECT_ID });
    db = admin.database();
    console.log('[Firebase Admin] Connected ✓');
  } catch (err) {
    console.warn('[Firebase Admin] Init failed — using in-memory simulation.', err.message);
  }
}

// ── In-Memory Live Data ───────────────────────────────────────
let inMemoryData = JSON.parse(JSON.stringify(INITIAL_FIREBASE_DATA));

async function getLiveData() {
  if (db) {
    const snap = await db.ref('/').once('value');
    return snap.val() || inMemoryData;
  }
  return inMemoryData;
}

// ── Session Store ─────────────────────────────────────────────
const sessions = {};
function getSession(uid) {
  if (!sessions[uid]) sessions[uid] = { chatHistory: [], decisionLog: [] };
  return sessions[uid];
}

// ── CSRF Token Store ──────────────────────────────────────────
const csrfTokens = new Map();

function generateCsrfToken(uid) {
  const token = crypto.randomBytes(32).toString('hex');
  csrfTokens.set(token, { uid, exp: Date.now() + 3_600_000 });
  return token;
}

function verifyCsrf(req, res, next) {
  if (req.method === 'GET' || req.path === '/health') return next();
  const token = req.headers['x-csrf-token'];
  const entry = token && csrfTokens.get(token);
  if (!entry || entry.exp < Date.now()) {
    return res.status(403).json({ ok: false, error: 'Invalid or expired CSRF token.' });
  }
  next();
}

// ── Auth Middleware ───────────────────────────────────────────
async function optionalAuth(req, res, next) {
  const idToken = req.headers.authorization?.replace('Bearer ', '');
  if (!idToken || !admin.apps.length) {
    req.uid = req.headers['x-user-id'] || `anon_${Date.now()}`;
    return next();
  }
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.uid = decoded.uid;
  } catch {
    req.uid = `anon_${Date.now()}`;
  }
  next();
}

// ── Input Validation ──────────────────────────────────────────
const VALID_BLOCKS = ['A1','A2','B1','B2','B3','C1','C2','C3','D1','D2','E1','E2','F1','F2'];
const VALID_PREFS  = ['any','biryani','pizza','burger','snacks','drinks'];

function sanitize(val) {
  if (typeof val !== 'string') return val;
  return xss(val.trim().slice(0, 500));
}

// ── Express App ───────────────────────────────────────────────
const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'", "https://www.gstatic.com"],
      connectSrc: ["'self'", "https://*.firebaseio.com", "https://*.googleapis.com"],
      imgSrc:     ["'self'", "data:"],
      styleSrc:   ["'self'", "'unsafe-inline'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: ALLOWED_ORIG.includes('*') ? '*' : ALLOWED_ORIG,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-ID', 'X-CSRF-Token'],
}));

app.use(express.json({ limit: '32kb' }));

// ── Rate Limiting ─────────────────────────────────────────────
const defaultLimiter = rateLimit({
  windowMs: 60_000, max: 60,
  standardHeaders: true, legacyHeaders: false,
  message: { error: 'Too many requests. Please wait a moment.' },
});
const chatLimiter = rateLimit({
  windowMs: 60_000, max: 20,
  message: { error: 'Chat rate limit reached. Please wait.' },
});

app.use(defaultLimiter);

// ══════════════════════════════════════════════════════════════
//  ROUTES
// ══════════════════════════════════════════════════════════════

// Root route — API info
app.get('/', (req, res) => {
  res.json({
    name: 'StadiumSaathi API',
    version: '2.0',
    description: 'Real-time stadium crowd navigation powered by Gemini Pro + Firebase',
    status: 'live',
    powered_by: ['Gemini 2.0 Flash', 'Firebase Realtime DB', 'Cloud Run', 'Pub/Sub', 'BigQuery'],
    endpoints: {
      health:      'GET /health',
      data:        'GET /api/data',
      predictions: 'GET /api/predictions',
      metrics:     'GET /api/metrics',
      chat:        'POST /api/chat',
      food:        'POST /api/decision/food',
      restroom:    'POST /api/decision/restroom',
      exit:        'POST /api/decision/exit',
    },
    frontend: 'https://prompt-war-virtual.web.app',
    github:   'https://github.com/Asutosh-21/Prompt-wars-Google-Project',
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', mode: IS_DEMO ? 'demo' : 'live', timestamp: new Date().toISOString() });
});

// CSRF token
app.get('/api/csrf-token', optionalAuth, (req, res) => {
  res.json({ ok: true, csrfToken: generateCsrfToken(req.uid) });
});

// Live data snapshot
app.get('/api/data', optionalAuth, async (req, res) => {
  try {
    res.json({ ok: true, data: await getLiveData() });
  } catch {
    res.status(500).json({ ok: false, error: 'Failed to fetch live data.' });
  }
});

// BigQuery-style predictions
app.get('/api/predictions', optionalAuth, async (req, res) => {
  try {
    res.json({ ok: true, predictions: getPredictions(await getLiveData()) });
  } catch {
    res.status(500).json({ ok: false, error: 'Prediction service unavailable.' });
  }
});

// Impact metrics
app.get('/api/metrics', optionalAuth, (req, res) => {
  const session = getSession(req.uid);
  res.json({ ok: true, metrics: calcImpactMetrics(session.decisionLog), totalDecisions: session.decisionLog.length });
});

// Food decision
app.post('/api/decision/food', optionalAuth, verifyCsrf, async (req, res) => {
  const block    = VALID_BLOCKS.includes(req.body.block) ? req.body.block : 'B2';
  const pref     = VALID_PREFS.includes(req.body.preference) ? req.body.preference : 'any';
  const mobility = !!req.body.mobility;
  try {
    const data   = await getLiveData();
    const ranked = decideFoodStall(block, pref, data.queues, mobility);
    const safety = detectSafetyAlerts(data);
    if (ranked.length >= 2) {
      getSession(req.uid).decisionLog.push({
        type: 'food', ts: Date.now(),
        bestTotal: ranked[0].totalTime, worstTotal: ranked[ranked.length - 1].totalTime,
      });
    }
    res.json({ ok: true, best: ranked[0], alternatives: ranked.slice(1, 3), safetyAlerts: safety });
  } catch (err) {
    console.error('[/api/decision/food]', err);
    res.status(500).json({ ok: false, error: 'Decision engine error.' });
  }
});

// Restroom decision
app.post('/api/decision/restroom', optionalAuth, verifyCsrf, async (req, res) => {
  const block    = VALID_BLOCKS.includes(req.body.block) ? req.body.block : 'B2';
  const mobility = !!req.body.mobility;
  try {
    const data   = await getLiveData();
    const ranked = decideRestroom(block, data.restrooms, mobility);
    const safety = detectSafetyAlerts(data);
    if (ranked.length >= 2) {
      getSession(req.uid).decisionLog.push({
        type: 'restroom', ts: Date.now(),
        bestTotal: ranked[0].totalTime, worstTotal: ranked[ranked.length - 1].totalTime,
      });
    }
    res.json({ ok: true, best: ranked[0], alternatives: ranked.slice(1, 3), safetyAlerts: safety });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Decision engine error.' });
  }
});

// Exit decision
app.post('/api/decision/exit', optionalAuth, verifyCsrf, async (req, res) => {
  const block    = VALID_BLOCKS.includes(req.body.block) ? req.body.block : 'B2';
  const mobility = !!req.body.mobility;
  try {
    const data   = await getLiveData();
    const ranked = decideExit(block, data.exits, mobility);
    const safety = detectSafetyAlerts(data);
    getSession(req.uid).decisionLog.push({
      type: 'exit', ts: Date.now(),
      bestTotal: ranked[0].totalTime, worstTotal: ranked[ranked.length - 1].totalTime,
    });
    res.json({ ok: true, best: ranked[0], alternatives: ranked.slice(1, 3), safetyAlerts: safety });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Decision engine error.' });
  }
});

// AI Chat
app.post('/api/chat', optionalAuth, chatLimiter, verifyCsrf, async (req, res) => {
  const rawMsg   = req.body.message;
  const block    = VALID_BLOCKS.includes(req.body.block) ? req.body.block : 'B2';
  const pref     = VALID_PREFS.includes(req.body.foodPref) ? req.body.foodPref : 'any';
  const mobility = !!req.body.mobility;
  const lang     = req.body.lang === 'hi' ? 'hi' : 'en';
  const seat     = sanitize(req.body.seat || 'Unknown');

  if (!rawMsg || typeof rawMsg !== 'string') {
    return res.status(400).json({ ok: false, error: 'Message is required.' });
  }
  const message = sanitize(rawMsg);
  if (!message.length) return res.status(400).json({ ok: false, error: 'Message too short.' });

  const session = getSession(req.uid);
  try {
    const liveData    = await getLiveData();
    const safety      = detectSafetyAlerts(liveData);
    const predictions = getPredictions(liveData);

    const aiResponse = IS_DEMO
      ? buildDemoResponse(message, { block, pref, mobility, seat }, liveData)
      : await callGemini({ userMessage: message, userContext: { seat, block, foodPref: pref, mobility, lang }, liveData, chatHistory: session.chatHistory });

    session.chatHistory.push({ role: 'user', text: message });
    session.chatHistory.push({ role: 'ai',   text: aiResponse });
    if (session.chatHistory.length > 20) session.chatHistory = session.chatHistory.slice(-20);

    res.json({ ok: true, response: aiResponse, safetyAlerts: safety, predictions: predictions.slice(0, 2), mode: IS_DEMO ? 'demo' : 'gemini' });
  } catch (err) {
    console.error('[/api/chat]', err.message);
    res.status(500).json({
      ok: false, error: `AI error: ${err.message}`,
      response: buildDemoResponse(message, { block, pref, mobility, seat }, inMemoryData),
    });
  }
});

// Pub/Sub push update
app.post('/api/data/update', optionalAuth, verifyCsrf, async (req, res) => {
  const update = req.body;
  if (!update || typeof update !== 'object') {
    return res.status(400).json({ ok: false, error: 'Invalid update payload.' });
  }
  inMemoryData = deepMerge(inMemoryData, update);
  if (db) {
    try { await db.ref('/').update(update); }
    catch (e) { console.warn('Firebase update failed, using in-memory.', e.message); }
  }
  res.json({ ok: true });
});

// ── Utilities ─────────────────────────────────────────────────
function deepMerge(base, update) {
  const result = { ...base };
  for (const key of Object.keys(update)) {
    result[key] = (typeof update[key] === 'object' && !Array.isArray(update[key]) && update[key] !== null)
      ? deepMerge(base[key] || {}, update[key])
      : update[key];
  }
  return result;
}

function buildDemoResponse(message, ctx, liveData) {
  const q = message.toLowerCase();
  const { block, pref, mobility } = ctx;

  if (/(biryani|food|eat|hungry|pizza|burger|snack|chai|drink)/i.test(q)) {
    const food   = q.match(/biryani|pizza|burger|snack|chai|drink/i)?.[0] || pref;
    const ranked = decideFoodStall(block, food, liveData?.queues, mobility);
    const best = ranked[0]; const alt = ranked[1];
    if (!best) return 'No matching stalls found.';
    return `**Best Option: ${best.emoji} ${best.name}**\n\n**Decision Math:**\n• ${best.walkTime}m walk + ${best.waitTime}m wait + ${best.congestionPenalty}m penalty = **${best.totalTime} min total**\n\n${alt ? `**Why not ${alt.name}?** → ${alt.walkTime}m + ${alt.waitTime}m + ${alt.congestionPenalty}m = ${alt.totalTime} min\n\n` : ''}**→ Navigation:** Head to ${best.gate} corridor. Zone is ${best.density} — ${best.density === 'low' ? 'walk straight through!' : 'avoid the main plaza, take side passage.'}\n\n💡 **Predictive Tip:** ${(liveData?.match_status?.next_break_min ?? 99) <= 7 ? 'Half-time in ' + liveData.match_status.next_break_min + ' min — go NOW before the rush!' : 'Good timing — no break imminent.'}`;
  }

  if (/(restroom|toilet|washroom|bathroom)/i.test(q)) {
    const ranked = decideRestroom(block, liveData?.restrooms, mobility);
    const best = ranked[0]; const alt = ranked[1];
    if (!best) return 'Restroom data unavailable.';
    return `**Best Option: 🚻 ${best.name}**\n\n**Decision Math:**\n• ${best.walkTime}m walk + ${best.waitTime}m wait + ${best.congestionPenalty}m penalty = **${best.totalTime} min total**\n• Occupancy: **${best.occ}%**${mobility ? '\n♿ Accessible route via elevator confirmed.' : ''}\n\n${alt ? `**Avoid ${alt.name}** — ${alt.occ}% full, ${alt.totalTime} min total.\n\n` : ''}**→ Navigation:** Head to ${best.gate}. Follow the blue 🚻 signs.`;
  }

  if (/(exit|leave|go home|out)/i.test(q)) {
    const ranked = decideExit(block, liveData?.exits, mobility);
    const best = ranked[0]; const alt = ranked[1];
    return `**Best Exit: 🚪 ${best.name}** (${best.zone})\n\n**Decision Math:**\n• ${best.walkTime}m walk + ${best.delay}m delay + ${best.congestionPenalty}m penalty = **${best.totalTime} min total**\n${best.transit ? `• 🚇 Transit: **${best.transit}**` : '• No transit — street exit'}\n\n${alt ? `**Alternative: ${alt.name}** → ${alt.totalTime} min total | ${alt.congestion} congestion\n\n` : ''}**→ Pro Tip:** ${best.congestion === 'low' ? '✅ Exit now — gate is clear!' : `⏳ Wait ${Math.min(best.delay, 8)} min to beat the peak surge.`}\n\n**→ Navigation:** From Block ${block}, follow ${best.zone} exit signs to ${best.name}.`;
  }

  if (/(crowd|density|busy|congest)/i.test(q)) {
    const density = liveData?.crowd_density || {};
    const low  = Object.entries(density).filter(([, v]) => v === 'low').map(([k]) => k.replace(/_/g, ' '));
    const high = Object.entries(density).filter(([, v]) => v === 'high' || v === 'critical').map(([k]) => k.replace(/_/g, ' '));
    return `**🔥 Stadium Crowd Status — Live**\n\n🟢 **Clear:** ${low.join(', ') || 'None'}\n🔴 **Crowded:** ${high.join(', ') || 'All zones moderate'}\n\n**→ Recommendation:** ${low[0] ? `Head to ${low[0]} — least congested right now.` : 'Move freely — all zones at moderate density.'}`;
  }

  if (/(transit|metro|bus|home|transport)/i.test(q)) {
    const ranked = decideExit(block, liveData?.exits).filter(g => g.transit);
    const best   = ranked[0];
    if (!best) return 'No transit options near your block. Consider a cab from Gate 1 main road.';
    return `**🚇 Best Transit from Block ${block}**\n\n• Exit via **${best.name}** → ${best.transit}\n• ${best.walkTime} min walk · ${best.delay} min current delay · ${best.congestion} congestion\n\n**→ Tip:** Leave ${best.congestion === 'low' ? 'now for smooth boarding' : 'in 8–10 min after final whistle to avoid peak'}.`;
  }

  return `I'm your real-time stadium AI! I can help with:\n\n🍛 **Food** — "Where can I get biryani?"\n🚻 **Restrooms** — "Which restroom is free?"\n🚪 **Exit planning** — "How do I exit safely?"\n🗺️ **Crowd status** — "Where is it least crowded?"\n🚇 **Transit** — "How do I get home?"\n\nWhat do you need?`;
}

// ── Pub/Sub Background Simulator ──────────────────────────────
function startInMemorySimulator() {
  setInterval(() => {
    const d = inMemoryData;
    if (!d) return;
    Object.keys(d.queues || {}).forEach(id => {
      d.queues[id].wait_min = Math.max(0, (d.queues[id].wait_min || 0) + Math.floor(Math.random() * 5) - 2);
      const w = d.queues[id].wait_min;
      d.queues[id].zone_density = w < 5 ? 'low' : w < 10 ? 'medium' : 'high';
    });
    Object.keys(d.restrooms || {}).forEach(id => {
      d.restrooms[id].occupancy = Math.min(100, Math.max(0, (d.restrooms[id].occupancy || 0) + Math.floor(Math.random() * 10) - 5));
      const occ = d.restrooms[id].occupancy;
      d.restrooms[id].wait_min = Math.floor(occ / 15);
      d.restrooms[id].density  = occ < 40 ? 'low' : occ < 70 ? 'medium' : occ < 90 ? 'high' : 'critical';
    });
    const levels = ['low', 'medium', 'high', 'critical'];
    Object.keys(d.exits || {}).forEach(id => {
      const cur  = levels.indexOf(d.exits[id].congestion);
      const next = Math.max(0, Math.min(3, cur + (Math.random() < 0.25 ? (Math.random() < 0.5 ? 1 : -1) : 0)));
      d.exits[id].congestion = levels[next];
      d.exits[id].delay_min  = [2, 7, 14, 22][next];
    });
    if ((d.match_status?.next_break_min ?? 0) > 0) d.match_status.next_break_min--;
    if (db) db.ref('/').set(d).catch(() => {});
  }, 20_000);
  console.log('[PubSub Simulator] Started ✓ (20s interval)');
}

// ── Boot ──────────────────────────────────────────────────────
initFirebaseAdmin();
if (GEMINI_KEY) initGemini(GEMINI_KEY);
else console.warn('[Gemini] No GEMINI_API_KEY — running in DEMO mode.');
startInMemorySimulator();

app.listen(PORT, () => {
  console.log(`🏟️  StadiumSaathi backend listening on port ${PORT}`);
  console.log(`   Mode    : ${IS_DEMO ? 'DEMO (no Gemini key)' : 'LIVE (Gemini enabled)'}`);
  console.log(`   Firebase: ${db ? 'Connected' : 'In-memory simulation'}`);
  console.log(`   CORS    : ${ALLOWED_ORIG.join(', ')}`);
});
