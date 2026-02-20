import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tag, Zap, MapPin } from "lucide-react";

const deals = [
  {
    title: "Taco Tuesday Special",
    description: "15% off all protein platters every Tuesday.",
    location: "Downtown",
    type: "Weekly",
    membersOnly: false,
  },
  {
    title: "Happy Hour Brews",
    description: "$3 Japanese beers Mon–Fri, 3pm to 6pm.",
    location: "Midtown",
    type: "Daily",
    membersOnly: false,
  },
  {
    title: "Flash Deal: Free Gyoza",
    description: "Get a free plate of gyoza with any combo order. This week only!",
    location: "All Locations",
    type: "Limited",
    membersOnly: true,
  },
  {
    title: "VIP Birthday Reward",
    description: "Free premium dessert during your birthday month. VIP members only.",
    location: "All Locations",
    type: "Ongoing",
    membersOnly: true,
  },
  {
    title: "Family Night",
    description: "Kids eat free every Thursday with a paying adult.",
    location: "Eastgate",
    type: "Weekly",
    membersOnly: false,
  },
  {
    title: "Weekend Wagyu Special",
    description: "20% off Wagyu platters on Fri & Sat evenings. VIP exclusive.",
    location: "Westside",
    type: "Weekly",
    membersOnly: true,
  },
];

const DealsPage = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl font-bold text-foreground mb-3">Deals & Promotions</h1>
          <p className="text-muted-foreground text-lg">Exclusive offers to make every visit even better.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {deals.map((deal) => (
            <Card key={deal.title} className="border-border hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={deal.membersOnly ? "default" : "secondary"} className="text-xs">
                    {deal.membersOnly ? "Members Only" : deal.type}
                  </Badge>
                </div>
                <CardTitle className="font-display text-xl">{deal.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{deal.description}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" /> {deal.location}
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

export default DealsPage;
