

## Plan: Track and Display Reward Redemptions

### Problem
When a customer earns a free entrée (10 punches), the `completed_cards` counter increments but there's no record of when, where, or by whom the reward was actually redeemed. Owners and admins have no visibility into redemption activity.

### Solution

**1. New `reward_redemptions` table** (migration)
- Columns: `id`, `user_id`, `location_id`, `redeemed_at` (default now()), `staff_note` (optional text)
- RLS: owners see their location's redemptions, admins see all, users see their own

**2. Add "Redeem Reward" action to Staff Panel**
- New button appears when a customer has `freeEntrees >= 1`
- Calls a new `"redeem_reward"` action in the `staff-action` edge function
- Edge function: decrements `completed_cards` by 1, inserts a row into `reward_redemptions`, returns updated count
- Staff sees a confirmation toast with customer name and remaining free entrées

**3. Show redemptions in Owner Dashboard**
- Fetch `reward_redemptions` for the location in `useOwnerDashboard`
- Add a stat card showing total redemptions count
- Add a "Recent Redemptions" section (table with customer name, date/time)

**4. Show redemptions in Admin Dashboard**
- Fetch all `reward_redemptions` with profile names
- Add a total redemptions metric card
- Optionally show in the member detail row

### Files changed
- **New migration**: create `reward_redemptions` table + RLS policies
- `supabase/functions/staff-action/index.ts`: add `"redeem_reward"` case
- `src/pages/StaffPanel.tsx`: add Redeem button + handler
- `src/hooks/use-owner-dashboard.ts`: fetch redemptions, add stats
- `src/pages/OwnerDashboard.tsx`: render redemptions section
- `src/pages/AdminDashboard.tsx`: add redemption metric

