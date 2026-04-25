import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Sparkles, Cake, Wallet, Crown, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface Promo {
  id: string;
  title: string;
  description: string | null;
  type: string;
  members_only: boolean;
  end_date: string | null;
  location_id: string | null;
  location_name?: string;
}

// Curated evergreen perks shown when no live DB promotions exist.
const EVERGREEN_PERKS = [
  {
    icon: Sparkles,
    title: "Earn 50 XP every visit",
    description: "Show your QR code at checkout. Reach 500 XP and we'll comp you a free entrée.",
    badge: "Always on",
  },
  {
    icon: Cake,
    title: "Birthday Spin",
    description: "It's your birthday month? Spin the wheel in-store for a guaranteed prize.",
    badge: "Birthday month",
    cta: { label: "Spin now", to: "/birthday" },
  },
  {
    icon: Crown,
    title: "VIP Multiplier",
    description: "VIP members earn 2× XP on every visit and unlock exclusive monthly perks.",
    badge: "VIP",
  },
];

const DealsPage = () => {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("promotions")
        .select("id, title, description, type, members_only, end_date, location_id, locations(name)")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (!error && data) {
        setPromos(
          data.map((p: any) => ({
            ...p,
            location_name: p.locations?.name,
          }))
        );
      }
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-background pb-mobile-nav md:pb-0">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-lg md:max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="font-display text-3xl md:text-5xl text-foreground tracking-wider">
              DEALS &amp; PERKS
            </h1>
            <p className="text-muted-foreground text-sm mt-2">
              Member benefits + live promotions across all 4 locations.
            </p>
          </motion.div>

          {/* Live promotions */}
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : promos.length > 0 ? (
            <section className="mb-10">
              <h2 className="font-display text-sm tracking-[0.2em] uppercase text-muted-foreground mb-3">
                Live now
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {promos.map((promo) => (
                  <Card key={promo.id} className="border-primary/20 hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge variant={promo.members_only ? "default" : "secondary"} className="text-[10px]">
                          {promo.members_only ? "Members Only" : promo.type}
                        </Badge>
                        {promo.end_date && (
                          <Badge variant="outline" className="text-[10px]">
                            Ends {new Date(promo.end_date).toLocaleDateString()}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="font-display text-xl tracking-wide">{promo.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {promo.description && (
                        <p className="text-sm text-muted-foreground">{promo.description}</p>
                      )}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {promo.location_name || "All locations"}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ) : null}

          {/* Evergreen perks */}
          <section>
            <h2 className="font-display text-sm tracking-[0.2em] uppercase text-muted-foreground mb-3">
              Member perks
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {EVERGREEN_PERKS.map((perk, i) => (
                <motion.div
                  key={perk.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="border-border h-full hover:border-primary/40 transition-colors">
                    <CardContent className="py-5">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <perk.icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h3 className="font-display text-lg tracking-wide leading-none">
                              {perk.title}
                            </h3>
                            <Badge variant="secondary" className="text-[10px] flex-shrink-0">
                              {perk.badge}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground leading-snug">
                            {perk.description}
                          </p>
                          {perk.cta && (
                            <Button asChild size="sm" variant="outline" className="mt-3 h-8">
                              <Link to={perk.cta.to}>{perk.cta.label}</Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <div className="mt-10 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              New here? Join free in seconds.
            </p>
            <Button asChild size="lg">
              <Link to="/login?mode=signup">Join Shabu Shack Rewards</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DealsPage;
