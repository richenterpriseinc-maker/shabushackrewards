import { Link, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuthReady } from "@/hooks/use-auth-ready";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/shabu-shack-logo.png";
import NotificationBell from "@/components/NotificationBell";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isReady } = useAuthReady();
  const navigate = useNavigate();

  const links = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/deals", label: "Deals" },
    { to: "/locations", label: "Locations" },
    { to: "/rewards", label: "Rewards" },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setMobileOpen(false);
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-secondary/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-14 md:h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Shabu Shack" className="h-9 md:h-10" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm font-medium text-secondary-foreground/70 hover:text-primary transition-colors tracking-wide uppercase"
            >
              {l.label}
            </Link>
          ))}
          {isReady && user ? (
            <div className="flex items-center gap-3">
              <NotificationBell />
              <Button asChild size="sm" variant="outline">
                <Link to="/profile" className="gap-2">
                  <User className="w-4 h-4" />
                  Profile
                </Link>
              </Button>
              <Button size="sm" variant="ghost" onClick={handleSignOut} className="gap-2 text-muted-foreground">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild size="sm" variant="outline">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/login?mode=signup">Join Now</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile: context-aware button + hamburger */}
        <div className="flex md:hidden items-center gap-2">
          {isReady && !user && (
            <div className="flex items-center gap-1.5">
              <Button asChild size="sm" variant="outline" className="h-9 px-3 text-xs">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild size="sm" className="h-9 px-3 text-xs">
                <Link to="/login?mode=signup">Join</Link>
              </Button>
            </div>
          )}
          {isReady && user && (
            <NotificationBell />
          )}
          <button
            className="text-secondary-foreground p-2 -mr-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-secondary border-b border-border px-4 pb-4 space-y-1 animate-in slide-in-from-top-2 duration-200">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="flex items-center text-sm font-medium text-secondary-foreground/70 hover:text-primary uppercase tracking-wide min-h-[44px] px-2"
              onClick={() => setMobileOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          {isReady && user && (
            <>
              <Link
                to="/profile"
                className="flex items-center gap-2 text-sm font-medium text-secondary-foreground/70 hover:text-primary uppercase tracking-wide min-h-[44px] px-2"
                onClick={() => setMobileOpen(false)}
              >
                <User className="w-4 h-4" /> Profile
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 text-sm font-medium text-destructive/80 hover:text-destructive uppercase tracking-wide min-h-[44px] px-2 w-full text-left"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
