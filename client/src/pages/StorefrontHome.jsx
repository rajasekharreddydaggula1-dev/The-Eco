import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { ShoppingBag, Search, Sparkles, Building, ChevronRight, Check, Trophy, Leaf, Users, Shield, Award, TrendingUp } from 'lucide-react';
import { fetchStores, fetchStoreBySlug, clearCurrentStore } from '../store/slices/storeSlice';
import { fetchProducts, clearProducts } from '../store/slices/productSlice';
import ProductCard from '../components/ProductCard';

export default function StorefrontHome({ onCartClick, cartCount = 0 }) {
  const { storeSlug } = useParams();
  const dispatch = useDispatch();

  const { stores, currentStore, loading: storeLoading } = useSelector(state => state.stores);
  const { products, loading: productsLoading } = useSelector(state => state.products);

  const [searchParams, setSearchParams] = useSearchParams();
  const searchParamTerm = searchParams.get('search') || '';

  const [searchTerm, setSearchTerm] = useState(searchParamTerm);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [leaderboard, setLeaderboard] = useState({ topCustomers: [], topStores: [] });
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  // Sync searchParamTerm to state
  useEffect(() => {
    setSearchTerm(searchParamTerm);
  }, [searchParamTerm]);

  useEffect(() => {
    if (!storeSlug) {
      setLeaderboardLoading(true);
      fetch('/api/stores/eco-leaderboard')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setLeaderboard(data.data);
          }
        })
        .catch(err => console.error("Error fetching eco leaderboard:", err))
        .finally(() => setLeaderboardLoading(false));
    }
  }, [storeSlug]);

  // 1. Load Stores List if at root, or Load Specific Store details if storeSlug is present
  useEffect(() => {
    dispatch(clearProducts());
    dispatch(clearCurrentStore());
    setSelectedCategory('');
    setSearchTerm('');

    if (!storeSlug) {
      dispatch(fetchStores());
      localStorage.removeItem('last_visited_store');
    } else {
      dispatch(fetchStoreBySlug(storeSlug));
      localStorage.setItem('last_visited_store', storeSlug);
    }

    return () => {
      dispatch(clearProducts());
      dispatch(clearCurrentStore());
    };
  }, [storeSlug, dispatch]);

  // 2. Load Products in parallel using storeSlug
  useEffect(() => {
    if (storeSlug) {
      dispatch(fetchProducts({ 
        tenantSlug: storeSlug, 
        search: searchTerm, 
        category: selectedCategory 
      }));
    }
  }, [storeSlug, searchTerm, selectedCategory, dispatch]);

  const triggerToast = (productName) => {
    setToastMessage(`Added ${productName} to your cart!`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Render ROOT general directory listing all stores
  if (!storeSlug) {
    return (
      <div className="relative min-h-screen bg-animated-gradient py-16 overflow-hidden">
        {/* Dot grid pattern overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none" />

        {/* Decorative blur glows */}
        <div className="absolute top-1/4 left-1/4 h-80 w-80 rounded-full bg-brand-500/10 blur-[100px] animate-drift-slow" />
        <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-eco-500/10 blur-[120px] animate-drift-slower" />
        <div className="absolute top-10 right-10 h-72 w-72 rounded-full bg-eco-400/5 blur-[90px]" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
          {/* Hero Header */}
          <div className="text-center max-w-2xl mx-auto space-y-6 animate-slide-up">
            <div className="inline-flex items-center gap-2 rounded-full bg-eco-500/10 px-4.5 py-1.5 text-xs font-semibold text-eco-400 border border-eco-500/20 shadow-sm backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-brand-400 animate-pulse" />
              SaaS Multi-Tenant Ecosystem
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl leading-tight">
              Explore Storefronts on <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-eco-400">The Eco</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-400/90 leading-relaxed">
              A premium marketplace powered by database partitioning. Enter any of our independent merchant storefronts below to browse and purchase items securely.
            </p>
          </div>

          {/* Directory Listings */}
          {storeLoading ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl glass-panel overflow-hidden border border-slate-900 bg-slate-950/40">
                  <div className="h-36 w-full bg-slate-900/60 shimmer-sweep relative" />
                  <div className="p-6 relative -mt-8 flex flex-col justify-between min-h-[160px] bg-slate-950/60 backdrop-blur-md">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-xl bg-slate-900 border border-slate-800 flex-shrink-0 shimmer-sweep" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-800 rounded-md w-3/4 shimmer-sweep" />
                        <div className="h-3 bg-slate-900 rounded-md w-1/2 shimmer-sweep" />
                      </div>
                    </div>
                    <div className="space-y-2 mt-4">
                      <div className="h-3 bg-slate-900 rounded-md w-full shimmer-sweep" />
                      <div className="h-3 bg-slate-900 rounded-md w-5/6 shimmer-sweep" />
                    </div>
                    <div className="mt-5 pt-4 border-t border-slate-900 flex justify-between items-center">
                      <div className="h-3.5 bg-slate-850 rounded-md w-24 shimmer-sweep" />
                      <div className="h-4 w-4 bg-slate-850 rounded-full shimmer-sweep" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : stores.length === 0 ? (
            <div className="text-center text-slate-500 py-16 border border-dashed border-slate-800 rounded-2xl max-w-md mx-auto bg-slate-950/40 backdrop-blur-md">
              No storefronts are currently registered. Register as a Merchant/Vendor on the login page to launch a storefront!
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              {stores.map((store, index) => (
                <Link
                  key={store._id}
                  to={`/store/${store.slug}`}
                  style={{ animationDelay: `${index * 75}ms` }}
                  className="group block rounded-2xl glass-panel card-elevate overflow-hidden animate-fade-in-up"
                >
                  {/* Banner */}
                  <div className="h-36 w-full bg-slate-950 overflow-hidden relative">
                    <img
                      src={store.banner || 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600'}
                      alt=""
                      className="h-full w-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                    
                    {/* Active Partner Tag */}
                    <span className="absolute top-4 right-4 rounded-full bg-eco-950/80 backdrop-blur-md px-3 py-1 text-[9px] font-bold tracking-wider text-eco-400 uppercase border border-eco-500/20">
                      Active Partner
                    </span>
                  </div>

                  {/* Store Details */}
                  <div className="p-6 relative -mt-8 flex flex-col justify-between min-h-[160px] bg-slate-950/50 backdrop-blur-md">
                    <div className="flex items-start gap-4">
                      {/* Logo */}
                      <div className="h-12 w-12 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex-shrink-0 flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 duration-300">
                        {store.logo ? (
                          <img src={store.logo} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-lg font-bold text-slate-400">{store.name[0]}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-white group-hover:text-brand-400 transition-colors truncate">
                          {store.name}
                        </h3>
                        <p className="text-[10px] text-slate-500 font-mono tracking-tight mt-0.5">/store/{store.slug}</p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 mt-4 line-clamp-2 leading-relaxed">
                      {store.description || 'No store description provided by vendor.'}
                    </p>

                    <div className="mt-5 pt-4 border-t border-slate-900 flex justify-between items-center text-xs font-bold text-eco-400 group-hover:text-brand-400 transition-colors">
                      <span>Browse Products</span>
                      <ChevronRight className="h-4 w-4 transform transition-transform group-hover:translate-x-1 duration-300" />
                    </div>
                  </div>
                 </Link>
              ))}
            </div>
          )}

          {/* Eco Impact Leaderboard Section */}
          {!leaderboardLoading && leaderboard && (leaderboard.topCustomers?.length > 0 || leaderboard.topStores?.length > 0) && (() => {
            const maxCustomerCarbon = Math.max(...leaderboard.topCustomers.map(c => c.carbonSaved || 0), 1);
            const maxStoreCarbon = Math.max(...leaderboard.topStores.map(s => s.carbonSaved || 0), 1);
            const totalTrees = leaderboard.topCustomers.reduce((sum, c) => sum + (c.treesPlanted || 0), 0);
            const totalCarbonSaved = (
              leaderboard.topCustomers.reduce((sum, c) => sum + (c.carbonSaved || 0), 0) +
              leaderboard.topStores.reduce((sum, s) => sum + (s.carbonSaved || 0), 0)
            ).toFixed(1);
            const activePartnersCount = leaderboard.topStores.length;

            return (
              <div className="border-t border-slate-900/60 pt-20 max-w-6xl mx-auto space-y-12 animate-fade-in-up">
                {/* Header */}
                <div className="text-center space-y-4 max-w-2xl mx-auto">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-4 py-1.5 text-xs font-bold text-emerald-450 border border-emerald-500/25 shadow-md backdrop-blur-md">
                    <Leaf className="h-3.5 w-3.5 animate-pulse text-emerald-400" />
                    <span>The Eco Initiative Community</span>
                  </span>
                  <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
                    Platform Sustainability Leaderboard
                  </h2>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Tracking collective environmental impacts across our multi-tenant SaaS ecosystem. Meet our top carbon-saving partners and shoppers!
                  </p>
                </div>

                {/* Platform Collective Stats Banner */}
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 max-w-4xl mx-auto">
                  {/* Stat 1 */}
                  <div className="glass-panel p-5 rounded-2xl flex items-center gap-4 relative overflow-hidden group hover:border-emerald-500/25 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
                    <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-440 flex-shrink-0 shadow-inner">
                      <Leaf className="h-6 w-6" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-2xl font-black text-white font-mono tracking-tight">{totalTrees}</p>
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Total Trees Planted</p>
                    </div>
                  </div>

                  {/* Stat 2 */}
                  <div className="glass-panel p-5 rounded-2xl flex items-center gap-4 relative overflow-hidden group hover:border-teal-500/25 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl group-hover:bg-teal-500/10 transition-colors" />
                    <div className="h-12 w-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 flex-shrink-0 shadow-inner">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-2xl font-black text-white font-mono tracking-tight">{totalCarbonSaved} kg</p>
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Total CO₂ Saved</p>
                    </div>
                  </div>

                  {/* Stat 3 */}
                  <div className="glass-panel p-5 rounded-2xl flex items-center gap-4 relative overflow-hidden group hover:border-amber-500/25 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors" />
                    <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-450 flex-shrink-0 shadow-inner">
                      <Building className="h-6 w-6" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-2xl font-black text-white font-mono tracking-tight">{activePartnersCount}</p>
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Eco-Certified Stores</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-8 md:grid-cols-2 lg:gap-12 pt-4">
                  {/* Column 1: Top Customers */}
                  <div className="glass-panel rounded-2xl p-6 md:p-8 space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/[0.02] rounded-full blur-3xl pointer-events-none" />
                    <div className="flex items-center justify-between pb-4 border-b border-slate-900">
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                          <Users className="h-4 w-4 text-emerald-400" />
                          <span>Top Green Shoppers</span>
                        </h3>
                        <p className="text-[11px] text-slate-505">Shoppers saving carbon through sustainable buying choices</p>
                      </div>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 uppercase tracking-widest font-mono">
                        Global
                      </span>
                    </div>

                    <div className="space-y-4">
                      {leaderboard.topCustomers.map((cust, idx) => {
                        // Styled rank badges
                        const isRank1 = idx === 0;
                        const isRank2 = idx === 1;
                        const isRank3 = idx === 2;

                        let rankBadgeClass = "bg-slate-900/60 border border-slate-800 text-slate-400";
                        let rankIcon = <span className="text-xs font-mono font-black">{idx + 1}</span>;

                        if (isRank1) {
                          rankBadgeClass = "bg-gradient-to-r from-amber-500/20 to-yellow-600/20 border-amber-500/40 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.15)]";
                          rankIcon = <Trophy className="h-3.5 w-3.5" />;
                        } else if (isRank2) {
                          rankBadgeClass = "bg-gradient-to-r from-slate-400/20 to-slate-500/20 border-slate-400/40 text-slate-300 shadow-[0_0_12px_rgba(148,163,184,0.15)]";
                          rankIcon = <Award className="h-3.5 w-3.5" />;
                        } else if (isRank3) {
                          rankBadgeClass = "bg-gradient-to-r from-amber-700/20 to-orange-700/20 border-amber-750/40 text-amber-600/90";
                          rankIcon = <Award className="h-3.5 w-3.5" />;
                        }

                        return (
                          <div 
                            key={cust._id || idx} 
                            id={`leaderboard-customer-${idx}`}
                            className="flex items-center justify-between p-4 rounded-xl border border-slate-900 bg-slate-950/20 hover:bg-slate-950/60 hover:border-emerald-500/20 transition-all duration-300 group/item"
                          >
                            <div className="flex items-center gap-3.5">
                              {/* Position Badge */}
                              <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover/item:scale-110 duration-300 ${rankBadgeClass}`}>
                                {rankIcon}
                              </div>

                              {/* Avatar */}
                              <div className="h-9 w-9 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xs text-emerald-440 font-extrabold flex-shrink-0 relative">
                                {cust.name ? cust.name[0].toUpperCase() : 'U'}
                                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border border-slate-950 flex items-center justify-center text-[7px] text-white">✓</span>
                              </div>

                              <div className="min-w-0">
                                <h4 className="font-bold text-white text-sm truncate group-hover/item:text-emerald-300 transition-colors">
                                  {cust.name}
                                </h4>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="text-[10px] text-slate-500">Eco Shopper</span>
                                  {cust.ecoPoints > 0 && (
                                    <>
                                      <span className="text-[9px] text-slate-650">•</span>
                                      <span className="text-[9px] font-bold text-brand-400 flex items-center gap-0.5">
                                        <Sparkles className="h-2.5 w-2.5" />
                                        {cust.ecoPoints} pts
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="text-right flex flex-col items-end gap-1 flex-shrink-0">
                              <p className="text-emerald-400 flex items-center gap-1 text-xs font-bold">
                                <span>🌳</span> {cust.treesPlanted || 0} {cust.treesPlanted === 1 ? 'tree' : 'trees'}
                              </p>
                              <p className="text-[11px] text-slate-450 font-mono">{(cust.carbonSaved || 0).toFixed(1)}kg CO₂ saved</p>
                              
                              {/* Relative Progress Bar */}
                              <div className="w-20 bg-slate-900/60 rounded-full h-1 overflow-hidden border border-slate-800/80 mt-1">
                                <div 
                                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-700" 
                                  style={{ width: `${Math.min(100, ((cust.carbonSaved || 0) / maxCustomerCarbon) * 105)}%` }} 
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Column 2: Top Stores */}
                  <div className="glass-panel rounded-2xl p-6 md:p-8 space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/[0.02] rounded-full blur-3xl pointer-events-none" />
                    <div className="flex items-center justify-between pb-4 border-b border-slate-900">
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                          <Building className="h-4 w-4 text-emerald-400" />
                          <span>Greenest Merchant Partners</span>
                        </h3>
                        <p className="text-[11px] text-slate-505 font-medium">Stores minimizing environmental footprint in logistics</p>
                      </div>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/20 text-teal-450 uppercase tracking-widest font-mono">
                        Partners
                      </span>
                    </div>

                    <div className="space-y-4">
                      {leaderboard.topStores.map((store, idx) => {
                        // Styled rank badges
                        const isRank1 = idx === 0;
                        const isRank2 = idx === 1;
                        const isRank3 = idx === 2;

                        let rankBadgeClass = "bg-slate-900/60 border border-slate-800 text-slate-400";
                        let rankIcon = <span className="text-xs font-mono font-black">{idx + 1}</span>;

                        if (isRank1) {
                          rankBadgeClass = "bg-gradient-to-r from-amber-500/20 to-yellow-600/20 border-amber-500/40 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.15)]";
                          rankIcon = <Trophy className="h-3.5 w-3.5" />;
                        } else if (isRank2) {
                          rankBadgeClass = "bg-gradient-to-r from-slate-400/20 to-slate-500/20 border-slate-400/40 text-slate-300 shadow-[0_0_12px_rgba(148,163,184,0.15)]";
                          rankIcon = <Award className="h-3.5 w-3.5" />;
                        } else if (isRank3) {
                          rankBadgeClass = "bg-gradient-to-r from-amber-700/20 to-orange-700/20 border-amber-750/40 text-amber-600/90";
                          rankIcon = <Award className="h-3.5 w-3.5" />;
                        }

                        return (
                          <Link 
                            key={store._id || idx} 
                            to={`/store/${store.slug}`}
                            id={`leaderboard-store-${store.slug}`}
                            className="flex items-center justify-between p-4 rounded-xl border border-slate-900 bg-slate-950/20 hover:bg-slate-950/60 hover:border-teal-500/20 transition-all duration-300 group/item cursor-pointer"
                          >
                            <div className="flex items-center gap-3.5 min-w-0">
                              {/* Position Badge */}
                              <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover/item:scale-110 duration-300 ${rankBadgeClass}`}>
                                {rankIcon}
                              </div>

                              {/* Logo */}
                              <div className="h-9 w-9 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center flex-shrink-0 shadow-md">
                                {store.logo ? (
                                  <img src={store.logo} alt="" className="h-full w-full object-cover" />
                                ) : (
                                  <span className="font-bold text-white text-xs">{store.name[0].toUpperCase()}</span>
                                )}
                              </div>

                              <div className="min-w-0">
                                <h4 className="font-bold text-white text-sm truncate group-hover/item:text-teal-350 transition-colors">
                                  {store.name}
                                </h4>
                                <p className="text-[10px] text-slate-500 font-mono tracking-tight mt-0.5 truncate">/store/{store.slug}</p>
                              </div>
                            </div>

                            <div className="text-right flex flex-col items-end gap-1 flex-shrink-0">
                              <p className="text-teal-400 flex items-center gap-1 text-xs font-bold">
                                <span>🌱</span> {(store.carbonSaved || 0).toFixed(1)}kg CO₂
                              </p>
                              <div className="flex items-center gap-1 text-[10px]">
                                <span className="text-slate-550">Eco Score</span>
                                <span className="font-bold text-brand-400">{store.ecoScore || 85}%</span>
                              </div>
                              
                              {/* Relative Progress Bar */}
                              <div className="w-20 bg-slate-900/60 rounded-full h-1 overflow-hidden border border-slate-800/80 mt-1">
                                <div 
                                  className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all duration-700" 
                                  style={{ width: `${Math.min(100, ((store.carbonSaved || 0) / maxStoreCarbon) * 105)}%` }} 
                                />
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    );
  }

  // Render SPECIFIC Store Catalog loading skeleton
  if (storeLoading) {
    return (
      <div className="min-h-screen bg-slate-950">
        {/* Banner Skeleton */}
        <div className="relative h-60 w-full overflow-hidden bg-slate-950 border-b border-slate-900">
          <div className="h-full w-full bg-slate-900/60 shimmer-sweep" />
          <div className="absolute bottom-6 left-0 right-0">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-end gap-4">
              <div className="h-16 w-16 rounded-xl bg-slate-950 border border-slate-800 flex-shrink-0 shimmer-sweep" />
              <div className="space-y-2 pb-1">
                <div className="h-6 bg-slate-850 rounded-md w-48 shimmer-sweep" />
                <div className="h-3.5 bg-slate-900 rounded-md w-72 shimmer-sweep" />
              </div>
            </div>
          </div>
        </div>

        {/* Catalog Body Skeleton */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          {/* Filters skeleton */}
          <div className="flex gap-1.5 pb-6 border-b border-slate-900">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 w-20 bg-slate-900 rounded-lg border border-slate-850 shimmer-sweep" />
            ))}
          </div>

          {/* Product grid skeletons */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col overflow-hidden rounded-xl border border-slate-900 bg-slate-950/40">
                <div className="relative aspect-square bg-slate-900/60 shimmer-sweep" />
                <div className="p-4 flex flex-col flex-1 space-y-3">
                  <div className="h-4 bg-slate-850 rounded-md w-3/4 shimmer-sweep" />
                  <div className="space-y-1.5">
                    <div className="h-3 bg-slate-900 rounded-md w-full shimmer-sweep" />
                    <div className="h-3 bg-slate-900 rounded-md w-5/6 shimmer-sweep" />
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <div className="h-5 bg-slate-800 rounded-md w-16 shimmer-sweep" />
                    <div className="h-3 bg-slate-900 rounded-md w-12 shimmer-sweep" />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <div className="h-8 bg-slate-850 rounded-lg flex-1 shimmer-sweep" />
                    <div className="h-8 w-10 bg-slate-850 rounded-lg shimmer-sweep" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!currentStore) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 bg-slate-950">
        <span className="text-4xl mb-4">⚠️</span>
        <h2 className="text-lg font-bold text-slate-200">Storefront Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">The store matching slug "/store/{storeSlug}" does not exist or has been suspended.</p>
        <Link to="/" className="mt-6 rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-500">
          Return to Marketplace Directory
        </Link>
      </div>
    );
  }

  // Categories list extracted from products
  const categories = [...new Set(products.map(p => p.category))];

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-eco-600 border border-eco-500 px-4 py-3.5 text-xs font-semibold text-white shadow-2xl animate-bounce">
          <Check className="h-4 w-4" />
          {toastMessage}
        </div>
      )}

      {/* Hero Banner Banner image */}
      <div className="relative h-60 w-full overflow-hidden bg-slate-950">
        <img
          src={currentStore.banner || 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200'}
          alt=""
          className="h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
        
        {/* Store description metadata overlay */}
        <div className="absolute bottom-6 left-0 right-0">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="h-16 w-16 rounded-xl bg-slate-900 border border-slate-700 overflow-hidden flex-shrink-0 flex items-center justify-center shadow-lg">
              {currentStore.logo ? (
                <img src={currentStore.logo} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-white">{currentStore.name[0]}</span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight leading-none">{currentStore.name}</h1>
              <p className="text-xs text-slate-300 mt-1.5 max-w-xl line-clamp-1">{currentStore.description || 'Welcome to our shop storefront.'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Catalog body */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Filters and search controls */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-900 pb-6">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5 items-center">
            <button
              onClick={() => setSelectedCategory('')}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold border transition-all ${
                selectedCategory === ''
                  ? 'bg-eco-600 text-white border-eco-500 shadow-md shadow-eco-600/10'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              All Items
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold border transition-all ${
                  selectedCategory === cat
                    ? 'bg-eco-600 text-white border-eco-500 shadow-md shadow-eco-600/10'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search input */}
          <div className="relative max-w-xs w-full">
            <Search className="absolute top-2.5 left-3 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSearchParams({ search: e.target.value });
              }}
              className="w-full bg-slate-900/50 border border-slate-850 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-eco-500"
            />
          </div>
        </div>

        {/* Product Grid */}
        {productsLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col overflow-hidden rounded-xl border border-slate-900 bg-slate-950/40">
                <div className="relative aspect-square bg-slate-900/60 shimmer-sweep" />
                <div className="p-4 flex flex-col flex-1 space-y-3">
                  <div className="h-4 bg-slate-850 rounded-md w-3/4 shimmer-sweep" />
                  <div className="space-y-1.5">
                    <div className="h-3 bg-slate-900 rounded-md w-full shimmer-sweep" />
                    <div className="h-3 bg-slate-900 rounded-md w-5/6 shimmer-sweep" />
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <div className="h-5 bg-slate-800 rounded-md w-16 shimmer-sweep" />
                    <div className="h-3 bg-slate-900 rounded-md w-12 shimmer-sweep" />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <div className="h-8 bg-slate-850 rounded-lg flex-1 shimmer-sweep" />
                    <div className="h-8 w-10 bg-slate-850 rounded-lg shimmer-sweep" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center text-slate-500 py-16 border border-dashed border-slate-800 rounded-xl">
            No products match your filters. Check back later!
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product, index) => (
              <ProductCard
                key={product._id}
                product={product}
                storeSlug={storeSlug}
                index={index}
                onQuickAdded={triggerToast}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
