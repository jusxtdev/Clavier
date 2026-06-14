import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuthStore } from '../stores/useAuthStore';
import { useCartStore } from '../stores/useCartStore';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState(null);

  const user = useAuthStore((state) => state.user);
  const fetchCart = useCartStore((state) => state.fetchCart);

  // Fetch product
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data.data);

        // Fetch related products based on first category
        const categories = res.data.data.categories || [];
        if (categories.length > 0) {
          const relatedRes = await api.get(
            `/products?category=${categories[0].title}&limit=4`
          );
          // Filter out current product from related
          const related = (relatedRes.data.data || []).filter(
            (p) => p.id !== parseInt(id)
          );
          setRelatedProducts(related);
        }
      } catch (err) {
        setError('Product not found');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Reset quantity when product changes
  useEffect(() => {
    setQuantity(1);
  }, [product]);

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/products/${id}` } } });
      return;
    }

    setAddingToCart(true);
    setCartMessage(null);

    try {
      await api.post('/cart/items', {
        productId: product.id,
        quantity: quantity,
      });
      await fetchCart();
      setCartMessage({ type: 'success', text: 'Added to cart!' });
      // Clear message after 3 seconds
      setTimeout(() => setCartMessage(null), 3000);
    } catch (err) {
      setCartMessage({
        type: 'error',
        text: err.response?.data?.msg || 'Failed to add to cart',
      });
      setTimeout(() => setCartMessage(null), 3000);
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="aspect-square bg-stone-200 rounded-xl" />
            <div className="space-y-4">
              <div className="h-8 bg-stone-200 rounded w-3/4" />
              <div className="h-6 bg-stone-200 rounded w-1/4" />
              <div className="h-24 bg-stone-200 rounded" />
              <div className="h-12 bg-stone-200 rounded w-1/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-12 text-center">
        <h1 className="text-2xl font-semibold text-stone-900 mb-4">
          {error || 'Product not found'}
        </h1>
        <Link
          to="/shop"
          className="text-stone-900 font-medium hover:underline"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  const maxQuantity = product.stock;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Breadcrumb */}
      <nav className="mb-8 text-sm">
        <Link to="/" className="text-stone-500 hover:text-stone-900">
          Home
        </Link>
        <span className="mx-2 text-stone-400">/</span>
        <Link to="/shop" className="text-stone-500 hover:text-stone-900">
          Shop
        </Link>
        <span className="mx-2 text-stone-400">/</span>
        <span className="text-stone-900">{product.title}</span>
      </nav>

      {/* Product Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Image */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {product.images || product.imageURL ? (
            <img
              src={product.images || product.imageURL}
              alt={product.title}
              className="w-full aspect-square object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div
            className="w-full aspect-square bg-stone-100 flex items-center justify-center"
            style={{ display: product.images || product.imageURL ? 'none' : 'flex' }}
          >
            <svg
              className="w-24 h-24 text-stone-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <h1 className="text-3xl font-semibold text-stone-900 mb-2">
            {product.title}
          </h1>

          <p className="text-2xl font-semibold text-stone-900 mb-4">
            ${product.price}
          </p>

          {/* Categories */}
          {product.categories?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {product.categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/shop?category=${cat.title}`}
                  className="px-3 py-1 bg-stone-100 text-stone-600 text-sm rounded-full hover:bg-stone-200 transition-colors capitalize"
                >
                  {cat.title}
                </Link>
              ))}
            </div>
          )}

          {/* Stock Status */}
          <div className="mb-6">
            {product.stock > 0 ? (
              <p className="text-green-600 text-sm font-medium">
                {product.stock} in stock
              </p>
            ) : (
              <p className="text-red-500 text-sm font-medium">Out of stock</p>
            )}
          </div>

          {/* Description */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-stone-900 mb-2">
              Description
            </h3>
            <p className="text-stone-600 leading-relaxed">
              {product.description || 'No description available.'}
            </p>
          </div>

          {/* Quantity & Add to Cart */}
          {product.stock > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-stone-700">
                  Quantity:
                </label>
                <div className="flex items-center border border-stone-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="px-3 py-2 text-stone-600 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 12H4"
                      />
                    </svg>
                  </button>
                  <span className="px-4 py-2 min-w-15 text-center font-medium text-stone-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(maxQuantity, quantity + 1))
                    }
                    disabled={quantity >= maxQuantity}
                    className="px-3 py-2 text-stone-600 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={addingToCart}
                className="w-full sm:w-auto bg-stone-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-stone-800 transition-colors disabled:opacity-50"
              >
                {addingToCart ? 'Adding...' : 'Add to Cart'}
              </button>

              {/* Cart message */}
              {cartMessage && (
                <div
                  className={`p-3 rounded-lg text-sm ${
                    cartMessage.type === 'success'
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {cartMessage.text}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-stone-900 mb-6">
            Related Products
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((related) => (
              <Link
                key={related.id}
                to={`/products/${related.id}`}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="aspect-square bg-stone-100">
                  {related.images || related.imageURL ? (
                    <img
                      src={related.images || related.imageURL}
                      alt={related.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className="w-full h-full flex items-center justify-center text-stone-400"
                    style={{ display: related.images || related.imageURL ? 'none' : 'flex' }}
                  >
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-stone-900 text-sm truncate">
                    {related.title}
                  </h3>
                  <p className="text-stone-600 text-sm mt-1">
                    ${related.price}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default ProductDetail;
