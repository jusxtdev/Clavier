import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';

const API_BASE = import.meta.env.VITE_BACKEND_URL
  ? `${import.meta.env.VITE_BACKEND_URL}/api`
  : 'http://localhost:3000/api';

/* ─────────────────────────────────────────────
   MOCK DATA — fallback when backend is unavailable
   ────────────────────────────────────────────── */
const MOCK_PRODUCTS = [
  {
    id: 1, title: 'Clavier 65% Pro', description: 'Gasket-mounted 65% with hotswap 3/5-pin switches, aluminum top plate, and south-facing RGB.',
    price: '8999', stock: 42, images: '/assets/hero-CLDdwZDr.png',
    categories: [{ category: { title: '65%' } }, { category: { title: 'hotswap' } }],
  },
  {
    id: 2, title: 'Clavier TKL Elite', description: 'Tenkeyless aluminum board with silent linear switches, PBT keycaps, and USB-C passthrough.',
    price: '12499', stock: 18, images: '/assets/hero-CLDdwZDr.png',
    categories: [{ category: { title: 'tkl' } }, { category: { title: 'silent' } }],
  },
  {
    id: 3, title: 'Clavier 75% Wireless', description: 'Bluetooth 5.0 + USB-C wireless 75% with gasket mount, POM plate, and 4000mAh battery.',
    price: '10999', stock: 7, images: '/assets/hero-CLDdwZDr.png',
    categories: [{ category: { title: '75%' } }, { category: { title: 'wireless' } }],
  },
  {
    id: 4, title: 'Clavier Full-Size Luxe', description: 'Full-size with numpad, silent tactile switches, and premium foam dampening.',
    price: '14999', stock: 3, images: '/assets/hero-CLDdwZDr.png',
    categories: [{ category: { title: 'full' } }, { category: { title: 'silent' } }],
  },
  {
    id: 5, title: 'Clavier 60% Compact', description: 'Ultra-compact 60% with clicky blue switches and RGB per-key lighting.',
    price: '5999', stock: 55, images: '/assets/hero-CLDdwZDr.png',
    categories: [{ category: { title: '60%' } }, { category: { title: 'rgb' } }],
  },
  {
    id: 6, title: 'Clavier Macro Pad', description: '3×3 macro pad with rotary encoder, OLED display, and customizable layouts.',
    price: '3499', stock: 30, images: '/assets/hero-CLDdwZDr.png',
    categories: [{ category: { title: 'accessories' } }, { category: { title: 'rgb' } }],
  },
  {
    id: 7, title: 'Clavier Split Ergo', description: 'Ergonomic split keyboard with tenting, ortholinear layout, and hotswap sockets.',
    price: '16999', stock: 5, images: '/assets/hero-CLDdwZDr.png',
    categories: [{ category: { title: 'ergonomic' } }, { category: { title: 'hotswap' } }],
  },
  {
    id: 8, title: 'Clavier 96% Gasket', description: '96% layout with gasket mount, pre-lubed switches, and FR4 plate.',
    price: '11499', stock: 0, images: '/assets/hero-CLDdwZDr.png',
    categories: [{ category: { title: '96%' } }, { category: { title: 'gasket' } }],
  },
];

/* Extract all unique category titles from products */
function getCategoryOptions(products) {
  const set = new Set();
  products.forEach(p => p.categories?.forEach(c => set.add(c.category.title)));
  return Array.from(set).sort();
}

const SWITCH_OPTIONS = ['Linear', 'Tactile', 'Clicky', 'Silent'];
const FEATURE_OPTIONS = ['Hot-swap', 'RGB', 'Wireless', 'Gasket Mount'];

const PRICE_RANGES = [
  { label: 'Under ₹5,000', min: 0, max: 4999 },
  { label: '₹5,000 – ₹10,000', min: 5000, max: 9999 },
  { label: '10,000 – ₹15,000', min: 10000, max: 14999 },
  { label: '₹15,000+', min: 15000, max: Infinity },
];

const SORT_OPTIONS = [
  { value: 'createdAt-desc', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
  { value: 'title-asc', label: 'Name: A → Z' },
  { value: 'stock-desc', label: 'Stock: Most' },
];

export default function ProductsPage() {
  /* ── State ── */
  const [products, setProducts] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priceRange, setPriceRange] = useState(null);
  const [switchFilter, setSwitchFilter] = useState('');
  const [featureFilters, setFeatureFilters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  /* ── Fetch products from API ── */
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      sortBy,
      sortOrder,
    });

    if (search) params.set('search', search);
    if (categoryFilter) params.set('category', categoryFilter);
    if (priceRange) {
      if (priceRange.min > 0) params.set('minPrice', String(priceRange.min));
      if (priceRange.max !== Infinity) params.set('maxPrice', String(priceRange.max));
    }
    if (switchFilter) params.set('search', search ? `${search} ${switchFilter}` : switchFilter);

    try {
      const res = await fetch(`${API_BASE}/products?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.status && json.data) {
        setProducts(json.data);
        setTotalItems(json.totalItems || 0);
      } else {
        throw new Error(json.msg || 'Failed to fetch products');
      }
    } catch (err) {
      console.warn('Backend fetch failed, falling back to mock data:', err.message);
      // Fallback: apply filters to mock data locally
      applyMockFilters();
    } finally {
      setLoading(false);
    }
  }, [page, limit, sortBy, sortOrder, search, categoryFilter, priceRange, switchFilter, featureFilters]);

  /* ── Mock data fallback with local filtering ── */
  function applyMockFilters() {
    let result = [...MOCK_PRODUCTS];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }
    if (categoryFilter) {
      result = result.filter(p =>
        p.categories?.some(c => c.category.title === categoryFilter)
      );
    }
    if (priceRange) {
      const price = typeof MOCK_PRODUCTS[0]?.price === 'string'
        ? Number(MOCK_PRODUCTS[0].price)
        : MOCK_PRODUCTS[0].price;
      result = result.filter(p => {
        const pPrice = typeof p.price === 'string' ? Number(p.price) : p.price;
        return pPrice >= priceRange.min && pPrice <= priceRange.max;
      });
    }
    if (switchFilter) {
      result = result.filter(p => p.description.toLowerCase().includes(switchFilter.toLowerCase()));
    }
    if (featureFilters.length > 0) {
      result = result.filter(p =>
        featureFilters.every(f => p.description.toLowerCase().includes(f.toLowerCase()))
      );
    }

    // Sort mock
    result.sort((a, b) => {
      const aPrice = typeof a.price === 'string' ? Number(a.price) : a.price;
      const bPrice = typeof b.price === 'string' ? Number(b.price) : b.price;
      if (sortBy === 'price') return sortOrder === 'asc' ? aPrice - bPrice : bPrice - aPrice;
      if (sortBy === 'stock') return sortOrder === 'asc' ? a.stock - b.stock : b.stock - a.stock;
      if (sortBy === 'title') return sortOrder === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
      return 0;
    });

    setProducts(result);
    setTotalItems(result.length);
    setLoading(false);
  }

  /* ── Refetch on filter change ── */
  useEffect(() => {
    setPage(1);
  }, [search, categoryFilter, priceRange, switchFilter, featureFilters, sortBy, sortOrder]);

  useEffect(() => {
    fetchProducts();
  }, [page, limit, sortBy, sortOrder, search, categoryFilter, priceRange, switchFilter, featureFilters]);

  /* ── Derived values ── */
  const categoryOptions = getCategoryOptions(products);
  const totalPages = Math.ceil(totalItems / limit);

  /* ─ Active filter pills ── */
  const activeFilters = [];
  if (categoryFilter) activeFilters.push({ label: categoryFilter, clear: () => setCategoryFilter('') });
  if (priceRange) activeFilters.push({ label: priceRange.label, clear: () => setPriceRange(null) });
  if (switchFilter) activeFilters.push({ label: switchFilter, clear: () => setSwitchFilter('') });
  featureFilters.forEach(f => activeFilters.push({ label: f, clear: () => setFeatureFilters(prev => prev.filter(x => x !== f)) }));

  const toggleFeature = (f) => {
    setFeatureFilters(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);
  };

  const clearAll = () => {
    setCategoryFilter('');
    setPriceRange(null);
    setSwitchFilter('');
    setFeatureFilters([]);
    setSearch('');
  };

  return (
    <div className="bg-clavier-bg text-clavier-cream min-h-screen">
      <Navbar />

      {/* ── Page Header ── */}
      <div className="max-w-[1280px] mx-auto px-8 pt-28 pb-8">
        {/* Breadcrumb */}
        <p className="font-inter text-xs text-clavier-dim tracking-wide">
          <Link to="/" className="hover:text-clavier-muted transition-colors">Home</Link>
          <span className="mx-2 text-clavier-border-b">/</span>
          <span className="text-clavier-muted">Products</span>
        </p>

        {/* Heading row */}
        <div className="flex items-end justify-between flex-wrap gap-4 mt-4">
          <div>
            <h1 className="font-cormorant text-[40px] lg:text-[48px] text-clavier-cream">
              The <span className="font-playfair italic text-clavier-orange underline decoration-clavier-orange/60">Collection</span>
            </h1>
            <p className="font-inter text-sm text-clavier-muted mt-1">
              {loading ? 'Loading...' : `${totalItems} product${totalItems !== 1 ? 's' : ''}`}
            </p>
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="flex items-center gap-2 font-inter text-xs text-clavier-muted border border-clavier-border px-4 py-2 hover:text-clavier-cream transition-colors"
            >
              Sort by: {SORT_OPTIONS.find(s => s.value === `${sortBy}-${sortOrder}`)?.label || 'Newest'}
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-clavier-bg-3 border border-clavier-border z-30 py-2">
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      const [f, o] = opt.value.split('-');
                      setSortBy(f);
                      setSortOrder(o);
                      setSortOpen(false);
                    }}
                    className={`w-full text-left font-inter text-xs px-4 py-2 transition-colors ${
                      sortBy === opt.value.split('-')[0] && sortOrder === opt.value.split('-')[1]
                        ? 'text-clavier-cream bg-clavier-bg-2'
                        : 'text-clavier-muted hover:text-clavier-cream hover:bg-clavier-bg-2'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Active filter pills */}
        {activeFilters.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mt-6">
            <span className="font-inter text-[11px] text-clavier-dim uppercase tracking-wider">Filters:</span>
            {activeFilters.map((f, i) => (
              <span key={i} className="inline-flex items-center font-inter text-xs bg-clavier-bg-3 border border-clavier-border text-clavier-cream px-3 py-1.5">
                {f.label}
                <button onClick={f.clear} className="ml-2 text-clavier-dim hover:text-clavier-red transition-colors">×</button>
              </span>
            ))}
            <button onClick={clearAll} className="font-inter text-xs text-clavier-red hover:underline ml-2">Clear all</button>
          </div>
        )}

        {/* Mobile filter toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden flex items-center gap-2 font-inter text-xs text-clavier-muted border border-clavier-border px-4 py-2 mt-6 hover:text-clavier-cream transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" /> Filters
        </button>
      </div>

      {/* ── Main: Sidebar + Grid ─ */}
      <div className="max-w-[1280px] mx-auto px-8 pb-24 flex gap-8">

        {/* Sidebar — Desktop */}
        <aside className="hidden lg:block w-[240px] flex-shrink-0">
          <FilterSidebar
            categoryOptions={categoryOptions}
            categoryFilter={categoryFilter}
            onCategoryChange={setCategoryFilter}
            switchOptions={SWITCH_OPTIONS}
            switchFilter={switchFilter}
            onSwitchChange={setSwitchFilter}
            priceRanges={PRICE_RANGES}
            priceRange={priceRange}
            onPriceRangeChange={setPriceRange}
            featureOptions={FEATURE_OPTIONS}
            featureFilters={featureFilters}
            onFeatureToggle={toggleFeature}
            onClearAll={clearAll}
          />
        </aside>

        {/* Sidebar — Mobile overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-clavier-bg/80" onClick={() => setSidebarOpen(false)} />
            <div className="absolute bottom-0 left-0 right-0 bg-clavier-bg-2 border-t border-clavier-border max-h-[80vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-6">
                <span className="font-inter text-sm text-clavier-cream font-medium">Filters</span>
                <button onClick={() => setSidebarOpen(false)} className="text-clavier-dim hover:text-clavier-cream">
                  ×
                </button>
              </div>
              <FilterSidebar
                categoryOptions={categoryOptions}
                categoryFilter={categoryFilter}
                onCategoryChange={setCategoryFilter}
                switchOptions={SWITCH_OPTIONS}
                switchFilter={switchFilter}
                onSwitchChange={setSwitchFilter}
                priceRanges={PRICE_RANGES}
                priceRange={priceRange}
                onPriceRangeChange={setPriceRange}
                featureOptions={FEATURE_OPTIONS}
                featureFilters={featureFilters}
                onFeatureToggle={toggleFeature}
                onClearAll={clearAll}
              />
            </div>
          </div>
        )}

        {/* Product Grid */}
        <div className="flex-1 min-w-0">
          {loading ? (
            /* ── Skeleton loading state ── */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="bg-clavier-bg-2 border border-clavier-border aspect-[4/3] animate-pulse" />
              ))}
            </div>
          ) : error ? (
            /* ── Error state ── */
            <div className="flex flex-col items-center py-20 gap-4">
              <p className="font-cormorant italic text-[28px] text-clavier-dim">{error}</p>
              <button
                onClick={fetchProducts}
                className="font-inter text-xs border border-clavier-border text-clavier-muted px-6 py-3 hover:text-clavier-cream hover:border-clavier-cream transition-colors"
              >
                Retry
              </button>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            /* ── Empty state ── */
            <div className="flex flex-col items-center py-20 gap-4">
              <p className="font-cormorant italic text-[28px] text-clavier-dim">
                No keyboards match your filters.
              </p>
              <button
                onClick={clearAll}
                className="font-inter text-xs border border-clavier-border text-clavier-muted px-6 py-3 hover:text-clavier-cream hover:border-clavier-cream transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 font-inter text-sm text-clavier-muted hover:text-clavier-cream transition-colors disabled:text-clavier-border disabled:cursor-not-allowed"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 font-inter text-sm flex items-center justify-center transition-colors ${
                    p === page
                      ? 'text-clavier-cream bg-clavier-bg-3 border border-clavier-border-b'
                      : 'text-clavier-dim hover:text-clavier-muted border border-transparent hover:border-clavier-border'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1 font-inter text-sm text-clavier-muted hover:text-clavier-cream transition-colors disabled:text-clavier-border disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Close sort dropdown on outside click */}
      {sortOpen && (
        <div className="fixed inset-0 z-20" onClick={() => setSortOpen(false)} />
      )}
    </div>
  );
}
