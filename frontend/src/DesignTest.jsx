import { useState, useEffect, useRef } from 'react';
import {
  ShoppingCart, Search, User, X, Heart, Eye, ChevronDown, ChevronLeft,
  ChevronRight, Check, Package, Truck, RotateCcw, Star, Lock,
  MapPin, CreditCard, Mail, Phone, Globe, Shield, AlertCircle,
  Info, Settings, FileText, LogOut, ChevronUp
} from 'lucide-react';

/* ──────────────────────────────────────────────────────
   CLAVIER DESIGN TEST — All components showcase page
   ────────────────────────────────────────────────────── */

export default function DesignTest() {
  const [cartOpen, setCartOpen] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [openAccordions, setOpenAccordions] = useState({ description: true });
  const [activeFilters, setActiveFilters] = useState(['65%', 'Hotswap']);
  const [cartQty, setCartQty] = useState(3);
  const [pdpQty, setPdpQty] = useState(1);
  const [selectedSwitch, setSelectedSwitch] = useState('Linear');
  const [selectedColor, setSelectedColor] = useState('#1A1A1A');
  const [checkoutStep, setCheckoutStep] = useState(2);
  const [activeSection, setActiveSection] = useState('all');

  const addToast = (type, title, body) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, title, body }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const sections = [
    { key: 'all', label: 'All' },
    { key: 'colors', label: 'Colors' },
    { key: 'typography', label: 'Typography' },
    { key: 'buttons', label: 'Buttons' },
    { key: 'inputs', label: 'Inputs' },
    { key: 'nav', label: 'Navigation' },
    { key: 'cards', label: 'Cards' },
    { key: 'pdp', label: 'Product Detail' },
    { key: 'cart', label: 'Cart' },
    { key: 'checkout', label: 'Checkout' },
    { key: 'account', label: 'Account' },
    { key: 'reviews', label: 'Reviews' },
    { key: 'misc', label: 'Misc' },
  ];

  const show = activeSection === 'all';
  const is = (k) => show || activeSection === k;

  return (
    <div className="min-h-screen bg-clavier-bg text-clavier-cream">

      {/* ═══════ TEST PAGE HEADER ═══════ */}
      <div className="sticky top-0 z-[60] bg-clavier-bg/95 backdrop-blur-sm border-b border-clavier-border py-4 px-6">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-cormorant italic text-2xl text-clavier-cream">Clavier</span>
          <span className="text-clavier-dim font-inter text-xs tracking-widest uppercase">Design System Test</span>
          <div className="flex gap-2 ml-auto flex-wrap">
            {sections.map(s => (
              <button
                key={s.key}
                onClick={() => setActiveSection(s.key)}
                className={`font-inter text-[11px] tracking-wider uppercase px-3 py-1.5 border transition-colors ${
                  activeSection === s.key
                    ? 'border-clavier-red text-clavier-cream bg-clavier-bg-3'
                    : 'border-clavier-border text-clavier-muted hover:text-clavier-cream hover:border-clavier-border-b'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-8 py-24 space-y-32">

        {/* ═══════════════════════════════════════════
           1. COLOR PALETTE
           ═══════════════════════════════════════════ */}
        {is('colors') && (
          <section>
            <SectionHeading pre="PALETTE" heading="Colors">
              The complete design system color tokens — backgrounds, accents, text, and borders.
            </SectionHeading>

            <div className="mt-12 space-y-8">
              {/* Backgrounds */}
              <div>
                <h3 className="font-inter text-xs tracking-widest text-clavier-muted uppercase mb-4">Backgrounds</h3>
                <div className="flex gap-4 flex-wrap">
                  {[
                    { name: 'bg-primary', hex: '#080808' },
                    { name: 'bg-secondary', hex: '#111111' },
                    { name: 'bg-elevated', hex: '#1A1A1A' },
                    { name: 'bg-nav', hex: '#161616' },
                    { name: 'bg-input', hex: '#0F0F0F' },
                  ].map(c => (
                    <ColorSwatch key={c.name} name={c.name} hex={c.hex} />
                  ))}
                </div>
              </div>

              {/* Accents */}
              <div>
                <h3 className="font-inter text-xs tracking-widest text-clavier-muted uppercase mb-4">Accents</h3>
                <div className="flex gap-4 flex-wrap">
                  {[
                    { name: 'accent-primary', hex: '#C0392B' },
                    { name: 'accent-warm', hex: '#D4621A' },
                    { name: 'accent-dim', hex: '#8B2500' },
                    { name: 'accent-success', hex: '#2E7D5E' },
                    { name: 'accent-warning', hex: '#B07D2A' },
                  ].map(c => (
                    <ColorSwatch key={c.name} name={c.name} hex={c.hex} />
                  ))}
                </div>
              </div>

              {/* Text */}
              <div>
                <h3 className="font-inter text-xs tracking-widest text-clavier-muted uppercase mb-4">Text</h3>
                <div className="flex gap-4 flex-wrap">
                  {[
                    { name: 'text-primary', hex: '#F5F0EB' },
                    { name: 'text-secondary', hex: '#A89F97' },
                    { name: 'text-muted', hex: '#5C5650' },
                    { name: 'text-inverse', hex: '#0A0A0A' },
                  ].map(c => (
                    <ColorSwatch key={c.name} name={c.name} hex={c.hex} />
                  ))}
                </div>
              </div>

              {/* Borders */}
              <div>
                <h3 className="font-inter text-xs tracking-widest text-clavier-muted uppercase mb-4">Borders</h3>
                <div className="flex gap-4 flex-wrap">
                  {[
                    { name: 'border', hex: '#2A2520' },
                    { name: 'border-bright', hex: '#3D3530' },
                  ].map(c => (
                    <ColorSwatch key={c.name} name={c.name} hex={c.hex} />
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════
           2. TYPOGRAPHY
           ═══════════════════════════════════════════ */}
        {is('typography') && (
          <section>
            <SectionHeading pre="TYPE" heading="Typography">
              Three-font system: Cormorant Garamond for display, Playfair Display for editorial, Inter for all UI.
            </SectionHeading>

            <div className="mt-12 space-y-10">
              {/* Cormorant Garamond */}
              <div className="space-y-4">
                <h3 className="font-inter text-xs tracking-widest text-clavier-muted uppercase">Cormorant Garamond — Display</h3>
                <p className="font-cormorant italic text-[80px] leading-none text-clavier-cream">Clavier</p>
                <p className="font-cormorant italic text-5xl leading-tight text-clavier-cream">Elegance in every keystroke</p>
                <p className="font-cormorant text-4xl font-semibold text-clavier-cream">The Collection — ₹12,499</p>
              </div>

              {/* Playfair Display */}
              <div className="space-y-4">
                <h3 className="font-inter text-xs tracking-widest text-clavier-muted uppercase">Playfair Display — Editorial Body</h3>
                <p className="font-playfair text-xl leading-relaxed text-clavier-muted">
                  Crafted for those who appreciate the subtle art of <span className="font-playfair italic text-clavier-orange underline decoration-clavier-orange/60">precision</span> in every keystroke.
                </p>
                <p className="font-playfair text-lg text-clavier-muted leading-7 max-w-lg">
                  Each keyboard is assembled with care, featuring premium switches and keycaps designed for both performance and aesthetic beauty.
                </p>
              </div>

              {/* Inter */}
              <div className="space-y-4">
                <h3 className="font-inter text-xs tracking-widest text-clavier-muted uppercase">Inter — UI / Commerce</h3>
                <p className="font-inter text-sm text-clavier-cream">Navigation, buttons, labels, filters, cart, checkout — all functional text.</p>
                <p className="font-inter text-xs tracking-widest text-clavier-dim uppercase">TRACKING WIDEST — LABELS & BADGES</p>
                <div className="flex gap-6">
                  <span className="font-inter text-xs text-clavier-muted">14px body text for UI labels</span>
                  <span className="font-inter text-[11px] text-clavier-dim">11px meta text for dates</span>
                </div>
              </div>

              {/* Key typography examples */}
              <div className="space-y-4">
                <h3 className="font-inter text-xs tracking-widest text-clavier-muted uppercase">Key Combinations</h3>
                <p className="font-cormorant italic text-3xl text-clavier-cream">
                  Clavier 65% — <span className="font-cormorant text-2xl">₹8,999</span>
                </p>
                <p className="font-inter text-xs tracking-widest text-clavier-red-d uppercase">
                  — KEYBOARD COLLECTION
                </p>
                <p className="font-playfair text-lg text-clavier-cream">
                  <span className="font-playfair italic text-clavier-orange underline decoration-clavier-orange/60">Crafted</span> for perfection
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════
           3. BUTTONS
           ═══════════════════════════════════════════ */}
        {is('buttons') && (
          <section>
            <SectionHeading pre="INTERACTIONS" heading="Buttons">
              Bracketed CTAs for non-primary actions, filled red for commerce, ghost for secondary.
            </SectionHeading>

            <div className="mt-12 space-y-10">
              {/* Bracketed */}
              <div className="space-y-4">
                <h3 className="font-inter text-xs tracking-widest text-clavier-muted uppercase">Bracketed CTA (§5.3)</h3>
                <div className="flex gap-8 items-center flex-wrap">
                  <BracketedButton text="View Products" />
                  <BracketedButton text="Explore Collection" />
                  <BracketedButton text="Track Order" />
                  <BracketedButton text="Write a Review" size="sm" />
                </div>
              </div>

              {/* Filled */}
              <div className="space-y-4">
                <h3 className="font-inter text-xs tracking-widest text-clavier-muted uppercase">Filled Commerce Button (§5.4)</h3>
                <div className="flex gap-6 items-center flex-wrap">
                  <FilledButton text="Add to Cart" />
                  <FilledButton text="Proceed to Checkout" />
                  <FilledButton text="Processing" loading />
                  <button className="font-inter text-sm font-medium tracking-[0.06em] uppercase text-clavier-dim bg-clavier-border py-3 px-8 rounded-sm cursor-not-allowed">
                    Disabled
                  </button>
                </div>
              </div>

              {/* Ghost */}
              <div className="space-y-4">
                <h3 className="font-inter text-xs tracking-widest text-clavier-muted uppercase">Ghost / Secondary (§5.5)</h3>
                <div className="flex gap-6 items-center flex-wrap">
                  <GhostButton text="Continue Shopping" />
                  <GhostButton text="Save for Later" />
                  <GhostButton text="← Back to Shop" />
                </div>
              </div>

              {/* Focus state demo */}
              <div className="space-y-4">
                <h3 className="font-inter text-xs tracking-widest text-clavier-muted uppercase">Focus Ring Demo</h3>
                <FilledButton text="Click then Tab to see focus ring" />
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════
           4. INPUT FIELDS
           ═══════════════════════════════════════════ */}
        {is('inputs') && (
          <section>
            <SectionHeading pre="FORMS" heading="Inputs">
              All form inputs — commerce forms use Inter exclusively, square edges, warm borders.
            </SectionHeading>

            <div className="mt-12 max-w-xl space-y-6">
              <InputField label="Full Name" placeholder="Enter your name" />
              <InputField label="Email Address" type="email" placeholder="you@example.com" />
              <InputField label="Shipping Address" placeholder="123 Key Street, Switch City" />
              <InputField label="Password" type="password" placeholder="••••••••" />

              {/* Error state */}
              <div>
                <label className="font-inter text-[11px] text-clavier-muted tracking-wide uppercase mb-2 block">Email Address</label>
                <input
                  type="email"
                  defaultValue="invalid-email"
                  className="w-full bg-clavier-input border border-clavier-red py-3 px-4 font-inter text-sm text-clavier-cream rounded-sm focus:outline-none"
                />
                <p className="font-inter text-xs text-clavier-red mt-1">Please enter a valid email address</p>
              </div>

              {/* Select */}
              <div>
                <label className="font-inter text-[11px] text-clavier-muted tracking-wide uppercase mb-2 block">Switch Type</label>
                <div className="relative">
                  <select className="w-full bg-clavier-input border border-clavier-border py-3 px-4 pr-10 font-inter text-sm text-clavier-cream rounded-sm appearance-none focus:outline-none focus:border-clavier-orange focus:shadow-[0_0_0_2px_rgba(212,98,26,0.15)]">
                    <option>Linear — Red Switch</option>
                    <option>Tactile — Brown Switch</option>
                    <option>Clicky — Blue Switch</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-clavier-dim pointer-events-none" />
                </div>
              </div>

              {/* Checkbox */}
              <div className="flex items-center gap-3">
                <input type="checkbox" id="demo-check" className="w-4 h-4 accent-clavier-red bg-clavier-input border-clavier-border rounded-sm" />
                <label htmlFor="demo-check" className="font-inter text-sm text-clavier-muted">Remember me</label>
              </div>

              {/* Radio */}
              <div className="space-y-2">
                {['Standard Shipping', 'Express Shipping', 'Next Day'].map((opt, i) => (
                  <label key={opt} className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="shipping" defaultChecked={i === 0} className="w-4 h-4 accent-clavier-red" />
                    <span className="font-inter text-sm text-clavier-muted">{opt}</span>
                  </label>
                ))}
              </div>

              {/* Textarea */}
              <div>
                <label className="font-inter text-[11px] text-clavier-muted tracking-wide uppercase mb-2 block">Review Text</label>
                <textarea
                  rows={4}
                  placeholder="Share your experience..."
                  className="w-full bg-clavier-input border border-clavier-border py-3 px-4 font-inter text-sm text-clavier-cream rounded-sm placeholder:text-clavier-dim focus:outline-none focus:border-clavier-orange focus:shadow-[0_0_0_2px_rgba(212,98,26,0.15)] resize-none"
                />
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════
           5. NAVIGATION BAR
           ═══════════════════════════════════════════ */}
        {is('nav') && (
          <section>
            <SectionHeading pre="STRUCTURE" heading="Navigation">
              Floating pill nav with cart badge, search, and auth — desktop and mobile variants.
            </SectionHeading>

            {/* Desktop Nav */}
            <div className="mt-12 flex justify-center relative h-48">
              <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-clavier-nav/90 backdrop-blur-sm border border-clavier-border py-3 px-8 rounded-full max-w-[720px]">
                <div className="flex items-center gap-8">
                  {/* Brand */}
                  <span className="font-cormorant italic text-lg text-clavier-cream cursor-pointer">Clavier</span>

                  {/* Center Links */}
                  <div className="flex items-center gap-6">
                    {['Home', 'Shop', 'Switches', 'Accessories', 'About'].map((link, i) => (
                      <span
                        key={link}
                        className={`font-inter text-sm cursor-pointer transition-colors ${
                          i === 1 ? 'text-clavier-cream font-medium' : 'text-clavier-muted hover:text-clavier-cream'
                        }`}
                      >
                        {link}
                      </span>
                    ))}
                  </div>

                  {/* Right section */}
                  <div className="flex items-center gap-5 ml-4">
                    <button onClick={() => setSearchOpen(true)} className="text-clavier-muted hover:text-clavier-cream transition-colors">
                      <Search className="w-[18px] h-[18px]" />
                    </button>

                    <button onClick={() => setCartOpen(true)} className="relative text-clavier-muted hover:text-clavier-cream transition-colors">
                      <ShoppingCart className="w-[18px] h-[18px]" />
                      <span className="absolute -top-2 -right-2 w-4 h-4 bg-clavier-red rounded-sm font-inter text-[10px] font-semibold text-clavier-cream flex items-center justify-center">
                        {cartQty}
                      </span>
                    </button>

                    {/* Avatar */}
                    <div className="w-7 h-7 bg-clavier-bg-3 border border-clavier-border rounded-full flex items-center justify-center">
                      <span className="font-inter text-[10px] text-clavier-cream font-medium">DP</span>
                    </div>
                  </div>
                </div>
              </nav>
            </div>

            {/* Mobile Nav Trigger */}
            <div className="mt-16 text-center">
              <h3 className="font-inter text-xs tracking-widest text-clavier-muted uppercase mb-4">Mobile Nav Overlay</h3>
              <button
                onClick={() => setMobileNavOpen(true)}
                className="border border-clavier-border px-4 py-3 text-clavier-muted hover:text-clavier-cream hover:border-clavier-border-b transition-colors"
              >
                Open Mobile Nav (Hamburger)
              </button>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════
           6. PRODUCT CARDS
           ═══════════════════════════════════════════ */}
        {is('cards') && (
          <section>
            <SectionHeading pre="LISTING" heading="Product Cards">
              Grid-ready product cards with badges, wishlist, rating, pricing, and quick actions.
            </SectionHeading>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Card 1 — New, In Stock */}
              <ProductCard
                name="Clavier 65% Pro"
                category="65% KEYBOARD"
                variant="Hotswap · 3 colors · Gasket mount"
                price="₹8,999"
                rating={4.8}
                reviews={142}
                badge="NEW"
                image="hero"
              />

              {/* Card 2 — Low Stock */}
              <ProductCard
                name="Clavier TKL Elite"
                category="TKL KEYBOARD"
                variant="Soldered · 2 colors · Aluminum"
                price="₹12,499"
                originalPrice="₹14,999"
                discount="-15%"
                rating={4.6}
                reviews={89}
                badge="LOW STOCK"
                badgeVariant="warning"
                image="hero"
              />

              {/* Card 3 — Sold Out */}
              <ProductCard
                name="Clavier 75% Wireless"
                category="75% KEYBOARD"
                variant="Wireless · RGB · POM plate"
                price="₹10,999"
                rating={4.9}
                reviews={203}
                badge="SOLD OUT"
                badgeVariant="out"
                image="hero"
                soldOut
              />
            </div>

            {/* Filter Pills */}
            <div className="mt-12">
              <h3 className="font-inter text-xs tracking-widest text-clavier-muted uppercase mb-4">Active Filter Pills (§5.13)</h3>
              <div className="flex gap-2 flex-wrap">
                {activeFilters.map(f => (
                  <FilterPill key={f} text={f} onRemove={() => setActiveFilters(prev => prev.filter(x => x !== f))} />
                ))}
                <FilterPill text="Tactile" />
                <FilterPill text="RGB" active />
                <FilterPill text="Wireless" />
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════
           7. PRODUCT DETAIL PAGE (PDP)
           ═══════════════════════════════════════════ */}
        {is('pdp') && (
          <section>
            <SectionHeading pre="DETAIL" heading="Product Detail">
              2-column split: image gallery left, info panel right with variants, add to cart, and accordion specs.
            </SectionHeading>

            {/* Breadcrumb */}
            <div className="mt-12 flex items-center gap-2 text-clavier-dim font-inter text-[11px]">
              <span>Shop</span>
              <span className="text-clavier-border-b">/</span>
              <span>Keyboards</span>
              <span className="text-clavier-border-b">/</span>
              <span className="text-clavier-muted">Clavier 65%</span>
            </div>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-[55%_45%] gap-0">
              {/* Image Gallery */}
              <div className="space-y-4">
                <div className="bg-[#0D0D0D] aspect-square flex items-center justify-center border border-clavier-border">
                  <img src="/assets/hero-CLDdwZDr.png" alt="Product" className="max-h-[80%] object-contain" />
                </div>
                <div className="flex gap-2">
                  {[0, 1, 2, 3].map(i => (
                    <div
                      key={i}
                      className={`w-[72px] h-[72px] bg-[#0D0D0D] border cursor-pointer flex items-center justify-center ${
                        i === 0 ? 'border-clavier-red' : 'border-clavier-border hover:border-clavier-border-b'
                      }`}
                    >
                      <img src="/assets/hero-CLDdwZDr.png" alt="" className="max-h-[80%] max-w-[80%] object-contain" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Info Panel */}
              <div className="pl-0 lg:pl-10 space-y-6">
                <span className="font-inter text-[11px] text-clavier-red tracking-widest uppercase">65% KEYBOARD</span>
                <h1 className="font-cormorant italic text-[44px] leading-[1.1] text-clavier-cream">Clavier 65% Pro</h1>

                {/* Rating */}
                <div className="flex items-center gap-3">
                  <Stars rating={4.8} size={14} />
                  <span className="font-inter text-sm text-clavier-muted">(142 reviews)</span>
                  <span className="font-inter text-sm text-clavier-red cursor-pointer hover:underline">Write a Review</span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-4">
                  <span className="font-cormorant text-[32px] text-clavier-cream">₹8,999</span>
                  <span className="font-cormorant text-[22px] text-clavier-dim line-through">₹10,599</span>
                  <span className="font-inter text-[11px] text-clavier-success bg-clavier-success/15 px-2 py-1">SAVE 15%</span>
                </div>

                {/* Stock */}
                <p className="font-inter text-sm text-clavier-success">✦ In Stock — Ships in 48hrs</p>

                <div className="border-t border-clavier-border my-6" />

                {/* Variant: Switch Type */}
                <div>
                  <label className="font-inter text-[11px] text-clavier-muted tracking-wide uppercase mb-3 block">Switch Type</label>
                  <TogglePills
                    options={['Linear', 'Tactile', 'Clicky', 'Silent']}
                    selected={selectedSwitch}
                    onChange={setSelectedSwitch}
                    disabled={['Silent']}
                  />
                </div>

                {/* Variant: Color */}
                <div>
                  <label className="font-inter text-[11px] text-clavier-muted tracking-wide uppercase mb-3 block">Case Color</label>
                  <ColorSwatchSelector
                    colors={['#1A1A1A', '#F5F0EB', '#C0392B', '#2E7D5E', '#D4621A']}
                    selected={selectedColor}
                    onChange={setSelectedColor}
                  />
                </div>

                {/* Quantity */}
                <div>
                  <label className="font-inter text-[11px] text-clavier-muted tracking-wide uppercase mb-3 block">Quantity</label>
                  <QuantityStepper value={pdpQty} onChange={setPdpQty} />
                </div>

                {/* Commerce Actions */}
                <button className="w-full font-inter text-sm font-medium tracking-[0.06em] uppercase text-clavier-cream bg-clavier-red py-4 rounded-sm hover:bg-clavier-red-d transition-colors duration-200 focus:outline-[2px] focus:outline-clavier-orange focus:outline-offset-[3px]">
                  Add to Cart
                </button>
                <GhostButton text="Buy Now" fullWidth />

                {/* Wishlist */}
                <div className="flex items-center gap-2 cursor-pointer group">
                  <Heart className="w-4 h-4 text-clavier-muted group-hover:text-clavier-cream transition-colors" />
                  <span className="font-inter text-sm text-clavier-muted group-hover:text-clavier-cream transition-colors">Save to wishlist</span>
                </div>

                {/* Trust Badges */}
                <div className="flex gap-8 pt-6 border-t border-clavier-border">
                  {[
                    { icon: Truck, label: 'Free Shipping' },
                    { icon: Shield, label: '1yr Warranty' },
                    { icon: RotateCcw, label: '30-day Returns' },
                  ].map(b => (
                    <div key={b.label} className="flex flex-col items-center gap-2">
                      <b.icon className="w-5 h-5 text-clavier-red" />
                      <span className="font-inter text-[10px] text-clavier-dim uppercase tracking-wider">{b.label}</span>
                    </div>
                  ))}
                </div>

                {/* Accordion */}
                <div className="mt-8 space-y-0">
                  {['Description', 'Specifications', 'In the Box', 'Shipping & Returns'].map(section => {
                    const key = section.toLowerCase().replace(/ & /g, '-').replace(' ', '');
                    const isOpen = openAccordions[key];
                    return (
                      <div key={key} className="border-b border-clavier-border">
                        <button
                          onClick={() => setOpenAccordions(prev => ({ ...prev, [key]: !prev[key] }))}
                          className="w-full flex items-center justify-between py-4 font-inter text-sm text-clavier-muted hover:text-clavier-cream transition-colors"
                        >
                          {section}
                          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isOpen && (
                          <div className="pt-3 pb-5 font-playfair text-sm text-clavier-muted leading-7">
                            {key === 'description' && (
                              <p>The Clavier 65% Pro is our flagship compact keyboard, featuring a gasket-mounted plate for a premium typing experience. Hot-swappable switches let you customize your feel without soldering.</p>
                            )}
                            {key === 'specifications' && (
                              <table className="w-full font-inter text-sm">
                                <tbody>
                                  {[
                                    ['Layout', '65% (68 keys)'],
                                    ['Mount', 'Gasket'],
                                    ['Switch', 'Hot-swap 3/5 pin'],
                                    ['Connection', 'USB-C / Bluetooth 5.0'],
                                    ['Battery', '4000mAh'],
                                    ['Weight', '820g'],
                                  ].map(([k, v]) => (
                                    <tr key={k} className="odd:bg-clavier-bg/50">
                                      <td className="py-2 text-clavier-muted pr-4">{k}</td>
                                      <td className="py-2 text-clavier-cream">{v}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                            {key === 'in-the-box' && (
                              <ul className="font-inter text-sm text-clavier-muted space-y-1">
                                <li>• Clavier 65% Pro Keyboard</li>
                                <li>• USB-C to USB-A Cable (1.8m)</li>
                                <li>• Switch Puller & Keycap Puller</li>
                                <li>• Extra Switches (3pcs)</li>
                                <li>• User Manual & Warranty Card</li>
                              </ul>
                            )}
                            {key === 'shipping-returns' && (
                              <p className="font-inter text-sm text-clavier-muted">Free shipping on orders over ₹8,000. 30-day hassle-free returns. 1-year manufacturer warranty on all defects.</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════
           8. RATING & REVIEWS
           ═══════════════════════════════════════════ */}
        {is('reviews') && (
          <section>
            <SectionHeading pre="SOCIAL PROOF" heading="Reviews">
              Rating summary with bar chart, individual review cards, and verified purchase badges.
            </SectionHeading>

            <div className="mt-12">
              {/* Header */}
              <div className="flex items-end justify-between flex-wrap gap-4">
                <div>
                  <h3 className="font-cormorant text-3xl text-clavier-cream">Reviews</h3>
                  <p className="font-playfair text-base text-clavier-muted">4.8 out of 5</p>
                </div>
                <BracketedButton text="Write a Review" size="sm" />
              </div>

              {/* Rating Summary */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Big Score */}
                <div className="flex flex-col items-center justify-center">
                  <span className="font-cormorant text-[64px] leading-none text-clavier-cream">4.8</span>
                  <Stars rating={5} size={20} className="mt-2" />
                  <span className="font-inter text-sm text-clavier-dim mt-2">Based on 142 reviews</span>
                </div>

                {/* Bar Chart */}
                <div className="md:col-span-2 space-y-3">
                  {[
                    { stars: 5, pct: 82 },
                    { stars: 4, pct: 12 },
                    { stars: 3, pct: 4 },
                    { stars: 2, pct: 1 },
                    { stars: 1, pct: 1 },
                  ].map(row => (
                    <div key={row.stars} className="flex items-center gap-3">
                      <span className="font-inter text-xs text-clavier-dim w-8">{row.stars} ★</span>
                      <div className="flex-1 h-1 bg-clavier-border">
                        <div className="h-full bg-clavier-orange" style={{ width: `${row.pct}%` }} />
                      </div>
                      <span className="font-inter text-xs text-clavier-dim w-10 text-right">{row.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review Cards */}
              <div className="mt-8 space-y-4">
                {[
                  { name: 'Arjun M.', date: '2 days ago', rating: 5, title: 'Best keyboard I\'ve ever owned', body: 'The gasket mount makes a huge difference in the typing feel. The sound is deep and satisfying, not hollow at all. Build quality is outstanding for the price.', verified: true },
                  { name: 'Sneha R.', date: '1 week ago', rating: 4, title: 'Great build, minor software quirks', body: 'The keyboard itself is phenomenal — solid, beautiful, and a joy to type on. The companion software could use some polish, but it\'s not a deal-breaker.', verified: true },
                  { name: 'Vikram P.', date: '2 weeks ago', rating: 5, title: 'Premium feel, worth every rupee', body: 'Packaging was excellent. The keyboard arrived perfectly protected. The aluminum top plate feels incredible, and the hot-swap sockets work flawlessly with all my switches.', verified: true },
                ].map((review, i) => (
                  <div key={i} className="bg-clavier-bg-2 border border-clavier-border p-6">
                    <div className="flex items-center justify-between">
                      <span className="font-inter text-sm text-clavier-cream font-medium">{review.name}</span>
                      <span className="font-inter text-xs text-clavier-dim">{review.date}</span>
                    </div>
                    <Stars rating={review.rating} size={14} className="mt-2" />
                    <h4 className="font-playfair text-sm text-clavier-cream font-medium mt-2">{review.title}</h4>
                    <p className="font-playfair text-sm text-clavier-muted leading-7 mt-1">{review.body}</p>
                    {review.verified && (
                      <span className="inline-block mt-3 font-inter text-[10px] text-clavier-success border border-clavier-success/30 px-2 py-0.5">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-center">
                <GhostButton text="Load More Reviews" />
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════
           9. CART DRAWER
           ═══════════════════════════════════════════ */}
        {is('cart') && (
          <section>
            <SectionHeading pre="COMMERCE" heading="Cart Drawer">
              Slide-in cart drawer with line items, quantity controls, subtotal, and free shipping progress.
            </SectionHeading>

            <div className="mt-12 flex justify-center">
              <button
                onClick={() => setCartOpen(true)}
                className="font-inter text-sm text-clavier-muted border border-clavier-border px-6 py-3 hover:text-clavier-cream hover:border-clavier-border-b transition-colors"
              >
                Open Cart Drawer ({cartQty} items)
              </button>
            </div>

            {/* Static cart preview below */}
            <div className="mt-12 max-w-lg mx-auto bg-clavier-bg-2 border border-clavier-border">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-clavier-border">
                <span className="font-inter text-base text-clavier-cream font-medium">Your Cart (3)</span>
                <X className="w-5 h-5 text-clavier-dim" />
              </div>

              {/* Items */}
              <div className="px-6">
                {[
                  { name: 'Clavier 65% Pro', variant: 'Linear · Black', price: '₹8,999', qty: 1 },
                  { name: 'Clavier TKL Elite', variant: 'Tactile · White', price: '₹12,499', qty: 1 },
                  { name: 'Artisan Keycap Set', variant: 'Resin · Galaxy', price: '₹2,499', qty: 2 },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 py-5 border-b border-clavier-border">
                    <div className="w-16 h-16 bg-[#0D0D0D] border border-clavier-border flex items-center justify-center flex-shrink-0">
                      <img src="/assets/hero-CLDdwZDr.png" alt="" className="max-h-[80%] object-contain" />
                    </div>
                    <div className="flex-1">
                      <p className="font-inter text-sm text-clavier-cream font-medium">{item.name}</p>
                      <p className="font-inter text-xs text-clavier-dim mt-0.5">{item.variant}</p>
                      <p className="font-cormorant text-lg text-clavier-cream mt-1">{item.price}</p>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <QuantityStepper value={item.qty} compact />
                      <span className="font-inter text-[11px] text-clavier-dim hover:text-clavier-red cursor-pointer transition-colors">Remove</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="px-6 py-6 bg-clavier-input border-t border-clavier-border">
                {/* Free shipping progress */}
                <p className="font-inter text-xs text-clavier-success mb-3">✦ Free shipping unlocked!</p>
                <div className="w-full h-1 bg-clavier-border mb-4">
                  <div className="h-full bg-clavier-success w-full" />
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-inter text-xs text-clavier-muted uppercase tracking-wider">Subtotal</span>
                  <span className="font-cormorant text-[22px] text-clavier-cream">₹26,496</span>
                </div>
                <p className="font-inter text-[11px] text-clavier-dim mt-1">Taxes & shipping at checkout</p>

                <button className="w-full font-inter text-sm font-medium tracking-[0.06em] uppercase text-clavier-cream bg-clavier-red py-4 rounded-sm hover:bg-clavier-red-d transition-colors duration-200 mt-4">
                  Proceed to Checkout
                </button>
                <button className="w-full font-inter text-sm border border-clavier-border text-clavier-muted py-3 rounded-sm hover:border-clavier-cream hover:text-clavier-cream transition-colors mt-2">
                  Continue Shopping
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════
           10. CHECKOUT
           ═══════════════════════════════════════════ */}
        {is('checkout') && (
          <section>
            <SectionHeading pre="TRANSACTION" heading="Checkout">
              Multi-step checkout flow: contact → shipping → payment → confirm. Step indicators, order summary, and confirmation.
            </SectionHeading>

            {/* Step Indicator */}
            <div className="mt-12 max-w-lg mx-auto">
              <h3 className="font-inter text-xs tracking-widest text-clavier-muted uppercase mb-6 text-center">Checkout Step Indicator (§5.21)</h3>
              <CheckoutSteps
                steps={['Contact', 'Shipping', 'Payment', 'Confirm']}
                current={checkoutStep}
              />
              <div className="flex gap-2 mt-4 justify-center">
                {['Contact', 'Shipping', 'Payment', 'Confirm'].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCheckoutStep(i)}
                    className={`font-inter text-[11px] px-3 py-1 border transition-colors ${
                      checkoutStep === i
                        ? 'border-clavier-red text-clavier-cream'
                        : 'border-clavier-border text-clavier-dim hover:text-clavier-muted'
                    }`}
                  >
                    Step {i}
                  </button>
                ))}
              </div>
            </div>

            {/* 2-col checkout layout */}
            <div className="mt-12 grid grid-cols-1 lg:grid-cols-[58%_42%] gap-8">
              {/* Form Column */}
              <div className="space-y-8">
                {/* Contact Step */}
                <div className={checkoutStep === 0 ? '' : 'opacity-50 pointer-events-none'}>
                  <span className="font-inter text-xs text-clavier-red tracking-widest uppercase mb-4 block">Contact Information</span>
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="First Name" placeholder="John" />
                    <InputField label="Last Name" placeholder="Doe" />
                  </div>
                  <InputField label="Email" type="email" placeholder="john@example.com" />
                  <InputField label="Phone" type="tel" placeholder="+91 98765 43210" />
                </div>

                {/* Shipping Step */}
                <div className={checkoutStep === 1 ? '' : 'opacity-50 pointer-events-none'}>
                  <span className="font-inter text-xs text-clavier-red tracking-widest uppercase mb-4 block">Shipping Address</span>
                  <InputField label="Address" placeholder="123 Main Street, Apt 4B" />
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <InputField label="City" placeholder="Mumbai" />
                    <InputField label="PIN Code" placeholder="400001" />
                  </div>
                  <InputField label="State" placeholder="Maharashtra" />
                </div>

                {/* Payment Step */}
                <div className={checkoutStep === 2 ? '' : 'opacity-50 pointer-events-none'}>
                  <span className="font-inter text-xs text-clavier-red tracking-widest uppercase mb-4 block">Payment Method</span>
                  <div className="space-y-3">
                    {[
                      { icon: CreditCard, label: 'Credit / Debit Card' },
                      { icon: Globe, label: 'UPI' },
                      { icon: Package, label: 'Cash on Delivery' },
                    ].map((method, i) => (
                      <label key={i} className="flex items-center gap-4 p-4 border border-clavier-border bg-clavier-bg-2 cursor-pointer hover:border-clavier-border-b transition-colors">
                        <input type="radio" name="payment" defaultChecked={i === 0} className="w-4 h-4 accent-clavier-red" />
                        <method.icon className="w-4 h-4 text-clavier-muted" />
                        <span className="font-inter text-sm text-clavier-cream">{method.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button className="flex-1 font-inter text-sm font-medium tracking-[0.06em] uppercase text-clavier-cream bg-clavier-red py-3 rounded-sm hover:bg-clavier-red-d transition-colors">
                    Continue
                  </button>
                </div>
                <button className="font-inter text-sm text-clavier-muted hover:text-clavier-cream transition-colors flex items-center gap-1">
                  <ChevronLeft className="w-3 h-3" /> Back
                </button>
              </div>

              {/* Order Summary */}
              <div className="bg-clavier-bg-2 border border-clavier-border p-6 h-fit sticky top-24">
                <h3 className="font-inter text-xs text-clavier-muted tracking-wider uppercase mb-4">Order Summary</h3>

                {/* Items */}
                {[
                  { name: 'Clavier 65% Pro', variant: 'Linear · Black', price: '₹8,999', qty: 1 },
                  { name: 'Artisan Keycap Set', variant: 'Resin · Galaxy', price: '₹2,499', qty: 2 },
                ].map((item, i) => (
                  <div key={i} className="flex gap-3 py-3 border-b border-clavier-border">
                    <div className="relative w-12 h-12 bg-[#0D0D0D] border border-clavier-border flex items-center justify-center flex-shrink-0">
                      <img src="/assets/hero-CLDdwZDr.png" alt="" className="max-h-[80%] object-contain" />
                      <span className="absolute -top-1.5 -right-1.5 w-[18px] h-[18px] bg-clavier-border rounded-sm font-inter text-[10px] text-clavier-cream flex items-center justify-center">
                        {item.qty}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-inter text-xs text-clavier-cream truncate">{item.name}</p>
                      <p className="font-inter text-[11px] text-clavier-dim">{item.variant}</p>
                    </div>
                    <span className="font-cormorant text-sm text-clavier-cream flex-shrink-0">{item.price}</span>
                  </div>
                ))}

                {/* Coupon */}
                <div className="flex gap-2 mt-4">
                  <input
                    type="text"
                    placeholder="Coupon code"
                    className="flex-1 bg-clavier-input border border-clavier-border py-2 px-3 font-inter text-xs text-clavier-cream rounded-sm placeholder:text-clavier-dim focus:outline-none focus:border-clavier-orange"
                  />
                  <button className="font-inter text-xs border border-clavier-border text-clavier-muted px-4 py-2 hover:text-clavier-cream hover:border-clavier-cream transition-colors rounded-sm">
                    Apply
                  </button>
                </div>

                {/* Totals */}
                <div className="mt-4 pt-4 border-t border-clavier-border space-y-2">
                  {[
                    { label: 'Subtotal', value: '₹13,997' },
                    { label: 'Shipping', value: 'FREE', valueClass: 'text-clavier-success' },
                    { label: 'Tax (GST 18%)', value: '₹2,519' },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between">
                      <span className="font-inter text-xs text-clavier-muted">{row.label}</span>
                      <span className={`font-inter text-sm text-clavier-cream ${row.valueClass || ''}`}>{row.value}</span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="flex items-center justify-between pt-4 border-t border-clavier-border mt-2">
                  <span className="font-inter text-sm text-clavier-cream font-medium uppercase tracking-wider">Total</span>
                  <span className="font-cormorant text-[24px] text-clavier-cream">₹16,516</span>
                </div>

                {/* Secure note */}
                <div className="flex items-center gap-2 mt-4">
                  <Lock className="w-3.5 h-3.5 text-clavier-dim" />
                  <span className="font-inter text-[11px] text-clavier-dim">Secure 256-bit SSL checkout</span>
                </div>
              </div>
            </div>

            {/* Order Confirmation */}
            <div className="mt-24">
              <h3 className="font-inter text-xs tracking-widest text-clavier-muted uppercase mb-8 text-center">Order Confirmation (§5.22)</h3>
              <div className="max-w-2xl mx-auto text-center py-12">
                {/* Checkmark */}
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-clavier-success bg-clavier-success/15">
                  <Check className="w-8 h-8 text-clavier-success" />
                </div>
                <h2 className="font-cormorant italic text-[48px] text-clavier-cream mt-6">Order Confirmed</h2>
                <p className="font-playfair text-base text-clavier-muted mt-2">We'll email you when it ships.</p>
                <p className="font-inter text-xs text-clavier-dim mt-2">Order #CLV-20481</p>

                {/* Summary Card */}
                <div className="bg-clavier-bg-2 border border-clavier-border p-6 mt-8 text-left">
                  <h3 className="font-inter text-xs text-clavier-muted tracking-wider uppercase mb-4">Order Summary</h3>
                  <div className="flex gap-3 py-3 border-b border-clavier-border">
                    <div className="w-12 h-12 bg-[#0D0D0D] border border-clavier-border flex items-center justify-center">
                      <img src="/assets/hero-CLDdwZDr.png" alt="" className="max-h-[80%] object-contain" />
                    </div>
                    <div className="flex-1">
                      <p className="font-inter text-xs text-clavier-cream">Clavier 65% Pro</p>
                      <p className="font-inter text-[11px] text-clavier-dim">Linear · Black × 1</p>
                    </div>
                    <span className="font-cormorant text-sm text-clavier-cream">₹8,999</span>
                  </div>

                  <div className="mt-4">
                    <h4 className="font-inter text-xs text-clavier-muted tracking-wider uppercase mb-2">Shipping Address</h4>
                    <p className="font-inter text-sm text-clavier-muted leading-relaxed">
                      John Doe<br />
                      123 Main Street, Apt 4B<br />
                      Mumbai, Maharashtra 400001
                    </p>
                  </div>

                  <div className="mt-4">
                    <h4 className="font-inter text-xs text-clavier-muted tracking-wider uppercase mb-1">Estimated Delivery</h4>
                    <p className="font-inter text-sm text-clavier-cream font-medium">June 7 – June 9, 2025</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 mt-8 justify-center">
                  <BracketedButton text="Track Order" />
                  <GhostButton text="Continue Shopping" />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════
           11. ACCOUNT PAGES
           ═══════════════════════════════════════════ */}
        {is('account') && (
          <section>
            <SectionHeading pre="USER" heading="Account">
              Account sidebar navigation, orders table, profile form, and address cards.
            </SectionHeading>

            <div className="mt-12 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-0 border border-clavier-border">
              {/* Sidebar */}
              <div className="bg-clavier-bg-2 border-r border-clavier-border p-6">
                {/* User Block */}
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-clavier-bg-3 border border-clavier-border rounded-full flex items-center justify-center">
                    <span className="font-inter text-sm text-clavier-cream font-medium">DP</span>
                  </div>
                  <div>
                    <p className="font-inter text-sm text-clavier-cream">Dev Prajapati</p>
                    <p className="font-inter text-xs text-clavier-dim">dev@clavier.in</p>
                  </div>
                </div>

                {/* Nav Items */}
                <nav className="space-y-1">
                  {[
                    { icon: Package, label: 'Orders' },
                    { icon: Heart, label: 'Wishlist' },
                    { icon: User, label: 'Profile' },
                    { icon: MapPin, label: 'Addresses' },
                    { icon: Settings, label: 'Settings' },
                    { icon: LogOut, label: 'Sign Out' },
                  ].map((item, i) => (
                    <a
                      key={i}
                      href="#"
                      className={`flex items-center gap-3 px-4 py-3 font-inter text-sm transition-colors ${
                        i === 0
                          ? 'text-clavier-cream bg-clavier-bg-3 border-l-2 border-clavier-red'
                          : 'text-clavier-muted hover:text-clavier-cream hover:bg-clavier-bg-3'
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </a>
                  ))}
                </nav>
              </div>

              {/* Content — Orders Table */}
              <div className="p-6">
                <h3 className="font-cormorant text-2xl text-clavier-cream mb-6">Order History</h3>
                <div className="overflow-x-auto">
                  <table className="w-full font-inter text-sm">
                    <thead>
                      <tr className="border-b border-clavier-border">
                        {['Order #', 'Date', 'Items', 'Total', 'Status', 'Action'].map(h => (
                          <th key={h} className="text-left py-3 px-4 font-inter text-[11px] text-clavier-muted tracking-wider uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { id: '#CLV-20481', date: 'Jun 3, 2025', items: '1 item', total: '₹8,999', status: 'Processing' },
                        { id: '#CLV-19204', date: 'May 18, 2025', items: '3 items', total: '₹15,497', status: 'Shipped' },
                        { id: '#CLV-17832', date: 'Apr 2, 2025', items: '1 item', total: '₹2,499', status: 'Delivered' },
                        { id: '#CLV-16100', date: 'Mar 15, 2025', items: '2 items', total: '₹22,998', status: 'Delivered' },
                      ].map(order => (
                        <tr key={order.id} className="border-b border-clavier-border odd:bg-clavier-bg/50">
                          <td className="py-3 px-4 text-clavier-cream font-medium">{order.id}</td>
                          <td className="py-3 px-4 text-clavier-muted">{order.date}</td>
                          <td className="py-3 px-4 text-clavier-muted">{order.items}</td>
                          <td className="py-3 px-4 text-clavier-cream">{order.total}</td>
                          <td className="py-3 px-4"><StatusBadge status={order.status} /></td>
                          <td className="py-3 px-4">
                            <span className="font-inter text-xs text-clavier-red cursor-pointer hover:underline">View →</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Address Cards */}
            <div className="mt-12">
              <h3 className="font-cormorant text-2xl text-clavier-cream mb-6">Saved Addresses</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { label: 'Home', address: '123 Main Street, Apt 4B\nMumbai, Maharashtra 400001\nPhone: +91 98765 43210', primary: true },
                  { label: 'Office', address: 'Tech Park, 5th Floor\nBandra Kurla Complex, Mumbai 400051\nPhone: +91 98765 43210', primary: false },
                ].map(addr => (
                  <div key={addr.label} className="bg-clavier-bg-2 border border-clavier-border p-5 relative">
                    {addr.primary && (
                      <span className="font-inter text-[10px] text-clavier-success border border-clavier-success/30 px-2 py-0.5 absolute top-4 right-4">
                        PRIMARY
                      </span>
                    )}
                    <h4 className="font-inter text-sm text-clavier-cream font-medium mb-3">{addr.label}</h4>
                    <p className="font-inter text-sm text-clavier-muted whitespace-pre-line leading-relaxed">{addr.address}</p>
                    <div className="flex gap-3 mt-4 pt-4 border-t border-clavier-border">
                      <span className="font-inter text-xs text-clavier-red cursor-pointer hover:underline">Edit</span>
                      <span className="font-inter text-xs text-clavier-dim cursor-pointer hover:text-clavier-red transition-colors">Delete</span>
                    </div>
                  </div>
                ))}

                {/* Add New */}
                <button className="border border-clavier-border border-dashed p-5 flex flex-col items-center justify-center gap-3 text-clavier-dim hover:text-clavier-cream hover:border-clavier-border-b transition-colors min-h-[180px]">
                  <span className="font-inter text-2xl">+</span>
                  <span className="font-inter text-sm">Add New Address</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════
           12. STATUS BADGES
           ═══════════════════════════════════════════ */}
        {is('misc') && (
          <>
            <section>
              <SectionHeading pre="COMPONENTS" heading="Status Badges">
                Order statuses, stock indicators, and state badges used throughout the store.
              </SectionHeading>

              <div className="mt-12 flex gap-4 flex-wrap">
                <StatusBadge status="Processing" />
                <StatusBadge status="Shipped" />
                <StatusBadge status="Delivered" />
                <StatusBadge status="Cancelled" />
                <StatusBadge status="In Stock" />
                <StatusBadge status="Low Stock" />
                <StatusBadge status="Out of Stock" />
              </div>
            </section>

            {/* Feature / Spec Strip */}
            <section className="mt-24">
              <SectionHeading pre="TRUST" heading="Feature Strip">
                Horizontal trust/spec strip used on homepage and PDP.
              </SectionHeading>

              <div className="mt-12 border-y border-clavier-border bg-clavier-bg py-8">
                <div className="flex items-center">
                  {[
                    { icon: Truck, label: 'Free Shipping', value: 'Over ₹8,000' },
                    { icon: Shield, label: 'Warranty', value: '1 Year' },
                    { icon: RotateCcw, label: 'Returns', value: '30 Days' },
                    { icon: Package, label: 'Packaging', value: 'Premium' },
                    { icon: Check, label: 'Quality', value: 'Hand-tested' },
                  ].map((item, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <item.icon className="w-5 h-5 text-clavier-red" />
                      <span className="font-inter text-[10px] text-clavier-dim tracking-widest uppercase">{item.label}</span>
                      <span className="font-playfair text-sm text-clavier-cream">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Toast Notifications */}
            <section className="mt-24">
              <SectionHeading pre="FEEDBACK" heading="Toasts">
                Slide-in notifications for cart adds, errors, warnings, and info messages.
              </SectionHeading>

              <div className="mt-12 flex gap-4 flex-wrap">
                <button
                  onClick={() => addToast('success', 'Added to Cart', 'Clavier 65% Pro has been added')}
                  className="font-inter text-xs border border-clavier-success text-clavier-success px-4 py-2 hover:bg-clavier-success/10 transition-colors"
                >
                  Success Toast
                </button>
                <button
                  onClick={() => addToast('error', 'Payment Failed', 'Please check your card details')}
                  className="font-inter text-xs border border-clavier-red text-clavier-red px-4 py-2 hover:bg-clavier-red/10 transition-colors"
                >
                  Error Toast
                </button>
                <button
                  onClick={() => addToast('warning', 'Low Stock', 'Only 2 left in stock')}
                  className="font-inter text-xs border border-clavier-warning text-clavier-warning px-4 py-2 hover:bg-clavier-warning/10 transition-colors"
                >
                  Warning Toast
                </button>
                <button
                  onClick={() => addToast('info', 'New Drop Coming', 'TKL Elite restocking next week')}
                  className="font-inter text-xs border border-clavier-orange text-clavier-orange px-4 py-2 hover:bg-clavier-orange/10 transition-colors"
                >
                  Info Toast
                </button>
              </div>
            </section>

            {/* Empty State */}
            <section className="mt-24">
              <SectionHeading pre="STATE" heading="Empty States">
                Consistent empty state pattern across all pages.
              </SectionHeading>

              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex flex-col items-center py-20 gap-4">
                  <ShoppingCart className="w-12 h-12 text-clavier-border" />
                  <h3 className="font-cormorant italic text-[28px] text-clavier-dim">Your cart is empty</h3>
                  <p className="font-playfair text-sm text-clavier-border-b text-center max-w-xs">Looks like you haven't added anything yet.</p>
                  <BracketedButton text="Browse Products" size="sm" />
                </div>

                <div className="flex flex-col items-center py-20 gap-4">
                  <Heart className="w-12 h-12 text-clavier-border" />
                  <h3 className="font-cormorant italic text-[28px] text-clavier-dim">No saved items</h3>
                  <p className="font-playfair text-sm text-clavier-border-b text-center max-w-xs">Save keyboards you love to find them later.</p>
                  <BracketedButton text="Explore Keyboards" size="sm" />
                </div>

                <div className="flex flex-col items-center py-20 gap-4">
                  <Package className="w-12 h-12 text-clavier-border" />
                  <h3 className="font-cormorant italic text-[28px] text-clavier-dim">No orders yet</h3>
                  <p className="font-playfair text-sm text-clavier-border-b text-center max-w-xs">Your order history will appear here.</p>
                  <BracketedButton text="Start Shopping" size="sm" />
                </div>
              </div>
            </section>

            {/* Pagination */}
            <section className="mt-24">
              <SectionHeading pre="NAVIGATION" heading="Pagination">
                Centered page navigation with prev/next and ellipsis.
              </SectionHeading>

              <div className="mt-12 flex items-center justify-center gap-2">
                <button className="flex items-center gap-1 font-inter text-sm text-clavier-muted hover:text-clavier-cream transition-colors">
                  <ChevronLeft className="w-3.5 h-3.5" /> Prev
                </button>
                {[1, 2, 3, '…', 8, 9, 10].map(page => (
                  page === '…' ? (
                    <span key="dots" className="w-7 h-7 font-inter text-sm text-clavier-dim flex items-center justify-center">…</span>
                  ) : (
                    <button
                      key={page}
                      className={`w-7 h-7 font-inter text-sm flex items-center justify-center transition-colors ${
                        page === 3
                          ? 'text-clavier-cream bg-clavier-bg-3 border border-clavier-border-b'
                          : 'text-clavier-dim hover:text-clavier-muted border border-transparent hover:border-clavier-border'
                      }`}
                    >
                      {page}
                    </button>
                  )
                ))}
                <button className="flex items-center gap-1 font-inter text-sm text-clavier-muted hover:text-clavier-cream transition-colors">
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </section>

            {/* Auth Card */}
            <section className="mt-24">
              <SectionHeading pre="AUTH" heading="Login / Sign Up">
                Auth card with star background, form inputs, OAuth, and footer link.
              </SectionHeading>

              <div className="mt-12 max-w-[440px] mx-auto">
                <div className="bg-clavier-bg-2 border border-clavier-border p-10">
                  {/* Logo & Tagline */}
                  <div className="text-center mb-8">
                    <h2 className="font-cormorant italic text-[32px] text-clavier-cream">Clavier</h2>
                    <p className="font-playfair italic text-sm text-clavier-dim mt-1">Welcome back to precision</p>
                  </div>

                  {/* Form */}
                  <div className="flex flex-col gap-5">
                    <InputField label="Email" type="email" placeholder="you@example.com" />
                    <InputField label="Password" type="password" placeholder="••••••••" />

                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 accent-clavier-red" />
                        <span className="font-inter text-xs text-clavier-muted">Remember me</span>
                      </label>
                      <span className="font-inter text-xs text-clavier-red cursor-pointer hover:underline">Forgot password?</span>
                    </div>

                    <FilledButton text="Sign In" fullWidth />

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-2">
                      <div className="flex-1 h-px bg-clavier-border" />
                      <span className="font-inter text-xs text-clavier-dim">or</span>
                      <div className="flex-1 h-px bg-clavier-border" />
                    </div>

                    {/* OAuth */}
                    <button className="w-full flex items-center justify-center gap-3 border border-clavier-border py-3 text-clavier-muted hover:text-clavier-cream hover:border-clavier-border-b transition-colors rounded-sm">
                      <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
                        <path fill="#F5F0EB" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                        <path fill="#F5F0EB" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#F5F0EB" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#F5F0EB" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span className="font-inter text-sm">Continue with Google</span>
                    </button>
                  </div>

                  {/* Footer */}
                  <p className="font-inter text-sm text-clavier-dim text-center mt-6">
                    Don't have an account? <span className="text-clavier-red cursor-pointer hover:underline">Sign up</span>
                  </p>
                </div>
              </div>
            </section>

            {/* Footer */}
            <section className="mt-24">
              <SectionHeading pre="LAYOUT" heading="Footer">
                4-column footer with brand, links, newsletter, payment icons, and bottom bar.
              </SectionHeading>

              <footer className="mt-12 border-t border-clavier-border bg-clavier-bg pt-16 pb-10">
                <div className="max-w-[1280px] mx-auto px-8">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    {/* Brand */}
                    <div className="md:col-span-1">
                      <h3 className="font-cormorant italic text-[26px] text-clavier-cream">Clavier</h3>
                      <p className="font-playfair italic text-sm text-clavier-dim mt-1">Crafted for precision.</p>
                      <div className="flex gap-4 mt-4">
                        {[Globe, Mail, Phone].map((Icon, i) => (
                          <Icon key={i} className="w-[18px] h-[18px] text-clavier-dim hover:text-clavier-red transition-colors cursor-pointer" />
                        ))}
                      </div>
                    </div>

                    {/* Shop */}
                    <div>
                      <h4 className="font-inter text-[11px] text-clavier-muted tracking-widest uppercase mb-4">Shop</h4>
                      <ul className="space-y-3">
                        {['All Products', 'Keyboards', 'Switches', 'Keycaps', 'Accessories', 'Sale'].map(link => (
                          <li key={link}><span className="font-inter text-sm text-clavier-dim hover:text-clavier-cream transition-colors cursor-pointer leading-loose">{link}</span></li>
                        ))}
                      </ul>
                    </div>

                    {/* Help */}
                    <div>
                      <h4 className="font-inter text-[11px] text-clavier-muted tracking-widest uppercase mb-4">Help</h4>
                      <ul className="space-y-3">
                        {['Shipping', 'Returns', 'FAQ', 'Contact Us', 'Track Order', 'Warranty'].map(link => (
                          <li key={link}><span className="font-inter text-sm text-clavier-dim hover:text-clavier-cream transition-colors cursor-pointer leading-loose">{link}</span></li>
                        ))}
                      </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                      <h4 className="font-inter text-[11px] text-clavier-muted tracking-widest uppercase mb-1">Stay in the Loop</h4>
                      <p className="font-playfair italic text-sm text-clavier-dim mb-4">New drops, build guides, deals.</p>
                      <div className="flex gap-2">
                        <input
                          type="email"
                          placeholder="your@email.com"
                          className="flex-1 bg-clavier-input border border-clavier-border py-2.5 px-3 font-inter text-xs text-clavier-cream rounded-sm placeholder:text-clavier-dim focus:outline-none focus:border-clavier-orange"
                        />
                        <button className="font-inter text-xs font-medium tracking-[0.06em] uppercase text-clavier-cream bg-clavier-red px-4 py-2.5 rounded-sm hover:bg-clavier-red-d transition-colors">
                          Join
                        </button>
                      </div>
                      <p className="font-inter text-[11px] text-clavier-dim mt-2 italic">No spam. Unsubscribe anytime.</p>
                    </div>
                  </div>

                  {/* Bottom bar */}
                  <div className="flex items-center justify-between pt-8 border-t border-clavier-border mt-12 flex-wrap gap-4">
                    <span className="font-inter text-xs text-clavier-dim">© 2025 Clavier. All rights reserved.</span>
                    <div className="flex gap-3 opacity-40">
                      {/* Payment icons — simplified text placeholders */}
                      {['Visa', 'MC', 'UPI', 'SSL'].map(p => (
                        <span key={p} className="font-inter text-[10px] text-clavier-dim border border-clavier-border px-2 py-1">{p}</span>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      {['Privacy Policy', 'Terms', 'Sitemap'].map(link => (
                        <span key={link} className="font-inter text-xs text-clavier-dim hover:text-clavier-muted cursor-pointer transition-colors">{link}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </footer>
            </section>
          </>
        )}

      </div>

      {/* ═══════════════════════════════════════════
         OVERLAYS
         ═══════════════════════════════════════════ */}

      {/* Cart Drawer Overlay */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} cartQty={cartQty} />

      {/* Quick View Modal */}
      <QuickViewModal open={quickViewOpen} onClose={() => setQuickViewOpen(false)} />

      {/* Search Overlay */}
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Mobile Nav Overlay */}
      <MobileNavOverlay open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} />
    </div>
  );
}

/* ──────────────────────────────────────────────────────
   SUB-COMPONENTS
   ────────────────────────────────────────────────────── */

/* ── Section Heading Pattern (§5.9) ── */
function SectionHeading({ pre, heading, children }) {
  // Extract the last word of heading for italic treatment
  const words = heading.split(' ');
  const lastWord = words[words.length - 1];
  const prefix = words.slice(0, -1).join(' ');

  return (
    <div>
      <p className="font-inter text-[11px] text-clavier-red tracking-widest uppercase">— {pre}</p>
      <h2 className="font-cormorant text-[48px] text-clavier-cream font-semibold mt-2">
        {prefix}{' '}
        <span className="font-playfair italic text-clavier-orange underline decoration-clavier-orange/60">{lastWord}</span>
      </h2>
      {children && (
        <p className="font-playfair text-base text-clavier-muted max-w-[480px] leading-7 mt-4">{children}</p>
      )}
    </div>
  );
}

/* ── Color Swatch ── */
function ColorSwatch({ name, hex }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="w-16 h-16 border border-clavier-border"
        style={{ backgroundColor: hex }}
      />
      <div className="text-center">
        <p className="font-inter text-[11px] text-clavier-muted">{name}</p>
        <p className="font-inter text-[10px] text-clavier-dim font-mono">{hex}</p>
      </div>
    </div>
  );
}

/* ── Bracketed Button (§5.3) ── */
function BracketedButton({ text, size = 'md' }) {
  const sizeClasses = size === 'sm'
    ? { bracket: 'text-base', text: 'text-xs', gap: 'gap-1.5' }
    : { bracket: 'text-lg', text: 'text-sm', gap: 'gap-2' };

  return (
    <button className={`flex items-center ${sizeClasses.gap} group`}>
      <span className={`text-clavier-red font-semibold ${sizeClasses.bracket} group-hover:brightness-125 transition-all`}>[</span>
      <span className={`font-inter ${sizeClasses.text} text-clavier-cream tracking-wide group-hover:text-clavier-red transition-colors duration-200`}>
        {text}
      </span>
      <span className={`text-clavier-red font-semibold ${sizeClasses.bracket} group-hover:brightness-125 transition-all`}>]</span>
    </button>
  );
}

/* ── Filled Button (§5.4) ── */
function FilledButton({ text, loading = false, fullWidth = false }) {
  return (
    <button
      className={`font-inter text-sm font-medium tracking-[0.06em] uppercase text-clavier-cream bg-clavier-red py-3 px-8 rounded-sm hover:bg-clavier-red-d transition-colors duration-200 focus:outline-[2px] focus:outline-clavier-orange focus:outline-offset-[3px] disabled:bg-clavier-border disabled:text-clavier-dim disabled:cursor-not-allowed ${fullWidth ? 'w-full' : ''} ${loading ? 'flex items-center gap-3' : ''}`}
      disabled={loading}
    >
      {loading && (
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {loading ? 'Processing...' : text}
    </button>
  );
}

/* ── Ghost Button (§5.5) ── */
function GhostButton({ text, fullWidth = false }) {
  return (
    <button
      className={`font-inter text-sm border border-clavier-border text-clavier-muted py-3 px-8 rounded-sm hover:border-clavier-cream hover:text-clavier-cream transition-colors ${fullWidth ? 'w-full' : ''}`}
    >
      {text}
    </button>
  );
}

/* ── Input Field (§5.10) ── */
function InputField({ label, type = 'text', placeholder }) {
  return (
    <div>
      <label className="font-inter text-[11px] text-clavier-muted tracking-wide uppercase mb-2 block">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full bg-clavier-input border border-clavier-border py-3 px-4 font-inter text-sm text-clavier-cream rounded-sm placeholder:text-clavier-dim focus:outline-none focus:border-clavier-orange focus:shadow-[0_0_0_2px_rgba(212,98,26,0.15)]"
      />
    </div>
  );
}

/* ── Stars Rating ── */
function Stars({ rating, size = 12, className = '' }) {
  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`w-[${size}px] h-[${size}px]`}
          size={size}
          fill={i <= Math.round(rating) ? '#D4621A' : 'none'}
          stroke={i <= Math.round(rating) ? '#D4621A' : '#2A2520'}
        />
      ))}
    </div>
  );
}

/* ── Product Card (§5.6) ── */
function ProductCard({ name, category, variant, price, originalPrice, discount, rating, reviews, badge, badgeVariant, soldOut, image }) {
  const badgeColors = {
    default: 'bg-clavier-red',
    warning: 'bg-clavier-warning',
    out: 'bg-clavier-border',
  };
  const badgeTextColors = {
    default: 'text-clavier-cream',
    warning: 'text-clavier-cream',
    out: 'text-clavier-dim',
  };

  return (
    <div className="bg-clavier-bg-2 border border-clavier-border hover:border-clavier-border-b hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
      {/* Image area */}
      <div className="relative bg-[#0D0D0D] aspect-[4/3] p-4 flex items-center justify-center overflow-hidden">
        {/* Bottom vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-clavier-bg-2 to-transparent z-[1]" style={{ opacity: 0.9 }} />

        {/* Badges */}
        {badge && (
          <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
            <span className={`font-inter text-[10px] tracking-widest ${badgeColors[badgeVariant || 'default']} ${badgeTextColors[badgeVariant || 'default']} px-2 py-1`}>
              {badge}
            </span>
          </div>
        )}

        {/* Wishlist */}
        <button className="absolute top-3 right-3 z-10 bg-clavier-bg-2 border border-clavier-border p-2 hover:border-clavier-red transition-colors">
          <Heart className="w-[18px] h-[18px] text-clavier-dim hover:text-clavier-red transition-colors" />
        </button>

        {/* Image */}
        <img
          src="/assets/hero-CLDdwZDr.png"
          alt={name}
          className="max-h-[80%] object-contain group-hover:scale-[1.03] transition-transform duration-400"
        />
      </div>

      {/* Info area */}
      <div className="px-5 pb-5 pt-4 flex flex-col gap-2">
        <span className="font-inter text-[10px] text-clavier-dim tracking-widest uppercase">{category}</span>
        <h3 className="font-playfair text-[17px] text-clavier-cream leading-tight">{name}</h3>
        <span className="font-inter text-xs text-clavier-dim">{variant}</span>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <Stars rating={rating} size={12} />
          <span className="font-inter text-[11px] text-clavier-dim">({reviews})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-3 mt-1">
          <span className="font-cormorant text-xl text-clavier-cream">{price}</span>
          {originalPrice && (
            <>
              <span className="font-cormorant text-base text-clavier-dim line-through">{originalPrice}</span>
              <span className="font-inter text-[11px] text-clavier-success bg-clavier-success/12 px-1.5 py-0.5">{discount}</span>
            </>
          )}
        </div>

        {/* CTA row */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-clavier-border">
          {soldOut ? (
            <span className="font-inter text-xs text-clavier-dim">Sold Out</span>
          ) : (
            <button className="flex items-center gap-1.5 group/atc">
              <span className="text-clavier-red font-semibold text-base group-hover/atc:brightness-125 transition-all">[</span>
              <span className="font-inter text-xs text-clavier-cream tracking-wide group-hover/atc:text-clavier-red transition-colors duration-200">
                Add to Cart
              </span>
              <span className="text-clavier-red font-semibold text-base group-hover/atc:brightness-125 transition-all">]</span>
            </button>
          )}
          <button className="text-clavier-dim hover:text-clavier-cream transition-colors">
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Filter Pill (§5.13) ── */
function FilterPill({ text, active, onRemove }) {
  return (
    <span className={`inline-flex items-center font-inter text-xs px-3 py-1.5 border transition-colors cursor-default ${
      active
        ? 'bg-clavier-bg-3 border-clavier-red text-clavier-cream'
        : 'bg-clavier-bg-2 border-clavier-border text-clavier-muted hover:border-clavier-border-b hover:text-clavier-cream'
    }`}>
      {text}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-2 text-clavier-dim hover:text-clavier-red transition-colors"
        >
          ×
        </button>
      )}
    </span>
  );
}

/* ── Toggle Pills (§5.17) ── */
function TogglePills({ options, selected, onChange, disabled = [] }) {
  return (
    <div className="inline-flex bg-clavier-bg-2 border border-clavier-border p-1 gap-0">
      {options.map(opt => {
        const isDisabled = disabled.includes(opt);
        const isSelected = selected === opt;
        return (
          <button
            key={opt}
            onClick={() => !isDisabled && onChange(opt)}
            disabled={isDisabled}
            className={`font-inter text-sm px-4 py-2 transition-colors duration-150 ${
              isDisabled
                ? 'text-clavier-border-b line-through cursor-not-allowed'
                : isSelected
                  ? 'text-clavier-cream bg-clavier-bg-3 border border-clavier-border-b'
                  : 'text-clavier-dim hover:text-clavier-muted'
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

/* ── Color Swatch Selector (§5.18) ── */
function ColorSwatchSelector({ colors, selected, onChange }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {colors.map(color => (
        <button
          key={color}
          onClick={() => onChange(color)}
          className={`w-6 h-6 transition-all ${
            selected === color
              ? 'border-2 border-clavier-cream ring-2 ring-clavier-red ring-offset-2 ring-offset-clavier-bg-2'
              : 'border-2 border-transparent hover:border-clavier-border-b'
          }`}
          style={{ backgroundColor: color, borderRadius: '50%' }}
          title={color}
        />
      ))}
    </div>
  );
}

/* ── Quantity Stepper (§5.19) ── */
function QuantityStepper({ value, onChange, compact = false }) {
  const sizeClass = compact ? 'px-2 py-1 text-sm' : 'px-3 py-2 text-base';
  const valueClass = compact ? 'px-3 py-1 text-xs min-w-[32px]' : 'px-4 py-2 text-sm min-w-[40px]';
  const borderClass = compact ? 'h-7' : '';

  return (
    <div className={`inline-flex items-center border border-clavier-border ${borderClass}`}>
      <button
        onClick={() => onChange && onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
        className={`${sizeClass} font-inter text-clavier-muted hover:text-clavier-cream hover:bg-clavier-bg-3 transition-colors disabled:text-clavier-border-b disabled:cursor-not-allowed border-r border-clavier-border`}
      >
        −
      </button>
      <span className={`${valueClass} font-inter text-clavier-cream text-center`}>{value}</span>
      <button
        onClick={() => onChange && onChange(value + 1)}
        className={`${sizeClass} font-inter text-clavier-muted hover:text-clavier-cream hover:bg-clavier-bg-3 transition-colors border-l border-clavier-border`}
      >
        +
      </button>
    </div>
  );
}

/* ── Status Badge (§5.24) ── */
function StatusBadge({ status }) {
  const variants = {
    'Processing': 'bg-clavier-warning/15 text-clavier-warning border-clavier-warning/30',
    'Shipped': 'bg-clavier-success/15 text-clavier-success border-clavier-success/30',
    'Delivered': 'bg-clavier-success/20 text-clavier-success border-clavier-success/40',
    'Cancelled': 'bg-clavier-red/15 text-clavier-red border-clavier-red/30',
    'In Stock': 'bg-clavier-success/15 text-clavier-success',
    'Low Stock': 'bg-clavier-warning/15 text-clavier-warning',
    'Out of Stock': 'bg-clavier-border/80 text-clavier-dim',
  };

  return (
    <span className={`font-inter text-[10px] font-medium tracking-widest uppercase px-2 py-1 border ${variants[status] || variants['Processing']}`}>
      {status}
    </span>
  );
}

/* ── Checkout Steps (§5.21) ── */
function CheckoutSteps({ steps, current }) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center flex-1">
          <div className="flex flex-col items-center">
            <div className={`w-6 h-6 border flex items-center justify-center ${
              i < current
                ? 'bg-clavier-red border-clavier-red'
                : i === current
                  ? 'bg-transparent border-clavier-cream'
                  : 'bg-transparent border-clavier-border'
            }`}>
              {i < current ? (
                <Check className="w-3 h-3 text-clavier-cream" />
              ) : (
                <span className={`font-inter text-xs ${
                  i === current ? 'text-clavier-cream' : 'text-clavier-dim'
                }`}>{i + 1}</span>
              )}
            </div>
            <span className={`font-inter text-xs mt-2 ${
              i < current ? 'text-clavier-muted' : i === current ? 'text-clavier-cream' : 'text-clavier-dim'
            }`}>{step}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-px mx-2 ${i < current ? 'bg-clavier-red' : 'bg-clavier-border'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Cart Drawer (§5.16) ── */
function CartDrawer({ open, onClose, cartQty }) {
  if (!open) return null;
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-clavier-bg/60 z-40"
        onClick={onClose}
      />
      {/* Drawer */}
      <div className="fixed top-0 right-0 bottom-0 w-[440px] max-w-full bg-clavier-bg-2 border-l border-clavier-border z-50 flex flex-col animate-[slideIn_300ms_cubic-bezier(0.4,0,0.2,1)_forwards]">
        <style>{`
          @keyframes slideIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
        `}</style>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-clavier-border">
          <span className="font-inter text-base text-clavier-cream font-medium">Your Cart ({cartQty})</span>
          <button onClick={onClose} className="text-clavier-dim hover:text-clavier-cream transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6">
          {[
            { name: 'Clavier 65% Pro', variant: 'Linear · Black', price: '₹8,999', qty: 1 },
            { name: 'Clavier TKL Elite', variant: 'Tactile · White', price: '₹12,499', qty: 1 },
            { name: 'Artisan Keycap Set', variant: 'Resin · Galaxy', price: '₹2,499', qty: 2 },
          ].map((item, i) => (
            <div key={i} className="flex gap-4 py-5 border-b border-clavier-border">
              <div className="w-16 h-16 bg-[#0D0D0D] border border-clavier-border flex items-center justify-center flex-shrink-0">
                <img src="/assets/hero-CLDdwZDr.png" alt="" className="max-h-[80%] object-contain" />
              </div>
              <div className="flex-1">
                <p className="font-inter text-sm text-clavier-cream font-medium">{item.name}</p>
                <p className="font-inter text-xs text-clavier-dim mt-0.5">{item.variant}</p>
                <p className="font-cormorant text-lg text-clavier-cream mt-1">{item.price}</p>
              </div>
              <div className="flex flex-col items-end gap-3">
                <QuantityStepper value={item.qty} compact />
                <span className="font-inter text-[11px] text-clavier-dim hover:text-clavier-red cursor-pointer transition-colors">Remove</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-6 bg-clavier-input border-t border-clavier-border">
          <p className="font-inter text-xs text-clavier-success mb-3">✦ Add ₹1,200 more for free shipping</p>
          <div className="w-full h-1 bg-clavier-border mb-4">
            <div className="h-full bg-clavier-success" style={{ width: '70%' }} />
          </div>

          <div className="flex items-center justify-between">
            <span className="font-inter text-xs text-clavier-muted uppercase tracking-wider">Subtotal</span>
            <span className="font-cormorant text-[22px] text-clavier-cream">₹26,496</span>
          </div>
          <p className="font-inter text-[11px] text-clavier-dim mt-1">Taxes & shipping at checkout</p>

          <button className="w-full font-inter text-sm font-medium tracking-[0.06em] uppercase text-clavier-cream bg-clavier-red py-4 rounded-sm hover:bg-clavier-red-d transition-colors duration-200 mt-4">
            Proceed to Checkout
          </button>
          <button className="w-full font-inter text-sm border border-clavier-border text-clavier-muted py-3 rounded-sm hover:border-clavier-cream hover:text-clavier-cream transition-colors mt-2">
            Continue Shopping
          </button>
        </div>
      </div>
    </>
  );
}

/* ── Quick View Modal (§5.7) ── */
function QuickViewModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-8" onClick={onClose}>
      <div className="absolute inset-0 bg-clavier-bg/85 backdrop-blur-sm" />
      <div
        className="relative bg-clavier-bg-2 border border-clavier-border max-w-3xl w-full flex shadow-2xl animate-[scaleIn_250ms_ease_forwards]"
        onClick={e => e.stopPropagation()}
      >
        <style>{`
          @keyframes scaleIn {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
        `}</style>

        {/* Image */}
        <div className="w-[45%] bg-[#0D0D0D] flex items-center justify-center p-8">
          <img src="/assets/hero-CLDdwZDr.png" alt="" className="max-h-[80%] object-contain" />
        </div>

        {/* Info */}
        <div className="w-[55%] p-8 flex flex-col gap-4">
          <button onClick={onClose} className="absolute top-4 right-4 text-clavier-dim hover:text-clavier-cream transition-colors">
            <X className="w-5 h-5" />
          </button>

          <span className="font-inter text-[11px] text-clavier-red tracking-widest uppercase">65% KEYBOARD</span>
          <h3 className="font-cormorant italic text-3xl text-clavier-cream">Clavier 65% Pro</h3>
          <span className="font-cormorant text-2xl text-clavier-cream">₹8,999</span>

          <TogglePills
            options={['Linear', 'Tactile', 'Clicky']}
            selected="Linear"
            onChange={() => {}}
          />

          <FilledButton text="Add to Cart" />
          <p className="font-inter text-xs text-clavier-dim mt-2">
            <span className="text-clavier-red cursor-pointer hover:underline">View Full Details →</span>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Search Overlay (§5.11) ── */
function SearchOverlay({ open, onClose }) {
  const [query, setQuery] = useState('');

  if (!open) return null;

  const results = query.length > 2
    ? [
        { name: 'Clavier 65% Pro', category: '65% KEYBOARD', price: '₹8,999' },
        { name: 'Clavier TKL Elite', category: 'TKL KEYBOARD', price: '₹12,499' },
        { name: 'Clavier 75% Wireless', category: '75% KEYBOARD', price: '₹10,999' },
      ]
    : [];

  return (
    <div className="fixed inset-0 z-50 bg-clavier-bg/92 backdrop-blur-sm flex flex-col items-center pt-[20vh]">
      {/* Input bar */}
      <div className="relative max-w-2xl w-full px-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-clavier-dim" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search keyboards..."
          autoFocus
          className="w-full bg-clavier-input border border-clavier-border py-4 pl-12 pr-12 font-cormorant italic text-2xl text-clavier-cream rounded-sm placeholder:text-clavier-dim placeholder:font-playfair focus:outline-none focus:border-clavier-orange"
        />
        <button onClick={onClose} className="absolute right-4 top-1/2 -translate-y-1/2 text-clavier-dim hover:text-clavier-cream transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="max-w-2xl w-full px-8 mt-6 max-h-[60vh] overflow-y-auto">
          {results.map((r, i) => (
            <div key={i} className="flex items-center gap-4 py-3 border-b border-clavier-border cursor-pointer hover:bg-clavier-bg-2/50 px-2">
              <div className="w-12 h-12 bg-[#0D0D0D] border border-clavier-border flex items-center justify-center flex-shrink-0">
                <img src="/assets/hero-CLDdwZDr.png" alt="" className="max-h-[80%] object-contain" />
              </div>
              <div className="flex-1">
                <p className="font-playfair text-sm text-clavier-cream">{r.name}</p>
                <p className="font-inter text-[11px] text-clavier-dim uppercase">{r.category}</p>
              </div>
              <span className="font-cormorant text-base text-clavier-cream ml-auto">{r.price}</span>
            </div>
          ))}
        </div>
      )}

      {query.length > 2 && results.length === 0 && (
        <p className="font-cormorant italic text-2xl text-clavier-dim mt-8">No results for "{query}"</p>
      )}
    </div>
  );
}

/* ── Mobile Nav Overlay ── */
function MobileNavOverlay({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-clavier-bg flex flex-col">
      {/* Close button */}
      <button onClick={onClose} className="absolute top-6 right-6 text-clavier-dim hover:text-clavier-cream transition-colors">
        <X className="w-6 h-6" />
      </button>

      {/* Nav Links */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        {['Home', 'Shop', 'Switches', 'Accessories', 'About'].map(link => (
          <span key={link} className="font-cormorant text-[36px] text-clavier-cream cursor-pointer hover:text-clavier-orange transition-colors">
            {link}
          </span>
        ))}
      </div>

      {/* Cart row */}
      <div className="border-t border-clavier-border py-6 px-8 flex items-center justify-center gap-4">
        <ShoppingCart className="w-5 h-5 text-clavier-muted" />
        <span className="font-inter text-sm text-clavier-muted">Cart (3 items)</span>
      </div>
    </div>
  );
}

/* ── Toast Notifications (§5.26) ── */
function ToastContainer({ toasts }) {
  const typeStyles = {
    success: 'border-clavier-success',
    error: 'border-clavier-red',
    warning: 'border-clavier-warning',
    info: 'border-clavier-orange',
  };
  const typeIcons = {
    success: Check,
    error: AlertCircle,
    warning: AlertCircle,
    info: Info,
  };
  const typeIconColors = {
    success: 'text-clavier-success',
    error: 'text-clavier-red',
    warning: 'text-clavier-warning',
    info: 'text-clavier-orange',
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map(toast => {
        const Icon = typeIcons[toast.type];
        return (
          <div
            key={toast.id}
            className={`bg-clavier-bg-3 border-l-[3px] ${typeStyles[toast.type]} px-5 py-4 shadow-2xl max-w-[320px] animate-[slideInRight_250ms_ease_forwards]`}
          >
            <style>{`
              @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
              }
            `}</style>
            <div className="flex items-start gap-3">
              <Icon className={`w-[18px] h-[18px] flex-shrink-0 mt-0.5 ${typeIconColors[toast.type]}`} />
              <div>
                <p className="font-inter text-sm text-clavier-cream font-medium">{toast.title}</p>
                <p className="font-inter text-xs text-clavier-muted mt-0.5">{toast.body}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
