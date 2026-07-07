import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, ShoppingBag, IndianRupee, Building, AlertTriangle, CheckCircle, Ban, LogOut, Plus } from 'lucide-react';
import { fetchStores, updateStoreStatus } from '../store/slices/storeSlice';
import { logout } from '../store/slices/authSlice';
import Logo from '../components/Logo';

export default function SuperAdminDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const { stores, loading } = useSelector(state => state.stores);

  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  // Store creation and vendor management state
  const [vendors, setVendors] = useState([]);
  const [showAddStoreModal, setShowAddStoreModal] = useState(false);
  const [newStore, setNewStore] = useState({
    name: '',
    description: '',
    logo: '',
    banner: '',
    vendor: ''
  });
  const [addStoreLoading, setAddStoreLoading] = useState(false);
  const [addStoreError, setAddStoreError] = useState('');
  const [addStoreSuccess, setAddStoreSuccess] = useState('');

  // Authorization Guard
  useEffect(() => {
    if (!user || user.role !== 'Super Admin') {
      navigate('/auth');
    }
  }, [user, navigate]);

  useEffect(() => {
    dispatch(fetchStores());

    // Fetch Super Admin aggregate metrics
    const fetchMetrics = async () => {
      try {
        const token = localStorage.getItem('eco_token');
        const response = await fetch('/api/analytics', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (response.ok) {
          setAnalytics(data.metrics);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setAnalyticsLoading(false);
      }
    };

    const fetchVendors = async () => {
      try {
        const token = localStorage.getItem('eco_token');
        const response = await fetch('/api/auth/vendors', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (response.ok && data.success) {
          setVendors(data.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    
    fetchMetrics();
    fetchVendors();
  }, [dispatch]);

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    const confirmMsg = `Are you sure you want to ${nextStatus === 'suspended' ? 'SUSPEND' : 'ACTIVATE'} this store? This will also update the vendor account status.`;
    
    if (window.confirm(confirmMsg)) {
      await dispatch(updateStoreStatus({ id, status: nextStatus }));
      // Reload stores list
      dispatch(fetchStores());
    }
  };

  const handleCreateStore = async (e) => {
    e.preventDefault();
    setAddStoreError('');
    setAddStoreSuccess('');
    setAddStoreLoading(true);

    try {
      const token = localStorage.getItem('eco_token');
      const response = await fetch('/api/stores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newStore)
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setAddStoreSuccess('Storefront successfully created!');
        setNewStore({
          name: '',
          description: '',
          logo: '',
          banner: '',
          vendor: ''
        });
        // Reload stores list
        dispatch(fetchStores());
        setTimeout(() => {
          setShowAddStoreModal(false);
          setAddStoreSuccess('');
        }, 1500);
      } else {
        setAddStoreError(data.message || 'Failed to create storefront');
      }
    } catch (err) {
      console.error(err);
      setAddStoreError('Network error creating storefront.');
    } finally {
      setAddStoreLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/auth');
  };

  if (!user || user.role !== 'Super Admin') return null;

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-10">
      {/* Header */}
      <div className="mx-auto max-w-7xl flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-900 pb-6 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <Logo className="h-6 w-6" />
            <h1 className="text-2xl font-bold tracking-tight text-white">Super Admin Control Center</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">Platform management, tenant isolation overview, and vendor controls.</p>
        </div>

        <button
          onClick={handleLogout}
          className="self-start sm:self-center flex items-center gap-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 transition-all"
        >
          <LogOut className="h-4 w-4 text-red-400" />
          Log Out
        </button>
      </div>

      <div className="mx-auto max-w-7xl space-y-8">
        {/* KPI Cards */}
        {analyticsLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 rounded-xl border border-slate-900 bg-slate-900/40 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Platform Revenue */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Platform GMV</span>
                <IndianRupee className="h-5 w-5 text-brand-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">₹{analytics?.platformRevenue?.toFixed(2) || '0.00'}</span>
              </div>
            </div>

            {/* Total Stores */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Storefronts</span>
                <Building className="h-5 w-5 text-eco-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">{analytics?.totalStores || 0}</span>
                <span className="text-xs text-slate-500">Tenants</span>
              </div>
            </div>

            {/* Total Vendors */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Platform Vendors</span>
                <Users className="h-5 w-5 text-blue-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">{analytics?.totalVendors || 0}</span>
                <span className="text-xs text-slate-500">Merchants</span>
              </div>
            </div>

            {/* Total Users */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Platform Customers</span>
                <Users className="h-5 w-5 text-purple-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">{analytics?.totalCustomers || 0}</span>
                <span className="text-xs text-slate-500">Buyers</span>
              </div>
            </div>
          </div>
        )}

        {/* Tenant Stores Management Table */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/20 overflow-hidden">
          <div className="border-b border-slate-850 bg-slate-900/40 px-6 py-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Tenant Stores Registry</h2>
            <button
              onClick={() => {
                setShowAddStoreModal(true);
                setAddStoreError('');
                setAddStoreSuccess('');
              }}
              className="flex items-center gap-1.5 rounded-lg bg-eco-600 hover:bg-eco-500 px-3 py-1.5 text-xs font-bold text-white transition-all shadow-md active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" />
              Onboard Storefront
            </button>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center text-slate-500">Loading platform stores data...</div>
            ) : stores.length === 0 ? (
              <div className="p-12 text-center text-slate-500">No stores registered on the platform.</div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-850 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="px-6 py-3.5 font-semibold">Store details</th>
                    <th className="px-6 py-3.5 font-semibold">Slug Identifier</th>
                    <th className="px-6 py-3.5 font-semibold">Vendor Owner</th>
                    <th className="px-6 py-3.5 font-semibold">Status</th>
                    <th className="px-6 py-3.5 font-semibold text-right">Administrative Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {stores.map((store) => (
                    <tr key={store._id} className="hover:bg-slate-900/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {store.logo ? (
                            <img src={store.logo} alt="" className="h-8 w-8 rounded-full object-cover border border-slate-800" />
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 font-bold text-slate-400 border border-slate-700">
                              {store.name[0]}
                            </div>
                          )}
                          <div>
                            <span className="font-semibold text-slate-200 block text-sm">{store.name}</span>
                            <span className="text-slate-500 text-[10px] line-clamp-1">{store.description || 'No description'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <code className="rounded bg-slate-900 px-2 py-1 text-slate-400 font-mono border border-slate-850">
                          {store.slug}
                        </code>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-slate-300 font-medium">{store.vendor?.name}</span>
                          <span className="text-slate-500 text-[10px]">{store.vendor?.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {store.status === 'active' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 font-medium text-emerald-400">
                            <CheckCircle className="h-3 w-3" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 border border-red-500/20 px-2.5 py-0.5 font-medium text-red-400">
                            <AlertTriangle className="h-3 w-3" />
                            Suspended
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleToggleStatus(store._id, store.status)}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95 ${
                            store.status === 'active'
                              ? 'bg-red-950/40 text-red-400 hover:bg-red-950/70 border border-red-500/20'
                              : 'bg-emerald-950/40 text-emerald-400 hover:bg-emerald-950/70 border border-emerald-500/20'
                          }`}
                        >
                          {store.status === 'active' ? (
                            <>
                              <Ban className="h-3.5 w-3.5" />
                              Suspend Store
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-3.5 w-3.5" />
                              Approve Store
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Onboard Store Modal */}
      {showAddStoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowAddStoreModal(false)} />
          <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl backdrop-blur-md transition-all animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-900 pb-4 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building className="h-5 w-5 text-eco-400" />
                Onboard New Storefront
              </h3>
              <button onClick={() => setShowAddStoreModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {addStoreError && (
              <div className="mb-4 rounded-lg bg-red-950/20 border border-red-500/20 p-3 text-red-400 text-xs">
                {addStoreError}
              </div>
            )}
            {addStoreSuccess && (
              <div className="mb-4 rounded-lg bg-emerald-950/20 border border-emerald-500/20 p-3 text-emerald-400 text-xs">
                {addStoreSuccess}
              </div>
            )}

            <form onSubmit={handleCreateStore} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Storefront Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Eco Leaf Designs"
                  value={newStore.name}
                  onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
                  className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 text-white placeholder-slate-600 focus:border-eco-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Description</label>
                <textarea
                  placeholder="Tell customers about this storefront brand..."
                  value={newStore.description}
                  onChange={(e) => setNewStore({ ...newStore, description: e.target.value })}
                  className="w-full h-20 rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 text-white placeholder-slate-600 focus:border-eco-500 focus:outline-none resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Assigned Vendor Owner</label>
                <select
                  required
                  value={newStore.vendor}
                  onChange={(e) => setNewStore({ ...newStore, vendor: e.target.value })}
                  className="w-full rounded-lg bg-slate-900 border border-slate-850 px-3 py-2 text-white focus:border-eco-500 focus:outline-none"
                >
                  <option value="">-- Choose Vendor User --</option>
                  {vendors.map(vendor => (
                    <option key={vendor._id} value={vendor._id}>
                      {vendor.name} ({vendor.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Logo Image URL (Optional)</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=100"
                  value={newStore.logo}
                  onChange={(e) => setNewStore({ ...newStore, logo: e.target.value })}
                  className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 text-white placeholder-slate-600 focus:border-eco-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Banner Image URL (Optional)</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600"
                  value={newStore.banner}
                  onChange={(e) => setNewStore({ ...newStore, banner: e.target.value })}
                  className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 text-white placeholder-slate-600 focus:border-eco-500 focus:outline-none"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddStoreModal(false)}
                  className="flex-1 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 py-2 text-slate-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addStoreLoading}
                  className="flex-1 rounded-lg bg-eco-600 hover:bg-eco-500 py-2 text-white transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  {addStoreLoading ? 'Creating...' : 'Onboard Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
