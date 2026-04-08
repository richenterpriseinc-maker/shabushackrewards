import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
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
} from "lucide-react";
import { motion } from "framer-motion";
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
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-lg">

          {/* Welcome Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <h1 className="text-2xl font-display font-bold text-foreground tracking-wide">
              Welcome back, {profile?.name || "Member"}!
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Here's your rewards snapshot</p>
          </motion.div>

          {/* Stats Row */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <div className="grid grid-cols-3 gap-3 mb-6">
              <Card className="border-border">
                <CardContent className="py-3 text-center">
                  <Utensils className="w-5 h-5 mx-auto mb-1 text-primary" />
                  <p className="text-lg font-bold text-foreground">{currentPoints}/10</p>
                  <p className="text-[10px] text-muted-foreground">Points</p>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="py-3 text-center">
                  <Wallet className="w-5 h-5 mx-auto mb-1 text-accent" />
                  <p className="text-lg font-bold text-foreground">${prepaidBalance.toFixed(2)}</p>
                  <p className="text-[10px] text-muted-foreground">Balance</p>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="py-3 text-center">
                  <Flame className={`w-5 h-5 mx-auto mb-1 ${streak.current >= 2 ? "text-orange-500" : "text-muted-foreground"}`} />
                  <p className="text-lg font-bold text-foreground">{streak.current}wk</p>
                  <p className="text-[10px] text-muted-foreground">Streak</p>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Tier Card — compact */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
            <Card className={`mb-6 border-2 ${tierColors.border} overflow-hidden`}>
              <div className={`bg-gradient-to-r ${tierColors.gradient} p-4 text-white`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TierIcon className="w-6 h-6" />
                    <div>
                      <h2 className="text-lg font-display font-bold tracking-wider uppercase">{currentTier}</h2>
                      <p className="text-xs opacity-80">{xp.toLocaleString()} XP</p>
                    </div>
                  </div>
                  {nextTier && (
                    <div className="text-right text-xs opacity-80">
                      <p>{xpInfo.needed} XP to {nextTier}</p>
                    </div>
                  )}
                </div>
                {nextTier && (
                  <div className="w-full bg-white/20 rounded-full h-2 mt-3">
                    <motion.div
                      className="bg-white rounded-full h-2"
                      initial={{ width: 0 }}
                      animate={{ width: `${xpInfo.progress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Free Entrée Progress */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="mb-6 border-primary/20">
              <CardContent className="py-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Utensils className="w-5 h-5 text-primary" />
                    <h3 className="font-display text-base font-bold text-foreground tracking-wide">FREE ENTRÉE</h3>
                  </div>
                  {freeEntrees > 0 && (
                    <Badge variant="secondary" className="text-xs">{freeEntrees} earned</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Progress value={(currentPoints / 10) * 100} className="h-3 flex-1" />
                  <span className="text-sm font-bold text-foreground">{currentPoints}/10</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {currentPoints === 0
                    ? "Earn 10 points to get a free entrée!"
                    : currentPoints >= 9
                      ? "🔥 One more point for your free entrée!"
                      : `${10 - currentPoints} more point${10 - currentPoints === 1 ? "" : "s"} to go!`}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* QR Code — compact */}
          {userId && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
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
                        <QRCodeSVG value={`shabu:${userId}`} size={140} bgColor="#ffffff" fgColor="#1a1a1a" level="M" />
                      </div>
                      <p className="text-[10px] text-muted-foreground">Show this to staff when you visit</p>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Recent Activity */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="mb-6 border-border">
              <CardContent className="py-4">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <h3 className="font-display text-base font-bold text-foreground tracking-wide">RECENT ACTIVITY</h3>
                </div>
                {activity.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No activity yet. Visit a location to get started!</p>
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

          {/* Quick Links */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
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
