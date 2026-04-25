import { useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Flame, Trophy, Target, Zap, LogOut, Cake, Utensils, Star,
  Shield, Crown, Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import {
  useGamification, TIER_PERKS, TIER_COLORS,
  type TierName,
} from "@/hooks/use-gamification";

const TIER_ICONS: Record<TierName, typeof Shield> = {
  bronze: Shield,
  silver: Star,
  gold: Crown,
  diamond: Trophy,
};

const RewardsPage = () => {
  const navigate = useNavigate();
  const {
    xp, currentTier, nextTier, xpInfo, streak,
    challenges, completedChallenges, totalChallenges,
    punchCard, isLoading,
  } = useGamification();

  const tierColors = TIER_COLORS[currentTier];
  const TierIcon = TIER_ICONS[currentTier];
  const perks = TIER_PERKS[currentTier];
  const currentPoints = punchCard?.punches_count ?? 0;
  const freeEntrees = punchCard?.completed_cards ?? 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-mobile-nav md:pb-0">
        <Navbar />
        <main className="pt-24 pb-16 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-mobile-nav md:pb-0">
      <Navbar />
      <main className="pt-20 pb-10">
        <div className="container mx-auto px-4 max-w-lg">

          {/* Tier Hero */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Card className={`mb-5 border-2 ${tierColors.border} overflow-hidden`}>
              <div className={`bg-gradient-to-r ${tierColors.gradient} p-5 text-white`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <TierIcon className="w-8 h-8" />
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.2em] opacity-75">Current tier</p>
                      <h2 className="text-2xl font-display font-bold tracking-wider uppercase leading-none">{currentTier}</h2>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold tabular-nums leading-none">{xp.toLocaleString()}</p>
                    <p className="text-[11px] opacity-80 mt-0.5">Total XP</p>
                  </div>
                </div>
                {nextTier ? (
                  <div>
                    <div className="flex justify-between text-[11px] mb-1.5 opacity-90">
                      <span className="uppercase tracking-wide">{currentTier}</span>
                      <span className="tabular-nums">{xpInfo.needed} XP to {nextTier.toUpperCase()}</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <motion.div
                        className="bg-white rounded-full h-2"
                        initial={{ width: 0 }}
                        animate={{ width: `${xpInfo.progress}%` }}
                        transition={{ duration: 0.9, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-sm opacity-90 text-center">🏆 You've reached the highest tier!</p>
                )}
              </div>
              <CardContent className="py-4">
                <p className="text-[10px] text-muted-foreground font-semibold mb-2 uppercase tracking-[0.2em]">
                  Your perks
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {perks.map((perk) => (
                    <Badge key={perk} variant="secondary" className="text-[11px] font-normal">
                      {perk}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Free Entrée Tracker */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card className="mb-5 border-primary/20">
              <CardContent className="py-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Utensils className="w-5 h-5 text-primary" />
                    <h3 className="font-display text-lg tracking-wide">FREE ENTRÉE</h3>
                  </div>
                  {freeEntrees > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {freeEntrees} earned
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  {currentPoints === 0
                    ? "Earn 500 XP across visits to unlock a free entrée."
                    : currentPoints >= 9
                      ? "🔥 One more visit unlocks your free entrée!"
                      : `${(10 - currentPoints) * 50} more XP to go.`}
                </p>
                <div className="grid grid-cols-5 gap-2">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div
                      key={i}
                      className={`aspect-square rounded-lg border-2 flex items-center justify-center transition-colors ${
                        i < currentPoints
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-border bg-muted/30 text-muted-foreground/30"
                      }`}
                    >
                      {i < currentPoints ? (
                        <Star className="w-4 h-4 fill-current" />
                      ) : i === 9 ? (
                        <Utensils className="w-4 h-4" />
                      ) : (
                        <span className="text-xs font-bold">{i + 1}</span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Streak */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="mb-5 border-border">
              <CardContent className="py-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Flame
                        className={`w-9 h-9 ${
                          streak.current >= 2 ? "text-orange-500" : "text-muted-foreground"
                        }`}
                      />
                      {streak.current >= 4 && (
                        <motion.div
                          className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-orange-500 rounded-full"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                        />
                      )}
                    </div>
                    <div>
                      <h3 className="font-display text-base tracking-wide leading-tight">
                        {streak.current > 0 ? `${streak.current}-WEEK STREAK` : "START A STREAK"}
                      </h3>
                      <p className="text-[11px] text-muted-foreground">
                        {streak.current > 0
                          ? `${streak.multiplier}× XP multiplier active`
                          : "Visit weekly to multiply your XP"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold tabular-nums leading-none">{streak.multiplier}×</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Best: {streak.best}wk</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {[
                    { weeks: 2, mult: "1.5×" },
                    { weeks: 4, mult: "2×" },
                    { weeks: 8, mult: "3×" },
                  ].map(({ weeks, mult }) => (
                    <div
                      key={weeks}
                      className={`text-center py-2 rounded-lg border text-xs ${
                        streak.current >= weeks
                          ? "border-orange-500/50 bg-orange-500/10 text-orange-600"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      <p className="font-bold">{weeks}wk</p>
                      <p>{mult}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Monthly Challenges */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="mb-5 border-border">
              <CardContent className="py-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    <h3 className="font-display text-base tracking-wide">MONTHLY CHALLENGES</h3>
                  </div>
                  <Badge variant="outline" className="text-xs tabular-nums">
                    {completedChallenges}/{totalChallenges}
                  </Badge>
                </div>

                {challenges.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No active challenges this month.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {challenges.map((challenge) => (
                      <div key={challenge.id} className="space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">
                              {challenge.completed ? "✅ " : ""}
                              {challenge.title}
                            </p>
                            {challenge.description && (
                              <p className="text-xs text-muted-foreground">{challenge.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Zap className="w-3 h-3 text-primary" />
                            <span className="text-xs font-bold text-primary">+{challenge.xp_reward}</span>
                          </div>
                        </div>
                        <Progress value={challenge.progressPercent} className="h-2" />
                        <p className="text-[10px] text-muted-foreground text-right tabular-nums">
                          {challenge.currentValue}/{Number(challenge.goal_value)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {completedChallenges === totalChallenges && totalChallenges > 0 && (
                  <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20 text-center">
                    <p className="text-sm font-bold text-primary">
                      🎉 All challenges done — +500 bonus XP!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Birthday CTA */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="mb-5 border-warm-gold/40 bg-warm-gold/5">
              <CardContent className="py-4 flex items-center gap-3">
                <Cake className="w-7 h-7 text-warm-gold flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-base tracking-wide leading-tight">Birthday Spin</h3>
                  <p className="text-xs text-muted-foreground">Free prize on your birthday — in-store only.</p>
                </div>
                <Button
                  asChild
                  size="sm"
                  className="bg-warm-gold hover:bg-warm-gold/90 text-secondary"
                >
                  <Link to="/birthday">Spin</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Sign Out */}
          <div className="text-center pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground text-xs"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate("/login");
              }}
            >
              <LogOut className="w-3 h-3 mr-1" /> Sign Out
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RewardsPage;
