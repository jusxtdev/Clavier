import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-purple-100 text-purple-800',
  SHIPPED: 'bg-green-100 text-green-800',
};

function OrderDetail() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch order
  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/orders/${id}`);
        setOrder(res.data.data);
        setError(null);
      } catch (err) {
        setError('Order not found');
        console.error('Error fetching order:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateTotal = () => {
    if (!order?.orderItems) return 0;
    return order.orderItems.reduce(
      (sum, item) => sum + Number(item.productPrice) * item.quantity,
      0
    );
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="h-8 bg-stone-200 rounded w-48 animate-pulse" />
        </div>
        <div className="animate-pulse bg-white rounded-xl p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="w-16 h-16 bg-stone-200 rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-stone-200 rounded w-1/2" />
                  <div className="h-3 bg-stone-200 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-12 text-center">
        <h1 className="text-2xl font-semibold text-stone-900 mb-4">
          {error || 'Order not found'}
        </h1>
        <Link
          to="/orders"
          className="text-stone-900 font-medium hover:underline"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Breadcrumb */}
      <nav className="mb-8 text-sm">
        <Link to="/orders" className="text-stone-500 hover:text-stone-900">
          Orders
        </Link>
        <span className="mx-2 text-stone-400">/</span>
        <span className="text-stone-900">Order #{order.id}</span>
      </nav>

      {/* Order Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-semibold text-stone-900">
                Order #{order.id}
              </h1>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${STATUS_COLORS[order.status] || 'bg-stone-100 text-stone-800'}`}>
                {order.status}
              </span>
            </div>
            <p className="text-stone-500">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-stone-900 mb-4">Items</h2>

        <div className="space-y-4">
          {order.orderItems?.map((item) => (
            <div key={item.id} className="flex items-center gap-4 py-4 border-b border-stone-100 last:border-0">
              <div className="w-16 h-16 bg-stone-100 rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-medium text-stone-900">{item.productTitle}</p>
                <p className="text-sm text-stone-500">Qty: {item.quantity}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-stone-900">
                  ${(Number(item.productPrice) * item.quantity).toFixed(2)}
                </p>
                <p className="text-sm text-stone-500">
                  ${Number(item.productPrice).toFixed(2)} each
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-stone-200 mt-6 pt-6">
          <div className="flex justify-between font-semibold text-lg text-stone-900">
            <span>Total</span>
            <span>${calculateTotal().toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Back to Orders */}
      <Link
        to="/orders"
        className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Orders
      </Link>
    </div>
  );
}

export default OrderDetail;