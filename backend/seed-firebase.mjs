/**
 * StadiumSaathi — Firebase Seed Script
 * ══════════════════════════════════════
 * Pushes initial live data to Firebase Realtime Database.
 *
 * Usage:
 *   node seed-firebase.mjs
 *
 * Requires .env with FIREBASE_PROJECT_ID + credentials set.
 */

import 'dotenv/config';
import admin from 'firebase-admin';

const PROJECT_ID   = process.env.FIREBASE_PROJECT_ID;
const DATABASE_URL = process.env.FIREBASE_DATABASE_URL;

if (!PROJECT_ID || !DATABASE_URL) {
  console.error('❌  Set FIREBASE_PROJECT_ID and FIREBASE_DATABASE_URL in .env');
  process.exit(1);
}

// Init Firebase Admin
const credential = process.env.FIREBASE_PRIVATE_KEY
  ? admin.credential.cert({
      projectId:   PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:  process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    })
  : admin.credential.applicationDefault();

admin.initializeApp({ credential, databaseURL: DATABASE_URL, projectId: PROJECT_ID });
const db = admin.database();

const SEED_DATA = {
  queues: {
    stall_a: { name:'Stall A', wait_min:15, zone_density:'high'   },
    stall_b: { name:'Stall B', wait_min:5,  zone_density:'medium' },
    stall_c: { name:'Stall C', wait_min:0,  zone_density:'low'    },
    stall_d: { name:'Stall D', wait_min:3,  zone_density:'low'    },
    stall_e: { name:'Stall E', wait_min:8,  zone_density:'medium' },
    stall_f: { name:'Stall F', wait_min:2,  zone_density:'low'    },
  },
  restrooms: {
    rr_g1: { name:'Gate 1 Restroom', occupancy:85, capacity:100, wait_min:8,  density:'high'   },
    rr_g2: { name:'Gate 2 Restroom', occupancy:40, capacity:100, wait_min:2,  density:'low'    },
    rr_g3: { name:'Gate 3 Restroom', occupancy:60, capacity:100, wait_min:4,  density:'medium' },
    rr_g4: { name:'Gate 4 Restroom', occupancy:20, capacity:100, wait_min:0,  density:'low'    },
    rr_g5: { name:'Gate 5 Restroom', occupancy:30, capacity:100, wait_min:1,  density:'low'    },
    rr_g6: { name:'Gate 6 Restroom', occupancy:75, capacity:100, wait_min:6,  density:'high'   },
  },
  exits: {
    gate_1: { name:'Gate 1', congestion:'medium',   delay_min:6,  transit:'Metro - Platform 2' },
    gate_2: { name:'Gate 2', congestion:'high',     delay_min:14, transit:'Bus Bay C'          },
    gate_3: { name:'Gate 3', congestion:'low',      delay_min:2,  transit:null                 },
    gate_4: { name:'Gate 4', congestion:'low',      delay_min:3,  transit:'Metro - Platform 1' },
    gate_5: { name:'Gate 5', congestion:'medium',   delay_min:7,  transit:'Bus Bay A'          },
    gate_6: { name:'Gate 6', congestion:'critical', delay_min:18, transit:null                 },
  },
  crowd_density: {
    north:'medium', east:'high', south:'low', west:'low',
    north_concourse:'high', east_concourse:'medium',
    south_concourse:'low',  west_concourse:'low',
  },
  match_status: {
    phase:'LIVE', score:'IND 187-4 (32)', inning:'1st Innings', next_break_min:8,
  },
};

console.log('🌱  Seeding Firebase Realtime Database...');
console.log(`    Project : ${PROJECT_ID}`);
console.log(`    URL     : ${DATABASE_URL}`);

try {
  await db.ref('/').set(SEED_DATA);
  console.log('✅  Seed complete! Data written to Firebase.');
  console.log('\n    Paths written:');
  Object.keys(SEED_DATA).forEach(k => console.log(`    /${k}`));
} catch (err) {
  console.error('❌  Seed failed:', err.message);
} finally {
  await admin.app().delete();
  process.exit(0);
}
