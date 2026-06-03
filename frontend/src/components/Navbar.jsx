import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* ── Desktop: Centered Pill ── */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-clavier-nav/90 backdrop-blur-sm border border-clavier-border rounded-full py-3 px-10">
        <div className="flex items-center gap-12">
          <Link to="/" className="font-playfair text-base text-clavier-cream hover:text-clavier-orange transition-colors duration-200">
            Home
          </Link>
          <Link to="/products" className="font-playfair text-base text-clavier-muted hover:text-clavier-cream transition-colors duration-200">
            Products
          </Link>
          <Link to="/login" className="font-playfair text-base text-clavier-muted hover:text-clavier-cream transition-colors duration-200">
            LogIn
          </Link>
          <Link to="/signup" className="font-playfair text-base text-clavier-muted hover:text-clavier-cream transition-colors duration-200">
            SignUp
          </Link>
        </div>
      </nav>

      {/* ─ Mobile: Hamburger ── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-6 right-6 z-50 lg:hidden text-clavier-muted hover:text-clavier-cream transition-colors duration-200"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* ─ Mobile Nav Overlay ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] bg-clavier-bg flex flex-col">
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute top-6 right-6 text-clavier-dim hover:text-clavier-cream transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex-1 flex flex-col items-center justify-center gap-8">
            <Link to="/" onClick={() => setMobileOpen(false)} className="font-cormorant text-[36px] text-clavier-cream hover:text-clavier-orange transition-colors">
              Home
            </Link>
            <Link to="/products" onClick={() => setMobileOpen(false)} className="font-cormorant text-[36px] text-clavier-cream hover:text-clavier-orange transition-colors">
              Products
            </Link>
            <div className="w-16 h-px bg-clavier-border my-2" />
            <Link to="/login" onClick={() => setMobileOpen(false)} className="font-inter text-lg text-clavier-muted hover:text-clavier-cream transition-colors">
              LogIn
            </Link>
            <Link to="/signup" onClick={() => setMobileOpen(false)} className="font-inter text-lg text-clavier-muted hover:text-clavier-cream transition-colors">
              SignUp
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
