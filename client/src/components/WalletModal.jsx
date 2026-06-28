import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Wallet, Plus, ArrowUpRight, ArrowDownLeft, CheckCircle2, ShieldAlert } from 'lucide-react';
import { rechargeWallet } from '../store/slices/authSlice';

export default function WalletModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleRecharge = async (rechargeAmount) => {
    const val = Number(rechargeAmount || amount);
    if (!val || val <= 0) return;

    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const result = await dispatch(rechargeWallet({ amount: val }));
      if (rechargeWallet.fulfilled.match(result)) {
        if (result.payload && result.payload.url) {
          // Redirect user to Stripe secure payment page
          window.location.href = result.payload.url;
          return;
        }
        setSuccessMsg(`Successfully added ₹${val.toFixed(2)} to your wallet!`);
        setAmount('');
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setErrorMsg(result.payload || 'Failed to recharge wallet. Please try again.');
        setTimeout(() => setErrorMsg(''), 5000);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('An unexpected connection error occurred.');
      setTimeout(() => setErrorMsg(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const formattedBalance = user?.walletBalance !== undefined 
    ? Number(user.walletBalance).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
    : '₹0.00';

  // Simulated static transactions for realism
  const mockTransactions = [
    { id: 1, type: 'credit', desc: 'Wallet Recharge', date: 'Today', amt: 1000 },
    { id: 2, type: 'debit', desc: 'Order Checkout Payment', date: 'Yesterday', amt: 1250 },
    { id: 3, type: 'credit', desc: 'Welcome Bonus Credited', date: '16 Jun 2026', amt: 5000 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl backdrop-blur-md transition-all animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-900 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-eco-500/10 p-2 text-eco-400">
              <Wallet className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">Your Eco Wallet</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-900 hover:text-white transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="mt-6 space-y-6">
          {/* Card Display */}
          <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-eco-600 p-6 text-white shadow-xl shadow-brand-900/10 relative overflow-hidden">
            {/* Background glowing circle */}
            <div className="absolute -right-6 -bottom-6 h-36 w-36 rounded-full bg-white/5 blur-xl" />
            
            <p className="text-[10px] uppercase font-bold tracking-widest text-brand-200">Current Balance</p>
            <h2 className="text-3xl font-extrabold tracking-tight mt-1">{formattedBalance}</h2>
            <div className="mt-6 flex justify-between items-center text-[10px] font-mono text-brand-100">
              <span>CARD HOLDER: {user?.name || 'GUEST USER'}</span>
              <span>THE ECO PAY</span>
            </div>
          </div>

          {/* Quick Recharge Section */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quick Top-Up</label>
            <div className="grid grid-cols-3 gap-2">
              {[500, 1000, 2000].map((amt) => (
                <button
                  key={amt}
                  disabled={loading}
                  onClick={() => handleRecharge(amt)}
                  className="flex items-center justify-center gap-1 rounded-lg bg-slate-900 border border-slate-800 py-2.5 text-xs font-semibold text-white hover:border-eco-500 active:scale-95 transition-all"
                >
                  <Plus className="h-3 w-3 text-eco-400" />
                  ₹{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Recharge Form */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Custom Recharge</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-2 text-slate-500 text-sm">₹</span>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-7 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-eco-500"
                />
              </div>
              <button
                disabled={loading || !amount}
                onClick={() => handleRecharge()}
                className="rounded-lg bg-eco-600 hover:bg-eco-500 disabled:bg-slate-900 disabled:text-slate-600 disabled:border-slate-800 disabled:border px-5 text-xs font-semibold text-white transition-all active:scale-95 flex items-center justify-center"
              >
                {loading ? 'Adding...' : 'Add Cash'}
              </button>
            </div>
          </div>

          {/* Success message banner */}
          {successMsg && (
            <div className="flex items-center gap-2 rounded-lg bg-eco-950/40 border border-eco-500/20 p-3 text-xs text-eco-400 font-semibold">
              <CheckCircle2 className="h-4 w-4" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Error message banner */}
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-lg bg-red-950/40 border border-red-500/20 p-3 text-xs text-red-400 font-semibold">
              <ShieldAlert className="h-4 w-4" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Transaction History */}
          <div className="space-y-3 pt-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block border-t border-slate-900 pt-4">Recent Activity</label>
            <div className="space-y-2.5 max-h-36 overflow-y-auto pr-1">
              {mockTransactions.map((tx) => (
                <div key={tx.id} className="flex justify-between items-center bg-slate-900/30 border border-slate-900/50 rounded-lg p-2.5 text-xs">
                  <div className="flex items-center gap-2">
                    <div className={`rounded-full p-1 ${
                      tx.type === 'credit' ? 'bg-eco-950 text-eco-400' : 'bg-red-950 text-red-400'
                    }`}>
                      {tx.type === 'credit' ? <ArrowDownLeft className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-200">{tx.desc}</p>
                      <p className="text-[10px] text-slate-500">{tx.date}</p>
                    </div>
                  </div>
                  <span className={`font-bold ${tx.type === 'credit' ? 'text-eco-400' : 'text-slate-300'}`}>
                    {tx.type === 'credit' ? '+' : '-'} ₹{tx.amt.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
