import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  Plus, Trash2, Edit2, BarChart2, Package, ShoppingCart, 
  Settings, LogOut, Check, ArrowRight, Layers, FileText, Activity,
  Building
} from 'lucide-react';
import { logout } from '../store/slices/authSlice';
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../store/slices/productSlice';
import { fetchOrders, updateOrderStatus } from '../store/slices/orderSlice';
import { fetchStores } from '../store/slices/storeSlice';
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

  // Store switcher & multiple stores state
  const { stores } = useSelector(state => state.stores);
  const myStores = stores.filter(s => s.vendor && (s.vendor === user?.id || s.vendor._id === user?.id || s.vendor === user?._id || s.vendor._id === user?._id));
  const [selectedStoreId, setSelectedStoreId] = useState(localStorage.getItem('vendor_selected_store') || user?.store || '');
  const [showAddStoreModal, setShowAddStoreModal] = useState(false);
  const [newStoreForm, setNewStoreForm] = useState({
    name: '',
    description: '',
    logo: '',
    banner: ''
  });
  const [addStoreSaving, setAddStoreSaving] = useState(false);
  const [addStoreMessage, setAddStoreMessage] = useState('');

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

  const loadDashboardData = async (storeId) => {
    const targetStoreId = storeId || selectedStoreId;
    if (!user || !targetStoreId) return;

    dispatch(fetchProducts({ tenantId: targetStoreId }));
    dispatch(fetchOrders({ tenantId: targetStoreId }));

    // Fetch vendor specific analytics
    try {
      const token = localStorage.getItem('eco_token');
      const response = await fetch('/api/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-tenant-id': targetStoreId
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
    dispatch(fetchStores());
  }, [dispatch]);

  // Sync selectedStoreId when user loads or stores load
  useEffect(() => {
    if (!selectedStoreId && myStores.length > 0) {
      const firstStoreId = myStores[0]._id;
      setSelectedStoreId(firstStoreId);
      localStorage.setItem('vendor_selected_store', firstStoreId);
    } else if (!selectedStoreId && user && user.store) {
      setSelectedStoreId(user.store);
      localStorage.setItem('vendor_selected_store', user.store);
    }
  }, [user, myStores, selectedStoreId]);

  useEffect(() => {
    if (selectedStoreId) {
      loadDashboardData(selectedStoreId);
      const activeStore = myStores.find(s => s._id === selectedStoreId);
      if (activeStore) {
        setStoreForm({
          name: activeStore.name || '',
          description: activeStore.description || '',
          logo: activeStore.logo || '',
          banner: activeStore.banner || ''
        });
      }
    }
  }, [selectedStoreId, stores]);

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
        tenantId: selectedStoreId 
      }));
    } else {
      await dispatch(createProduct({ 
        productData: productPayload, 
        tenantId: selectedStoreId 
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
      await dispatch(deleteProduct({ id, tenantId: selectedStoreId }));
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
      const response = await fetch(`/api/stores/${selectedStoreId}`, {
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
        dispatch(fetchStores());
      } else {
        setStoreMessage(data.message || 'Failed to update settings');
      }
    } catch (e) {
      setStoreMessage('Network error updating settings');
    } finally {
      setStoreSaving(false);
    }
  };

  // Onboard new vendor-owned store
  const handleCreateVendorStore = async (e) => {
    e.preventDefault();
    setAddStoreSaving(true);
    setAddStoreMessage('');

    try {
      const token = localStorage.getItem('eco_token');
      const response = await fetch('/api/stores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newStoreForm)
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setAddStoreMessage('Storefront successfully created!');
        setNewStoreForm({ name: '', description: '', logo: '', banner: '' });
        
        await dispatch(fetchStores());
        
        const newStoreId = data.data._id;
        setSelectedStoreId(newStoreId);
        localStorage.setItem('vendor_selected_store', newStoreId);

        setTimeout(() => {
          setShowAddStoreModal(false);
          setAddStoreMessage('');
        }, 1500);
      } else {
        setAddStoreMessage(data.message || 'Failed to create storefront');
      }
    } catch (err) {
      console.error(err);
      setAddStoreMessage('Network error creating storefront.');
    } finally {
      setAddStoreSaving(false);
    }
  };

  if (!user || user.role !== 'Vendor') return null;

  if (myStores.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-xs font-sans">
        <div className="max-w-md w-full rounded-2xl border border-slate-900 bg-slate-950/60 p-8 backdrop-blur-md space-y-6">
          <div className="text-center space-y-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-eco-500/10 border border-eco-500/20 text-eco-400">
              <Building className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">Onboard Your First Eco Storefront</h2>
            <p className="text-slate-400 leading-relaxed font-sans">
              Launch your eco-merchant brand! Set up a custom directory listing on our database partitioned multi-tenant SaaS marketplace.
            </p>
          </div>

          {addStoreMessage && (
            <div className={`rounded-lg p-3 border text-[10px] font-semibold text-center font-sans ${
              addStoreMessage.includes('successfully') ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400' : 'bg-red-950/20 border-red-500/20 text-red-400'
            }`}>
              {addStoreMessage}
            </div>
          )}

          <form onSubmit={handleCreateVendorStore} className="space-y-4 text-xs font-sans">
            <div className="space-y-1">
              <label className="text-slate-400 font-medium font-sans">Storefront Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Green Planet Seeds"
                value={newStoreForm.name}
                onChange={(e) => setNewStoreForm({ ...newStoreForm, name: e.target.value })}
                className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 text-white placeholder-slate-600 focus:border-eco-500 focus:outline-none font-sans"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-medium font-sans">Description</label>
              <textarea
                required
                placeholder="Tell buyers about your merchant story, organic practices, and green mission..."
                value={newStoreForm.description}
                onChange={(e) => setNewStoreForm({ ...newStoreForm, description: e.target.value })}
                className="w-full h-24 rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 text-white placeholder-slate-600 focus:border-eco-500 focus:outline-none resize-none font-sans"
              />
            </div>

            <button
              type="submit"
              disabled={addStoreSaving}
              className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-eco-600 hover:bg-eco-500 py-2.5 font-bold text-white shadow-md transition-all active:scale-95 disabled:scale-100 font-sans"
            >
              {addStoreSaving ? 'Creating Storefront...' : 'Launch Storefront Brand'}
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 py-2.5 font-bold border border-slate-800 text-slate-400 hover:text-red-400 transition-colors font-sans"
            >
              <LogOut className="h-4 w-4" />
              Logout of Account
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row text-xs font-sans">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 bg-slate-950 border-b md:border-b-0 md:border-r border-slate-900 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Logo className="h-6 w-6" />
            <span className="text-sm font-bold tracking-tight text-white uppercase font-sans">The Eco Vendor Portal</span>
          </div>

          <div className="mb-6 space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-sans">Active Storefront</label>
            <div className="flex gap-1.5">
              <select
                value={selectedStoreId}
                onChange={(e) => {
                  const id = e.target.value;
                  setSelectedStoreId(id);
                  localStorage.setItem('vendor_selected_store', id);
                }}
                className="flex-1 rounded-lg bg-slate-900 border border-slate-800 px-2 py-1.5 text-xs text-white font-semibold focus:outline-none font-sans"
              >
                {myStores.map(store => (
                  <option key={store._id} value={store._id}>
                    {store.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  setShowAddStoreModal(true);
                  setAddStoreMessage('');
                }}
                className="rounded-lg bg-eco-600 hover:bg-eco-500 px-2.5 py-1.5 text-xs font-bold text-white transition-all shadow-md active:scale-95 flex items-center justify-center font-sans"
                title="Add Another Storefront"
              >
                +
              </button>
            </div>
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
            {selectedStoreId && myStores.find(s => s._id === selectedStoreId) && (
              <a 
                href={`/store/${myStores.find(s => s._id === selectedStoreId).slug}`} 
                target="_blank" 
                rel="noreferrer"
                className="inline-block mt-2 font-medium text-eco-400 hover:text-eco-300 underline font-sans"
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
                    ₹{analytics?.metrics?.totalRevenue?.toFixed(2) || '0.00'}
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
                        <Area type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" name="Sales (₹)" />
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
                          <span className="font-bold text-eco-400">₹{prod.revenue.toFixed(2)}</span>
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
                      src={prod.images?.[0] || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600'} 
                      alt="" 
                      className="h-40 w-full object-cover border-b border-slate-900" 
                    />
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-slate-200 text-sm">{prod.name}</span>
                          <span className="text-xs font-mono text-eco-400 font-bold">₹{prod.price?.toFixed(2) || '0.00'}</span>
                        </div>
                        <p className="text-slate-400 mt-1 line-clamp-2 text-xs">{prod.description}</p>
                        
                        <div className="mt-3 flex flex-wrap gap-1">
                          {(prod.variants || []).map((v, i) => (
                            <span key={i} className="bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-[9px] text-slate-400">
                              {v.name} (₹{v.price})
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
                               {(order.items || []).map((item, idx) => (
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
                            <span className="font-bold text-white">₹{order.totalAmount?.toFixed(2) || '0.00'}</span>
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
                    placeholder="e.g. Footwear, Stationery"
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
                  <label className="text-xs text-slate-400">Base Price (₹)</label>
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
                    placeholder="Price (₹)"
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
                      <span>{variant.name} | ₹{variant.price} | Qty:{variant.stock}</span>
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
      {/* Add Store Modal for Vendors */}
      {showAddStoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowAddStoreModal(false)} />
          <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl backdrop-blur-md transition-all animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-900 pb-4 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building className="h-5 w-5 text-eco-400" />
                Launch New Storefront Brand
              </h3>
              <button onClick={() => setShowAddStoreModal(false)} className="text-slate-400 hover:text-white font-sans">✕</button>
            </div>

            {addStoreMessage && (
              <div className={`mb-4 rounded-lg p-3 border text-[10px] font-semibold text-center font-sans ${
                addStoreMessage.includes('successfully') ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400' : 'bg-red-950/20 border-red-500/20 text-red-400'
              }`}>
                {addStoreMessage}
              </div>
            )}

            <form onSubmit={handleCreateVendorStore} className="space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="text-slate-400 font-medium font-sans">Storefront Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Earthly Goods"
                  value={newStoreForm.name}
                  onChange={(e) => setNewStoreForm({ ...newStoreForm, name: e.target.value })}
                  className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 text-white placeholder-slate-600 focus:border-eco-500 focus:outline-none font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium font-sans">Description</label>
                <textarea
                  required
                  placeholder="Tell customers about this storefront brand..."
                  value={newStoreForm.description}
                  onChange={(e) => setNewStoreForm({ ...newStoreForm, description: e.target.value })}
                  className="w-full h-20 rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 text-white placeholder-slate-600 focus:border-eco-500 focus:outline-none resize-none font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium font-sans">Logo Image URL (Optional)</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=100"
                  value={newStoreForm.logo}
                  onChange={(e) => setNewStoreForm({ ...newStoreForm, logo: e.target.value })}
                  className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 text-white placeholder-slate-600 focus:border-eco-500 focus:outline-none font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium font-sans">Banner Image URL (Optional)</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600"
                  value={newStoreForm.banner}
                  onChange={(e) => setNewStoreForm({ ...newStoreForm, banner: e.target.value })}
                  className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 text-white placeholder-slate-600 focus:border-eco-500 focus:outline-none font-sans"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddStoreModal(false)}
                  className="flex-1 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 py-2.5 font-semibold text-slate-300 transition-all font-sans"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addStoreSaving}
                  className="flex-1 rounded-lg bg-eco-600 hover:bg-eco-500 py-2.5 font-semibold text-white transition-all shadow-md flex items-center justify-center gap-1.5 font-sans"
                >
                  {addStoreSaving ? 'Creating...' : 'Launch Brand'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
