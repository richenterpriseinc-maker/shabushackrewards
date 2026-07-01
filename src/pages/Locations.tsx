import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, ExternalLink, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface LocationRow {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string | null;
  perk: string | null;
  yelp_url: string | null;
  badge: string | null;
}

const displayName = (name: string) => name.replace(/^Shabu Shack\s+/i, "");

const LocationsPage = () => {
  const [locations, setLocations] = useState<LocationRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("locations")
        .select("id, name, address, city, phone, perk, yelp_url, badge")
        .eq("is_active", true)
        .order("name");
      setLocations((data as LocationRow[]) || []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background pb-mobile-nav md:pb-0">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-lg md:max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="font-display text-3xl md:text-5xl text-foreground tracking-wider">
              OUR LOCATIONS
            </h1>
            <p className="text-muted-foreground text-sm mt-2">
              {loading
                ? "Loading locations…"
                : `${locations.length} NorCal spots — earn and redeem rewards at any of them.`}
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {locations.map((loc, i) => {
                const fullAddress = `${loc.address}, ${loc.city}, CA`;
                const mapUrl = `https://maps.google.com/?q=${encodeURIComponent(fullAddress)}`;
                return (
                  <motion.div
                    key={loc.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="border-border h-full hover:border-primary/40 transition-colors overflow-hidden">
                      <CardContent className="p-5 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2 flex-1 min-w-0">
                            <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <h3 className="font-display text-xl tracking-wide leading-tight">
                                {displayName(loc.name)}
                              </h3>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {fullAddress}
                              </p>
                            </div>
                          </div>
                          {loc.badge && (
                            <Badge className="bg-primary text-primary-foreground text-[10px] flex-shrink-0">
                              {loc.badge}
                            </Badge>
                          )}
                        </div>

                        {loc.perk && (
                          <div className="flex items-center gap-2 text-xs text-warm-gold">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span className="font-medium">{loc.perk}</span>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <Button asChild variant="outline" size="sm" className="h-10">
                            <a href={mapUrl} target="_blank" rel="noopener noreferrer">
                              <MapPin className="w-4 h-4 mr-1.5" />
                              Directions
                            </a>
                          </Button>
                          {loc.phone && (
                            <Button asChild variant="outline" size="sm" className="h-10">
                              <a href={`tel:${loc.phone.replace(/\D/g, "")}`}>
                                <Phone className="w-4 h-4 mr-1.5" />
                                Call
                              </a>
                            </Button>
                          )}
                          {loc.yelp_url && (
                            <Button
                              asChild
                              variant="ghost"
                              size="sm"
                              className="h-10 col-span-2 text-xs text-muted-foreground hover:text-foreground"
                            >
                              <a href={loc.yelp_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                                View on Yelp
                              </a>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LocationsPage;
