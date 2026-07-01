# Merge Rewards → Main Shabu Shack Site

Goal: consolidate this rewards app into [Shabu Shack](/projects/eb3b02b2-c388-4c59-9594-3e73bf324e69) so shabushack.com serves everything (marketing + rewards) on one backend.

## Direction of the merge

Cross-project tools only pull files **into** the current project, not push out. So the merge must be run **from inside the main Shabu Shack project**, pulling this rewards project in. That's also the right direction — the main site is the larger surface (menu, reservations, events, franchise, reviews, admin) and already lives at shabushack.com.

**Action for you:** open [Shabu Shack](/projects/eb3b02b2-c388-4c59-9594-3e73bf324e69), then paste this plan into chat there and say "execute". The agent in that project will do the work below.

## Scope

All rewards pages port over:
- Public: `/login`, `/join`, `/reset-password`, `/rewards`, `/deals`, `/locations` (merge with existing), `/install`, `/birthday`
- Auth-gated: `/dashboard`, `/profile`
- Staff: `/staff` (PIN-gated)
- Admin: `/owner`, `/admin` (role-gated, merge with existing admin)

Supporting pieces: RequireAuth guard, Navbar/Footer additions, notification system, QR code, spin wheel, staff panel, owner dashboard analytics.

## Backend consolidation (single Supabase)

Main site's Lovable Cloud stays the source of truth. Recreate the rewards schema there via one migration:

Tables: `profiles` (merge with any existing), `user_roles`, `punch_cards`, `visits`, `points_transactions`, `reward_redemptions`, `notifications`, `promotions`, `locations` (merge — main site already has locations), `birthday_spins`, `challenges`, `challenge_progress`, `user_streaks`, `vip_memberships`, `location_owner_access`, `phone_otps`. Drop `prepaid_balances` / `prepaid_transactions` (already removed from UI per POS constraint) unless you want the historical shell.

Functions/triggers: `has_role`, `is_location_owner`, `update_updated_at_column`, `handle_new_user` (extend the main site's existing new-user trigger rather than replacing).

Edge functions to copy: `staff-action`, birthday spin, notification realtime, any others in `supabase/functions/`.

RLS + GRANTs on every new public table.

Auth: enable email/password + Google on the main project (Google via `configure_social_auth`). Existing main-site auth (if any) keeps working — rewards just adds member-facing routes on top.

## Merges to reconcile

- **Locations**: main site already has a locations page. Keep main site's version as canonical; port rewards' `perk`/`yelp_url`/`badge` columns and staff PIN into that table.
- **Navbar**: add "Rewards / Sign In / Dashboard" entries to the existing main-site navbar rather than replacing it.
- **Admin**: main site has `/admin`. Merge rewards owner/admin dashboards as tabs or sub-routes under it.
- **Design tokens**: keep main site's tokens; adapt rewards components to them (red/black/white + Bebas Neue should already align).

## Data migration

Rewards app has ~zero real users, so no export needed. If any test accounts matter, note them and recreate manually after merge.

## Cutover

1. Merge completes on main site project → verify all routes on the preview URL.
2. Publish main site.
3. On this rewards project: unpublish (Settings → Unpublish) so `shabushackrewards.lovable.app` stops serving a duplicate.
4. Optional: keep this project as an archive, or delete once satisfied.

## Technical checklist for the main-site agent

- [ ] Read every file under `src/pages`, `src/components`, `src/hooks`, `src/contexts`, `src/lib`, `supabase/functions` from `@Shabu Shack Rewards`
- [ ] Copy pages/components/hooks into main site, adapting imports
- [ ] One migration creating all rewards tables with GRANTs + RLS + trigger extensions
- [ ] Deploy copied edge functions
- [ ] Enable Google OAuth via `configure_social_auth`
- [ ] Wire rewards routes into main site's router
- [ ] Extend main site navbar/footer with rewards entries
- [ ] Merge locations table (add perk/yelp_url/badge/pin columns, seed data)
- [ ] Run security scan, then publish

## Out of scope

- Prepaid/gift card UI (POS-locked, already removed)
- Menu/online ordering in rewards app (already excluded)
- Migrating rewards users (none live)
