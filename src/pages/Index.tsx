import { Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Gift, Star, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import heroImage from "@/assets/shabu-hero.jpg";
import { useAuthReady } from "@/hooks/use-auth-ready";

const benefits = [
  {
    icon: Gift,
    title: "Earn 50 XP per visit",
    description: "Reach 500 XP and unlock a free entrée — no paper cards required.",
  },
  {
    icon: Star,
    title: "Level up your tier",
    description: "Climb Bronze → Silver → Gold → Diamond for bigger perks every visit.",
  },
  {
    icon: Utensils,
    title: "Prepay & save",
    description: "Load funds for bonus credit. The more you load, the more you earn.",
  },
  {
    icon: MapPin,
    title: "4 NorCal locations",
    description: "Earn and redeem across Elk Grove, SSF, Downtown Sac, and Davis.",
  },
];

const Index = () => {
  const { user, isReady } = useAuthReady();
  if (isReady && user) return <Navigate to="/dashboard" replace />;
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
          <div className="absolute inset-0 bg-gradient-to-b md:bg-gradient-to-r from-secondary/95 via-secondary/80 to-secondary/40" />
        </div>

        <div className="relative container mx-auto px-5 py-20 md:py-40 flex flex-col items-center md:items-start text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-xl w-full"
          >
            <h1 className="font-display text-5xl md:text-7xl font-bold text-secondary-foreground mb-3 leading-[0.95] tracking-wider">
              NORCAL'S #1 <br />
              <span className="text-primary">HOTPOT</span>
            </h1>
            <p className="text-base md:text-xl text-secondary-foreground/80 mb-7 max-w-md mx-auto md:mx-0">
              Join Shabu Shack Rewards. Earn free meals, exclusive deals, and VIP perks every visit.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto sm:max-w-none">
              <Button asChild size="lg" className="text-base h-12 w-full sm:w-auto">
                <Link to="/login?mode=signup">Join for Free</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="text-base h-12 w-full sm:w-auto bg-secondary-foreground/10 border-secondary-foreground/30 text-secondary-foreground hover:bg-secondary-foreground/20"
              >
                <a href="https://www.shabushack.com" target="_blank" rel="noopener noreferrer">View Menu</a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4 max-w-lg md:max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="font-display text-2xl md:text-5xl font-bold text-foreground mb-3 tracking-wider">
              WHY JOIN SHABU SHACK REWARDS?
            </h2>
            <p className="text-muted-foreground text-sm md:text-lg">
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

      {/* Free Entrée Preview */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-lg md:max-w-5xl">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex-1 text-center md:text-left"
            >
              <h2 className="font-display text-2xl md:text-5xl font-bold text-foreground mb-3 tracking-wider">
                500 XP = FREE ENTRÉE
              </h2>
              <p className="text-muted-foreground text-sm md:text-lg mb-6">
                Earn 50 XP each visit across all 4 locations. Track your progress digitally — no paper cards.
              </p>
              <Button asChild>
                <Link to="/login">Start Earning</Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex-1 w-full max-w-sm md:max-w-md"
            >
              <Card className="bg-gradient-to-br from-primary to-secondary p-1 rounded-2xl">
                <div className="bg-background rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-display text-lg font-semibold text-foreground tracking-wider">FREE ENTRÉE</span>
                    <span className="text-sm text-muted-foreground tabular-nums">350 / 500 XP</span>
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
                    3 more visits until your <strong className="text-primary">free entrée!</strong>
                  </p>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 max-w-lg md:max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-2xl md:text-5xl font-bold mb-3 tracking-wider">
              READY TO START EARNING?
            </h2>
            <p className="text-sm md:text-lg opacity-90 mb-6 max-w-lg mx-auto">
              Join thousands of shabu lovers across NorCal and get rewarded for every visit.
            </p>
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="text-base"
            >
              <Link to="/login">Join Shabu Shack Rewards</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
