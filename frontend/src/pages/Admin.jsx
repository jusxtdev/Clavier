import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuthStore } from '../stores/useAuthStore';

const TABS = {
  PRODUCTS: 'products',
  ORDERS: 'orders',
  USERS: 'users',
  CATEGORIES: 'categories',
};

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-purple-100 text-purple-800',
  SHIPPED: 'bg-green-100 text-green-800',
};

function Admin() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [activeTab, setActiveTab] = useState(TABS.PRODUCTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Data states
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showAddProduct, setShowAddProduct] = useState(false);

  // Check authorization
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'ADMIN' && user.role !== 'STAFF') {
      navigate('/');
    }
  }, [user, navigate]);

  const isAdmin = user?.role === 'ADMIN';

  // Generic fetch with error handling
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      switch (activeTab) {
        case TABS.PRODUCTS:
          // Fetch products and categories (for Add Product modal)
          const productsRes = await api.get('/products?limit=50');
          setProducts(productsRes.data.data || []);
          if (isAdmin) {
            const categoriesRes = await api.get('/categories?limit=50');
            setCategories(categoriesRes.data.data || []);
          }
          break;
        case TABS.ORDERS:
          const ordersRes = await api.get('/orders');
          setOrders(ordersRes.data.data || []);
          break;
        case TABS.USERS:
          if (isAdmin) {
            const usersRes = await api.get('/users?limit=50');
            setUsers(usersRes.data.data || []);
          }
          break;
        case TABS.CATEGORIES:
          if (isAdmin) {
            const categoriesRes = await api.get('/categories?limit=50');
            setCategories(categoriesRes.data.data || []);
          }
          break;
      }
    } catch (err) {
      const errorMsg = err.response?.data?.msg || err.message || 'Failed to load data';
      setError(errorMsg);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && (user.role === 'ADMIN' || user.role === 'STAFF')) {
      fetchData();
    }
  }, [activeTab, user, isAdmin]);

  const showMessage = (message, type = 'success') => {
    if (type === 'success') setSuccess(message);
    else setError(message);
    setTimeout(() => {
      setSuccess(null);
      setError(null);
    }, 3000);
  };

  // ============ PRODUCT HANDLERS ============
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await api.delete(`/products/${productId}`);
      setProducts(products.filter((p) => p.id !== productId));
      showMessage('Product deleted successfully');
    } catch (err) {
      showMessage(err.response?.data?.msg || 'Failed to delete product', 'error');
    }
  };

  const handleAddProduct = async (productData) => {
    try {
      const res = await api.post('/products', productData);
      setProducts([res.data.data, ...products]);
      setShowAddProduct(false);
      showMessage('Product created successfully');
    } catch (err) {
      showMessage(err.response?.data?.msg || 'Failed to create product', 'error');
    }
  };

  // ============ ORDER HANDLERS ============
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}`, { status: newStatus });
      setOrders(
        orders.map((o) =>
          o.id === orderId ? { ...o, status: newStatus } : o
        )
      );
      showMessage('Order status updated');
    } catch (err) {
      showMessage(err.response?.data?.msg || 'Failed to update order', 'error');
    }
  };

  // ============ USER HANDLERS ============
  const handlePromoteUser = async (userId, newRole) => {
    try {
      await api.patch('/users/promote', { userId, role: newRole });
      setUsers(
        users.map((u) =>
          u.id === userId ? { ...u, role: newRole } : u
        )
      );
      showMessage('User role updated');
    } catch (err) {
      showMessage(err.response?.data?.msg || 'Failed to update user', 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await api.delete(`/users/${userId}`);
      setUsers(users.filter((u) => u.id !== userId));
      showMessage('User deleted successfully');
    } catch (err) {
      showMessage(err.response?.data?.msg || 'Failed to delete user', 'error');
    }
  };

  // ============ CATEGORY HANDLERS ============
  const handleCreateCategory = async (title, description) => {
    try {
      const res = await api.post('/categories', { title, description });
      setCategories([...categories, res.data.data]);
      showMessage('Category created successfully');
      return true;
    } catch (err) {
      showMessage(err.response?.data?.msg || 'Failed to create category', 'error');
      return false;
    }
  };

  const handleUpdateCategory = async (categoryId, title, description) => {
    try {
      const res = await api.patch(`/categories/${categoryId}`, { title, description });
      setCategories(
        categories.map((c) =>
          c.id === categoryId ? res.data.data : c
        )
      );
      showMessage('Category updated successfully');
      return true;
    } catch (err) {
      showMessage(err.response?.data?.msg || 'Failed to update category', 'error');
      return false;
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      await api.delete(`/categories/${categoryId}`);
      setCategories(categories.filter((c) => c.id !== categoryId));
      showMessage('Category deleted successfully');
    } catch (err) {
      showMessage(err.response?.data?.msg || 'Failed to delete category', 'error');
    }
  };

  // ============ RENDER ============
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateOrderTotal = (order) => {
    if (!order.orderItems) return 0;
    return order.orderItems.reduce(
      (sum, item) => sum + Number(item.productPrice || 0) * item.quantity,
      0
    );
  };

  if (!user || (user.role !== 'ADMIN' && user.role !== 'STAFF')) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-semibold text-stone-900 mb-8">Admin Dashboard</h1>

      {/* Messages */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b border-stone-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab(TABS.PRODUCTS)}
          className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
            activeTab === TABS.PRODUCTS
              ? 'border-stone-900 text-stone-900'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          Products
        </button>
        <button
          onClick={() => setActiveTab(TABS.ORDERS)}
          className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
            activeTab === TABS.ORDERS
              ? 'border-stone-900 text-stone-900'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          Orders
        </button>
        {isAdmin && (
          <>
            <button
              onClick={() => setActiveTab(TABS.USERS)}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
                activeTab === TABS.USERS
                  ? 'border-stone-900 text-stone-900'
                  : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab(TABS.CATEGORIES)}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
                activeTab === TABS.CATEGORIES
                  ? 'border-stone-900 text-stone-900'
                  : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
            >
              Categories
            </button>
          </>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddProduct && (
        <AddProductModal
          categories={categories}
          onClose={() => setShowAddProduct(false)}
          onSubmit={handleAddProduct}
        />
      )}

      {/* Tab Content */}
      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-stone-200 rounded-lg" />
          ))}
        </div>
      ) : (
        <>
          {/* ============ PRODUCTS TAB ============ */}
          {activeTab === TABS.PRODUCTS && (
            <div>
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => setShowAddProduct(true)}
                  className="px-4 py-2 bg-stone-900 text-white rounded-lg text-sm font-medium hover:bg-stone-800"
                >
                  + Add Product
                </button>
              </div>
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-stone-50 border-b border-stone-200">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="text-right px-6 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-stone-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-stone-100 rounded overflow-hidden">
                              {product.images || product.imageURL ? (
                                <img
                                  src={product.images || product.imageURL}
                                  alt={product.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">
                                  N/A
                                </div>
                              )}
                            </div>
                            <span className="font-medium text-stone-900">
                              {product.title}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-stone-600">
                          ${product.price}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              product.stock > 10
                                ? 'bg-green-100 text-green-800'
                                : product.stock > 0
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {product.stock}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {products.length === 0 && (
                  <p className="text-center py-8 text-stone-500">No products found</p>
                )}
              </div>
            </div>
          )}

          {/* ============ ORDERS TAB ============ */}
          {activeTab === TABS.ORDERS && (
            <div>
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-stone-50 border-b border-stone-200">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                        User ID
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                        Update Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-stone-50">
                        <td className="px-6 py-4 font-medium text-stone-900">
                          #{order.id}
                        </td>
                        <td className="px-6 py-4 text-stone-600">
                          {order.userId}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[order.status] || 'bg-stone-100 text-stone-800'}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-stone-600">
                          ${calculateOrderTotal(order).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-stone-500 text-sm">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={order.status}
                            onChange={(e) =>
                              handleUpdateOrderStatus(order.id, e.target.value)
                            }
                            className="px-3 py-1.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
                          >
                            <option value="PENDING">Pending</option>
                            <option value="CONFIRMED">Confirmed</option>
                            <option value="PROCESSING">Processing</option>
                            <option value="SHIPPED">Shipped</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {orders.length === 0 && (
                  <p className="text-center py-8 text-stone-500">No orders found</p>
                )}
              </div>
            </div>
          )}

          {/* ============ USERS TAB (ADMIN ONLY) ============ */}
          {activeTab === TABS.USERS && isAdmin && (
            <div>
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-stone-50 border-b border-stone-200">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="text-right px-6 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-stone-50">
                        <td className="px-6 py-4 font-medium text-stone-900">
                          {u.name}
                        </td>
                        <td className="px-6 py-4 text-stone-600">{u.email}</td>
                        <td className="px-6 py-4">
                          <select
                            value={u.role}
                            onChange={(e) =>
                              handlePromoteUser(u.id, e.target.value)
                            }
                            className="px-3 py-1.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
                          >
                            <option value="BUYER">Buyer</option>
                            <option value="STAFF">Staff</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {users.length === 0 && (
                  <p className="text-center py-8 text-stone-500">No users found</p>
                )}
              </div>
            </div>
          )}

          {/* ============ CATEGORIES TAB (ADMIN ONLY) ============ */}
          {activeTab === TABS.CATEGORIES && isAdmin && (
            <div>
              <CategoryManager
                categories={categories}
                onCreate={handleCreateCategory}
                onUpdate={handleUpdateCategory}
                onDelete={handleDeleteCategory}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Category Manager Sub-component
function CategoryManager({ categories, onCreate, onUpdate, onDelete }) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ title: '', description: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    let success;
    if (editingId) {
      success = await onUpdate(editingId, form.title, form.description);
      if (success) {
        setEditingId(null);
        setForm({ title: '', description: '' });
      }
    } else {
      success = await onCreate(form.title, form.description);
      if (success) {
        setIsCreating(false);
        setForm({ title: '', description: '' });
      }
    }
  };

  const startEdit = (category) => {
    setEditingId(category.id);
    setForm({ title: category.title, description: category.description || '' });
    setIsCreating(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsCreating(false);
    setForm({ title: '', description: '' });
  };

  return (
    <div>
      {/* Create Button / Form */}
      {isCreating ? (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-stone-900 mb-4">New Category</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
                placeholder="e.g., gaming"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
                placeholder="Category description"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-4 py-2 bg-stone-900 text-white rounded-lg text-sm font-medium hover:bg-stone-800"
              >
                Create
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="px-4 py-2 border border-stone-300 rounded-lg text-sm font-medium hover:bg-stone-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setIsCreating(true)}
          className="mb-6 px-4 py-2 bg-stone-900 text-white rounded-lg text-sm font-medium hover:bg-stone-800"
        >
          + Add Category
        </button>
      )}

      {/* Categories List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Title
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Description
              </th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-stone-50">
                {editingId === category.id ? (
                  <>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        className="w-full px-3 py-1 border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-stone-900"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        className="w-full px-3 py-1 border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-stone-900"
                      />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={handleSubmit}
                        className="text-green-600 hover:text-green-800 text-sm mr-3"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="text-stone-500 hover:text-stone-700 text-sm"
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4 font-medium text-stone-900 capitalize">
                      {category.title}
                    </td>
                    <td className="px-6 py-4 text-stone-500 text-sm">
                      {category.description || '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => startEdit(category)}
                        className="text-stone-500 hover:text-stone-900 text-sm mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(category.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {categories.length === 0 && (
          <p className="text-center py-8 text-stone-500">No categories found</p>
        )}
      </div>
    </div>
  );
}

// Add Product Modal Component
function AddProductModal({ categories, onClose, onSubmit }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    stock: '',
    images: '',
    categories: [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const productData = {
        title: form.title,
        description: form.description,
        price: Number(form.price),
        stock: Number(form.stock),
        images: form.images || undefined,
        categories: form.categories,
      };
      await onSubmit(productData);
    } catch (err) {
      setError(err.message || 'Failed to create product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCategoryToggle = (categoryTitle) => {
    setForm((prev) => ({
      ...prev,
      categories: prev.categories.includes(categoryTitle)
        ? prev.categories.filter((c) => c !== categoryTitle)
        : [...prev.categories, categoryTitle],
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-stone-900">Add New Product</h2>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
              placeholder="Product title"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
              placeholder="Product description"
            />
          </div>

          {/* Price & Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Price <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Stock <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                required
                min="0"
                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
                placeholder="0"
              />
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Image URL
            </label>
            <input
              type="url"
              value={form.images}
              onChange={(e) => setForm({ ...form, images: e.target.value })}
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* Categories */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Categories
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryToggle(cat.title)}
                  className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                    form.categories.includes(cat.title)
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-white text-stone-700 border-stone-300 hover:border-stone-400'
                  }`}
                >
                  {cat.title}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-stone-300 rounded-lg text-stone-700 font-medium hover:bg-stone-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-stone-900 text-white rounded-lg font-medium hover:bg-stone-800 disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Admin;