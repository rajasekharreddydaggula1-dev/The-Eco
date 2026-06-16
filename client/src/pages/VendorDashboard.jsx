import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  Plus, Trash2, Edit2, BarChart2, Package, ShoppingCart, 
  Settings, LogOut, Check, ArrowRight, Layers, FileText, Activity 
} from 'lucide-react';
import { logout } from '../store/slices/authSlice';
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../store/slices/productSlice';
import { fetchOrders, updateOrderStatus } from '../store/slices/orderSlice';
import Logo from '../components/Logo';

export default function VendorDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const { products } = useSelector(state => state.products);
  const { orders } = useSelector(state => state.orders);

  const [activeTab, setActiveTab] = useState('overview'); // overview, products, orders, settings
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  // Form states for product addition
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    images: '',
    category: '',
    stock: ''
  });
  const [variantsList, setVariantsList] = useState([]);
  const [newVariant, setNewVariant] = useState({ name: '', price: '', stock: '' });

  // Store profile settings form
  const [storeForm, setStoreForm] = useState({
    name: '',
    description: '',
    logo: '',
    banner: ''
  });
  const [storeSaving, setStoreSaving] = useState(false);
  const [storeMessage, setStoreMessage] = useState('');

  // Authorization Guard
  useEffect(() => {
    if (!user || user.role !== 'Vendor') {
      navigate('/auth');
    }
  }, [user, navigate]);

  const loadDashboardData = async () => {
    if (!user || !user.store) return;

    dispatch(fetchProducts({ tenantId: user.store }));
    dispatch(fetchOrders());

    // Fetch vendor specific analytics
    try {
      const token = localStorage.getItem('eco_token');
      const response = await fetch('/api/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setAnalytics(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    if (user && user.storeDetails) {
      setStoreForm({
        name: user.storeDetails.name || '',
        description: user.storeDetails.description || '',
        logo: user.storeDetails.logo || '',
        banner: user.storeDetails.banner || ''
      });
    }
  }, [user]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/auth');
  };

  // Variant addition helpers
  const handleAddVariant = () => {
    if (!newVariant.name || !newVariant.price || !newVariant.stock) return;
    setVariantsList([...variantsList, { 
      name: newVariant.name, 
      price: parseFloat(newVariant.price), 
      stock: parseInt(newVariant.stock) 
    }]);
    setNewVariant({ name: '', price: '', stock: '' });
  };

  const handleRemoveVariant = (idx) => {
    setVariantsList(variantsList.filter((_, i) => i !== idx));
  };

  // Product CRUD handlers
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const productPayload = {
      name: productForm.name,
      description: productForm.description,
      price: parseFloat(productForm.price),
      images: productForm.images ? productForm.images.split(',').map(img => img.trim()) : [],
      category: productForm.category,
      stock: parseInt(productForm.stock),
      variants: variantsList
    };

    if (editingProduct) {
      await dispatch(updateProduct({ 
        id: editingProduct._id, 
        productData: productPayload, 
        tenantId: user.store 
      }));
    } else {
      await dispatch(createProduct({ 
        productData: productPayload, 
        tenantId: user.store 
      }));
    }

    setShowProductModal(false);
    setEditingProduct(null);
    setProductForm({ name: '', description: '', price: '', images: '', category: '', stock: '' });
    setVariantsList([]);
    loadDashboardData();
  };

  const handleOpenEditProduct = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      description: prod.description,
      price: prod.price,
      images: prod.images.join(', '),
      category: prod.category,
      stock: prod.stock
    });
    setVariantsList(prod.variants || []);
    setShowProductModal(true);
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await dispatch(deleteProduct({ id, tenantId: user.store }));
      loadDashboardData();
    }
  };

  // Order Status update
  const handleStatusChange = async (orderId, newStatus) => {
    await dispatch(updateOrderStatus({ id: orderId, status: newStatus }));
    loadDashboardData();
  };

  // Store metadata settings save
  const handleSaveStoreSettings = async (e) => {
    e.preventDefault();
    setStoreSaving(true);
    setStoreMessage('');

    try {
      const token = localStorage.getItem('eco_token');
      const response = await fetch(`/api/stores/${user.store}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(storeForm)
      });
      const data = await response.json();
      if (response.ok) {
        setStoreMessage('Store settings updated successfully!');
      } else {
        setStoreMessage(data.message || 'Failed to update settings');
      }
    } catch (e) {
      setStoreMessage('Network error updating settings');
    } finally {
      setStoreSaving(false);
    }
  };

  if (!user || user.role !== 'Vendor') return null;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row text-xs">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 bg-slate-950 border-b md:border-b-0 md:border-r border-slate-900 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-8">
            <Logo className="h-6 w-6" />
            <span className="text-sm font-bold tracking-tight text-white uppercase">The Eco Vendor Portal</span>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg font-semibold transition-all ${
                activeTab === 'overview' ? 'bg-eco-600 text-white shadow-md shadow-eco-600/10' : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
              }`}
            >
              <BarChart2 className="h-4 w-4" />
              Store Performance
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg font-semibold transition-all ${
                activeTab === 'products' ? 'bg-eco-600 text-white shadow-md shadow-eco-600/10' : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
              }`}
            >
              <Package className="h-4 w-4" />
              Manage Inventory
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg font-semibold transition-all ${
                activeTab === 'orders' ? 'bg-eco-600 text-white shadow-md shadow-eco-600/10' : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
              }`}
            >
              <ShoppingCart className="h-4 w-4" />
              Customer Orders
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg font-semibold transition-all ${
                activeTab === 'settings' ? 'bg-eco-600 text-white shadow-md shadow-eco-600/10' : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
              }`}
            >
              <Settings className="h-4 w-4" />
              Store Settings
            </button>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-900">
          <div className="mb-4">
            <span className="block font-semibold text-slate-300">{user.name}</span>
            <span className="block text-[10px] text-slate-500">{user.email}</span>
            {user.storeDetails && (
              <a 
                href={`/store/${user.storeDetails.slug}`} 
                target="_blank" 
                rel="noreferrer"
                className="inline-block mt-2 font-medium text-eco-400 hover:text-eco-300 underline"
              >
                View Storefront ↗
              </a>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 justify-center px-4 py-2 bg-slate-900 hover:bg-slate-850 rounded-lg font-semibold border border-slate-800 text-slate-400 hover:text-red-400 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">Store Performance Overview</h2>

            {/* KPI Cards */}
            {analyticsLoading ? (
              <div className="grid gap-4 sm:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 rounded-xl border border-slate-900 bg-slate-900/40 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-850 bg-slate-900/20 p-5">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Sales Revenue</span>
                  <div className="text-xl font-extrabold text-white mt-1">
                    ${analytics?.metrics?.totalRevenue?.toFixed(2) || '0.00'}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-850 bg-slate-900/20 p-5">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Orders Received</span>
                  <div className="text-xl font-extrabold text-white mt-1">
                    {analytics?.metrics?.totalOrders || 0}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-850 bg-slate-900/20 p-5">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Active Inventory Items</span>
                  <div className="text-xl font-extrabold text-white mt-1">
                    {analytics?.metrics?.totalProducts || 0}
                  </div>
                </div>
              </div>
            )}

            {/* Graph area */}
            <div className="grid gap-6 md:grid-cols-12">
              <div className="md:col-span-8 rounded-xl border border-slate-850 bg-slate-900/10 p-5">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">Revenue Growth (6 Months)</h3>
                <div className="h-64">
                  {!analyticsLoading && analytics?.chartData ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analytics.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                        <YAxis stroke="#64748b" fontSize={10} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                        <Area type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" name="Sales ($)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-600">Gathering statistics data...</div>
                  )}
                </div>
              </div>

              {/* Popular Products */}
              <div className="md:col-span-4 rounded-xl border border-slate-850 bg-slate-900/10 p-5 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">Popular Products</h3>
                  <div className="space-y-4">
                    {analyticsLoading ? (
                      <div className="text-slate-600">Loading metrics...</div>
                    ) : !analytics?.popularProducts || analytics.popularProducts.length === 0 ? (
                      <div className="text-slate-600 py-6 text-center">No products sold yet.</div>
                    ) : (
                      analytics.popularProducts.map((prod, idx) => (
                        <div key={prod._id || idx} className="flex justify-between items-center border-b border-slate-900 pb-2">
                          <div>
                            <span className="font-semibold text-slate-200 block text-xs truncate max-w-[150px]">{prod.name}</span>
                            <span className="text-[10px] text-slate-500">{prod.sold} units sold</span>
                          </div>
                          <span className="font-bold text-eco-400">${prod.revenue.toFixed(2)}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-900 pb-4">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider">Inventory Products</h2>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setProductForm({ name: '', description: '', price: '', images: '', category: '', stock: '' });
                  setVariantsList([]);
                  setShowProductModal(true);
                }}
                className="flex items-center gap-1 px-4 py-2 bg-eco-600 hover:bg-eco-500 rounded-lg text-xs font-bold text-white shadow-md transition-all active:scale-95"
              >
                <Plus className="h-4 w-4" />
                Add Product
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {products.length === 0 ? (
                <div className="col-span-full py-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
                  Your store inventory is empty. Add your first product catalog above!
                </div>
              ) : (
                products.map((prod) => (
                  <div key={prod._id} className="rounded-xl border border-slate-850 bg-slate-900/30 overflow-hidden flex flex-col">
                    <img 
                      src={prod.images[0] || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600'} 
                      alt="" 
                      className="h-40 w-full object-cover border-b border-slate-900" 
                    />
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-slate-200 text-sm">{prod.name}</span>
                          <span className="text-xs font-mono text-eco-400 font-bold">${prod.price.toFixed(2)}</span>
                        </div>
                        <p className="text-slate-400 mt-1 line-clamp-2 text-xs">{prod.description}</p>
                        
                        <div className="mt-3 flex flex-wrap gap-1">
                          {prod.variants.map((v, i) => (
                            <span key={i} className="bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-[9px] text-slate-400">
                              {v.name} (${v.price})
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-900 flex justify-between items-center">
                        <span className="text-slate-500 text-[10px] font-medium uppercase">Stock: {prod.stock} total</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleOpenEditProduct(prod)}
                            className="p-1.5 text-slate-400 hover:text-white bg-slate-850 hover:bg-slate-800 rounded transition-all"
                            title="Edit Product"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod._id)}
                            className="p-1.5 text-slate-500 hover:text-red-400 bg-slate-850 hover:bg-slate-800 rounded transition-all"
                            title="Delete Product"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ORDERS Fulfillment TAB */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider border-b border-slate-900 pb-4">Customer Orders</h2>

            <div className="rounded-xl border border-slate-800 bg-slate-900/10 overflow-hidden">
              <div className="overflow-x-auto">
                {orders.length === 0 ? (
                  <div className="p-12 text-center text-slate-500">No orders received yet.</div>
                ) : (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-850 text-slate-400 uppercase tracking-wider text-[10px]">
                        <th className="px-6 py-3.5 font-semibold">Order details</th>
                        <th className="px-6 py-3.5 font-semibold">Customer details</th>
                        <th className="px-6 py-3.5 font-semibold">Total Amount</th>
                        <th className="px-6 py-3.5 font-semibold">Status</th>
                        <th className="px-6 py-3.5 font-semibold text-right">Fulfillment Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {orders.map((order) => (
                        <tr key={order._id} className="hover:bg-slate-900/20 transition-colors">
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <span className="font-semibold text-slate-200 block text-xs">ID: {order._id}</span>
                              <div className="space-y-0.5">
                                {order.items.map((item, idx) => (
                                  <span key={idx} className="block text-[10px] text-slate-400">
                                    • {item.name} {item.variantName ? `(${item.variantName})` : ''} x{item.quantity}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-slate-300 font-medium">{order.customer?.name}</span>
                              <span className="text-slate-500 text-[10px]">{order.customer?.email}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-bold text-white">${order.totalAmount.toFixed(2)}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex rounded-full px-2 py-0.5 font-medium text-[9px] uppercase border ${
                              order.status === 'paid' || order.status === 'delivered'
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                : order.status === 'pending'
                                ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                                : 'bg-red-500/10 border-red-500/20 text-red-400'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order._id, e.target.value)}
                              className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-brand-500 text-[11px]"
                            >
                              <option value="pending">Pending</option>
                              <option value="paid">Paid</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider border-b border-slate-900 pb-4">Storefront Settings</h2>

            <form onSubmit={handleSaveStoreSettings} className="max-w-xl space-y-4">
              {storeMessage && (
                <div className={`p-3 rounded-lg border text-center font-semibold text-xs ${
                  storeMessage.includes('successfully') ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400' : 'bg-red-950/20 border-red-500/20 text-red-400'
                }`}>
                  {storeMessage}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Store Name</label>
                <input
                  type="text"
                  required
                  value={storeForm.name}
                  onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
                  className="glass-input w-full"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Description</label>
                <textarea
                  value={storeForm.description}
                  onChange={(e) => setStoreForm({ ...storeForm, description: e.target.value })}
                  rows={3}
                  className="glass-input w-full"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Logo URL</label>
                <input
                  type="text"
                  value={storeForm.logo}
                  onChange={(e) => setStoreForm({ ...storeForm, logo: e.target.value })}
                  className="glass-input w-full"
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Banner URL</label>
                <input
                  type="text"
                  value={storeForm.banner}
                  onChange={(e) => setStoreForm({ ...storeForm, banner: e.target.value })}
                  className="glass-input w-full"
                  placeholder="https://example.com/banner.jpg"
                />
              </div>

              <button
                type="submit"
                disabled={storeSaving}
                className="flex items-center gap-1 px-6 py-3 bg-eco-600 hover:bg-eco-500 text-white font-bold rounded-lg shadow-md transition-all active:scale-95"
              >
                {storeSaving ? 'Saving Store...' : 'Save Settings'}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* PRODUCT ADD / EDIT MODAL */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs" onClick={() => setShowProductModal(false)} />
          <div className="relative w-full max-w-lg rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl backdrop-blur-lg overflow-y-auto max-h-[90vh]">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              {editingProduct ? 'Edit Product Catalog' : 'Add New Inventory Product'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Product Name</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="glass-input w-full"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Category</label>
                  <input
                    type="text"
                    required
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="glass-input w-full"
                    placeholder="e.g. Footwear, Produce"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400">Description</label>
                <textarea
                  required
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  rows={2}
                  className="glass-input w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Base Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="glass-input w-full"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Total Stock</label>
                  <input
                    type="number"
                    required
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    className="glass-input w-full"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400">Images URLs (Comma-separated)</label>
                <input
                  type="text"
                  value={productForm.images}
                  onChange={(e) => setProductForm({ ...productForm, images: e.target.value })}
                  className="glass-input w-full"
                  placeholder="url1, url2, url3"
                />
              </div>

              {/* Product Variants management */}
              <div className="border-t border-slate-800 pt-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                  <Layers className="h-3.5 w-3.5" />
                  Product Variants (Optional)
                </h4>

                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Variant (e.g. Size 10)"
                    value={newVariant.name}
                    onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })}
                    className="glass-input w-full text-[11px]"
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Price ($)"
                    value={newVariant.price}
                    onChange={(e) => setNewVariant({ ...newVariant, price: e.target.value })}
                    className="glass-input w-full text-[11px]"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Stock"
                      value={newVariant.stock}
                      onChange={(e) => setNewVariant({ ...newVariant, stock: e.target.value })}
                      className="glass-input w-full text-[11px] flex-1"
                    />
                    <button
                      type="button"
                      onClick={handleAddVariant}
                      className="px-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-200 border border-slate-700"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {variantsList.map((variant, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-[10px] text-slate-400">
                      <span>{variant.name} | ${variant.price} | Qty:{variant.stock}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(idx)}
                        className="text-slate-500 hover:text-red-400 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg font-semibold text-slate-300 border border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-eco-600 hover:bg-eco-500 text-white font-bold rounded-lg shadow-md transition-all"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
