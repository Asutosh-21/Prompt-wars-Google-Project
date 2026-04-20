# 🏟️ StadiumSaathi — Real-Time Stadium AI Navigator

> AI-powered crowd navigation using Gemini Pro + Firebase + Google Cloud  
> Built for the Google Prompt Wars Hackathon

---

## 🚀 Quick Start (Demo Mode — No Keys Needed)

```bash
# Terminal 1 — Backend
cd backend
npm install
node server.js

# Terminal 2 — Frontend
cd ..
npx serve . --listen 3000
```

Open `http://localhost:3000` → fill modal → click **Start Navigation**

---

## 🔑 Full Setup — Step by Step

### Step 1 — Gemini API Key

1. Go to https://aistudio.google.com/app/apikey
2. Click **Create API Key**
3. Copy the key → paste into `backend/.env`:
```env
GEMINI_API_KEY=AIzaSy_your_key_here
```

---

### Step 2 — Firebase Project Setup

#### 2a. Create Firebase Project
1. Go to https://console.firebase.google.com
2. Click **Add project** → name it `stadiumsaathi`
3. Disable Google Analytics (not needed) → **Create project**

#### 2b. Enable Realtime Database
1. In Firebase Console → **Build** → **Realtime Database**
2. Click **Create Database**
3. Choose region: `asia-south1` (Mumbai) or nearest
4. Start in **test mode** (we'll add rules next)
5. Copy your database URL: `https://stadiumsaathi-default-rtdb.firebaseio.com`

#### 2c. Deploy Database Rules
```bash
npm install -g firebase-tools
firebase login
firebase init database   # select your project
firebase deploy --only database
```

#### 2d. Get Service Account (for backend)
1. Firebase Console → **Project Settings** → **Service Accounts**
2. Click **Generate new private key** → download `serviceAccountKey.json`
3. Move it to `backend/serviceAccountKey.json`

OR use individual env vars in `backend/.env`:
```env
FIREBASE_PROJECT_ID=stadiumsaathi
FIREBASE_DATABASE_URL=https://stadiumsaathi-default-rtdb.firebaseio.com
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@stadiumsaathi.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"
```

#### 2e. Get Web App Config (for frontend)
1. Firebase Console → **Project Settings** → **General**
2. Scroll to **Your apps** → click **</>** (Web)
3. Register app name: `stadiumsaathi-web`
4. Copy the config object → paste into `app.js`:
```js
const FIREBASE_CONFIG = {
  apiKey:            "AIzaSy_your_web_api_key",
  authDomain:        "stadiumsaathi.firebaseapp.com",
  databaseURL:       "https://stadiumsaathi-default-rtdb.firebaseio.com",
  projectId:         "stadiumsaathi",
  storageBucket:     "stadiumsaathi.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123456789:web:abcdef123456",
};
```

#### 2f. Seed Initial Data
```bash
cd backend
node seed-firebase.mjs
```
Output:
```
✅  Seed complete! Data written to Firebase.
    /queues
    /restrooms
    /exits
    /crowd_density
    /match_status
```

---

### Step 3 — Google Cloud TTS (Optional — Neural voices)

1. Go to https://console.cloud.google.com
2. Enable **Cloud Text-to-Speech API**
3. **APIs & Services** → **Credentials** → **Create API Key**
4. Restrict key to: Cloud Text-to-Speech API
5. Paste into the onboarding modal **Google TTS API Key** field

Voices used:
- English: `en-IN-Neural2-A` (Indian female, neural)
- Fallback: `en-IN-Wavenet-A`

---

### Step 4 — Google Maps (Optional — real routing)

1. Go to https://console.cloud.google.com
2. Enable: **Maps JavaScript API** + **Routes API** + **Places API**
3. Create API Key → restrict to your domain
4. Add to `app.js`:
```js
const GOOGLE_MAPS_KEY = "AIzaSy_your_maps_key";
```

---

### Step 5 — Run Full Stack

```bash
# backend/.env (minimum for full live mode)
GEMINI_API_KEY=AIzaSy_...
FIREBASE_PROJECT_ID=stadiumsaathi
FIREBASE_DATABASE_URL=https://stadiumsaathi-default-rtdb.firebaseio.com
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
PORT=8080
ALLOWED_ORIGINS=http://localhost:3000
```

```bash
cd backend && node server.js
# → Mode: LIVE (Gemini enabled)
# → Firebase: Connected ✓
```

---

## ☁️ Deploy to Google Cloud

### Deploy Backend to Cloud Run
```bash
cd backend
gcloud run deploy stadiumsaathi-backend \
  --source . \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars "GEMINI_API_KEY=your_key,FIREBASE_PROJECT_ID=your_project,FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com,FIREBASE_CLIENT_EMAIL=your_email,FIREBASE_PRIVATE_KEY=your_key"
```

### Deploy Frontend to Firebase Hosting
```bash
# Update FIREBASE_CONFIG in app.js first
firebase deploy --only hosting
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Health check + mode |
| GET | `/api/csrf-token` | Get CSRF token |
| GET | `/api/data` | Full live data snapshot |
| GET | `/api/predictions` | BigQuery-style predictions |
| GET | `/api/metrics` | Session impact metrics |
| POST | `/api/chat` | AI chat (Gemini) |
| POST | `/api/decision/food` | Best food stall |
| POST | `/api/decision/restroom` | Best restroom |
| POST | `/api/decision/exit` | Best exit gate |
| POST | `/api/data/update` | Pub/Sub data update |

---

## 🗂️ Project Structure

```
StadiumSaathi/
├── backend/
│   ├── server.js           ← Express + Cloud Run
│   ├── decision-engine.js  ← TOTAL_TIME formula
│   ├── gemini-service.js   ← Gemini Pro integration
│   ├── seed-data.js        ← In-memory fallback data
│   ├── seed-firebase.mjs   ← Push data to Firebase
│   ├── .env                ← Your keys (never commit)
│   ├── .env.example        ← Template
│   └── Dockerfile          ← Cloud Run container
├── app.js                  ← Frontend logic
├── index.html              ← UI shell
├── style.css               ← Premium dark UI
├── database.rules.json     ← Firebase security rules
├── firebase.json           ← Firebase deploy config
└── README.md
```

---

## ✨ Features

| Feature | Technology |
|---|---|
| AI Chat | Gemini 2.0 Flash (Cloud Run backend) |
| Live Queue Data | Firebase Realtime Database |
| Real-Time Events | Pub/Sub simulation (20s interval) |
| Predictive Alerts | BigQuery ML simulation |
| Decision Engine | TOTAL_TIME = walk + wait + penalty |
| Voice I/O | Google Cloud TTS Neural2 + Web Speech |
| Security | CSRF tokens · Helmet · Rate limiting · XSS |
| Explainable AI | Decision Transparency Panel |
| Accessibility | ♿ Ramp/elevator routing |
| Impact Metrics | Wait saved · Routes optimized · Efficiency % |
