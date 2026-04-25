import { Link } from "react-router-dom";
import logo from "@/assets/shabu-shack-logo.png";
import { Instagram, Facebook, Mail } from "lucide-react";

const Footer = () => (
  <footer className="bg-secondary text-secondary-foreground mt-8">
    {/* Mobile: compact footer */}
    <div className="md:hidden container mx-auto px-5 py-7 max-w-lg">
      <div className="flex items-center justify-between mb-5">
        <img src={logo} alt="Shabu Shack" className="h-8" />
        <div className="flex items-center gap-2">
          <a
            href="https://www.instagram.com/shabushack/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="w-9 h-9 rounded-full bg-secondary-foreground/10 flex items-center justify-center active:bg-primary active:text-primary-foreground transition-colors"
          >
            <Instagram className="w-4 h-4" />
          </a>
          <a
            href="https://www.facebook.com/shabushack/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="w-9 h-9 rounded-full bg-secondary-foreground/10 flex items-center justify-center active:bg-primary active:text-primary-foreground transition-colors"
          >
            <Facebook className="w-4 h-4" />
          </a>
          <a
            href="mailto:info@shabushack.com"
            aria-label="Email"
            className="w-9 h-9 rounded-full bg-secondary-foreground/10 flex items-center justify-center active:bg-primary active:text-primary-foreground transition-colors"
          >
            <Mail className="w-4 h-4" />
          </a>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
        <Link to="/locations" className="opacity-70 active:opacity-100">Locations</Link>
        <Link to="/deals" className="opacity-70 active:opacity-100">Deals</Link>
        <Link to="/rewards" className="opacity-70 active:opacity-100">Rewards</Link>
        <Link to="/login?mode=signup" className="opacity-70 active:opacity-100">Join</Link>
      </div>

      <p className="text-[10px] opacity-50 mt-4">
        © {new Date().getFullYear()} Shabu Shack. All rights reserved.
      </p>
    </div>

    {/* Desktop: full footer */}
    <div className="hidden md:block container mx-auto px-4 py-10 max-w-5xl">
      <div className="grid grid-cols-4 gap-8">
        <div>
          <img src={logo} alt="Shabu Shack" className="h-10 mb-3" />
          <p className="text-xs opacity-70 leading-relaxed">
            NorCal's #1 hot pot. Premium shabu-shabu across 4 locations.
          </p>
        </div>

        <div>
          <h4 className="font-display text-sm tracking-[0.2em] mb-3 opacity-80">LOCATIONS</h4>
          <ul className="space-y-2 text-xs opacity-70">
            <li>Elk Grove</li>
            <li>South San Francisco</li>
            <li>Downtown Sacramento</li>
            <li>Davis</li>
          </ul>
          <Link
            to="/locations"
            className="inline-block mt-3 text-xs font-medium text-primary hover:opacity-80 transition-opacity"
          >
            See all →
          </Link>
        </div>

        <div>
          <h4 className="font-display text-sm tracking-[0.2em] mb-3 opacity-80">EXPLORE</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link to="/deals" className="opacity-70 hover:opacity-100 transition-opacity">
                Deals
              </Link>
            </li>
            <li>
              <Link to="/rewards" className="opacity-70 hover:opacity-100 transition-opacity">
                Rewards
              </Link>
            </li>
            <li>
              <Link to="/login?mode=signup" className="opacity-70 hover:opacity-100 transition-opacity">
                Join free
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm tracking-[0.2em] mb-3 opacity-80">CONNECT</h4>
          <div className="flex items-center gap-3">
            <a
              href="https://www.instagram.com/shabushack/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="w-9 h-9 rounded-full bg-secondary-foreground/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href="https://www.facebook.com/shabushack/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="w-9 h-9 rounded-full bg-secondary-foreground/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a
              href="mailto:info@shabushack.com"
              aria-label="Email"
              className="w-9 h-9 rounded-full bg-secondary-foreground/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <Mail className="w-4 h-4" />
            </a>
          </div>
          <a
            href="mailto:info@shabushack.com"
            className="text-xs opacity-70 hover:opacity-100 transition-opacity mt-3 inline-block"
          >
            info@shabushack.com
          </a>
        </div>
      </div>

      <div className="border-t border-secondary-foreground/15 mt-8 pt-5 text-center text-[11px] opacity-50">
        © {new Date().getFullYear()} Shabu Shack. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
