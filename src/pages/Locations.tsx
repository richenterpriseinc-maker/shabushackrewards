import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

const locations = [
  {
    name: "Elk Grove",
    address: "7419 Laguna Blvd #220, Elk Grove, CA 95624",
    hours: "Check store for hours",
    phone: "(916) 585-5714",
    deal: "Loyalty members: 10% off first visit",
    mapUrl: "https://maps.google.com/?q=7419+Laguna+Blvd+%23220+Elk+Grove+CA+95624",
  },
  {
    name: "South San Francisco",
    address: "200 Grand Ave, South San Francisco, CA 94080",
    hours: "Check store for hours",
    phone: "(650) 379-8043",
    deal: "Happy Hour specials daily",
    mapUrl: "https://maps.google.com/?q=200+Grand+Ave+South+San+Francisco+CA+94080",
  },
  {
    name: "Downtown Sacramento",
    address: "606 L Street, Sacramento, CA 95814",
    hours: "Check store for hours",
    phone: "(916) 822-4146",
    deal: "VIP Room & Patio available",
    mapUrl: "https://maps.google.com/?q=606+L+Street+Sacramento+CA+95814",
    badge: "NOW OPEN!",
  },
  {
    name: "Davis",
    address: "500 1st Street Suite 15, Davis, CA 95616",
    hours: "Check store for hours",
    phone: "(530) 298-1678",
    deal: "College night specials",
    mapUrl: "https://maps.google.com/?q=500+1st+Street+Suite+15+Davis+CA+95616",
  },
];

const LocationsPage = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3 tracking-wider">OUR LOCATIONS</h1>
          <p className="text-muted-foreground text-lg">4 NorCal spots serving up warmth and flavor.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {locations.map((loc) => (
            <Card key={loc.name} className="border-border">
              <CardHeader>
                <CardTitle className="font-display text-2xl flex items-center gap-2 tracking-wider">
                  <MapPin className="w-5 h-5 text-primary" />
                  {loc.name}
                  {loc.badge && <Badge className="bg-primary text-primary-foreground text-xs">{loc.badge}</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{loc.address}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" /> {loc.hours}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <a href={`tel:${loc.phone}`} className="hover:text-primary transition-colors">{loc.phone}</a>
                </div>
                <Badge variant="secondary" className="text-xs">{loc.deal}</Badge>
                <div className="pt-2">
                  <Button asChild variant="outline" size="sm">
                    <a href={loc.mapUrl} target="_blank" rel="noopener noreferrer">
                      Get Directions
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default LocationsPage;
