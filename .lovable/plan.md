

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

## 3. Digital Punch Card & Rewards
- Visual punch card that tracks visits across all 4 locations
- Progress indicator showing how close they are to their next reward (e.g., "3 more visits until a free meal!")
- Reward history so customers can see what they've earned

## 4. Membership Subscription (VIP Tier)
- Optional paid monthly VIP membership with premium perks:
  - % discount on every visit
  - Birthday reward (free dish or dessert)
  - Early access to new menu items
  - Priority seating or reservations
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

