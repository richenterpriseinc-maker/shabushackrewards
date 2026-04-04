import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Coins, Wallet } from "lucide-react";
import { motion } from "framer-motion";

const JoinPage = () => {
  const navigate = useNavigate();

  return (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl font-bold text-foreground mb-3 tracking-wider">JOIN SHABU SHACK REWARDS</h1>
          <p className="text-muted-foreground text-lg">Choose a plan and start earning today.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-16">
          {/* Free Tier */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-border h-full">
              <CardHeader className="text-center">
                <CardTitle className="font-display text-2xl tracking-wide">FREE REWARDS</CardTitle>
                <p className="text-3xl font-bold text-foreground mt-2">$0 <span className="text-base font-normal text-muted-foreground">/ forever</span></p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {[
                    "Digital punch card (10 visits = free meal)",
                    "Earn 1 point per $1 spent",
                    "Redeem points for dishes & drinks",
                    "Prepaid balance with bonus credit",
                    "Access to public deals",
                    "Track rewards across all 4 locations",
                  ].map((perk) => (
                    <li key={perk} className="flex items-center gap-2 text-sm text-foreground">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" /> {perk}
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant="outline" onClick={() => navigate("/login")}>
                  Sign Up Free
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* VIP Tier */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-primary border-2 h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-bl-lg">
                BEST VALUE
              </div>
              <CardHeader className="text-center">
                <CardTitle className="font-display text-2xl tracking-wide">VIP MEMBERSHIP</CardTitle>
                <p className="text-3xl font-bold text-foreground mt-2">$2.49 <span className="text-base font-normal text-muted-foreground">/ month</span> <span className="block text-sm text-muted-foreground mt-1">or $24.99/year (save 16%)</span></p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {[
                    "Everything in Free Rewards",
                    "15% off every visit",
                    "2x points on every dollar",
                    "Birthday reward (free dish or dessert)",
                    "Early access to new menu items",
                    "Priority seating & reservations",
                    "Members-only flash deals",
                    "Higher prepaid bonus rates",
                  ].map((perk) => (
                    <li key={perk} className="flex items-center gap-2 text-sm text-foreground">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" /> {perk}
                    </li>
                  ))}
                </ul>
                <Button className="w-full">
                  Subscribe to VIP
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* How It Works */}
        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="font-display text-2xl font-bold text-foreground text-center mb-8 tracking-wider">HOW IT WORKS</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: Coins, title: "Earn Points", desc: "Get 1 pt per $1 spent (2x for VIP). Redeem for free dishes, drinks, and more." },
              { icon: "🍲", title: "Collect Punches", desc: "Every visit = 1 punch. Hit 10 punches and your next meal is on us!" },
              { icon: Wallet, title: "Prepaid & Save", desc: "Load $50+ to get bonus credit. VIP members get even higher bonuses." },
            ].map((step, i) => (
              <motion.div key={step.title} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}>
                <Card className="border-border text-center h-full">
                  <CardContent className="pt-6">
                    <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 text-xl">
                      {typeof step.icon === "string" ? step.icon : <step.icon className="w-6 h-6 text-primary" />}
                    </div>
                    <h3 className="font-display text-base font-semibold text-foreground mb-1">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Sign up with your Google account for instant access. Cancel VIP anytime.
        </p>
      </div>
    </main>
    <Footer />
  </div>
);

export default JoinPage;
