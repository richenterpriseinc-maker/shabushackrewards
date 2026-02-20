import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Gift, Crown, MapPin, Tag } from "lucide-react";
import { Link } from "react-router-dom";

const RewardsPage = () => {
  // Mock data — will be dynamic with backend
  const punches = 7;
  const total = 10;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl font-bold text-foreground mb-3">Your Rewards</h1>
            <p className="text-muted-foreground text-lg">Track punches, earn meals, enjoy perks.</p>
          </div>

          {/* Punch Card */}
          <Card className="mb-8 bg-gradient-to-br from-primary to-secondary p-1 rounded-2xl">
            <div className="bg-background rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-display text-lg font-semibold text-foreground">Punch Card</span>
                <span className="text-sm text-muted-foreground">{punches} / {total}</span>
              </div>
              <div className="grid grid-cols-5 gap-3 mb-4">
                {Array.from({ length: total }).map((_, i) => (
                  <div
                    key={i}
                    className={`aspect-square rounded-full flex items-center justify-center text-lg border-2 ${
                      i < punches
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    {i < punches ? "🍲" : i + 1}
                  </div>
                ))}
              </div>
              <Progress value={(punches / total) * 100} className="mb-2" />
              <p className="text-center text-sm text-muted-foreground">
                {total - punches} more visits until your <strong className="text-primary">free meal!</strong>
              </p>
            </div>
          </Card>

          {/* VIP Upsell */}
          <Card className="mb-8 border-accent">
            <CardContent className="py-6 flex flex-col sm:flex-row items-center gap-4">
              <Crown className="w-10 h-10 text-accent" />
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-display text-xl font-semibold text-foreground mb-1">Upgrade to VIP</h3>
                <p className="text-sm text-muted-foreground">
                  Get discounts on every visit, a birthday reward, early menu access, and priority seating.
                </p>
              </div>
              <Button asChild>
                <Link to="/join">Learn More</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-border hover:shadow-md transition-shadow">
              <CardContent className="py-5 flex items-center gap-3">
                <Tag className="w-6 h-6 text-primary" />
                <Link to="/deals" className="text-sm font-medium text-foreground hover:text-primary">View Deals</Link>
              </CardContent>
            </Card>
            <Card className="border-border hover:shadow-md transition-shadow">
              <CardContent className="py-5 flex items-center gap-3">
                <MapPin className="w-6 h-6 text-primary" />
                <Link to="/locations" className="text-sm font-medium text-foreground hover:text-primary">Find a Location</Link>
              </CardContent>
            </Card>
            <Card className="border-border hover:shadow-md transition-shadow">
              <CardContent className="py-5 flex items-center gap-3">
                <Gift className="w-6 h-6 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">Reward History (coming soon)</span>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RewardsPage;
