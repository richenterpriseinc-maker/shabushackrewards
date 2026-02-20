import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-warm-brown text-primary-foreground py-12">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🍲</span>
            <span className="font-display text-xl font-bold">Shabu Shack</span>
          </div>
          <p className="text-sm opacity-80">
            Premium shabu-shabu dining across 4 locations. Dip, swirl, enjoy.
          </p>
        </div>
        <div>
          <h4 className="font-display text-lg font-semibold mb-3">Explore</h4>
          <div className="space-y-2 text-sm opacity-80">
            <Link to="/menu" className="block hover:opacity-100 transition-opacity">Menu</Link>
            <Link to="/deals" className="block hover:opacity-100 transition-opacity">Deals</Link>
            <Link to="/locations" className="block hover:opacity-100 transition-opacity">Locations</Link>
          </div>
        </div>
        <div>
          <h4 className="font-display text-lg font-semibold mb-3">Membership</h4>
          <div className="space-y-2 text-sm opacity-80">
            <Link to="/rewards" className="block hover:opacity-100 transition-opacity">Rewards</Link>
            <Link to="/join" className="block hover:opacity-100 transition-opacity">Join Now</Link>
          </div>
        </div>
        <div>
          <h4 className="font-display text-lg font-semibold mb-3">Connect</h4>
          <div className="space-y-2 text-sm opacity-80">
            <a href="#" className="block hover:opacity-100 transition-opacity">Instagram</a>
            <a href="#" className="block hover:opacity-100 transition-opacity">Facebook</a>
            <a href="#" className="block hover:opacity-100 transition-opacity">Contact Us</a>
          </div>
        </div>
      </div>
      <div className="border-t border-primary-foreground/20 mt-8 pt-6 text-center text-sm opacity-60">
        © 2026 Shabu Shack. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
