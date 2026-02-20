import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { to: "/menu", label: "Menu" },
    { to: "/deals", label: "Deals" },
    { to: "/locations", label: "Locations" },
    { to: "/rewards", label: "Rewards" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🍲</span>
          <span className="font-display text-xl font-bold text-foreground">Shabu Shack</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <Button asChild size="sm">
            <Link to="/join">Join Now</Link>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-background border-b border-border px-4 pb-4 space-y-3">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="block text-sm font-medium text-muted-foreground hover:text-primary"
              onClick={() => setMobileOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <Button asChild size="sm" className="w-full">
            <Link to="/join" onClick={() => setMobileOpen(false)}>Join Now</Link>
          </Button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
