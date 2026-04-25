import { Link, useLocation } from "react-router-dom";
import { Home, Tag, Gift, MapPin, User, LayoutDashboard } from "lucide-react";
import { useAuthReady } from "@/hooks/use-auth-ready";

const MobileBottomNav = () => {
  const { pathname } = useLocation();
  const { user } = useAuthReady();

  const navItems = user
    ? [
        { to: "/dashboard", icon: LayoutDashboard, label: "Home" },
        { to: "/rewards", icon: Gift, label: "Rewards" },
        { to: "/deals", icon: Tag, label: "Deals" },
        { to: "/locations", icon: MapPin, label: "Locations" },
        { to: "/profile", icon: User, label: "Profile" },
      ]
    : [
        { to: "/", icon: Home, label: "Home" },
        { to: "/deals", icon: Tag, label: "Deals" },
        { to: "/locations", icon: MapPin, label: "Locations" },
        { to: "/login", icon: Gift, label: "Join" },
      ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-secondary/95 backdrop-blur-md border-t border-border safe-bottom shadow-[0_-2px_10px_rgba(0,0,0,0.06)]">
      <div className="flex items-stretch justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.to || (item.to !== "/" && pathname.startsWith(item.to));
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center gap-0.5 py-3 px-3 min-h-[60px] flex-1 transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-secondary-foreground/60 active:text-primary"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
