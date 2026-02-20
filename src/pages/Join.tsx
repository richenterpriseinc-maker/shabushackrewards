import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

const JoinPage = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl font-bold text-foreground mb-3">Join Shabu Shack Rewards</h1>
          <p className="text-muted-foreground text-lg">Choose a plan and start earning today.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Free Tier */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-border h-full">
              <CardHeader className="text-center">
                <CardTitle className="font-display text-2xl">Free Rewards</CardTitle>
                <p className="text-3xl font-bold text-foreground mt-2">$0 <span className="text-base font-normal text-muted-foreground">/ forever</span></p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {[
                    "Digital punch card",
                    "Free meal every 10 visits",
                    "Access to public deals",
                    "Track visits across all locations",
                  ].map((perk) => (
                    <li key={perk} className="flex items-center gap-2 text-sm text-foreground">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" /> {perk}
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant="outline">
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
                <CardTitle className="font-display text-2xl">VIP Membership</CardTitle>
                <p className="text-3xl font-bold text-foreground mt-2">$9.99 <span className="text-base font-normal text-muted-foreground">/ month</span></p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {[
                    "Everything in Free Rewards",
                    "10% off every visit",
                    "Birthday reward (free dish)",
                    "Early access to new menu items",
                    "Priority seating",
                    "Members-only flash deals",
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

        <p className="text-center text-sm text-muted-foreground mt-8">
          Sign up with your Google account for instant access. Cancel VIP anytime.
        </p>
      </div>
    </main>
    <Footer />
  </div>
);

export default JoinPage;
