

# 🍲 Shabu Shack — Loyalty & Membership App

A warm, inviting web app that rewards your loyal customers and drives foot traffic across all 4 locations.

---

## 1. Landing Page & Branding
- Warm color palette (rich reds, deep oranges, cream tones) reflecting the cozy shabu-shabu dining experience
- Hero section showcasing your food with a clear "Join Now" call-to-action
- Overview of membership benefits to entice sign-ups

## 2. Customer Sign-Up & Login
- Google sign-in for quick, frictionless onboarding
- Simple profile with name, phone, and favorite location
- Returning customers can sign in instantly

## 3. Hybrid Rewards System (Points + Punch Card + Prepaid)
- **Points:** Earn 1 pt per $1 spent (VIP gets 2x). Redeem for dishes, drinks, meals.
- **Punch Card:** Visual 10-visit punch card → free meal. Tracks across all locations.
- **Prepaid Balance:** Load $50+ for bonus credit ($50→$55, $100→$110, $200→$230, $500→$600). VIP gets higher bonuses.
- **Reward History:** Full activity log showing points earned, punches, redemptions, and balance loads.

## 4. Membership Tiers (Free + VIP)
- **Free:** Punch card, 1x points, prepaid balance, public deals
- **VIP ($2.49/mo or $24.99/yr):** Everything free + 15% off, 2x points, birthday reward, early menu access, priority seating, members-only deals, higher prepaid bonuses
- Stripe-powered subscription billing

## 5. Exclusive Deals & Promotions
- Feed of current promotions and limited-time offers
- Location-specific deals (e.g., "Tuesday special at Downtown location")
- Members-only flash deals to drive traffic on slow days

## 6. Menu & Online Ordering
- Browse the full menu with photos and descriptions
- Filter by category (broths, proteins, sides, drinks)
- Note: actual order processing would be a future phase — initially this serves as a digital menu

## 7. Location Finder
- All 4 Shabu Shack locations with addresses, hours, and phone numbers
- Map view with directions link (opens Google Maps)
- Each location shows current deals or wait times

## 8. Member Dashboard
- At-a-glance view: punch card progress, active deals, membership status
- Quick links to nearby location, current promotions, and rewards

---

**Backend:** Supabase (database for users, rewards, promotions) + Stripe (VIP membership payments)

**Starting simple:** We'll build the core loyalty features first, then layer on ordering and more advanced features over time.

