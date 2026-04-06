
# Gamified Rewards System

## Overview
Replace the current punch card + points system with a gaming-style rewards engine built around **monthly challenges**, **visit streaks**, and **tier progression**.

## Core Mechanics

### 1. Tier Progression (replaces membership_tier)
- **Bronze** → **Silver** → **Gold** → **Diamond**
- Advance by earning XP from challenges and streaks
- Each tier unlocks better perks (e.g. Gold = 15% off every visit, Diamond = 20% + birthday double spin)
- Tiers reset annually to keep customers engaged (or soft-decay if inactive)

### 2. Monthly Challenges
- Rotating set of 3-4 challenges each month, e.g.:
  - "Visit 4 times this month" → 200 XP
  - "Try 2 different locations" → 150 XP
  - "Spend $50+ in a single visit" → 100 XP
- Progress bars show completion status
- Completing all challenges = bonus milestone reward

### 3. Visit Streaks
- Track consecutive weeks with at least 1 visit
- Streak multiplier: 2 weeks = 1.5x XP, 4 weeks = 2x XP, 8+ weeks = 3x XP
- Breaking a streak resets the multiplier (but not tier progress)
- Visual flame/fire indicator showing current streak

## Database Changes
- **New table: `challenges`** — monthly challenge definitions (title, description, goal_type, goal_value, xp_reward, month/year)
- **New table: `challenge_progress`** — per-user progress on each challenge (user_id, challenge_id, current_value, completed_at)
- **New table: `user_streaks`** — tracks current streak, best streak, last_visit_week, multiplier
- **Modify `profiles`** — add `xp_total`, `current_tier` (bronze/silver/gold/diamond) columns
- **Remove reliance on**: punch_cards table (keep data but stop using in UI)

## UI Changes
- **Rewards page** → completely redesigned:
  - Hero section: current tier + XP progress bar to next tier
  - Active streak display with flame animation
  - Monthly challenges grid with progress bars
  - Reward perks list for current tier
- **Navbar/Profile**: show tier badge icon

## What Stays
- Visit tracking (visits table) — used as the data source for challenges/streaks
- Prepaid balance — independent feature, unchanged
- Birthday wheel — stays as-is
- VIP membership — replaced by tier system

## Implementation Order
1. Database migration (new tables + profile columns)
2. Rewards page redesign with new UI
3. Challenge/streak logic hooks
4. Staff panel updates (visits still recorded same way, XP auto-calculated)
