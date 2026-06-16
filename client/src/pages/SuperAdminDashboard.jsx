import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, ShoppingBag, DollarSign, Building, AlertTriangle, CheckCircle, Ban, LogOut } from 'lucide-react';
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
    
    fetchMetrics();
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
                <DollarSign className="h-5 w-5 text-brand-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">${analytics?.platformRevenue?.toFixed(2) || '0.00'}</span>
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
          <div className="border-b border-slate-850 bg-slate-900/40 px-6 py-4">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Tenant Stores Registry</h2>
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
    </div>
  );
}
