import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const categories = ["Broths", "Proteins", "Vegetables", "Sides", "Drinks"];

const menuItems = [
  { name: "Original Tonkotsu Broth", category: "Broths", price: "$4.99", description: "Rich, creamy pork bone broth simmered for 12 hours", popular: true },
  { name: "Spicy Miso Broth", category: "Broths", price: "$4.99", description: "Bold miso with chili oil and garlic", popular: true },
  { name: "Kombu Dashi (Vegan)", category: "Broths", price: "$4.99", description: "Light and umami-rich kelp broth" },
  { name: "Prime Wagyu Beef", category: "Proteins", price: "$18.99", description: "Thinly sliced A5 wagyu for the ultimate dip", popular: true },
  { name: "Kurobuta Pork Belly", category: "Proteins", price: "$12.99", description: "Premium black pork, marbled and tender" },
  { name: "Chicken Breast", category: "Proteins", price: "$8.99", description: "Thinly sliced free-range chicken" },
  { name: "Shrimp Platter", category: "Proteins", price: "$14.99", description: "Jumbo tiger shrimp, shell-on" },
  { name: "Tofu & Mushroom Set", category: "Vegetables", price: "$7.99", description: "Silken tofu, enoki, shiitake, and king oyster" },
  { name: "Seasonal Veggie Platter", category: "Vegetables", price: "$6.99", description: "Napa cabbage, corn, spinach, and more" },
  { name: "Udon Noodles", category: "Sides", price: "$3.99", description: "Thick and chewy wheat noodles" },
  { name: "Glass Noodles", category: "Sides", price: "$3.49", description: "Translucent sweet potato starch noodles" },
  { name: "Gyoza (6 pcs)", category: "Sides", price: "$5.99", description: "Pan-fried pork dumplings" },
  { name: "Matcha Latte", category: "Drinks", price: "$4.49", description: "Creamy ceremonial-grade matcha" },
  { name: "Yuzu Soda", category: "Drinks", price: "$3.49", description: "Refreshing citrus sparkling drink" },
  { name: "Japanese Beer", category: "Drinks", price: "$5.99", description: "Asahi or Sapporo draft" },
];

const MenuPage = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl font-bold text-foreground mb-3">Our Menu</h1>
          <p className="text-muted-foreground text-lg">Fresh ingredients, rich broths, endless combinations.</p>
        </div>

        <Tabs defaultValue="Broths" className="max-w-4xl mx-auto">
          <TabsList className="flex flex-wrap justify-center mb-8 bg-transparent gap-2">
            {categories.map((cat) => (
              <TabsTrigger
                key={cat}
                value={cat}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((cat) => (
            <TabsContent key={cat} value={cat}>
              <div className="grid gap-4">
                {menuItems
                  .filter((item) => item.category === cat)
                  .map((item) => (
                    <Card key={item.name} className="border-border">
                      <CardContent className="flex items-center justify-between py-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground">{item.name}</h3>
                            {item.popular && <Badge variant="secondary" className="text-xs">Popular</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                        <span className="font-display text-lg font-semibold text-primary whitespace-nowrap ml-4">
                          {item.price}
                        </span>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </main>
    <Footer />
  </div>
);

export default MenuPage;
