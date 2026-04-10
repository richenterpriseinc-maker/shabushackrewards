import { Link } from "react-router-dom";
import logo from "@/assets/shabu-shack-logo.png";

const Footer = () => (
  <footer className="bg-secondary text-secondary-foreground py-12">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <img src={logo} alt="Shabu Shack" className="h-12 mb-4" />
          <p className="text-sm opacity-80">
            NorCal's #1 HotPot. Premium shabu-shabu dining across 4 locations.
          </p>
        </div>
        <div>
          <h4 className="font-display text-lg font-semibold mb-3 tracking-wider">LOCATIONS</h4>
          <div className="space-y-1 text-sm opacity-80">
            <Link to="/locations" className="block hover:opacity-100 transition-opacity py-1.5 min-h-[44px] flex items-center">Elk Grove</Link>
            <Link to="/locations" className="block hover:opacity-100 transition-opacity py-1.5 min-h-[44px] flex items-center">South San Francisco</Link>
            <Link to="/locations" className="block hover:opacity-100 transition-opacity py-1.5 min-h-[44px] flex items-center">Downtown Sacramento</Link>
            <Link to="/locations" className="block hover:opacity-100 transition-opacity py-1.5 min-h-[44px] flex items-center">Davis</Link>
          </div>
        </div>
        <div>
          <h4 className="font-display text-lg font-semibold mb-3 tracking-wider">EXPLORE</h4>
          <div className="space-y-1 text-sm opacity-80">
            <Link to="/deals" className="block hover:opacity-100 transition-opacity py-1.5 min-h-[44px] flex items-center">Deals</Link>
            <Link to="/rewards" className="block hover:opacity-100 transition-opacity py-1.5 min-h-[44px] flex items-center">Rewards</Link>
            <Link to="/join" className="block hover:opacity-100 transition-opacity py-1.5 min-h-[44px] flex items-center">Join Now</Link>
          </div>
        </div>
        <div>
          <h4 className="font-display text-lg font-semibold mb-3 tracking-wider">CONNECT</h4>
          <div className="space-y-1 text-sm opacity-80">
            <a href="https://www.instagram.com/shabushack/" target="_blank" rel="noopener noreferrer" className="block hover:opacity-100 transition-opacity py-1.5 min-h-[44px] flex items-center">Instagram</a>
            <a href="https://www.facebook.com/shabushack/" target="_blank" rel="noopener noreferrer" className="block hover:opacity-100 transition-opacity py-1.5 min-h-[44px] flex items-center">Facebook</a>
            <a href="https://www.yelp.com/biz/shabu-shack" target="_blank" rel="noopener noreferrer" className="block hover:opacity-100 transition-opacity py-1.5 min-h-[44px] flex items-center">Yelp</a>
            <a href="mailto:info@shabushack.com" className="block hover:opacity-100 transition-opacity py-1.5 min-h-[44px] flex items-center">info@shabushack.com</a>
          </div>
        </div>
      </div>
      <div className="border-t border-secondary-foreground/20 mt-8 pt-6 text-center text-sm opacity-60">
        <p>© 2026 Shabu Shack. All rights reserved.</p>
        <Link to="/staff" className="inline-block mt-2 text-[10px] opacity-30 hover:opacity-60 transition-opacity">
          Staff Portal
        </Link>
      </div>
    </div>
  </footer>
);

export default Footer;
