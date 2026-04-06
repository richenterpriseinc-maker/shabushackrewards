import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Flame, Trophy, Target, Zap, Wallet, QrCode, LogOut, User,
  MapPin, Tag, Cake, Utensils, ChevronRight, Star, Shield, Crown, Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { QRCodeSVG } from "qrcode.react";
import {
  useGamification, TIER_PERKS, TIER_COLORS, getNextTier,
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
    profile, xp, currentTier, nextTier, xpInfo, streak,
    challenges, completedChallenges, totalChallenges,
    prepaid, points, isLoading,
  } = useGamification();

  const [userId, setUserId] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/login");
      else setUserId(session.user.id);
    });
  }, [navigate]);

  const prepaidBalance = Number(prepaid?.balance ?? 0) + Number(prepaid?.bonus_credits ?? 0);
  const tierColors = TIER_COLORS[currentTier];
  const TierIcon = TIER_ICONS[currentTier];
  const perks = TIER_PERKS[currentTier];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-lg">

          {/* Hero: Tier + XP */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className={`mb-6 border-2 ${tierColors.border} overflow-hidden`}>
              <div className={`bg-gradient-to-r ${tierColors.gradient} p-5 text-white`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <TierIcon className="w-8 h-8" />
                    <div>
                      <p className="text-sm opacity-80">Current Tier</p>
                      <h2 className="text-2xl font-display font-bold tracking-wider uppercase">{currentTier}</h2>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold">{xp.toLocaleString()}</p>
                    <p className="text-xs opacity-80">Total XP</p>
                  </div>
                </div>
                {nextTier && (
                  <div>
                    <div className="flex justify-between text-xs mb-1 opacity-80">
                      <span>{currentTier.toUpperCase()}</span>
                      <span>{xpInfo.needed} XP to {nextTier.toUpperCase()}</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2.5">
                      <motion.div
                        className="bg-white rounded-full h-2.5"
                        initial={{ width: 0 }}
                        animate={{ width: `${xpInfo.progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                )}
                {!nextTier && (
                  <p className="text-sm opacity-80 text-center mt-1">🏆 You've reached the highest tier!</p>
                )}
              </div>
              <CardContent className="py-4">
                <p className="text-xs text-muted-foreground font-medium mb-2 uppercase tracking-wide">Your Perks</p>
                <div className="flex flex-wrap gap-2">
                  {perks.map((perk) => (
                    <Badge key={perk} variant="secondary" className="text-xs font-normal">{perk}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Streak Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card className="mb-6 border-border">
              <CardContent className="py-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Flame className={`w-10 h-10 ${streak.current >= 2 ? "text-orange-500" : "text-muted-foreground"}`} />
                      {streak.current >= 4 && (
                        <motion.div
                          className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                        >
                          <span className="text-[8px] text-white font-bold">🔥</span>
                        </motion.div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-bold text-foreground tracking-wide">
                        {streak.current > 0 ? `${streak.current}-WEEK STREAK` : "NO STREAK YET"}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {streak.current > 0
                          ? `${streak.multiplier}x XP multiplier active!`
                          : "Visit weekly to start a streak"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-foreground">{streak.multiplier}x</p>
                    <p className="text-[10px] text-muted-foreground">multiplier</p>
                  </div>
                </div>
                {/* Streak milestones */}
                <div className="mt-4 flex gap-2">
                  {[2, 4, 8].map((milestone) => (
                    <div
                      key={milestone}
                      className={`flex-1 text-center p-2 rounded-lg border text-xs ${
                        streak.current >= milestone
                          ? "border-orange-500/50 bg-orange-500/10 text-orange-600"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      <p className="font-bold">{milestone}wk</p>
                      <p>{milestone === 2 ? "1.5x" : milestone === 4 ? "2x" : "3x"}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Monthly Challenges */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="mb-6 border-border">
              <CardContent className="py-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    <h3 className="font-display text-lg font-bold text-foreground tracking-wide">MONTHLY CHALLENGES</h3>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {completedChallenges}/{totalChallenges}
                  </Badge>
                </div>

                {challenges.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No active challenges this month.</p>
                ) : (
                  <div className="space-y-4">
                    {challenges.map((challenge) => (
                      <div key={challenge.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">
                              {challenge.completed ? "✅ " : ""}{challenge.title}
                            </p>
                            <p className="text-xs text-muted-foreground">{challenge.description}</p>
                          </div>
                          <div className="flex items-center gap-1 ml-3">
                            <Zap className="w-3 h-3 text-primary" />
                            <span className="text-xs font-bold text-primary">{challenge.xp_reward} XP</span>
                          </div>
                        </div>
                        <div className="relative">
                          <Progress value={challenge.progressPercent} className="h-2" />
                          <p className="text-[10px] text-muted-foreground mt-0.5 text-right">
                            {challenge.currentValue}/{Number(challenge.goal_value)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {completedChallenges === totalChallenges && totalChallenges > 0 && (
                  <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20 text-center">
                    <p className="text-sm font-bold text-primary">🎉 All challenges completed! +500 bonus XP</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats Row */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { icon: Zap, label: "Points", value: points.toLocaleString(), color: "text-primary" },
                { icon: Wallet, label: "Balance", value: `$${prepaidBalance.toFixed(2)}`, color: "text-accent" },
                { icon: Trophy, label: "Best Streak", value: `${streak.best}wk`, color: "text-orange-500" },
              ].map((stat, i) => (
                <Card key={stat.label} className="border-border">
                  <CardContent className="py-3 text-center">
                    <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />
                    <p className="text-lg font-bold text-foreground">{stat.value}</p>
                    <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* QR Code */}
          {userId && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="mb-6 border-border">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-5 h-5 text-primary" />
                      <span className="font-display text-sm font-bold text-foreground tracking-wide">MY QR CODE</span>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setShowQR(!showQR)} className="text-xs h-7">
                      {showQR ? "Hide" : "Show"}
                    </Button>
                  </div>
                  {showQR && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-2 mt-3">
                      <div className="bg-white p-4 rounded-xl shadow-inner">
                        <QRCodeSVG value={`${window.location.origin}/staff?customer=${userId}`} size={160} bgColor="#ffffff" fgColor="#1a1a1a" level="M" />
                      </div>
                      <p className="text-[10px] text-muted-foreground">{profile?.name || "Member"}</p>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Birthday CTA */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card className="mb-6 border-warm-gold bg-warm-gold/5">
              <CardContent className="py-4 flex items-center gap-4">
                <Cake className="w-8 h-8 text-warm-gold flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-display text-base font-bold text-foreground">🎂 Birthday Spin</h3>
                  <p className="text-xs text-muted-foreground">Spin for a free prize at any location!</p>
                </div>
                <Button asChild size="sm" className="bg-warm-gold hover:bg-warm-gold/90 text-secondary">
                  <Link to="/birthday">Spin</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Links */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { icon: User, label: "Profile", to: "/profile" },
                { icon: Tag, label: "Deals", to: "/deals" },
                { icon: MapPin, label: "Locations", to: "/locations" },
                { icon: Utensils, label: "Menu", to: "/menu" },
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

          {/* Sign Out */}
          <div className="text-center">
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
