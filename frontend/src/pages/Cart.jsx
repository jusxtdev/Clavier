import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuthStore } from '../stores/useAuthStore';
import { useCartStore } from '../stores/useCartStore';

function Cart() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const fetchCart = useCartStore((state) => state.fetchCart);
  const clearCartStore = useCartStore((state) => state.clearCart);

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(null); // Track which item is being updated

  // Redirect if not logged in
  useEffect(() => {
    if (!user && !loading) {
      navigate('/login', { state: { from: { pathname: '/cart' } } });
    }
  }, [user, loading, navigate]);

  // Normalize cart data - backend returns array when empty, object with cartItems when populated
  const normalizeCart = (data) => {
    if (!data) return null;
    if (Array.isArray(data)) {
      // Empty cart returns array, convert to items format
      return { items: [] };
    }
    // Non-empty cart has cartItems array, convert to items format
    return { items: data.cartItems || [] };
  };

  // Fetch cart
  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      try {
        const res = await api.get('/cart');
        setCart(normalizeCart(res.data.data));
        setError(null);
      } catch (err) {
        if (err.response?.status === 401) {
          // Not logged in - handled by useEffect above
        } else {
          setError('Failed to load cart');
        }
        console.error('Error fetching cart:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadCart();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Update quantity
  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    setUpdating(productId);
    try {
      const res = await api.patch('/cart', {
        productId,
        quantity: newQuantity,
      });
      // Backend returns updated cart item, refetch full cart
      const cartRes = await api.get('/cart');
      setCart(normalizeCart(cartRes.data.data));
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to update quantity');
      setTimeout(() => setError(null), 3000);
    } finally {
      setUpdating(null);
    }
  };

  // Remove item
  const removeItem = async (productId) => {
    setUpdating(productId);
    try {
      await api.delete(`/cart/items/${productId}`);
      await fetchCart();
      // Refresh cart data
      const res = await api.get('/cart');
      setCart(normalizeCart(res.data.data));
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to remove item');
      setTimeout(() => setError(null), 3000);
    } finally {
      setUpdating(null);
    }
  };

  // Clear cart
  const handleClearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your cart?')) return;

    setUpdating('clearing');
    try {
      await api.delete('/cart/items');
      setCart({ items: [] });
      clearCartStore();
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to clear cart');
      setTimeout(() => setError(null), 3000);
    } finally {
      setUpdating(null);
    }
  };

  // Calculate totals
  const subtotal = cart?.items?.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  ) || 0;
  const itemCount = cart?.items?.reduce(
    (sum, item) => sum + item.quantity,
    0
  ) || 0;

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-semibold text-stone-900 mb-8">Your Cart</h1>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 flex gap-6">
              <div className="w-24 h-24 bg-stone-200 rounded-lg" />
              <div className="flex-1 space-y-3">
                <div className="h-5 bg-stone-200 rounded w-1/3" />
                <div className="h-4 bg-stone-200 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-12 text-center">
        <h1 className="text-2xl font-semibold text-stone-900 mb-4">Please sign in</h1>
        <p className="text-stone-500 mb-6">You need to be logged in to view your cart.</p>
        <Link
          to="/login"
          className="inline-block bg-stone-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-stone-800"
        >
          Sign In
        </Link>
      </div>
    );
  }

  // Empty cart state
  if (!cart?.items?.length) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-12 text-center">
        <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-stone-900 mb-4">Your cart is empty</h1>
        <p className="text-stone-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
        <Link
          to="/shop"
          className="inline-block bg-stone-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-stone-800"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-semibold text-stone-900">Your Cart</h1>
        <button
          onClick={handleClearCart}
          disabled={updating === 'clearing'}
          className="text-sm text-stone-500 hover:text-red-500 transition-colors"
        >
          {updating === 'clearing' ? 'Clearing...' : 'Clear Cart'}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => {
            const productId = item.product?.id;
            return (
            <div
              key={productId}
              className="bg-white rounded-xl shadow-sm p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6"
            >
              {/* Product Image */}
              <Link to={`/products/${productId}`} className="shrink-0">
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-stone-100 rounded-lg overflow-hidden">
                  {item.product.images || item.product.imageURL ? (
                    <img
                      src={item.product.images || item.product.imageURL}
                      alt={item.product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-400">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
              </Link>

              {/* Product Details */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <Link
                    to={`/products/${productId}`}
                    className="font-semibold text-stone-900 hover:text-stone-700"
                  >
                    {item.product.title}
                  </Link>
                  <p className="text-stone-600 mt-1">${item.product.price}</p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
                  {/* Quantity Controls */}
                  <div className="flex items-center border border-stone-300 rounded-lg">
                    <button
                      onClick={() => updateQuantity(productId, item.quantity - 1)}
                      disabled={updating === productId || item.quantity <= 1}
                      className="px-3 py-2 text-stone-600 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="px-4 py-2 min-w-12 text-center font-medium text-stone-900">
                      {updating === productId ? '...' : item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(productId, item.quantity + 1)}
                      disabled={updating === productId || item.quantity >= item.product.stock}
                      className="px-3 py-2 text-stone-600 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>

                  {/* Item Total & Remove */}
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-stone-900">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeItem(productId)}
                      disabled={updating === productId}
                      className="p-2 text-stone-400 hover:text-red-500 transition-colors disabled:opacity-50"
                      aria-label="Remove item"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-stone-900 mb-4">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-stone-600">
                <span>Items ({itemCount})</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
            </div>

            <div className="border-t border-stone-200 my-4" />

            <div className="flex justify-between font-semibold text-lg text-stone-900 mb-6">
              <span>Total</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>

            <Link
              to="/checkout"
              className="block w-full text-center bg-stone-900 text-white py-3 rounded-lg font-medium hover:bg-stone-800 transition-colors"
            >
              Proceed to Checkout
            </Link>

            <Link
              to="/shop"
              className="block w-full text-center mt-3 text-stone-500 hover:text-stone-900 text-sm"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;