/**
 * StadiumSaathi — Gemini Service (Backend)
 * ═════════════════════════════════════════
 * Hosts the masterfully engineered system prompt.
 * All Gemini calls happen server-side — key never leaves backend.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { CONGESTION_PENALTY, FOOD_STALLS, RESTROOMS, GATES,
         WALKING_TIMES_STALL, WALKING_TIMES_RESTROOM, EXIT_TIMES_FROM_BLOCK,
         detectSafetyAlerts, decideFoodStall, decideRestroom, decideExit } from './decision-engine.js';

let genAI = null;

export function initGemini(apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
  console.log('[Gemini] Initialized ✓');
}

// ── System Prompt Builder ─────────────────────────────────────

function buildSystemPrompt(userContext, liveData) {
  const { seat, block, foodPref, mobility, lang } = userContext;
  const { queues, restrooms, exits, crowd_density, match_status } = liveData;

  const safetyAlerts = detectSafetyAlerts(liveData);
  const criticalZones = safetyAlerts.map(a => a.zone).join(', ');
  const hasSafety = safetyAlerts.length > 0;

  // Format live data sections
  const foodLines = FOOD_STALLS.map(s => {
    const live  = queues?.[s.id]    || {};
    const walk  = WALKING_TIMES_STALL[block]?.[s.id] ?? '?';
    const total = (walk || 0) + (live.wait_min || 0) + (CONGESTION_PENALTY[live.zone_density] || 0);
    return `  • ${s.emoji} ${s.name} [${s.foods.join('/')}]: ${walk}m walk + ${live.wait_min ?? '?'}m wait + ${CONGESTION_PENALTY[live.zone_density??'medium']}m penalty = **${total}m total** (${live.zone_density ?? 'unknown'} zone)`;
  }).join('\n');

  const rrLines = RESTROOMS.map(r => {
    const live = restrooms?.[r.id] || {};
    const walk = WALKING_TIMES_RESTROOM[block]?.[r.id] ?? '?';
    const total= (walk||0) + (live.wait_min||0) + (CONGESTION_PENALTY[live.density]||0);
    return `  • ${r.name}${r.hasAccessibility?' ♿':''}: ${walk}m walk, ${live.occupancy??'?'}% full, ${live.wait_min??'?'}m wait = **${total}m total**`;
  }).join('\n');

  const exitLines = GATES.map(g => {
    const live     = exits?.[g.id] || {};
    const walk     = EXIT_TIMES_FROM_BLOCK[block]?.[g.id] ?? '?';
    const total    = (walk||0) + (live.delay_min||0) + (CONGESTION_PENALTY[live.congestion]||0);
    const transit  = live.transit ? `[${live.transit}]` : '[No transit]';
    return `  • ${g.name} (${g.zone}): ${walk}m walk + ${live.delay_min??'?'}m delay = **${total}m total** | ${live.congestion??'?'} | ${transit}`;
  }).join('\n');

  const densityLines = Object.entries(crowd_density || {})
    .map(([z, lvl]) => `  • ${z.replace(/_/g,' ')}: ${lvl}`)
    .join('\n');

  const safetyBlock = hasSafety
    ? `\n🚨 SAFETY OVERRIDE ACTIVE — Critical zones: ${criticalZones}
       You MUST redirect all users away from these zones regardless of efficiency.
       Prepend a clear safety warning to every response.`
    : '';

  const mobilityBlock = mobility
    ? `\n♿ ACCESSIBILITY MODE ACTIVE
       Always route via elevators, ramps, and wide corridors.
       Never route through stairs or high-density zones.
       Prioritize comfort and safety over speed.`
    : '';

  const langBlock = lang === 'hi'
    ? `\n🌐 LANGUAGE: Respond in Hindi (Devanagari script + Roman if needed). Keep navigation terms in English.`
    : `\n🌐 LANGUAGE: English — be direct, warm, and human.`;

  return `You are StadiumSaathi — an elite real-time stadium intelligence system built on Google Cloud.

Your mission: CONTEXT-AWARE CROWD NAVIGATION AND DECISION ENGINE for Rajiv Gandhi International Stadium (capacity 55,000).

You combine:
  • Real-time Firebase data streams
  • Predictive crowd reasoning  
  • Personalized routing
  • Safety-first crowd management

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 USER CONTEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Seat: ${seat || 'Unknown'}  |  Block: ${block}  |  Food Pref: ${foodPref}  |  Mobility: ${mobility ? 'YES' : 'No'}
${mobilityBlock}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 LIVE FIREBASE DATA (real-time)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏏 Match: ${match_status?.phase} | ${match_status?.score} | Break in ${match_status?.next_break_min ?? '?'} min

🍽️ Food Stalls (from Block ${block}):
${foodLines}

🚻 Restrooms (from Block ${block}):
${rrLines}

🚪 Exit Gates (from Block ${block}):
${exitLines}

🔥 Crowd Density:
${densityLines}
${safetyBlock}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚙️ DECISION RULE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL_TIME = walk_time + wait_time + congestion_penalty
Penalties: low=0min · medium=2min · high=5min · critical=10min
ALWAYS recommend MINIMUM TOTAL_TIME.
ALWAYS show the arithmetic — it builds trust.
NEVER expose raw JSON, IDs, or backend internals.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 RESPONSE FORMAT (mandatory structure)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. **Best Option** — emoji + name + why it wins
2. **Decision Math** — show the time breakdown (judges love this)
3. **Navigation** — exact route: corridor → gate → landmark
4. **Alternative** — second-best with tradeoff
5. **Safety Note** — only when critical zones active
6. **Predictive Tip** — anticipate next situation (e.g., "Break in 5 min — preorder now")

🗣️ Tone: Warm, decisive, expert. Sound like a knowledgeable local friend with a supercomputer — not a robot.
${langBlock}`;
}

// ── API Call ──────────────────────────────────────────────────

export async function callGemini({ userMessage, userContext, liveData, chatHistory = [] }) {
  if (!genAI) throw new Error('Gemini not initialized. Set GEMINI_API_KEY.');

  const model  = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const system = buildSystemPrompt(userContext, liveData);

  // Build multi-turn history (max last 6 turns)
  const sliced = chatHistory.slice(-6);
  const histContents = sliced.map(h => ({
    role:  h.role === 'ai' ? 'model' : 'user',
    parts: [{ text: h.text }],
  }));

  const chat = model.startChat({
    systemInstruction: { parts: [{ text: system }] },
    history: histContents,
    generationConfig: {
      temperature     : 0.72,
      maxOutputTokens : 650,
      topP            : 0.95,
    },
    safetySettings: [
      { category:'HARM_CATEGORY_DANGEROUS_CONTENT', threshold:'BLOCK_ONLY_HIGH' },
      { category:'HARM_CATEGORY_HARASSMENT',        threshold:'BLOCK_ONLY_HIGH' },
    ],
  });

  const result = await chat.sendMessage(userMessage);
  return result.response.text();
}
