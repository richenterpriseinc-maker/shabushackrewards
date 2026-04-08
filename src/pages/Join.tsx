import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Flame, Target, Zap, Shield, Star, Crown, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { TIER_PERKS, TIER_COLORS, type TierName } from "@/hooks/use-gamification";

const TIERS: { name: TierName; xp: string; icon: typeof Shield }[] = [
  { name: "bronze", xp: "0 XP", icon: Shield },
  { name: "silver", xp: "500 XP", icon: Star },
  { name: "gold", xp: "1,500 XP", icon: Crown },
  { name: "diamond", xp: "4,000 XP", icon: Trophy },
];

const JoinPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-mobile-nav md:pb-0">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl font-bold text-foreground mb-3 tracking-wider">SHABU SHACK REWARDS</h1>
            <p className="text-muted-foreground text-lg">Level up, complete challenges, and unlock epic perks.</p>
          </div>

          {/* Tier Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {TIERS.map((tier, i) => {
              const colors = TIER_COLORS[tier.name];
              const TierIcon = tier.icon;
              return (
                <motion.div key={tier.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                  <Card className={`border-2 ${colors.border} h-full`}>
                    <CardContent className="pt-5 pb-4 text-center">
                      <div className={`w-12 h-12 mx-auto rounded-full bg-gradient-to-br ${colors.gradient} flex items-center justify-center mb-3`}>
                        <TierIcon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-display text-sm font-bold text-foreground uppercase tracking-wider mb-1">{tier.name}</h3>
                      <p className="text-xs text-muted-foreground mb-3">{tier.xp}</p>
                      <ul className="text-left space-y-1.5">
                        {TIER_PERKS[tier.name].map((perk) => (
                          <li key={perk} className="flex items-start gap-1.5 text-[11px] text-foreground">
                            <Check className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />
                            {perk}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* How to Earn XP */}
          <div className="mb-12">
            <h2 className="font-display text-2xl font-bold text-foreground text-center mb-8 tracking-wider">HOW TO EARN XP</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { icon: Target, title: "Monthly Challenges", desc: "Complete rotating challenges each month for big XP rewards. Finish them all for a bonus!" },
                { icon: Flame, title: "Visit Streaks", desc: "Visit weekly to build your streak. 2 weeks = 1.5x, 4 weeks = 2x, 8+ weeks = 3x XP!" },
                { icon: Zap, title: "Every Visit Counts", desc: "Earn base XP with every visit. Higher tiers earn more per dollar spent." },
              ].map((step, i) => (
                <motion.div key={step.title} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.1 }}>
                  <Card className="border-border text-center h-full">
                    <CardContent className="pt-6">
                      <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                        <step.icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-display text-base font-semibold text-foreground mb-1">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">{step.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <Button size="lg" onClick={() => navigate("/login")} className="px-8">
              Start Earning — Sign Up Free
            </Button>
            <p className="text-xs text-muted-foreground mt-3">100% free. No subscription required. Level up by visiting!</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default JoinPage;
