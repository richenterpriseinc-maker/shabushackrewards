import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

const locations = [
  {
    name: "Downtown",
    address: "123 Main St, Downtown",
    hours: "11am – 10pm daily",
    phone: "(555) 100-0001",
    deal: "Taco Tuesday: 15% off all proteins",
    mapUrl: "https://maps.google.com/?q=123+Main+St+Downtown",
  },
  {
    name: "Midtown",
    address: "456 Center Ave, Midtown",
    hours: "11am – 10pm daily",
    phone: "(555) 100-0002",
    deal: "Happy Hour: $3 beers M–F 3–6pm",
    mapUrl: "https://maps.google.com/?q=456+Center+Ave+Midtown",
  },
  {
    name: "Westside",
    address: "789 West Blvd, Westside",
    hours: "11am – 11pm Fri–Sat, 11am – 10pm otherwise",
    phone: "(555) 100-0003",
    deal: "Weekend Special: Free dessert with VIP",
    mapUrl: "https://maps.google.com/?q=789+West+Blvd+Westside",
  },
  {
    name: "Eastgate",
    address: "321 East Rd, Eastgate",
    hours: "11:30am – 9:30pm daily",
    phone: "(555) 100-0004",
    deal: "Family Night Thu: Kids eat free",
    mapUrl: "https://maps.google.com/?q=321+East+Rd+Eastgate",
  },
];

const LocationsPage = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl font-bold text-foreground mb-3">Our Locations</h1>
          <p className="text-muted-foreground text-lg">4 spots serving up warmth and flavor.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {locations.map((loc) => (
            <Card key={loc.name} className="border-border">
              <CardHeader>
                <CardTitle className="font-display text-2xl flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  {loc.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{loc.address}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" /> {loc.hours}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" /> {loc.phone}
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
