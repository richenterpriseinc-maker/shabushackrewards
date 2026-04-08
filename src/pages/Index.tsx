import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Gift, Star, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import heroImage from "@/assets/shabu-hero.jpg";

const benefits = [
  {
    icon: Gift,
    title: "Earn Points",
    description: "Get 1 point per visit. Collect 10 points and earn a free entrée!",
  },
  {
    icon: Star,
    title: "Level Up",
    description: "Rise through Bronze, Silver, Gold, and Diamond tiers for bigger perks.",
  },
  {
    icon: Utensils,
    title: "Prepaid & Save",
    description: "Load funds for bonus credit. The more you load, the more you earn.",
  },
  {
    icon: MapPin,
    title: "4 NorCal Locations",
    description: "Earn and redeem across Elk Grove, SSF, Downtown Sac, and Davis.",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background pb-mobile-nav md:pb-0">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-14 md:pt-16 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Shabu Shack premium hot pot with fresh sliced beef"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/95 via-secondary/75 to-secondary/40" />
        </div>

        <div className="relative container mx-auto px-4 py-16 md:py-40">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-xl"
          >
            <h1 className="font-display text-4xl md:text-7xl font-bold text-secondary-foreground mb-3 leading-none tracking-wider">
              NORCAL'S #1 <br />
              <span className="text-primary">HOTPOT</span>
            </h1>
            <p className="text-base md:text-xl text-secondary-foreground/80 mb-6">
              Join Shabu Shack Rewards and earn free meals, exclusive deals, and VIP perks every time you dine with us.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="text-base">
                <Link to="/login">Join for Free</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="text-base bg-secondary-foreground/10 border-secondary-foreground/30 text-secondary-foreground hover:bg-secondary-foreground/20"
              >
                <a href="https://www.shabushack.com" target="_blank" rel="noopener noreferrer">View Menu</a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4 tracking-wider">
              WHY JOIN SHABU SHACK REWARDS?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Every visit brings you closer to something delicious.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full border-border bg-background hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6 text-center">
                    <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <b.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="font-display text-xl font-semibold mb-2 text-foreground tracking-wide">{b.title}</h3>
                    <p className="text-muted-foreground text-sm">{b.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Points Preview */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex-1"
            >
              <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4 tracking-wider">
                10 POINTS = FREE ENTRÉE
              </h2>
              <p className="text-muted-foreground text-lg mb-6">
                No paper cards needed. Track your points digitally across all 4 locations. Every 10th point earns you a free entrée!
              </p>
              <Button asChild>
                <Link to="/login">Start Earning</Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex-1 w-full max-w-md"
            >
              <Card className="bg-gradient-to-br from-primary to-secondary p-1 rounded-2xl">
                <div className="bg-background rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-display text-lg font-semibold text-foreground tracking-wider">YOUR POINTS</span>
                    <span className="text-sm text-muted-foreground">7 / 10</span>
                  </div>
                  <div className="grid grid-cols-5 gap-3 mb-4">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div
                        key={i}
                        className={`aspect-square rounded-full flex items-center justify-center text-lg border-2 ${
                          i < 7
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-border text-muted-foreground"
                        }`}
                      >
                        {i < 7 ? <Star className="w-5 h-5 fill-current" /> : i + 1}
                      </div>
                    ))}
                  </div>
                  <p className="text-center text-sm text-muted-foreground">
                    3 more points until your <strong className="text-primary">free entrée!</strong>
                  </p>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4 tracking-wider">
              READY TO START EARNING?
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-lg mx-auto">
              Join thousands of shabu lovers across NorCal and get rewarded for every visit.
            </p>
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="text-base"
            >
              <Link to="/join">Join Shabu Shack Rewards</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
