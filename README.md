# ⚡ HabitForge — Gamified Habit Tracking Platform

HabitForge is a full-stack gamified habit tracking application built with React, TypeScript, Express, Mongoose, and Better-Auth. It transforms daily habit building into an RPG-style progression system with level-ups, XP multipliers, active streaks, unlocked badges, and detailed 365-day analytics heatmaps.

---

## 🚀 Quick Start & Live Application

### Demo User Credentials (Pre-populated 3 Months History)
The database comes pre-seeded with a **Demo User** account populated with **90 days (3 months)** of habit completion logs, populated charts, active streaks, level 25 progression, and unlocked badges:

* **Email**: `demo@habitforge.com`
* **Password**: `demo123456`

### Seeding Test Data
To re-seed or populate the database locally or in production at any time:
```bash
# Via Backend CLI
cd backend
pnpm seed

# Via API Endpoint
POST /api/seed/demo-user
```

---

## 📦 Project Architecture & Deliverables

```
HabitForge/
├── utils/
│   └── gamification.js         # Pure, isolated Gamification Math Engine (XP, Levels, Streaks)
├── backend/
│   ├── src/
│   │   ├── config/             # DB & Environment Configuration
│   │   ├── controllers/        # Express Route Controllers
│   │   ├── lib/                # Better-Auth & Integration Setup
│   │   ├── middleware/         # Auth & Validation Middleware
│   │   ├── models/             # Mongoose Schemas (User, Habit, HabitLog, Badge, Tag)
│   │   ├── routes/             # API Endpoints (Habits, Analytics, Badges, Users, Seed)
│   │   ├── services/           # Business Logic (Analytics, Badges, Habits, Seeding)
│   │   ├── utils/              # Gamification & Helper Utilities
│   │   └── seed.ts             # CLI Database Seed Script
│   ├── package.json
│   └── tsconfig.json
└── frontend/
    ├── src/
    │   ├── api/                # API Client Services
    │   ├── components/         # Reusable UI Components
    │   ├── context/            # Global Auth & App State Context
    │   ├── pages/              # Pages (Dashboard, Analytics, Badges, Habits, Profile)
    │   └── utils/              # Frontend Utilities & Gamification Math Engine
    ├── package.json
    └── vite.config.ts
```

---

## 🧮 Gamification & Streak Algorithm Documentation

### 1. Dedicated Gamification Module
The gamification engine is isolated from API routes and UI components in `/utils/gamification.js` (and mirrored in `backend/src/utils/gamification.ts` & `frontend/src/utils/gamification.ts`). It contains zero external dependencies and handles all math calculations deterministically.

### 2. Math & Formulas

#### XP Calculation Formula
Completing a habit grants base XP plus a streak bonus that scales with your consecutive active days:
$$\text{XP}_{\text{earned}} = \text{BaseXP} + \min(\text{Streak} \times \text{BonusPerDay}, \text{MaxBonus})$$
* **Base XP**: `10 XP` per completion
* **Streak Bonus**: `+2 XP` per active streak day
* **Cap**: Maximum bonus of `+50 XP` per completion

#### Level Progression Formula
Level thresholds follow a quadratic progression curve:
$$\text{Level} = \left\lfloor \sqrt{\frac{\text{TotalXP}}{25}} \right\rfloor + 1$$
$$\text{XP}_{\text{threshold}}(\text{Level}) = \text{Level}^2 \times 25$$

| Level | Cumulative XP Required | Level Title |
| :--- | :--- | :--- |
| **Level 1** | 0 XP | Novice |
| **Level 2** | 100 XP | Beginner |
| **Level 5** | 625 XP | Rising Star |
| **Level 10** | 2,500 XP | Forge Veteran |
| **Level 25** | 15,625 XP | Grandmaster |

---

### 3. Streak Calculation Algorithm Detail

```
Input: Array of completion date keys ['YYYY-MM-DD', ...]
Output: { currentStreak: number, maxStreak: number }
```

#### Step 1: Input Normalization & Deduplication
- Completion timestamps are converted to `YYYY-MM-DD` date strings in the user's local timezone.
- Duplicate completions on the same day for the same habit are removed.
- Dates are sorted in **descending chronological order** (newest date first).

#### Step 2: Timezone Handling
Timezone shifts are one of the most common causes of accidental streak resets (e.g., completing a habit at 11:30 PM local time being recorded as the next day in UTC).
- **Date Key Storage**: Log entries store a explicit `dateKey` string (`YYYY-MM-DD`) derived from the user's local client time zone.
- **Dynamic Timezone Evaluation**: When computing active streaks, `calculateStreak(dateKeys, timeZone)` formats "today" and "yesterday" using `Intl.DateTimeFormat` with the requested IANA timezone (e.g., `America/New_York` or `Asia/Kolkata`).
- This guarantees that calendar boundaries align perfectly with user local time regardless of server UTC time.

#### Step 3: Missed Days & Active Streak Logic
To maintain an **active streak**:
1. The most recent log date must be either **TODAY** or **YESTERDAY**.
2. If the user hasn't completed a habit today yet, yesterday's completion holds the streak active so the user can complete today's task without losing momentum.
3. The algorithm iterates through consecutive pairs of dates $(D_i, D_{i+1})$:
   $$\Delta_{\text{days}} = \text{round}\left( \frac{\text{Time}(D_i) - \text{Time}(D_{i+1})}{86,400,000\text{ ms}} \right)$$
   - If $\Delta_{\text{days}} \le 1$: `currentStreak` increments by 1.
   - If $\Delta_{\text{days}} > 1$: A gap of 1 or more missed calendar days has occurred. The current streak loop breaks immediately and `currentStreak` stops counting.

#### Step 4: Maximum Historical Streak (`maxStreak`)
An independent scan evaluates the full timeline array to find the longest unbroken consecutive sequence ever achieved in the habit's history, guaranteeing `maxStreak` $\ge$ `currentStreak`.

---

## 🛠️ Local Setup & Environment

### 1. Prerequisites
- Node.js (v18+)
- pnpm (or npm / yarn)
- MongoDB instance (Local or MongoDB Atlas)

### 2. Environment Variables

Create `.env` inside `backend/`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_ACCESS_SECRET=your_secret_key_at_least_16_chars
CLIENT_URL=http://localhost:5173
```

Create `.env` inside `frontend/`:
```env
VITE_API_URL=http://localhost:5000
```

### 3. Running Locally
```bash
# Terminal 1: Backend
cd backend
pnpm dev

# Terminal 2: Frontend
cd frontend
pnpm dev
```

---

## 🚢 Deployment Guide

### Deploying Frontend (Vercel / Netlify)
1. Set Framework Preset to **Vite**.
2. Build Command: `pnpm build`
3. Output Directory: `dist`
4. Set Environment Variable: `VITE_API_URL` pointing to your deployed backend.

### Deploying Backend (Render / Railway)
1. Build Command: `pnpm build`
2. Start Command: `pnpm start`
3. Set Environment Variables: `MONGODB_URI`, `PORT`, `CLIENT_URL`, `JWT_ACCESS_SECRET`.
4. Trigger Post-Deployment Seed: `pnpm seed` or call `/api/seed/demo-user`.
