import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import OnboardingBanner from "@/components/OnboardingBanner";
import Footer from "@/components/Footer";
import { useAuthReady } from "@/hooks/use-auth-ready";
import { useGamification, TIER_COLORS, type TierName } from "@/hooks/use-gamification";
import { useRewardsData } from "@/hooks/use-rewards-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Flame, Trophy, Star, Shield, Crown, Utensils,
  QrCode, Loader2, Clock, Zap, ChevronRight, MapPin, Cake, Gift,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";

const TIER_ICONS: Record<TierName, typeof Shield> = {
  bronze: Shield,
  silver: Star,
  gold: Crown,
  diamond: Trophy,
};

const Dashboard = () => {
  const { user } = useAuthReady();
  const {
    profile, xp, currentTier, streak,
    punchCard, isLoading,
  } = useGamification();
  const { activity } = useRewardsData();
  const [showQR, setShowQR] = useState(false);

  const tierColors = TIER_COLORS[currentTier];
  const TierIcon = TIER_ICONS[currentTier];
  const currentPoints = punchCard?.punches_count ?? 0;
  const freeEntrees = punchCard?.completed_cards ?? 0;
  const userId = user?.id ?? null;
  const visitsToFree = 10 - currentPoints;
  const xpToFree = visitsToFree * 50;
  const firstName = profile?.name?.split(" ")[0] || "Member";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-mobile-nav md:pb-0">
        <Navbar />
        <main className="pt-24 pb-16 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-mobile-nav md:pb-0">
      <Navbar />
      <main className="pt-20 pb-10">
        <div className="container mx-auto px-4 max-w-lg">

          {profile && (
            <OnboardingBanner
              profile={{
                user_id: profile.user_id,
                date_of_birth: profile.date_of_birth,
                favorite_location_id: profile.favorite_location_id,
              }}
            />
          )}

          {/* HERO — single focal point: greeting + free-entrée progress + QR */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-primary via-primary to-[hsl(0,78%,32%)]">
              <CardContent className="p-5 text-primary-foreground">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.2em] opacity-75 mb-1">Welcome back</p>
                    <h1 className="font-display text-3xl tracking-wide leading-none">{firstName}</h1>
                  </div>
                  <button
                    onClick={() => setShowQR(!showQR)}
                    className="w-12 h-12 rounded-full bg-white text-primary flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                    aria-label="Show QR code"
                  >
                    <QrCode className="w-6 h-6" />
                  </button>
                </div>

                {/* Free Entrée progress */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Utensils className="w-4 h-4" />
                      <span className="text-sm font-semibold">Free entrée progress</span>
                    </div>
                    <span className="text-xs font-bold tabular-nums">{currentPoints * 50}/500 XP</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden">
                    <motion.div
                      className="bg-white rounded-full h-2.5"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (currentPoints / 10) * 100)}%` }}
                      transition={{ duration: 0.9, ease: "easeOut" }}
                    />
                  </div>
                  <p className="text-xs mt-2 opacity-90">
                    {currentPoints === 0
                      ? "Visit any location to earn your first 50 XP."
                      : currentPoints >= 10
                        ? "🎉 Free entrée ready — show staff to redeem!"
                        : currentPoints >= 9
                          ? "🔥 One more visit for your free entrée!"
                          : `${visitsToFree} visits (${xpToFree} XP) until free entrée`}
                  </p>
                </div>

                {freeEntrees > 0 && (
                  <div className="bg-white text-primary rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm font-bold shadow-md">
                    <Utensils className="w-4 h-4" />
                    {freeEntrees} free entrée{freeEntrees > 1 ? "s" : ""} ready
                    <span className="ml-auto text-[11px] font-medium opacity-70">Show QR to staff</span>
                  </div>
                )}

                <AnimatePresence>
                  {showQR && userId && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-col items-center gap-2 bg-white rounded-2xl p-4">
                        <QRCodeSVG
                          value={`${window.location.origin}/staff?customer=${userId}`}
                          size={180}
                          bgColor="#ffffff"
                          fgColor="#1a1a1a"
                          level="M"
                        />
                        <p className="text-[11px] text-muted-foreground">{profile?.name || "Member"}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats strip */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="grid grid-cols-3 gap-2.5 mt-4"
          >
            <Link to="/rewards" className="group">
              <Card className="border-border h-full hover:border-primary/40 transition-colors">
                <CardContent className="py-3 px-2 text-center">
                  <TierIcon className={`w-5 h-5 mx-auto mb-1 ${tierColors.text}`} />
                  <p className="text-base font-bold capitalize leading-tight">{currentTier}</p>
                  <p className="text-[10px] text-muted-foreground tabular-nums">{xp.toLocaleString()} XP</p>
                </CardContent>
              </Card>
            </Link>
            <Card className="border-border">
              <CardContent className="py-3 px-2 text-center">
                <Gift className="w-5 h-5 mx-auto mb-1 text-warm-gold" />
                <p className="text-base font-bold tabular-nums">{freeEntrees}</p>
                <p className="text-[10px] text-muted-foreground">Free Entrées</p>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="py-3 px-2 text-center">
                <Flame className={`w-5 h-5 mx-auto mb-1 ${streak.current >= 2 ? "text-orange-500" : "text-muted-foreground"}`} />
                <p className="text-base font-bold tabular-nums">{streak.current}wk</p>
                <p className="text-[10px] text-muted-foreground">
                  Streak{streak.current >= 2 ? ` · ${streak.multiplier}×` : ""}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent activity */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-5"
          >
            <Card className="border-border">
              <CardContent className="py-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <h3 className="font-display text-sm tracking-wider uppercase">Recent activity</h3>
                  </div>
                  <Link to="/rewards" className="text-[11px] text-muted-foreground hover:text-primary inline-flex items-center gap-0.5">
                    View all <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
                {activity.length === 0 ? (
                  <div className="text-center py-6">
                    <Zap className="w-7 h-7 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No activity yet.</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Visit a Shabu Shack to earn your first 50 XP.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {activity.slice(0, 4).map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-2 border-b last:border-0 border-border/50"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.action}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{item.location}</p>
                        </div>
                        <span className="text-[11px] text-muted-foreground ml-2 flex-shrink-0">{item.date}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Discovery row — birthday + locations */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-2 gap-2.5 mt-4"
          >
            <Link to="/birthday">
              <Card className="border-warm-gold/40 bg-warm-gold/5 h-full hover:border-warm-gold transition-colors">
                <CardContent className="py-3 px-3 flex items-center gap-2.5">
                  <Cake className="w-5 h-5 text-warm-gold flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-tight">Birthday Spin</p>
                    <p className="text-[10px] text-muted-foreground">Win a free prize</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link to="/locations">
              <Card className="border-border h-full hover:border-primary/40 transition-colors">
                <CardContent className="py-3 px-3 flex items-center gap-2.5">
                  <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-tight">Find Location</p>
                    <p className="text-[10px] text-muted-foreground">4 NorCal spots</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
