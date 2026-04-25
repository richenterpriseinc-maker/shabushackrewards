import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, ExternalLink, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const locations = [
  {
    name: "Elk Grove",
    address: "7419 Laguna Blvd #220, Elk Grove, CA 95624",
    phone: "(916) 585-5714",
    perk: "10% off every visit",
    mapUrl: "https://maps.google.com/?q=7419+Laguna+Blvd+%23220+Elk+Grove+CA+95624",
    yelpUrl: "https://www.yelp.com/search?find_desc=Shabu+Shack&find_loc=7419+Laguna+Blvd+Elk+Grove+CA+95624",
  },
  {
    name: "South San Francisco",
    address: "200 Grand Ave, South San Francisco, CA 94080",
    phone: "(650) 379-8043",
    perk: "Happy Hour daily",
    mapUrl: "https://maps.google.com/?q=200+Grand+Ave+South+San+Francisco+CA+94080",
    yelpUrl: "https://www.yelp.com/search?find_desc=Shabu+Shack&find_loc=200+Grand+Ave+South+San+Francisco+CA+94080",
  },
  {
    name: "Downtown Sacramento",
    address: "606 L Street, Sacramento, CA 95814",
    phone: "(916) 822-4146",
    perk: "VIP Room & Patio",
    mapUrl: "https://maps.google.com/?q=606+L+Street+Sacramento+CA+95814",
    yelpUrl: "https://www.yelp.com/search?find_desc=Shabu+Shack&find_loc=606+L+Street+Sacramento+CA+95814",
    badge: "Now Open",
  },
  {
    name: "Davis",
    address: "500 1st Street Suite 15, Davis, CA 95616",
    phone: "(530) 298-1678",
    perk: "College night specials",
    mapUrl: "https://maps.google.com/?q=500+1st+Street+Suite+15+Davis+CA+95616",
    yelpUrl: "https://www.yelp.com/search?find_desc=Shabu+Shack&find_loc=500+1st+Street+Suite+15+Davis+CA+95616",
  },
];

const LocationsPage = () => (
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
            4 NorCal spots — earn and redeem rewards at any of them.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {locations.map((loc, i) => (
            <motion.div
              key={loc.name}
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
                          {loc.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{loc.address}</p>
                      </div>
                    </div>
                    {loc.badge && (
                      <Badge className="bg-primary text-primary-foreground text-[10px] flex-shrink-0">
                        {loc.badge}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-warm-gold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span className="font-medium">{loc.perk}</span>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button asChild variant="outline" size="sm" className="flex-1 h-9">
                      <a href={loc.mapUrl} target="_blank" rel="noopener noreferrer">
                        <MapPin className="w-3.5 h-3.5 mr-1.5" />
                        Directions
                      </a>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="flex-1 h-9">
                      <a href={`tel:${loc.phone.replace(/\D/g, "")}`}>
                        <Phone className="w-3.5 h-3.5 mr-1.5" />
                        Call
                      </a>
                    </Button>
                    <Button asChild variant="ghost" size="sm" className="h-9 px-3">
                      <a href={loc.yelpUrl} target="_blank" rel="noopener noreferrer" aria-label="View on Yelp">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default LocationsPage;
