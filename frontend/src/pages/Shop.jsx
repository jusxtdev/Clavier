import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const SORT_OPTIONS = [
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'createdAt-desc', label: 'Newest' },
  { value: 'title-asc', label: 'Name: A-Z' },
];

function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 12;

  // Filter state from URL params
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = searchParams.get('sortOrder') || 'desc';

  // Local filter state (for inputs)
  const [localSearch, setLocalSearch] = useState(search);
  const [localMinPrice, setLocalMinPrice] = useState(minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories?limit=20');
        setCategories(res.data.data || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products when filters change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.set('page', currentPage);
        params.set('limit', limit);
        if (search) params.set('search', search);
        if (category) params.set('category', category);
        if (minPrice) params.set('minPrice', minPrice);
        if (maxPrice) params.set('maxPrice', maxPrice);
        if (sortBy) params.set('sortBy', sortBy);
        if (sortOrder) params.set('sortOrder', sortOrder);

        const res = await api.get(`/products?${params.toString()}`);
        setProducts(res.data.data || []);
        setTotalItems(res.data.totalItems || 0);
      } catch (err) {
        setError('Failed to load products. Please try again.');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [search, category, minPrice, maxPrice, sortBy, sortOrder, currentPage]);

  // Sync local state when URL changes
  useEffect(() => {
    setLocalSearch(search);
    setLocalMinPrice(minPrice);
    setLocalMaxPrice(maxPrice);
  }, [search, minPrice, maxPrice]);

  const updateFilters = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    // Reset page when filters change
    newParams.set('page', '1');
    setSearchParams(newParams);
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateFilters({ search: localSearch });
  };

  const handleCategoryChange = (cat) => {
    updateFilters({ category: cat === category ? '' : cat });
  };

  const handlePriceChange = () => {
    updateFilters({ minPrice: localMinPrice, maxPrice: localMaxPrice });
  };

  const handleSortChange = (value) => {
    const [newSortBy, newSortOrder] = value.split('-');
    updateFilters({ sortBy: newSortBy, sortOrder: newSortOrder });
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
    setLocalSearch('');
    setLocalMinPrice('');
    setLocalMaxPrice('');
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalItems / limit);

  const FilterSidebar = () => (
    <div className="space-y-8">
      {/* Search */}
      <div>
        <h3 className="text-sm font-semibold text-stone-900 mb-3">Search</h3>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search products..."
            className="flex-1 px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
          />
          <button
            type="submit"
            className="px-3 py-2 bg-stone-900 text-white rounded-lg text-sm hover:bg-stone-800"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>
      </div>

      {/* Categories */}
      <div>
        <h3 className="text-sm font-semibold text-stone-900 mb-3">Category</h3>
        <div className="space-y-2">
          {categories.map((cat) => (
            <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="category"
                checked={category === cat.title}
                onChange={() => handleCategoryChange(cat.title)}
                className="w-4 h-4 text-stone-900 border-stone-300 focus:ring-stone-900"
              />
              <span className="text-sm text-stone-600 capitalize">{cat.title}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-sm font-semibold text-stone-900 mb-3">Price Range</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={localMinPrice}
            onChange={(e) => setLocalMinPrice(e.target.value)}
            placeholder="Min"
            className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
          />
          <span className="text-stone-400">—</span>
          <input
            type="number"
            value={localMaxPrice}
            onChange={(e) => setLocalMaxPrice(e.target.value)}
            placeholder="Max"
            className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
          />
        </div>
        <button
          onClick={handlePriceChange}
          className="mt-2 w-full px-3 py-2 border border-stone-300 rounded-lg text-sm text-stone-600 hover:bg-stone-50"
        >
          Apply
        </button>
      </div>

      {/* Clear Filters */}
      {(search || category || minPrice || maxPrice) && (
        <button
          onClick={clearFilters}
          className="text-sm text-stone-500 hover:text-stone-900 underline"
        >
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-24">
            <FilterSidebar />
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-semibold text-stone-900">Shop</h1>
              <p className="text-stone-500 mt-1">
                {totalItems} {totalItems === 1 ? 'product' : 'products'}
                {category && ` in ${category}`}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Mobile filter button */}
              <button
                onClick={() => setIsMobileFiltersOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 border border-stone-300 rounded-lg text-sm text-stone-700 hover:bg-stone-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
              </button>

              {/* Sort dropdown */}
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-4 py-2 border border-stone-300 rounded-lg text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Error state */}
          {error && (
            <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-600 text-center">
              {error}
            </div>
          )}

          {/* Loading state */}
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm animate-pulse">
                  <div className="aspect-square bg-stone-200 rounded-t-xl" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-stone-200 rounded w-3/4" />
                    <div className="h-4 bg-stone-200 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-stone-500 mb-4">No products found</p>
              {(search || category || minPrice || maxPrice) && (
                <button
                  onClick={clearFilters}
                  className="text-stone-900 font-medium underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Product Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Link
                    key={product.id}
                    to={`/products/${product.id}`}
                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                  >
                    <div className="aspect-square bg-stone-100">
                      {product.images || product.imageURL ? (
                        <img
                          src={product.images || product.imageURL}
                          alt={product.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        className="w-full h-full flex items-center justify-center text-stone-400"
                        style={{ display: product.images || product.imageURL ? 'none' : 'flex' }}
                      >
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-stone-900 truncate">{product.title}</h3>
                      <p className="text-stone-600 mt-1">${product.price}</p>
                      {product.stock === 0 && (
                        <span className="text-xs text-red-500 mt-1 block font-medium">Out of Stock</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  <button
                    onClick={() => {
                      const newPage = currentPage - 1;
                      setCurrentPage(newPage);
                      const newParams = new URLSearchParams(searchParams);
                      newParams.set('page', newPage);
                      setSearchParams(newParams);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-stone-300 rounded-lg text-sm text-stone-700 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  <span className="px-4 py-2 text-sm text-stone-600">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() => {
                      const newPage = currentPage + 1;
                      setCurrentPage(newPage);
                      const newParams = new URLSearchParams(searchParams);
                      newParams.set('page', newPage);
                      setSearchParams(newParams);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-stone-300 rounded-lg text-sm text-stone-700 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsMobileFiltersOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-full bg-white p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-stone-900">Filters</h2>
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="p-2 text-stone-500 hover:text-stone-900"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <FilterSidebar />
          </div>
        </div>
      )}
    </div>
  );
}

export default Shop;
