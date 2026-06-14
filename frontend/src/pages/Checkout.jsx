import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuthStore } from '../stores/useAuthStore';
import { useCartStore } from '../stores/useCartStore';

function Checkout() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const fetchCart = useCartStore((state) => state.fetchCart);
  const clearCartStore = useCartStore((state) => state.clearCart);

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!user && !loading) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
    }
  }, [user, loading, navigate]);

  // Fetch cart
  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      try {
        const res = await api.get('/cart');
        // Normalize cart data (backend returns array when empty, object with cartItems when populated)
        const data = res.data.data;
        if (Array.isArray(data)) {
          setCart({ items: [] });
        } else {
          setCart({ items: data?.cartItems || [] });
        }
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

  // Calculate totals
  const subtotal = cart?.items?.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  ) || 0;
  const itemCount = cart?.items?.reduce(
    (sum, item) => sum + item.quantity,
    0
  ) || 0;

  // Place order
  const handlePlaceOrder = async () => {
    setPlacingOrder(true);
    setError(null);

    try {
      await api.post('/orders');
      // Clear cart from store and state
      clearCartStore();
      setCart({ items: [] });
      // Redirect to orders page with success message
      navigate('/orders', { state: { orderSuccess: true } });
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to place order. Please try again.');
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-semibold text-stone-900 mb-8">Checkout</h1>
        <div className="animate-pulse">
          <div className="bg-white rounded-xl p-6 max-w-lg">
            <div className="h-6 bg-stone-200 rounded w-1/3 mb-6" />
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 bg-stone-200 rounded w-1/2" />
                  <div className="h-4 bg-stone-200 rounded w-1/4" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-12 text-center">
        <h1 className="text-2xl font-semibold text-stone-900 mb-4">Please sign in</h1>
        <p className="text-stone-500 mb-6">You need to be logged in to checkout.</p>
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
        <p className="text-stone-500 mb-8">Add some items to your cart before checking out.</p>
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
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-semibold text-stone-900 mb-8">Checkout</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Order Summary */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-stone-900 mb-4">Order Summary</h2>

        {/* Items */}
        <div className="space-y-4 mb-6">
          {cart.items.map((item) => (
            <div key={item.product?.id} className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-stone-100 rounded-lg overflow-hidden">
                  {item.product?.images || item.product?.imageURL ? (
                    <img
                      src={item.product.images || item.product.imageURL}
                      alt={item.product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-400">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-stone-900">{item.product?.title}</p>
                  <p className="text-sm text-stone-500">Qty: {item.quantity}</p>
                </div>
              </div>
              <p className="font-medium text-stone-900">
                ${((item.product?.price || 0) * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        <div className="border-t border-stone-200 my-4" />

        {/* Totals */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-stone-600">
            <span>Subtotal ({itemCount} items)</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-stone-600">
            <span>Shipping</span>
            <span className="text-green-600">Free</span>
          </div>
        </div>

        <div className="border-t border-stone-200 my-4" />

        <div className="flex justify-between font-semibold text-lg text-stone-900">
          <span>Total</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Place Order Button */}
      <button
        onClick={handlePlaceOrder}
        disabled={placingOrder}
        className="w-full bg-stone-900 text-white py-4 rounded-lg font-medium hover:bg-stone-800 transition-colors disabled:opacity-50"
      >
        {placingOrder ? 'Placing Order...' : `Place Order - $${subtotal.toFixed(2)}`}
      </button>

      <Link
        to="/cart"
        className="block w-full text-center mt-4 text-stone-500 hover:text-stone-900 text-sm"
      >
        Back to Cart
      </Link>
    </div>
  );
}

export default Checkout;