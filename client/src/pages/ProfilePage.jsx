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
