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
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    if (!user && !loading) {
      navigate('/login', { state: { from: { pathname: '/cart' } } });
    }
  }, [user, loading, navigate]);

  const normalizeCart = (data) => {
    if (!data) return null;
    if (Array.isArray(data)) {
      return { items: [] };
    }
    return { items: data.cartItems || [] };
  };

  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      try {
        const res = await api.get('/cart');
        setCart(normalizeCart(res.data.data));
        setError(null);
      } catch (err) {
        if (err.response?.status !== 401) {
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

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    setUpdating(productId);
    try {
      await api.patch('/cart', { productId, quantity: newQuantity });
      const cartRes = await api.get('/cart');
      setCart(normalizeCart(cartRes.data.data));
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to update quantity');
      setTimeout(() => setError(null), 3000);
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (productId) => {
    setUpdating(productId);
    try {
      await api.delete(`/cart/items/${productId}`);
      await fetchCart();
      const res = await api.get('/cart');
      setCart(normalizeCart(res.data.data));
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to remove item');
      setTimeout(() => setError(null), 3000);
    } finally {
      setUpdating(null);
    }
  };

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

  const subtotal = cart?.items?.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity, 0
  ) || 0;
  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  if (loading) {
    return (
      <div className="bg-stone-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 flex gap-6">
                <div className="w-24 h-24 bg-stone-200 rounded-xl" />
                <div className="flex-1 space-y-3">
                  <div className="h-5 bg-stone-200 rounded w-1/3" />
                  <div className="h-4 bg-stone-200 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-stone-900 mb-3">Sign in to view your cart</h1>
          <p className="text-stone-500 mb-8">You need to be logged in to view your shopping cart.</p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center bg-stone-900 text-white px-8 py-3 rounded-xl font-medium hover:bg-stone-800 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (!cart?.items?.length) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-stone-900 mb-3">Your cart is empty</h1>
          <p className="text-stone-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
          <Link
            to="/shop"
            className="inline-flex items-center justify-center bg-stone-900 text-white px-8 py-3 rounded-xl font-medium hover:bg-stone-800 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-stone-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-stone-900">Shopping Cart</h1>
              <p className="text-stone-500 mt-1">{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
            </div>
            <button
              onClick={handleClearCart}
              disabled={updating === 'clearing'}
              className="text-sm text-stone-500 hover:text-red-500 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              {updating === 'clearing' ? 'Clearing...' : 'Clear Cart'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
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
                  className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                    {/* Product Image */}
                    <Link to={`/products/${productId}`} className="shrink-0">
                      <div className="w-24 h-24 sm:w-32 sm:h-32 bg-stone-100 rounded-xl overflow-hidden">
                        {item.product?.images || item.product?.imageURL ? (
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
                    <div className="flex-1 flex flex-col">
                      <div>
                        <Link
                          to={`/products/${productId}`}
                          className="font-semibold text-stone-900 hover:text-stone-600 transition-colors"
                        >
                          {item.product?.title}
                        </Link>
                        <p className="text-stone-600 mt-1">${item.product?.price}</p>
                      </div>

                      <div className="flex items-center justify-between gap-4 mt-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center bg-stone-50 rounded-xl overflow-hidden border border-stone-200">
                          <button
                            onClick={() => updateQuantity(productId, item.quantity - 1)}
                            disabled={updating === productId || item.quantity <= 1}
                            className="px-4 py-3 text-stone-600 hover:bg-stone-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="px-6 py-3 min-w-16 text-center font-semibold text-stone-900 border-x border-stone-200 bg-white">
                            {updating === productId ? '...' : item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(productId, item.quantity + 1)}
                            disabled={updating === productId || item.quantity >= item.product?.stock}
                            className="px-4 py-3 text-stone-600 hover:bg-stone-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>

                        {/* Item Total & Remove */}
                        <div className="flex items-center gap-4">
                          <span className="text-lg font-bold text-stone-900">
                            ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                          </span>
                          <button
                            onClick={() => removeItem(productId)}
                            disabled={updating === productId}
                            className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
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
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-6">
              <h2 className="text-lg font-semibold text-stone-900 mb-6">Order Summary</h2>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal ({itemCount} items)</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
              </div>

              <div className="border-t border-stone-200 my-6" />

              <div className="flex justify-between font-bold text-xl text-stone-900 mb-6">
                <span>Total</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              <Link
                to="/checkout"
                className="flex items-center justify-center gap-2 w-full bg-stone-900 text-white py-4 rounded-xl font-medium hover:bg-stone-800 transition-colors"
              >
                Checkout
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>

              <Link
                to="/shop"
                className="flex items-center justify-center gap-2 w-full mt-3 text-stone-500 hover:text-stone-900 text-sm transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;