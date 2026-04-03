import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Gift, Crown, MapPin, Tag, Coins, Wallet, History, TrendingUp, Utensils, Cake, Loader2, QrCode } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useRewardsData } from "@/hooks/use-rewards-data";
import { supabase } from "@/integrations/supabase/client";
import { QRCodeSVG } from "qrcode.react";

const RewardsPage = () => {
  const navigate = useNavigate();
  const { profile, punchCard, prepaid, points, activity, isLoading, isAuthenticated } = useRewardsData();
  const [userId, setUserId] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/login");
      else setUserId(session.user.id);
    });
  }, [navigate]);

  const punches = punchCard?.punches_count ?? 0;
  const completedCards = punchCard?.completed_cards ?? 0;
  const total = 10;
  const prepaidBalance = Number(prepaid?.balance ?? 0) + Number(prepaid?.bonus_credits ?? 0);
  const tier = profile?.membership_tier === "vip" ? "VIP" : "Free";

  const redeemableRewards = [
    { name: "Free Drink", cost: 200 },
    { name: "Appetizer", cost: 500 },
    { name: "Side Dish", cost: 750 },
    { name: "Free Meal", cost: 1500 },
  ];

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
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl font-bold text-foreground mb-3 tracking-wider">YOUR REWARDS</h1>
            <p className="text-muted-foreground text-lg">
              {profile?.name ? `Welcome back, ${profile.name}!` : "Track points, punches, and perks — all in one place."}
            </p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: Coins, label: "Points", value: points.toLocaleString(), color: "text-primary" },
              { icon: Gift, label: "Punches", value: `${punches}/${total}`, color: "text-primary" },
              { icon: Wallet, label: "Balance", value: `$${prepaidBalance.toFixed(2)}`, color: "text-accent" },
              { icon: Crown, label: "Tier", value: tier, color: "text-accent" },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="border-border">
                  <CardContent className="py-4 text-center">
                    <stat.icon className={`w-6 h-6 mx-auto mb-1 ${stat.color}`} />
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Punch Card */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="mb-8 bg-gradient-to-br from-primary to-secondary p-1 rounded-2xl">
              <div className="bg-background rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-display text-lg font-semibold text-foreground tracking-wide">PUNCH CARD</span>
                  <span className="text-sm text-muted-foreground">
                    {punches} / {total} {completedCards > 0 && `(${completedCards} completed)`}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-3 mb-4">
                  {Array.from({ length: total }).map((_, i) => (
                    <div
                      key={i}
                      className={`aspect-square rounded-full flex items-center justify-center text-lg border-2 ${
                        i < punches
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      {i < punches ? "🍲" : i + 1}
                    </div>
                  ))}
                </div>
                <Progress value={(punches / total) * 100} className="mb-2" />
                <p className="text-center text-sm text-muted-foreground">
                  {punches >= total
                    ? <strong className="text-primary">You've earned a free meal! 🎉</strong>
                    : <>{total - punches} more visits until your <strong className="text-primary">free meal!</strong></>
                  }
                </p>
              </div>
            </Card>
          </motion.div>

          {/* Points Redemption + Prepaid Balance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="h-full border-border">
                <CardContent className="py-5">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <h3 className="font-display text-lg font-semibold text-foreground tracking-wide">REDEEM POINTS</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    You have <strong className="text-foreground">{points.toLocaleString()} pts</strong>. Earn {tier === "VIP" ? "2" : "1"} pt per $1 spent.
                  </p>
                  <div className="space-y-2">
                    {redeemableRewards.map((r) => (
                      <div key={r.name} className="flex items-center justify-between p-2 rounded-lg border border-border">
                        <span className="text-sm text-foreground">{r.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{r.cost} pts</span>
                          <Button size="sm" variant={points >= r.cost ? "default" : "outline"} disabled={points < r.cost} className="text-xs h-7">
                            Redeem
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
              <Card className="h-full border-border">
                <CardContent className="py-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Wallet className="w-5 h-5 text-accent" />
                    <h3 className="font-display text-lg font-semibold text-foreground tracking-wide">PREPAID BALANCE</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Current balance: <strong className="text-foreground text-lg">${prepaidBalance.toFixed(2)}</strong>
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Load funds and get bonus credit. The more you load, the more you save!
                  </p>
                  <div className="space-y-2">
                    {[
                      { load: 50, bonus: 5 },
                      { load: 100, bonus: 20 },
                      { load: 200, bonus: 40 },
                      { load: 500, bonus: 100 },
                    ].map((t) => (
                      <div key={t.load} className="flex items-center justify-between p-2 rounded-lg border border-border">
                        <div>
                          <span className="text-sm text-foreground font-medium">${t.load}</span>
                          <span className="text-xs text-primary ml-2">+${t.bonus} bonus</span>
                        </div>
                        <Button size="sm" variant="outline" className="text-xs h-7">
                          Load
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* VIP Upsell */}
          {tier === "Free" && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card className="mb-8 border-accent bg-accent/5">
                <CardContent className="py-6 flex flex-col sm:flex-row items-center gap-4">
                  <Crown className="w-10 h-10 text-accent" />
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="font-display text-xl font-semibold text-foreground mb-1">Upgrade to VIP — $2.49/mo or $24.99/yr</h3>
                    <p className="text-sm text-muted-foreground">
                      15% off every visit, birthday reward, early menu access, priority seating, and 2x points.
                    </p>
                  </div>
                  <Button asChild>
                    <Link to="/join">Upgrade</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Reward History */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
            <Card className="mb-8 border-border">
              <CardContent className="py-5">
                <div className="flex items-center gap-2 mb-4">
                  <History className="w-5 h-5 text-primary" />
                  <h3 className="font-display text-lg font-semibold text-foreground tracking-wide">RECENT ACTIVITY</h3>
                </div>
                {activity.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No activity yet. Visit a Shabu Shack to start earning rewards!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {activity.map((entry, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div className="flex items-center gap-3">
                          <Badge variant={entry.type === "redeem" ? "default" : "secondary"} className="text-xs">
                            {entry.type === "earn" ? "Points" : entry.type === "redeem" ? "Redeemed" : entry.type === "spin" ? "Birthday" : "Other"}
                          </Badge>
                          <span className="text-sm text-foreground">{entry.action}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">{entry.location}</p>
                          <p className="text-xs text-muted-foreground">{entry.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Birthday Wheel CTA */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card className="mb-8 border-warm-gold bg-warm-gold/5">
              <CardContent className="py-6 flex flex-col sm:flex-row items-center gap-4">
                <Cake className="w-10 h-10 text-warm-gold" />
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-display text-xl font-semibold text-foreground mb-1">🎂 Birthday? Spin the Wheel!</h3>
                  <p className="text-sm text-muted-foreground">
                    Visit any Shabu Shack on your birthday and spin for a free prize — in-store only!
                  </p>
                </div>
                <Button asChild className="bg-warm-gold hover:bg-warm-gold/90 text-secondary">
                  <Link to="/birthday">Spin Now</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-border hover:shadow-md transition-shadow">
              <CardContent className="py-5 flex items-center gap-3">
                <Tag className="w-6 h-6 text-primary" />
                <Link to="/deals" className="text-sm font-medium text-foreground hover:text-primary">View Deals</Link>
              </CardContent>
            </Card>
            <Card className="border-border hover:shadow-md transition-shadow">
              <CardContent className="py-5 flex items-center gap-3">
                <MapPin className="w-6 h-6 text-primary" />
                <Link to="/locations" className="text-sm font-medium text-foreground hover:text-primary">Find a Location</Link>
              </CardContent>
            </Card>
            <Card className="border-border hover:shadow-md transition-shadow">
              <CardContent className="py-5 flex items-center gap-3">
                <Utensils className="w-6 h-6 text-primary" />
                <Link to="/menu" className="text-sm font-medium text-foreground hover:text-primary">Browse Menu</Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RewardsPage;
