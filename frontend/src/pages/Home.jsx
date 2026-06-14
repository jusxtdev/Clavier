import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useState, useEffect } from 'react';

function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          api.get('/products?limit=8&sortBy=createdAt&sortOrder=desc'),
          api.get('/categories?limit=20'),
        ]);
        setProducts(productsRes.data.data || []);
        setCategories(categoriesRes.data.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="w-full bg-white">
        <div className="max-w-6xl mx-auto px-6 py-24 text-center">
          <h1 className="text-5xl md:text-6xl font-semibold text-stone-900 mb-6">
            Precision at your fingertips
          </h1>
          <p className="text-xl text-stone-500 mb-10 max-w-2xl mx-auto">
            Discover premium mechanical keyboards crafted for gamers, professionals, and enthusiasts alike.
          </p>
          <Link
            to="/shop"
            className="inline-block bg-stone-900 text-white px-8 py-4 rounded-lg font-medium hover:bg-stone-800 transition-colors"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-semibold text-stone-900 mb-8">Categories</h2>
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/shop?category=${category.title}`}
              className="px-5 py-2 bg-white border border-stone-200 rounded-full text-stone-700 hover:border-stone-400 hover:text-stone-900 transition-colors"
            >
              {category.title}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <h2 className="text-2xl font-semibold text-stone-900 mb-8">Featured Products</h2>
        {loading ? (
          <div className="text-center py-12 text-stone-500">Loading...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
                    No Image
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-stone-900 truncate">{product.title}</h3>
                  <p className="text-stone-600 mt-1">${product.price}</p>
                  {product.stock === 0 && (
                    <span className="text-xs text-red-500 mt-1 block">Out of Stock</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;
