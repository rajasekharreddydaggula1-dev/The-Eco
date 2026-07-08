import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, CreditCard, Landmark, Send, Wallet, Check, AlertCircle, Loader, Lock, Sparkles, Wifi, CheckCircle2, QrCode } from 'lucide-react';
import Logo from '../components/Logo';

export default function PaymentGateway() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');
  const initialMethod = searchParams.get('payment_method') || 'Card';

  const [order, setOrder] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [walletBalance, setWalletBalance] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Payment forms state
  const [paymentMethod, setPaymentMethod] = useState(initialMethod);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardFocused, setCardFocused] = useState('front'); // front or back

  const [upiId, setUpiId] = useState('');
  const [selectedBank, setSelectedBank] = useState('');

  // Payment processing simulation
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const processingMessages = [
    'Establishing secure 256-bit SSL gateway connection...',
    'Encrypting credentials and routing payload to the bank...',
    'Performing multi-tenant cryptographic verification...',
    'Deducting transaction funds from source vault...',
    'Securing order ledger and finalizing invoice records...'
  ];

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!sessionId) {
        setErrorMsg('Invalid checkout session. Please try again.');
        setLoadingOrder(false);
        return;
      }

      try {
        const token = localStorage.getItem('eco_token');
        // Fetch order details
        const response = await fetch(`/api/orders/session/${sessionId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const result = await response.json();
        
        if (response.ok && result.success) {
          setOrder(result.data);
          
          // If customer, fetch user profile for wallet balance and name
          const profileResponse = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const profileResult = await profileResponse.json();
          if (profileResponse.ok && profileResult.success) {
            setWalletBalance(profileResult.user.walletBalance);
            setCustomerName(profileResult.user.name);
          }
        } else {
          setErrorMsg(result.message || 'Failed to retrieve order details.');
        }
      } catch (err) {
        console.error(err);
        setErrorMsg('Connection error loading order details.');
      } finally {
        setLoadingOrder(false);
      }
    };

    fetchOrderDetails();
  }, [sessionId]);

  // Card brand detection
  const getCardBrand = (number) => {
    const cleanNumber = number.replace(/\s/g, '');
    if (cleanNumber.startsWith('4')) return 'visa';
    if (/^5[1-5]/.test(cleanNumber)) return 'mastercard';
    if (/^(5078|60|65|81|82)/.test(cleanNumber)) return 'rupay';
    return 'default';
  };

  const cardBrand = getCardBrand(cardNumber);

  // Format card number with spaces
  const handleCardNumberChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').substring(0, 16);
    const formatted = val.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  // Format card expiry MM/YY
  const handleCardExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (val.length >= 3) {
      val = `${val.substring(0, 2)}/${val.substring(2)}`;
    }
    setCardExpiry(val);
  };

  // Auto-verify UPI ID
  const isUpiValid = upiId.includes('@') && upiId.split('@')[1].length >= 2;

  const handlePay = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Field Validations
    if (paymentMethod === 'Card') {
      if (cardNumber.replace(/\s/g, '').length < 16) {
        setErrorMsg('Please enter a valid 16-digit credit card number.');
        return;
      }
      if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
        setErrorMsg('Please enter a valid expiry date (MM/YY).');
        return;
      }
      if (cardCvv.length < 3) {
        setErrorMsg('Please enter a valid 3-digit CVV.');
        return;
      }
      if (!cardName.trim()) {
        setErrorMsg('Please enter the cardholder name.');
        return;
      }
    } else if (paymentMethod === 'UPI') {
      if (!isUpiValid) {
        setErrorMsg('Please enter a valid UPI ID (e.g. user@okhdfcbank).');
        return;
      }
    } else if (paymentMethod === 'Net Banking') {
      if (!selectedBank) {
        setErrorMsg('Please select your bank from the list.');
        return;
      }
    } else if (paymentMethod === 'Wallet') {
      if (walletBalance === null || walletBalance < order.totalAmount) {
        setErrorMsg('Insufficient wallet balance to complete this transaction.');
        return;
      }
    }

    // Trigger loader sequence
    setIsProcessing(true);
    setProcessingStep(0);

    const stepInterval = setInterval(() => {
      setProcessingStep(prev => {
        if (prev >= processingMessages.length - 1) {
          clearInterval(stepInterval);
          finalizePayment();
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const finalizePayment = async () => {
    try {
      const token = localStorage.getItem('eco_token');
      const response = await fetch('/api/orders/confirm-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ sessionId })
      });
      const result = await response.json();
      if (response.ok && result.success) {
        navigate(`/checkout-success?session_id=${sessionId}&payment_method=${encodeURIComponent(paymentMethod)}`);
      } else {
        setIsProcessing(false);
        setErrorMsg(result.message || 'Payment verification failed at gateway.');
      }
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
      setErrorMsg('Network error confirming payment transaction.');
    }
  };

  if (loadingOrder) {
    return (
      <div className="min-h-screen bg-[#040c09] flex flex-col items-center justify-center space-y-4">
        <style>{`
          @keyframes spin-gradient {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .custom-loader {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: conic-gradient(transparent 30%, #10b981);
            -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 4px), red 0);
            mask: radial-gradient(farthest-side, transparent calc(100% - 4px), red 0);
            animation: spin-gradient 1s linear infinite;
          }
        `}</style>
        <div className="custom-loader" />
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest animate-pulse">Initializing Secure Gateway...</p>
      </div>
    );
  }

  if (errorMsg && !order) {
    return (
      <div className="min-h-screen bg-[#040c09] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500 animate-bounce" />
        <h2 className="text-lg font-bold text-white">Payment Gateway Error</h2>
        <p className="text-slate-400 text-xs max-w-sm">{errorMsg}</p>
        <button
          onClick={() => navigate('/')}
          className="rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 px-5 py-2.5 text-xs font-semibold text-white transition-all duration-300"
        >
          Return to Marketplace
        </button>
      </div>
    );
  }

  const formattedAmount = order?.totalAmount.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR'
  });

  return (
    <div className="min-h-screen bg-[#040c09] flex flex-col justify-between relative overflow-hidden py-10 px-4 font-sans text-slate-200">
      
      {/* Premium background radial glows */}
      <div className="absolute top-[-10%] left-[-10%] h-[400px] w-[400px] rounded-full bg-brand-500/5 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[450px] w-[450px] rounded-full bg-eco-500/5 blur-[160px] pointer-events-none" />
      <div className="absolute top-[30%] left-[40%] h-[300px] w-[300px] rounded-full bg-emerald-500/3 blur-[120px] pointer-events-none animate-pulse-slow" />

      {/* Styles for premium 3D transforms and keyframes */}
      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        .card-inner {
          transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .card-shine {
          position: relative;
          overflow: hidden;
        }
        .card-shine::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0) 30%,
            rgba(255, 255, 255, 0.05) 40%,
            rgba(255, 255, 255, 0.15) 50%,
            rgba(255, 255, 255, 0.05) 60%,
            rgba(255, 255, 255, 0) 70%
          );
          transform: rotate(-45deg);
          pointer-events: none;
          mix-blend-mode: overlay;
          animation: shine-sweep 6s infinite ease-in-out;
        }
        @keyframes shine-sweep {
          0% { transform: translate(-30%, -30%) rotate(-45deg); }
          50% { transform: translate(30%, 30%) rotate(-45deg); }
          100% { transform: translate(-30%, -30%) rotate(-45deg); }
        }
        @keyframes scan-line {
          0% { top: 4%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 94%; opacity: 0; }
        }
        .qr-scanner-line {
          position: absolute;
          left: 4%;
          right: 4%;
          height: 3px;
          background: #34d399;
          box-shadow: 0 0 10px #10b981, 0 0 20px #059669;
          animation: scan-line 3s infinite ease-in-out;
          border-radius: 50%;
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s infinite ease-in-out;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-4px); }
          40%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
        .glass-container {
          background: rgba(6, 20, 15, 0.45);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(52, 211, 153, 0.08);
        }
        .glass-card-dark {
          background: rgba(4, 12, 9, 0.85);
          border: 1px solid rgba(52, 211, 153, 0.05);
        }
      `}</style>

      <div className="max-w-5xl w-full mx-auto grid gap-8 lg:grid-cols-12 items-start relative z-10">
        
        {/* Left Side: Order summary / branding */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center gap-3">
            <Logo className="h-7 w-7 text-eco-400" />
            <div>
              <span className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
                The Eco Pay <Sparkles className="h-4 w-4 text-brand-400" />
              </span>
              <p className="text-[10px] text-slate-500 font-medium">Multi-Tenant Vault Routing Gateway</p>
            </div>
          </div>

          <div className="rounded-2xl glass-container p-6 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-eco-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Amount to Pay</p>
              <h1 className="text-4xl font-extrabold text-white mt-1.5 tracking-tight text-gradient-emerald">
                {formattedAmount}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[11px] text-slate-400">
                  Recipient Tenant: <span className="font-semibold text-white">{order?.store?.name}</span>
                </p>
              </div>
            </div>

            <div className="border-t border-slate-900/60 pt-5 space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Order Items</p>
                <span className="text-[10px] text-slate-500 font-semibold bg-slate-900/80 px-2 py-0.5 rounded-full">
                  {order?.items.length} item(s)
                </span>
              </div>
              
              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {order?.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs group">
                    <div className="space-y-0.5">
                      <p className="font-medium text-slate-200 group-hover:text-eco-400 transition-colors line-clamp-1">{item.name}</p>
                      <div className="flex gap-2 text-[10px] text-slate-500 font-medium">
                        {item.variantName && <span>Variant: {item.variantName}</span>}
                        <span>Qty: {item.quantity} x ₹{item.price}</span>
                      </div>
                    </div>
                    <span className="font-bold text-slate-300">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-900/60 pt-4 flex flex-col gap-2 text-[10px]">
              <div className="flex items-center justify-between text-slate-500">
                <span className="font-medium">Secure Session ID</span>
                <span className="font-mono text-slate-400 select-all">{sessionId?.substring(0, 20)}...</span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span className="font-medium">Channel Protocol</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <Lock className="h-3 w-3" /> Encrypted isolation
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Payment Form & Methods */}
        <div className="lg:col-span-7 rounded-2xl glass-container p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-900/60 pb-4">
            <div className="space-y-0.5">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Payment Instrument</h2>
              <p className="text-[10px] text-slate-500 font-medium">Choose from our verified secure routing modes</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 px-3 py-1.5 text-[10px] text-emerald-400 font-bold shadow-md">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              256-Bit SSL Guarded
            </div>
          </div>

          {errorMsg && (
            <div className="rounded-xl bg-red-950/25 border border-red-500/30 p-3.5 text-red-400 text-xs flex items-center gap-3 animate-shake">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}

          {/* Payment Method Switcher */}
          <div className="grid grid-cols-4 gap-2.5">
            {[
              { id: 'Card', label: 'Credit/Debit', icon: CreditCard },
              { id: 'UPI', label: 'UPI / QR', icon: Send },
              { id: 'Net Banking', label: 'Net Banking', icon: Landmark },
              { id: 'Wallet', label: 'Eco Wallet', icon: Wallet }
            ].map(method => {
              const Icon = method.icon;
              const active = paymentMethod === method.id;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => {
                    setPaymentMethod(method.id);
                    setErrorMsg('');
                  }}
                  className={`flex flex-col items-center justify-center py-3 px-1 rounded-xl border transition-all duration-300 relative overflow-hidden group ${
                    active
                      ? 'bg-eco-500/10 border-eco-500 text-eco-400 shadow-lg shadow-eco-500/5'
                      : 'bg-[#061410]/50 border-slate-900/60 text-slate-400 hover:border-slate-800 hover:text-slate-300'
                  }`}
                >
                  <Icon className="h-4.5 w-4.5 mb-1.5 transition-transform group-hover:scale-110" />
                  <span className="text-[10px] font-bold tracking-tight">{method.label}</span>
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-eco-400" />
                  )}
                </button>
              );
            })}
          </div>

          <form onSubmit={handlePay} className="space-y-6">
            
            {/* 1. CARD PAYMENT MODE */}
            {paymentMethod === 'Card' && (
              <div className="space-y-6">
                
                {/* 3D Flipping Card Graphic */}
                <div className="perspective-1000 w-full max-w-sm mx-auto h-[210px] cursor-pointer">
                  <div className={`relative w-full h-full card-inner transform-style-3d ${cardFocused === 'back' ? 'rotate-y-180' : ''}`}>
                    
                    {/* Front of the Card */}
                    <div className={`absolute inset-0 w-full h-full backface-hidden rounded-2xl p-6 text-white shadow-2xl flex flex-col justify-between card-shine border border-white/10 ${
                      cardBrand === 'visa' 
                        ? 'bg-gradient-to-br from-blue-700 via-indigo-800 to-indigo-950' 
                        : cardBrand === 'mastercard'
                        ? 'bg-gradient-to-br from-[#1e1e1e] via-[#2a2a2a] to-[#a855f7]/20'
                        : cardBrand === 'rupay'
                        ? 'bg-gradient-to-br from-teal-700 via-emerald-800 to-slate-900'
                        : 'bg-gradient-to-br from-emerald-950 via-forest-900 to-brand-950'
                    }`}>
                      <div className="flex justify-between items-start">
                        {/* Chip design */}
                        <div className="w-10 h-8 rounded-md bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-600 p-1.5 flex flex-col justify-between shadow-inner relative">
                          <div className="w-full h-[1px] bg-slate-950/20" />
                          <div className="w-full h-[1px] bg-slate-950/20" />
                          <div className="w-full h-[1px] bg-slate-950/20" />
                          <div className="absolute inset-y-0 left-1/2 w-[1px] bg-slate-950/20" />
                          <div className="absolute inset-y-0 left-1/3 w-[1px] bg-slate-950/20" />
                        </div>
                        {/* Contactless / Logo */}
                        <div className="flex items-center gap-3">
                          <Wifi className="h-5 w-5 text-white/50 rotate-90" />
                          
                          {/* Brand badge */}
                          {cardBrand === 'visa' && (
                            <span className="italic font-black text-xl tracking-tight text-white select-none">VISA</span>
                          )}
                          {cardBrand === 'mastercard' && (
                            <div className="flex items-center">
                              <div className="w-6 h-6 rounded-full bg-[#eb001b] opacity-90" />
                              <div className="w-6 h-6 rounded-full bg-[#f79e1b] -ml-3 mix-blend-screen opacity-90" />
                            </div>
                          )}
                          {cardBrand === 'rupay' && (
                            <div className="flex flex-col items-end select-none">
                              <span className="font-extrabold text-sm tracking-tight text-white">RuPay</span>
                              <span className="text-[6px] tracking-widest text-emerald-300 font-bold -mt-0.5">SECURE</span>
                            </div>
                          )}
                          {cardBrand === 'default' && (
                            <span className="font-mono text-xs font-bold tracking-wider text-brand-200">THE ECO PAY</span>
                          )}
                        </div>
                      </div>

                      {/* Card Number */}
                      <div className="space-y-1.5">
                        <p className="font-mono text-lg tracking-[0.16em] text-white/95 text-center drop-shadow-md">
                          {cardNumber || '•••• •••• •••• ••••'}
                        </p>
                      </div>

                      {/* Bottom row */}
                      <div className="flex justify-between items-end">
                        <div className="space-y-0.5">
                          <p className="text-[7px] uppercase tracking-wider text-slate-400">Card Holder</p>
                          <p className="font-mono text-xs font-semibold uppercase tracking-wide truncate max-w-[190px]">
                            {cardName || 'Your Name'}
                          </p>
                        </div>
                        <div className="space-y-0.5 text-right">
                          <p className="text-[7px] uppercase tracking-wider text-slate-400">Expires</p>
                          <p className="font-mono text-xs font-semibold tracking-wide">
                            {cardExpiry || 'MM/YY'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Back of the Card */}
                    <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 p-6 text-white shadow-2xl flex flex-col justify-between border border-white/5">
                      <div className="h-10 bg-slate-950 -mx-6 mt-1 shadow-inner" /> {/* Magnetic strip */}
                      
                      <div className="space-y-2 mt-4">
                        <p className="text-[7px] uppercase tracking-wider text-slate-500">Security Code (CVV)</p>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-8 bg-slate-800/80 rounded border border-slate-700/50 flex items-center justify-end px-3 font-mono italic text-xs text-slate-500 select-none">
                            XXXX XXXX XXXX
                          </div>
                          <div className="w-14 h-8 bg-white text-slate-950 font-mono font-extrabold text-center flex items-center justify-center text-xs rounded shadow-md">
                            {cardCvv || '•••'}
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-[7px] text-slate-500 leading-tight text-center max-w-[280px] mx-auto border-t border-slate-900 pt-3">
                        This is a simulated secure transaction channel. Do not enter real credit card details.
                      </p>
                    </div>

                  </div>
                </div>

                {/* Form fields */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cardholder Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alice Cooper"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      onFocus={() => setCardFocused('front')}
                      className="w-full rounded-xl bg-[#030907] border border-slate-900 hover:border-slate-800 focus:border-eco-500 focus:outline-none px-4 py-2.5 text-xs text-white placeholder-slate-600 transition-all font-sans"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Card Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="4111 2222 3333 4444"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        onFocus={() => setCardFocused('front')}
                        className="w-full rounded-xl bg-[#030907] border border-slate-900 hover:border-slate-800 focus:border-eco-500 focus:outline-none px-4 py-2.5 text-xs text-white placeholder-slate-600 transition-all font-mono tracking-wider"
                      />
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                        <Lock className="h-3.5 w-3.5 text-slate-600" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Expiry Date</label>
                    <input
                      type="text"
                      required
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={handleCardExpiryChange}
                      onFocus={() => setCardFocused('front')}
                      className="w-full rounded-xl bg-[#030907] border border-slate-900 hover:border-slate-800 focus:border-eco-500 focus:outline-none px-4 py-2.5 text-xs text-white placeholder-slate-600 transition-all font-mono text-center"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CVV / CVN</label>
                    <input
                      type="password"
                      required
                      placeholder="•••"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').substring(0, 3))}
                      onFocus={() => setCardFocused('back')}
                      onBlur={() => setCardFocused('front')}
                      className="w-full rounded-xl bg-[#030907] border border-slate-900 hover:border-slate-800 focus:border-eco-500 focus:outline-none px-4 py-2.5 text-xs text-white placeholder-slate-600 transition-all font-mono text-center"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. UPI PAYMENT MODE */}
            {paymentMethod === 'UPI' && (
              <div className="space-y-6 text-center">
                
                {/* SVG High-Fidelity QR Code with scanning green line */}
                <div className="p-4 rounded-3xl bg-[#020705] border border-slate-900 max-w-[210px] mx-auto shadow-2xl relative group card-shine">
                  <div className="absolute inset-0 bg-eco-500/3 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl blur" />
                  
                  <div className="bg-white p-4.5 rounded-2xl relative overflow-hidden flex flex-col justify-center items-center shadow-inner">
                    {/* The Green Laser Scanner bar */}
                    <div className="qr-scanner-line" />
                    
                    {/* QR Code SVG */}
                    <svg className="w-36 h-36 text-slate-950" viewBox="0 0 100 100" fill="currentColor">
                      {/* Finder Pattern - Top Left */}
                      <path d="M0,0 h30 v30 h-30 z M5,5 v20 h20 v-20 z M10,10 h10 v10 h-10 z" />
                      {/* Finder Pattern - Top Right */}
                      <path d="M70,0 h30 v30 h-30 z M75,5 v20 h20 v-20 z M80,10 h10 v10 h-10 z" />
                      {/* Finder Pattern - Bottom Left */}
                      <path d="M0,70 h30 v30 h-30 z M5,75 v20 h20 v-20 z M10,80 h10 v10 h-10 z" />
                      
                      {/* Alignment Pattern */}
                      <path d="M75,75 h10 v10 h-10 z M78,78 h4 v4 h-4 z" />
                      
                      {/* Random Mock modules */}
                      <rect x="40" y="5" width="5" height="5" />
                      <rect x="55" y="0" width="5" height="10" />
                      <rect x="45" y="15" width="10" height="5" />
                      <rect x="35" y="25" width="5" height="15" />
                      <rect x="45" y="25" width="10" height="5" />
                      <rect x="55" y="30" width="5" height="10" />
                      <rect x="5" y="40" width="10" height="5" />
                      <rect x="0" y="50" width="5" height="10" />
                      <rect x="15" y="45" width="15" height="5" />
                      <rect x="20" y="55" width="10" height="10" />
                      
                      <rect x="85" y="40" width="5" height="15" />
                      <rect x="75" y="50" width="10" height="5" />
                      <rect x="90" y="60" width="10" height="5" />
                      <rect x="65" y="45" width="5" height="15" />
                      <rect x="50" y="50" width="10" height="15" />
                      <rect x="40" y="60" width="5" height="5" />
                      
                      <rect x="35" y="70" width="15" height="5" />
                      <rect x="55" y="75" width="5" height="10" />
                      <rect x="45" y="85" width="10" height="5" />
                      <rect x="35" y="90" width="5" height="10" />
                      <rect x="60" y="90" width="10" height="5" />
                      
                      {/* Tiny Eco logo in center */}
                      <rect x="42" y="42" width="16" height="16" rx="3" fill="#ffffff" />
                      <path d="M47,53 C47,48 53,47 53,47 C53,47 52,53 47,53 Z" fill="#10b981" />
                    </svg>
                  </div>
                  
                  <div className="mt-3 flex items-center justify-center gap-1.5 text-[9px] font-bold text-eco-400 tracking-wider uppercase">
                    <QrCode className="h-3.5 w-3.5" />
                    Scan code with any UPI app
                  </div>
                </div>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-slate-900/60"></div>
                  <span className="flex-shrink mx-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest">Or Pay via UPI ID</span>
                  <div className="flex-grow border-t border-slate-900/60"></div>
                </div>

                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">UPI ID / VPA</label>
                  <div className="space-y-2">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="username@okhdfcbank"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="w-full rounded-xl bg-[#030907] border border-slate-900 hover:border-slate-800 focus:border-eco-500 focus:outline-none px-4 py-2.5 text-xs text-white placeholder-slate-600 transition-all font-mono"
                      />
                      {isUpiValid && (
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[9px] text-emerald-400 font-bold">
                          ✓ VPA Valid
                        </div>
                      )}
                    </div>
                    {isUpiValid && customerName && (
                      <p className="text-[10px] text-emerald-400/90 font-medium flex items-center gap-1 animate-fade-in-up">
                        <CheckCircle2 className="h-3 w-3" />
                        Verified account owner: <span className="font-bold text-white">{customerName}</span>
                      </p>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* 3. NET BANKING MODE */}
            {paymentMethod === 'Net Banking' && (
              <div className="space-y-4">
                <div className="space-y-0.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Select Preferred Net Banking</label>
                  <p className="text-[10px] text-slate-500">Secure direct channel to the bank portal</p>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { name: 'State Bank of India', code: 'SBI', color: '#0072bc', logo: 'sbi' },
                    { name: 'HDFC Bank', code: 'HDFC', color: '#003366', logo: 'hdfc' },
                    { name: 'ICICI Bank', code: 'ICICI', color: '#f58220', logo: 'icici' },
                    { name: 'Axis Bank', code: 'AXIS', color: '#97144d', logo: 'axis' },
                    { name: 'Kotak Bank', code: 'KOTAK', color: '#ed1c24', logo: 'kotak' },
                    { name: 'Punjab Natl Bank', code: 'PNB', color: '#d60812', logo: 'pnb' }
                  ].map(bank => {
                    const isSelected = selectedBank === bank.name;
                    return (
                      <button
                        key={bank.name}
                        type="button"
                        onClick={() => setSelectedBank(bank.name)}
                        style={{
                          borderColor: isSelected ? bank.color : 'rgba(15, 23, 42, 0.6)',
                          boxShadow: isSelected ? `0 0 12px -3px ${bank.color}50` : 'none',
                          background: isSelected ? `${bank.color}0c` : 'rgba(2, 7, 5, 0.4)'
                        }}
                        className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all duration-300 group hover:-translate-y-0.5 relative overflow-hidden`}
                      >
                        <Landmark 
                          style={{ color: isSelected ? bank.color : '#64748b' }} 
                          className="h-6 w-6 mb-2 transition-transform duration-300 group-hover:scale-110" 
                        />
                        <span className={`text-[10px] tracking-tight truncate max-w-full font-bold ${
                          isSelected ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'
                        }`}>
                          {bank.code}
                        </span>
                        
                        <span className={`text-[8px] font-medium block truncate max-w-full -mt-0.5 ${
                          isSelected ? 'text-white/60' : 'text-slate-500'
                        }`}>
                          {bank.name}
                        </span>

                        {isSelected && (
                          <div 
                            style={{ backgroundColor: bank.color }}
                            className="absolute top-0 right-0 h-1.5 w-1.5 rounded-bl-md" 
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4. ECO WALLET PAYMENT MODE */}
            {paymentMethod === 'Wallet' && (
              <div className="space-y-4">
                <div className="space-y-0.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Eco Wallet Account Status</label>
                  <p className="text-[10px] text-slate-500">Authorize instant payment with platform wallet balance</p>
                </div>

                <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-emerald-950/20 to-slate-950 p-6 space-y-5 shadow-xl relative overflow-hidden card-shine">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-eco-400/5 rounded-full blur-2xl" />
                  
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-[8px] uppercase tracking-wider text-slate-500">Available Vault Funds</p>
                      <h2 className="text-2xl font-bold font-mono text-white">
                        ₹{walletBalance !== null ? walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
                      </h2>
                    </div>
                    <div className="p-2 rounded-xl bg-eco-500/10 border border-eco-500/20">
                      <Wallet className="h-5 w-5 text-eco-400" />
                    </div>
                  </div>

                  {/* Visual calculation details */}
                  <div className="border-t border-slate-900/60 pt-4 grid grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <p className="text-[8px] uppercase tracking-wider text-slate-500">Order Deduct</p>
                      <p className="font-mono font-bold text-red-400">- ₹{order?.totalAmount.toFixed(2)}</p>
                    </div>
                    
                    <div className="space-y-1 text-right">
                      <p className="text-[8px] uppercase tracking-wider text-slate-500">Future Balance</p>
                      {walletBalance !== null && (
                        <p className={`font-mono font-bold ${walletBalance >= order.totalAmount ? 'text-emerald-400' : 'text-red-500'}`}>
                          ₹{(walletBalance - order.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </p>
                      )}
                    </div>
                  </div>

                  {walletBalance !== null && walletBalance >= order.totalAmount ? (
                    <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/15 p-3 text-emerald-400 text-[10px] flex items-center gap-2.5 font-medium leading-relaxed">
                      <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 flex-shrink-0" />
                      <span>Authorization code valid. Complete checkout to deduct funds instantly.</span>
                    </div>
                  ) : (
                    <div className="rounded-xl bg-red-950/20 border border-red-500/20 p-3 text-red-400 text-[10px] flex items-center gap-2.5 font-medium leading-relaxed">
                      <AlertCircle className="h-4.5 w-4.5 text-red-500 flex-shrink-0" />
                      <span>Insufficient wallet balance. Please use another routing method.</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pay Button */}
            <button
              type="submit"
              disabled={paymentMethod === 'Wallet' && (walletBalance === null || walletBalance < order.totalAmount)}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-eco-600 hover:bg-eco-500 disabled:bg-slate-900 disabled:text-slate-600 disabled:border-slate-950 py-3.5 font-bold text-white shadow-xl transition-all hover:shadow-eco-500/15 active:scale-[0.98] disabled:scale-100 disabled:cursor-not-allowed select-none font-sans"
            >
              <Lock className="h-4 w-4" />
              Authorize & Pay {formattedAmount}
            </button>
          </form>
        </div>
      </div>

      {/* Futuristic Secure checklist overlay */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md">
          <div className="max-w-md w-full p-8 text-center space-y-6 animate-slide-up relative">
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-40 h-40 bg-eco-500/10 rounded-full blur-3xl pointer-events-none" />
            
            {/* Spinning/pulsing shield lock */}
            <div className="relative h-20 w-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 border-[3px] border-eco-500/10 rounded-full" />
              <div className="absolute inset-0 border-[3px] border-eco-500 border-t-transparent rounded-full animate-spin" />
              <div className="h-12 w-12 rounded-full bg-eco-500/10 border border-eco-500/20 flex items-center justify-center text-eco-400">
                <Lock className="h-6 w-6 animate-pulse" />
              </div>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-lg font-bold text-white tracking-tight">Processing Checkout Route</h2>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest">Secure Multi-Tenant Gateway</p>
            </div>

            {/* Checklist processing tracker */}
            <div className="mt-8 border border-slate-900 bg-[#020705] rounded-2xl p-4.5 space-y-3.5 text-left text-xs max-w-sm mx-auto shadow-inner">
              {processingMessages.map((msg, idx) => {
                const completed = processingStep > idx;
                const active = processingStep === idx;
                return (
                  <div key={idx} className="flex items-center gap-3">
                    {completed ? (
                      <div className="h-5 w-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-[10px] shadow-sm">
                        ✓
                      </div>
                    ) : active ? (
                      <div className="h-5 w-5 border-2 border-eco-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border border-slate-900 bg-[#040c09]" />
                    )}
                    <span className={`font-mono text-[10px] leading-none ${completed ? 'text-slate-400 line-through' : active ? 'text-white font-bold' : 'text-slate-600'}`}>
                      {msg}
                    </span>
                  </div>
                );
              })}
            </div>
            
            <p className="text-[10px] text-slate-500">Please do not refresh, exit the portal, or press back.</p>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900/60 pt-6 text-center text-xs text-slate-600 w-full mt-12 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>© {new Date().getFullYear()} The Eco Multi-Tenant E-Commerce SaaS. All transactions are mock simulations.</p>
        <div className="flex items-center gap-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          <span className="flex items-center gap-1"><Lock className="h-3 w-3 text-eco-400" /> PCI DSS COMPLIANT</span>
          <span>•</span>
          <span>AES-256 ENCRYPTED</span>
        </div>
      </footer>
    </div>
  );
}

