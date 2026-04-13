import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import OnboardingBanner from "@/components/OnboardingBanner";
import Footer from "@/components/Footer";
import { useAuthReady } from "@/hooks/use-auth-ready";
import { useGamification, TIER_COLORS, getNextTier, type TierName } from "@/hooks/use-gamification";
import { useRewardsData } from "@/hooks/use-rewards-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Flame, Trophy, Star, Shield, Crown, Utensils, Wallet,
  QrCode, ChevronRight, User, Tag, MapPin, Loader2, Clock,
  Zap, ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { QRCodeSVG } from "qrcode.react";

const TIER_ICONS: Record<TierName, typeof Shield> = {
  bronze: Shield,
  silver: Star,
  gold: Crown,
  diamond: Trophy,
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isReady } = useAuthReady();
  const {
    profile, xp, currentTier, nextTier, xpInfo, streak,
    punchCard, prepaid, isLoading,
  } = useGamification();
  const { activity } = useRewardsData();
  const [showQR, setShowQR] = useState(false);

  if (isReady && !user) {
    navigate("/login", { replace: true });
    return null;
  }

  const tierColors = TIER_COLORS[currentTier];
  const TierIcon = TIER_ICONS[currentTier];
  const currentPoints = punchCard?.punches_count ?? 0;
  const freeEntrees = punchCard?.completed_cards ?? 0;
  const prepaidBalance = Number(prepaid?.balance ?? 0) + Number(prepaid?.bonus_credits ?? 0);
  const userId = user?.id ?? null;
  const visitsToFree = 10 - currentPoints;

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
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-lg">

          {/* Onboarding */}
          {profile && (
            <OnboardingBanner profile={{ user_id: profile.user_id, date_of_birth: profile.date_of_birth, favorite_location_id: profile.favorite_location_id }} />
          )}

          {/* ─── HERO: Earn XP CTA ─── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
            <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-primary to-[hsl(0,78%,35%)]">
              <CardContent className="p-5 text-primary-foreground">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs uppercase tracking-widest opacity-80 mb-1">
                      Hi, {profile?.name?.split(" ")[0] || "Member"}
                    </p>
                    <h1 className="text-2xl font-display font-bold tracking-wide leading-tight">
                      EARN 50 XP<br />
                      <span className="text-lg font-normal opacity-90">every visit</span>
                    </h1>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Zap className="w-7 h-7 text-white" />
                    </div>
                  </div>
                </div>

                {/* Big progress ring-style bar */}
                <div className="bg-white/15 rounded-2xl p-3 mb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-bold flex items-center gap-1.5">
                      <Utensils className="w-4 h-4" />
                      Free Entrée Progress
                    </span>
                    <span className="text-sm font-bold">{currentPoints * 50}/500 XP</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-4 overflow-hidden">
                    <motion.div
                      className="bg-white rounded-full h-4"
                      initial={{ width: 0 }}
                      animate={{ width: `${(currentPoints / 10) * 100}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                  <p className="text-xs mt-1.5 opacity-90">
                    {currentPoints === 0
                      ? "Visit any location to start earning!"
                      : currentPoints >= 9
                        ? "🔥 ONE more visit for your FREE entrée!"
                        : `${visitsToFree} visit${visitsToFree > 1 ? "s" : ""} to free entrée`}
                  </p>
                </div>

                {/* Earned badges */}
                {freeEntrees > 0 && (
                  <div className="bg-white/20 rounded-xl px-3 py-2 flex items-center gap-2 mb-3">
                    <Utensils className="w-4 h-4" />
                    <span className="text-sm font-bold">{freeEntrees} free entrée{freeEntrees > 1 ? "s" : ""} ready!</span>
                    <span className="text-xs opacity-80 ml-auto">Show staff to redeem</span>
                  </div>
                )}

                {/* QR toggle */}
                <Button
                  onClick={() => setShowQR(!showQR)}
                  className={`w-full font-bold text-base h-12 rounded-xl shadow-lg transition-all ${
                    showQR
                      ? "bg-white/80 text-primary hover:bg-white/70"
                      : "bg-white text-primary hover:bg-white/90 animate-pulse ring-2 ring-white/60 ring-offset-2 ring-offset-primary shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                  }`}
                >
                  <QrCode className="w-5 h-5 mr-2" />
                  {showQR ? "Hide My QR Code" : "⚡ Show My QR Code"}
                </Button>

                <AnimatePresence>
                  {showQR && userId && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-col items-center gap-2 mt-4">
                        <div className="bg-white p-5 rounded-2xl shadow-lg">
                          <QRCodeSVG value={`shabu:${userId}`} size={160} bgColor="#ffffff" fgColor="#1a1a1a" level="M" />
                        </div>
                        <p className="text-xs opacity-80 text-center">
                          Show this to staff at checkout to earn XP
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* ─── HOW IT WORKS ─── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card className="mb-5 border-border bg-muted/30">
              <CardContent className="py-4 px-4">
                <h3 className="font-display text-sm font-bold text-foreground tracking-wider uppercase mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  HOW TO EARN XP
                </h3>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { step: "1", icon: MapPin, label: "Visit any\nlocation" },
                    { step: "2", icon: QrCode, label: "Show QR\nat checkout" },
                    { step: "3", icon: Utensils, label: "Earn 50 XP\nper visit" },
                  ].map((item) => (
                    <div key={item.step} className="flex flex-col items-center gap-1.5">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <item.icon className="w-5 h-5 text-primary" />
                      </div>
                      <p className="text-[11px] text-muted-foreground font-medium whitespace-pre-line leading-tight">{item.label}</p>
                    </div>
                  ))}
                </div>
                <Link to="/locations">
                  <Button variant="outline" className="w-full mt-4 h-11 rounded-xl border-primary/30 text-primary font-bold hover:bg-primary/5">
                    <MapPin className="w-4 h-4 mr-2" />
                    Find a Location Near Me
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* ─── Stats Row ─── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
            <div className="grid grid-cols-3 gap-3 mb-5">
              <Card className="border-border">
                <CardContent className="py-3 text-center">
                  <TierIcon className={`w-5 h-5 mx-auto mb-1 ${tierColors.text}`} />
                  <p className="text-lg font-bold text-foreground capitalize">{currentTier}</p>
                  <p className="text-[10px] text-muted-foreground">{xp.toLocaleString()} XP</p>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="py-3 text-center">
                  <Wallet className="w-5 h-5 mx-auto mb-1 text-[hsl(var(--warm-gold))]" />
                  <p className="text-lg font-bold text-foreground">${prepaidBalance.toFixed(2)}</p>
                  <p className="text-[10px] text-muted-foreground">Balance</p>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="py-3 text-center">
                  <Flame className={`w-5 h-5 mx-auto mb-1 ${streak.current >= 2 ? "text-orange-500" : "text-muted-foreground"}`} />
                  <p className="text-lg font-bold text-foreground">{streak.current}wk</p>
                  <p className="text-[10px] text-muted-foreground">Streak{streak.current >= 2 ? ` (${streak.multiplier}×)` : ""}</p>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* ─── Tier Progress (compact) ─── */}
          {nextTier && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className={`mb-5 border ${tierColors.border}`}>
                <CardContent className="py-3 px-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Next: {nextTier}</span>
                    <span className="text-xs text-muted-foreground">{xpInfo.needed} XP to go</span>
                  </div>
                  <Progress value={xpInfo.progress} className="h-2" />
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ─── Recent Activity ─── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
            <Card className="mb-5 border-border">
              <CardContent className="py-4">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <h3 className="font-display text-sm font-bold text-foreground tracking-wider uppercase">RECENT ACTIVITY</h3>
                </div>
                {activity.length === 0 ? (
                  <div className="text-center py-6">
                    <Zap className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No activity yet.</p>
                    <p className="text-xs text-muted-foreground mt-1">Visit a Shabu Shack to earn your first 50 XP!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {activity.slice(0, 5).map((item, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b last:border-0 border-border">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{item.action}</p>
                          <p className="text-xs text-muted-foreground">{item.location}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{item.date}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* ─── Quick Links ─── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { icon: Star, label: "Rewards", to: "/rewards" },
                { icon: User, label: "Profile", to: "/profile" },
                { icon: Tag, label: "Deals", to: "/deals" },
                { icon: MapPin, label: "Locations", to: "/locations" },
              ].map((link) => (
                <Card key={link.label} className="border-border hover:shadow-md transition-shadow">
                  <CardContent className="py-3">
                    <Link to={link.to} className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary">
                      <link.icon className="w-4 h-4 text-primary" />
                      {link.label}
                      <ChevronRight className="w-3 h-3 ml-auto text-muted-foreground" />
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;