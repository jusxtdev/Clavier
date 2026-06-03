import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, ShoppingCart, Star } from 'lucide-react';

function getBadge(product) {
  if (product.stock === 0) return { label: 'SOLD OUT', variant: 'out' };
  if (product.stock <= 5) return { label: 'LOW STOCK', variant: 'warning' };
  // Check if recently added (within 7 days) — use createdAt if available
  if (product.createdAt) {
    const age = (Date.now() - new Date(product.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    if (age < 7) return { label: 'NEW', variant: 'default' };
  }
  return null;
}

function getVariantLabel(product) {
  const cats = product.categories?.map(c => c.category.title) || [];
  const desc = product.description || '';
  const parts = [];

  // Layout from categories
  const layout = cats.find(c => /\d+%?/.test(c));
  if (layout) parts.push(layout);

  // Switch type from description
  const sw = desc.match(/(linear|tactile|clicky|silent)/i)?.[0];
  if (sw) parts.push(sw.charAt(0).toUpperCase() + sw.slice(1));

  // Features
  if (desc.toLowerCase().includes('hotswap') || desc.toLowerCase().includes('hot-swap')) parts.push('Hotswap');
  if (desc.toLowerCase().includes('rgb')) parts.push('RGB');
  if (desc.toLowerCase().includes('wireless')) parts.push('Wireless');

  if (parts.length === 0 && cats.length > 0) {
    return cats.join(' · ').charAt(0).toUpperCase() + cats.join(' · ').slice(1);
  }

  return parts.length > 0 ? parts.join(' · ') : 'Standard';
}

function getRating(product) {
  // Deterministic pseudo-rating from id
  const base = 4 + ((product.id * 7) % 10) / 10;
  const reviews = 20 + (product.id * 37) % 180;
  return { rating: Math.round(base * 10) / 10, reviews };
}

export default function ProductCard({ product }) {
  const [wishlisted, setWishlisted] = useState(false);
  const badge = getBadge(product);
  const variant = getVariantLabel(product);
  const { rating, reviews } = getRating(product);

  return (
    <Link
      to={`/products/${product.id}`}
      className="block group"
    >
      <div className="bg-clavier-bg-2 border border-clavier-border group-hover:border-clavier-border-b group-hover:-translate-y-1 transition-all duration-300">
        {/* ── Image Area ── */}
        <div className="relative bg-[#0D0D0D] aspect-[4/3] p-4 flex items-center justify-center overflow-hidden">
          {/* Bottom vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-clavier-bg-2 via-transparent to-transparent z-[1]" style={{ opacity: 0.9 }} />

          {/* Badge */}
          {badge && (
            <span className={`absolute top-3 left-3 z-10 font-inter text-[10px] tracking-widest px-2 py-1 ${
              badge.variant === 'warning'
                ? 'bg-clavier-warning text-clavier-cream'
                : badge.variant === 'out'
                  ? 'bg-clavier-border text-clavier-dim'
                  : 'bg-clavier-red text-clavier-cream'
            }`}>
              {badge.label}
            </span>
          )}

          {/* Wishlist */}
          <button
            onClick={e => { e.preventDefault(); setWishlisted(!wishlisted); }}
            className={`absolute top-3 right-3 z-10 bg-clavier-bg-2 border p-2 transition-colors ${
              wishlisted
                ? 'border-clavier-red'
                : 'border-clavier-border hover:border-clavier-red'
            }`}
          >
            <Heart
              className={`w-[18px] h-[18px] transition-colors ${
                wishlisted ? 'text-clavier-red fill-clavier-red' : 'text-clavier-dim'
              }`}
            />
          </button>

          {/* Product Image */}
          {product.images ? (
            <img
              src={product.images}
              alt={product.title}
              className="relative z-0 max-h-[80%] max-w-[90%] object-contain group-hover:scale-[1.03] transition-transform duration-400"
            />
          ) : (
            <div className="relative z-0 w-16 h-16 bg-clavier-bg-3 rounded-sm" />
          )}
        </div>

        {/* ── Info Area ── */}
        <div className="px-5 pb-5 pt-4 flex flex-col gap-2">
          {/* Category */}
          <span className="font-inter text-[10px] text-clavier-dim tracking-widest uppercase">
            {product.categories?.[0]?.category?.title || 'KEYBOARD'}
          </span>

          {/* Name */}
          <h3 className="font-playfair text-[17px] text-clavier-cream leading-tight group-hover:text-clavier-orange transition-colors duration-200">
            {product.title}
          </h3>

          {/* Variant */}
          <span className="font-inter text-xs text-clavier-dim">{variant}</span>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map(i => (
                <Star
                  key={i}
                  size={12}
                  fill={i <= Math.round(rating) ? '#D4621A' : 'none'}
                  stroke={i <= Math.round(rating) ? '#D4621A' : '#2A2520'}
                />
              ))}
            </div>
            <span className="font-inter text-[11px] text-clavier-dim">({reviews})</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3 mt-1">
            <span className="font-cormorant text-xl text-clavier-cream">
              ₹{Number(product.price).toLocaleString('en-IN')}
            </span>
          </div>

          {/* CTA Row */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-clavier-border">
            {product.stock > 0 ? (
              <button
                onClick={e => e.preventDefault()}
                className="flex items-center gap-1.5 group/atc"
              >
                <span className="text-clavier-red font-semibold text-base group-hover/atc:brightness-125 transition-all">[</span>
                <span className="font-inter text-xs text-clavier-cream tracking-wide group-hover/atc:text-clavier-red transition-colors duration-200">
                  Add to Cart
                </span>
                <span className="text-clavier-red font-semibold text-base group-hover/atc:brightness-125 transition-all">]</span>
              </button>
            ) : (
              <span className="font-inter text-xs text-clavier-dim">Sold Out</span>
            )}
            <button
              onClick={e => e.preventDefault()}
              className="text-clavier-dim hover:text-clavier-cream transition-colors"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
