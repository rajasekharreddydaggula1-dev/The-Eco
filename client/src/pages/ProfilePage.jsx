import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders, cancelOrder, returnOrder } from '../store/slices/orderSlice';
import { logout } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Wallet, ShieldAlert, ShoppingBag, Truck, CheckCircle2, ChevronDown, ChevronUp, Calendar, MapPin, CreditCard, ArrowRight, HelpCircle } from 'lucide-react';
import WalletModal from '../components/WalletModal';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const { orders, loading, error } = useSelector(state => state.orders);

  const [expandedOrder, setExpandedOrder] = useState(null);
  const [walletOpen, setWalletOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  const ecoTips = [
    "A single mature tree absorbs about 22kg of carbon dioxide per year! 🌳",
    "Bamboo is one of the fastest-growing plants on earth, absorbing tons of CO₂! 🎋",
    "Trees release organic compounds that can help improve human immunity. 🌲",
    "Planting trees helps stabilize soil and prevents erosion in local ecosystems. 🌿",
    "Trees in forests communicate and share resources through a network of fungi! 🍄",
    "Mangroves sequester carbon at rates up to 4 times greater than terrestrial forests! 🌊",
    "Urban trees can cool cities by up to 8°C by providing shade and evapotranspiration! 🏙️"
  ];

  const [activeTip, setActiveTip] = useState(ecoTips[0]);

  const renderTreeSVG = (type, index) => {
    switch (type) {
      case 'oak':
        return (
          <svg key={index} className="w-12 h-16 hover:scale-110 transition-transform cursor-pointer drop-shadow-md" viewBox="0 0 100 120">
            <rect x="44" y="70" width="12" height="40" rx="3" fill="#78350f" />
            <circle cx="50" cy="45" r="30" fill="#047857" />
            <circle cx="35" cy="50" r="22" fill="#065f46" />
            <circle cx="65" cy="50" r="22" fill="#065f46" />
            <circle cx="50" cy="30" r="22" fill="#10b981" />
          </svg>
        );
      case 'pine':
        return (
          <svg key={index} className="w-10 h-16 hover:scale-110 transition-transform cursor-pointer drop-shadow-md" viewBox="0 0 100 120">
            <rect x="45" y="80" width="10" height="30" rx="2" fill="#451a03" />
            <polygon points="50,15 20,60 80,60" fill="#064e3b" />
            <polygon points="50,30 25,70 75,70" fill="#0f766e" />
            <polygon points="50,45 30,85 70,85" fill="#14b8a6" />
          </svg>
        );
      case 'bamboo':
        return (
          <svg key={index} className="w-8 h-16 hover:scale-110 transition-transform cursor-pointer drop-shadow-md" viewBox="0 0 80 120">
            <rect x="36" y="10" width="8" height="25" rx="1" fill="#065f46" />
            <rect x="36" y="38" width="8" height="25" rx="1" fill="#047857" />
            <rect x="36" y="66" width="8" height="25" rx="1" fill="#10b981" />
            <rect x="36" y="94" width="8" height="20" rx="1" fill="#34d399" />
            <line x1="34" y1="36" x2="46" y2="36" stroke="#064e3b" strokeWidth="2" />
            <line x1="34" y1="64" x2="46" y2="64" stroke="#064e3b" strokeWidth="2" />
            <line x1="34" y1="92" x2="46" y2="92" stroke="#064e3b" strokeWidth="2" />
            <path d="M 44,20 C 55,15 60,18 60,18 C 60,18 52,24 44,22 Z" fill="#10b981" />
            <path d="M 36,48 C 25,43 20,46 20,46 C 20,46 28,52 36,50 Z" fill="#047857" />
          </svg>
        );
      default:
        return (
          <svg key={index} className="w-8 h-10 hover:scale-110 transition-transform cursor-pointer drop-shadow-md animate-bounce" viewBox="0 0 60 80">
            <path d="M 30,75 Q 30,40 45,25" fill="none" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
            <path d="M 45,25 C 50,10 35,5 35,5 C 35,5 32,18 45,25 Z" fill="#34d399" />
            <path d="M 30,45 C 15,35 10,48 10,48 C 10,48 22,50 30,45 Z" fill="#059669" />
          </svg>
        );
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    } else {
      dispatch(fetchOrders());
    }
  }, [user, navigate, dispatch]);

  const handleLogoutClick = () => {
    dispatch(logout());
    navigate('/auth');
  };

  const toggleOrderExpand = (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        const result = await dispatch(cancelOrder({ id: orderId }));
        if (cancelOrder.fulfilled.match(result)) {
          setActionMessage('Order cancelled successfully!');
          setTimeout(() => setActionMessage(''), 3000);
        } else {
          alert(result.payload || 'Failed to cancel order.');
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleReturnOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to return this order?')) {
      try {
        const result = await dispatch(returnOrder({ id: orderId }));
        if (returnOrder.fulfilled.match(result)) {
          setActionMessage('Return processed and refunded successfully!');
          setTimeout(() => setActionMessage(''), 3000);
        } else {
          alert(result.payload || 'Failed to return order.');
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Helper to format date
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper to resolve progress bar states
  const getStatusSteps = (status) => {
    const steps = [
      { name: 'Order Placed', completed: true, active: true },
      { name: 'Payment Confirmed', completed: ['paid', 'shipped', 'delivered'].includes(status), active: ['paid', 'shipped', 'delivered'].includes(status) },
      { name: 'Shipped', completed: ['shipped', 'delivered'].includes(status), active: ['shipped', 'delivered'].includes(status) },
      { name: 'Delivered', completed: status === 'delivered', active: status === 'delivered' }
    ];
    return steps;
  };

  return (
    <div className="min-h-screen bg-slate-950 py-10 relative">
      <div className="absolute top-10 left-10 h-72 w-72 rounded-full bg-brand-600/5 blur-3xl" />
      <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-eco-600/5 blur-3xl" />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10 space-y-8 animate-slide-up">
        {/* Page Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-900 pb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Your Account</h1>
            <p className="text-xs text-slate-400 mt-1">Manage your profile, track active shipments, and view order history.</p>
          </div>
          <button
            onClick={handleLogoutClick}
            className="rounded-lg bg-slate-900 border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-red-400 hover:border-red-500/20 transition-all active:scale-95"
          >
            Logout Account
          </button>
        </div>

        {/* GREEN FOREST WIDGET */}
        {user?.role === 'Customer' && (
          <div className="rounded-2xl border border-slate-900 bg-slate-950/40 p-6 space-y-6 backdrop-blur-md relative overflow-hidden animate-fade-in-up">
            <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-emerald-500/5 blur-2xl animate-pulse" />
            <div className="absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-teal-500/5 blur-2xl animate-pulse" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                  <span>🌳</span> My Virtual Eco-Forest
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Your carbon-offsetting forest grows as you make sustainable purchases and check the "Plant a Tree" box!
                </p>
              </div>

              {/* Eco Stats breakdown */}
              <div className="flex flex-wrap gap-3">
                <div className="rounded-xl bg-slate-900/60 border border-slate-850 px-4 py-2.5 flex items-center gap-3">
                  <span className="text-xl">✨</span>
                  <div>
                    <p className="text-[9px] uppercase font-bold text-slate-500">Eco-Points</p>
                    <p className="text-sm font-extrabold text-white">{user.ecoPoints || 0}</p>
                  </div>
                </div>
                <div className="rounded-xl bg-slate-900/60 border border-slate-850 px-4 py-2.5 flex items-center gap-3">
                  <span className="text-xl">🌱</span>
                  <div>
                    <p className="text-[9px] uppercase font-bold text-slate-500">CO₂ Offset</p>
                    <p className="text-sm font-extrabold text-emerald-450">{(user.carbonSaved || 0).toFixed(1)} kg</p>
                  </div>
                </div>
                <div className="rounded-xl bg-slate-900/60 border border-slate-850 px-4 py-2.5 flex items-center gap-3">
                  <span className="text-xl">🌳</span>
                  <div>
                    <p className="text-[9px] uppercase font-bold text-slate-500">Trees Planted</p>
                    <p className="text-sm font-extrabold text-white">{user.treesPlanted || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Speech bubble tip */}
            {activeTip && (
              <div className="relative bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-3.5 text-xs text-emerald-350 max-w-2xl animate-fade-in-up">
                <div className="absolute -bottom-2 left-6 w-3 h-3 bg-slate-950 border-r border-b border-emerald-500/20 transform rotate-45" />
                <span className="font-bold mr-1">💡 Eco Fact:</span> {activeTip}
              </div>
            )}

            {/* Forest Landscape Garden */}
            <div className="relative min-h-[160px] rounded-xl border border-slate-900 bg-slate-950/40 p-4 flex flex-col justify-end overflow-hidden shadow-inner">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/90 to-emerald-950/10 pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 h-4 bg-emerald-950/30 border-t border-emerald-500/10" />

              <div className="relative z-10 flex flex-wrap items-end justify-center gap-4 px-4 pb-2 min-h-[120px]">
                {!(user.treesPlanted > 0) ? (
                  <div 
                    onClick={() => setActiveTip(ecoTips[Math.floor(Math.random() * ecoTips.length)])}
                    className="flex flex-col items-center justify-center text-center p-6 space-y-3 cursor-pointer"
                  >
                    {renderTreeSVG('sprout', 0)}
                    <p className="text-[11px] text-slate-500 max-w-sm">
                      Your eco-forest is empty. Purchase sustainable items or select <strong className="text-emerald-400">"Plant a Tree"</strong> at checkout to plant your first tree! Click me for an Eco Fact.
                    </p>
                  </div>
                ) : (
                  <>
                    {Array.from({ length: user.treesPlanted }).slice(0, 24).map((_, idx) => {
                      const treeTypes = ['oak', 'pine', 'bamboo'];
                      const type = treeTypes[idx % treeTypes.length];
                      return (
                        <div 
                          key={idx} 
                          onClick={() => {
                            const idxTip = (idx) % ecoTips.length;
                            setActiveTip(ecoTips[idxTip]);
                          }}
                          className="transition-transform duration-300 transform origin-bottom hover:-translate-y-1"
                          title={`Virtual ${type} tree. Click for fact.`}
                        >
                          {renderTreeSVG(type, idx)}
                        </div>
                      );
                    })}
                    {user.treesPlanted > 24 && (
                      <div className="h-10 flex items-center justify-center rounded-full bg-slate-900/80 border border-slate-800 px-3 py-1.5 text-[10px] font-bold text-slate-400">
                        + {user.treesPlanted - 24} more
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          {/* PROFILE SUMMARY COLUMN */}
          <div className="md:col-span-1 space-y-6">
            {/* User Profile Card */}
            <div className="rounded-2xl border border-slate-900 bg-slate-950/40 p-6 space-y-5 backdrop-blur-md">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Profile Details</h2>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 font-bold">
                  {user?.name ? user.name[0] : 'U'}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white truncate">{user?.name}</h3>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">{user?.email}</p>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-900 text-xs">
                <div className="flex items-center gap-2 text-slate-400">
                  <User className="h-4 w-4 text-slate-600" />
                  <span>Role: <strong>{user?.role}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Mail className="h-4 w-4 text-slate-600" />
                  <span className="truncate">Email Verified</span>
                </div>
              </div>
            </div>

            {/* Wallet Quick Access Card */}
            <div className="rounded-2xl border border-slate-900 bg-slate-950/40 p-6 space-y-4 backdrop-blur-md">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Wallet Account</h2>
              <div className="flex justify-between items-center bg-slate-900/40 border border-slate-900 rounded-xl p-4">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Balance Available</span>
                  <p className="text-xl font-extrabold text-white">
                    {user?.walletBalance !== undefined 
                      ? Number(user.walletBalance).toLocaleString('en-IN', { style: 'currency', currency: 'INR' }) 
                      : '₹0.00'}
                  </p>
                </div>
                <div className="rounded-full bg-eco-500/10 p-2 text-eco-400">
                  <Wallet className="h-6 w-6" />
                </div>
              </div>
              <button
                onClick={() => setWalletOpen(true)}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-eco-600 hover:bg-eco-500 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-eco-600/10 transition-all active:scale-95"
              >
                Recharge Balance
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* ORDERS & TRACKING COLUMN */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ShoppingBag className="h-4 w-4 text-brand-400" /> Order History & Live Tracking
              </h2>
              <span className="text-[10px] text-slate-500 font-semibold">{orders.length} Orders</span>
            </div>

            {loading ? (
              <div className="text-center text-slate-500 py-12 bg-slate-950/40 border border-slate-900 rounded-2xl">
                Loading orders...
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center text-slate-500 py-16 bg-slate-950/40 border border-slate-900 border-dashed rounded-2xl space-y-4">
                <ShoppingBag className="h-10 w-10 text-slate-700 mx-auto" />
                <h3 className="text-sm font-semibold text-slate-300">No Orders Found</h3>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">You haven't placed any orders yet. Visit any of our store merchant channels to shop items!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const isExpanded = expandedOrder === order._id;
                  const statusSteps = getStatusSteps(order.status);
                  
                  return (
                    <div key={order._id} className="rounded-2xl border border-slate-900 bg-slate-950/40 overflow-hidden backdrop-blur-md">
                      {/* Order Summary Header */}
                      <div 
                        onClick={() => toggleOrderExpand(order._id)}
                        className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 gap-3 cursor-pointer hover:bg-slate-900/10 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white uppercase font-mono tracking-tight">Order #{order._id.substring(order._id.length - 8)}</span>
                            <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                              order.status === 'delivered' ? 'bg-eco-950 text-eco-400' :
                              order.status === 'cancelled' ? 'bg-red-950 text-red-400' :
                              order.status === 'returned' ? 'bg-slate-900 text-slate-400 border border-slate-800' :
                              'bg-brand-950 text-brand-400'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-[10px] text-slate-500">
                            <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-slate-600" /> {formatDate(order.createdAt)}</span>
                            <span>Store: <strong>{order.store?.name || 'Eco Partner'}</strong></span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 self-end sm:self-center">
                          <span className="text-sm font-extrabold text-eco-400">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                          {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                        </div>
                      </div>

                      {/* Expanded Order Tracking Details */}
                      {isExpanded && (
                        <div className="border-t border-slate-900/50 bg-slate-950/80 p-5 space-y-6 animate-slide-up">
                          {/* Live Shipment Tracking Timeline */}
                          {order.status === 'cancelled' ? (
                            <div className="flex items-center gap-2.5 rounded-xl bg-red-950/20 border border-red-500/20 p-4 text-xs text-red-400">
                              <ShieldAlert className="h-5 w-5" />
                              <div>
                                <h4 className="font-bold">This order has been cancelled</h4>
                                <p className="text-[10px] text-slate-400 mt-0.5">Funds have been rolled back to your original payment method.</p>
                              </div>
                            </div>
                          ) : order.status === 'returned' ? (
                            <div className="flex items-center gap-2.5 rounded-xl bg-slate-900 border border-slate-800 p-4 text-xs text-slate-300">
                              <ShieldAlert className="h-5 w-5 text-amber-500" />
                              <div>
                                <h4 className="font-bold text-white">This order was returned</h4>
                                <p className="text-[10px] text-slate-400 mt-0.5">The return process completed and the grand total has been refunded to your wallet.</p>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="space-y-4">
                              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Truck className="h-4 w-4 text-slate-600" /> Delivery Tracking Status</h4>
                              
                              <div className="relative pt-6 pb-2">
                                {/* Connector Line */}
                                <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-slate-800 sm:left-0 sm:right-0 sm:top-9 sm:bottom-auto sm:h-0.5 sm:w-auto" />
                                
                                <div className="grid gap-6 sm:grid-cols-4 relative z-10 text-left">
                                  {statusSteps.map((step, idx) => (
                                    <div key={idx} className="flex sm:flex-col items-center gap-3 sm:gap-2">
                                      <div className={`flex h-8 w-8 items-center justify-center rounded-full border shadow-md transition-all ${
                                        step.completed 
                                          ? 'bg-eco-600 border-eco-500 text-white shadow-eco-600/10' 
                                          : step.active 
                                            ? 'bg-brand-950 border-brand-500 text-brand-400 animate-pulse'
                                            : 'bg-slate-950 border-slate-800 text-slate-600'
                                      }`}>
                                        <CheckCircle2 className="h-4 w-4" />
                                      </div>
                                      <div className="sm:text-center text-xs">
                                        <h5 className={`font-semibold ${step.active ? 'text-white' : 'text-slate-500'}`}>{step.name}</h5>
                                        {step.completed && idx === 0 && <p className="text-[9px] text-slate-500 font-mono mt-0.5">Checked out</p>}
                                        {step.completed && idx === 1 && <p className="text-[9px] text-slate-500 font-mono mt-0.5">Paid via {order.paymentMethod}</p>}
                                        {step.completed && idx === 2 && <p className="text-[9px] text-slate-500 font-mono mt-0.5">In Transit</p>}
                                        {step.completed && idx === 3 && <p className="text-[9px] text-slate-500 font-mono mt-0.5">Received</p>}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Order Actions */}
                            {['pending', 'paid', 'delivered'].includes(order.status) && (
                              <div className="flex justify-end gap-3 pt-5 border-t border-slate-900">
                                {['pending', 'paid'].includes(order.status) && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCancelOrder(order._id);
                                    }}
                                    className="rounded-lg bg-red-950/40 border border-red-500/20 px-4 py-2 text-xs font-bold text-red-400 hover:bg-red-950/60 hover:border-red-500/40 transition-all active:scale-95 cursor-pointer"
                                  >
                                    Cancel Order
                                  </button>
                                )}
                                {order.status === 'delivered' && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleReturnOrder(order._id);
                                    }}
                                    className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-4 py-2 text-xs font-bold text-amber-400 hover:bg-amber-500/20 hover:border-amber-500/40 transition-all active:scale-95 cursor-pointer"
                                  >
                                    Return Items
                                  </button>
                                )}
                              </div>
                            )}
                          </>
                        )}

                          {/* Items List */}
                          <div className="space-y-3 border-t border-slate-900 pt-5">
                            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Order Items</h4>
                            <div className="space-y-2.5">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center text-xs">
                                  <div className="flex flex-col">
                                    <span className="font-semibold text-slate-200">{item.name}</span>
                                    {item.variantName && (
                                      <span className="text-[10px] text-slate-500">Variant: {item.variantName}</span>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <span className="text-slate-400">Qty: {item.quantity}</span>
                                    <span className="font-bold text-white ml-6">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Address & Payment Info */}
                          <div className="grid gap-4 sm:grid-cols-2 border-t border-slate-900 pt-5 text-xs text-slate-400">
                            <div className="space-y-2">
                              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-slate-600" /> Delivery Address</h4>
                              <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-3 font-medium leading-relaxed">
                                <p className="text-slate-200">{order.shippingAddress?.street}</p>
                                <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
                                <p>{order.shippingAddress?.postalCode}, {order.shippingAddress?.country}</p>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1"><CreditCard className="h-3.5 w-3.5 text-slate-600" /> Payment & Transaction Info</h4>
                              <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-3 font-medium space-y-1.5">
                                <p>Method: <strong className="text-white">{order.paymentMethod || 'Stripe'}</strong></p>
                                {order.paymentMethod === 'UPI' && order.paymentDetails?.upiId && (
                                  <p className="font-mono text-[10px]">UPI ID: {order.paymentDetails.upiId}</p>
                                )}
                                {order.paymentMethod === 'Card' && order.paymentDetails?.cardLast4 && (
                                  <p className="font-mono text-[10px]">Card: **** **** **** {order.paymentDetails.cardLast4}</p>
                                )}
                                {order.paymentMethod === 'Net Banking' && order.paymentDetails?.bankName && (
                                  <p>Bank: {order.paymentDetails.bankName}</p>
                                )}
                                <p className="font-mono text-[9px] text-slate-500 truncate mt-2">TxID: {order.stripeSessionId || order._id}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Global Wallet recharge portal overlay */}
      <WalletModal
        isOpen={walletOpen}
        onClose={() => setWalletOpen(false)}
      />

      {/* Floating Action Message Toast */}
      {actionMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-amber-500 text-slate-950 px-4 py-3.5 text-xs font-bold shadow-2xl animate-bounce">
          <CheckCircle2 className="h-4 w-4" />
          {actionMessage}
        </div>
      )}
    </div>
  );
}
