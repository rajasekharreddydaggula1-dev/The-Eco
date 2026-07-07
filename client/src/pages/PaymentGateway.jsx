import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, CreditCard, Landmark, Send, Wallet, Check, AlertCircle, Loader } from 'lucide-react';
import Logo from '../components/Logo';

export default function PaymentGateway() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');
  const initialMethod = searchParams.get('payment_method') || 'Card';

  const [order, setOrder] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [walletBalance, setWalletBalance] = useState(null);
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
    'Connecting to secure gateway server...',
    'Authorizing transaction with the bank...',
    'Exchanging cryptographic payment tokens...',
    'Deducting amount and updating merchant records...',
    'Finalizing secure order checkout details...'
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
          
          // If customer, fetch user profile for wallet balance
          const profileResponse = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const profileResult = await profileResponse.json();
          if (profileResponse.ok && profileResult.success) {
            setWalletBalance(profileResult.user.walletBalance);
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
      if (!upiId || !upiId.includes('@')) {
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
    }, 800);
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
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <Loader className="h-10 w-10 text-eco-400 animate-spin" />
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">Loading Secure Gateway...</p>
      </div>
    );
  }

  if (errorMsg && !order) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h2 className="text-lg font-bold text-white">Payment Gateway Error</h2>
        <p className="text-slate-400 text-xs max-w-sm">{errorMsg}</p>
        <button
          onClick={() => navigate('/')}
          className="rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 px-4 py-2 text-xs font-semibold text-white"
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
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between relative overflow-hidden py-10 px-4 font-sans">
      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] h-[300px] w-[300px] rounded-full bg-brand-500/5 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[350px] w-[350px] rounded-full bg-eco-500/5 blur-[130px]" />

      <div className="max-w-4xl w-full mx-auto grid gap-8 lg:grid-cols-12 items-start relative z-10">
        
        {/* Left Side: Order summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center gap-2">
            <Logo className="h-6 w-6" />
            <span className="text-base font-bold text-white tracking-tight">The Eco Pay</span>
          </div>

          <div className="rounded-2xl border border-slate-900 bg-slate-950/60 p-6 backdrop-blur-md space-y-6">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Checkout Total</p>
              <h1 className="text-3xl font-extrabold text-white mt-1">{formattedAmount}</h1>
              <p className="text-[10px] text-slate-400 mt-1">Paying to: <span className="font-semibold text-eco-400">{order?.store?.name}</span></p>
            </div>

            <div className="border-t border-slate-900 pt-4 space-y-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Order Details</p>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {order?.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <div>
                      <p className="font-medium text-slate-300 line-clamp-1">{item.name}</p>
                      {item.variantName && <p className="text-[10px] text-slate-500">Variant: {item.variantName}</p>}
                      <p className="text-[10px] text-slate-500">Qty: {item.quantity} x ₹{item.price}</p>
                    </div>
                    <span className="font-bold text-slate-400">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-900 pt-4 flex items-center justify-between text-[10px] text-slate-500 font-medium">
              <span>Secure Session ID</span>
              <span className="font-mono text-slate-400 max-w-[150px] truncate">{sessionId}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Payment Form */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-900 bg-slate-950/40 p-6 sm:p-8 backdrop-blur-md space-y-6">
          <div className="flex items-center justify-between border-b border-slate-900 pb-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Secure Payment Portal</h2>
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-[10px] text-emerald-400 font-semibold shadow-sm">
              <ShieldCheck className="h-3.5 w-3.5" />
              Secure 256-bit SSL
            </div>
          </div>

          {errorMsg && (
            <div className="rounded-lg bg-red-950/20 border border-red-500/20 p-3 text-red-400 text-xs flex items-center gap-2 animate-shake">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Payment Method Switcher */}
          <div className="grid grid-cols-4 gap-2 border-b border-slate-900 pb-4">
            {[
              { id: 'Card', label: 'Card', icon: CreditCard },
              { id: 'UPI', label: 'UPI', icon: Send },
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
                  className={`flex flex-col items-center justify-center py-2.5 rounded-xl border transition-all text-[10px] font-bold ${
                    active
                      ? 'bg-eco-500/10 border-eco-500 text-eco-400'
                      : 'bg-slate-950 border-slate-900 text-slate-400 hover:border-slate-800'
                  }`}
                >
                  <Icon className="h-4 w-4 mb-1" />
                  {method.label}
                </button>
              );
            })}
          </div>

          <form onSubmit={handlePay} className="space-y-6">
            
            {/* 1. Card Form */}
            {paymentMethod === 'Card' && (
              <div className="space-y-6">
                {/* Visual Credit Card Graphics */}
                <div className="relative h-44 w-full max-w-sm mx-auto rounded-2xl bg-gradient-to-br from-brand-600 to-eco-600 p-6 text-white shadow-xl overflow-hidden transition-all duration-500 transform">
                  <div className="absolute -right-10 -bottom-10 h-44 w-44 rounded-full bg-white/5 blur-xl" />
                  
                  {cardFocused === 'front' ? (
                    <div className="h-full flex flex-col justify-between relative">
                      <div className="flex justify-between items-start">
                        <div className="h-8 w-10 bg-amber-500/30 border border-amber-500/50 rounded-md" /> {/* Chip */}
                        <span className="font-mono text-sm font-bold tracking-widest text-brand-100 font-sans">THE ECO PAY</span>
                      </div>
                      
                      <div className="space-y-2 mt-4">
                        <p className="font-mono text-base tracking-[0.15em] text-white/95">
                          {cardNumber || '•••• •••• •••• ••••'}
                        </p>
                      </div>

                      <div className="flex justify-between items-end mt-4">
                        <div className="space-y-0.5">
                          <p className="text-[8px] uppercase tracking-wider text-brand-200">Card Holder</p>
                          <p className="font-mono text-xs font-semibold uppercase tracking-wide truncate max-w-[180px]">
                            {cardName || 'YOUR FULL NAME'}
                          </p>
                        </div>
                        <div className="space-y-0.5 text-right">
                          <p className="text-[8px] uppercase tracking-wider text-brand-200">Expires</p>
                          <p className="font-mono text-xs font-semibold tracking-wide">
                            {cardExpiry || 'MM/YY'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col justify-between py-2 relative">
                      <div className="h-10 bg-slate-950 -mx-6" /> {/* Black strip */}
                      
                      <div className="flex items-center gap-3 mt-4">
                        <div className="flex-1 h-8 bg-slate-100 rounded text-right pr-3 text-slate-900 font-mono italic font-bold flex items-center justify-end text-xs font-sans">
                          XXXX XXXX XXXX
                        </div>
                        <div className="w-12 h-8 bg-amber-500 text-slate-950 font-mono font-bold text-center flex items-center justify-center text-xs rounded">
                          {cardCvv || 'CVV'}
                        </div>
                      </div>
                      
                      <p className="text-[8px] text-brand-200 tracking-wide mt-4 text-center leading-none">
                        This is a simulated card payment transaction. Do not enter real credit card details.
                      </p>
                    </div>
                  )}
                </div>

                {/* Form Fields */}
                <div className="space-y-4 font-sans">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cardholder Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      onFocus={() => setCardFocused('front')}
                      className="w-full rounded-xl bg-slate-950 border border-slate-900 px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:border-eco-500 focus:outline-none transition-all font-sans"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Card Number</label>
                    <input
                      type="text"
                      required
                      placeholder="4111 2222 3333 4444"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      onFocus={() => setCardFocused('front')}
                      className="w-full rounded-xl bg-slate-950 border border-slate-900 px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:border-eco-500 focus:outline-none transition-all font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expiration Date</label>
                      <input
                        type="text"
                        required
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={handleCardExpiryChange}
                        onFocus={() => setCardFocused('front')}
                        className="w-full rounded-xl bg-slate-950 border border-slate-900 px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:border-eco-500 focus:outline-none transition-all font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CVV / CVN</label>
                      <input
                        type="password"
                        required
                        placeholder="•••"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').substring(0, 3))}
                        onFocus={() => setCardFocused('back')}
                        onBlur={() => setCardFocused('front')}
                        className="w-full rounded-xl bg-slate-950 border border-slate-900 px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:border-eco-500 focus:outline-none transition-all font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. UPI Form */}
            {paymentMethod === 'UPI' && (
              <div className="space-y-6 text-center">
                <div className="p-4 rounded-2xl bg-white max-w-[160px] mx-auto border-4 border-slate-900 relative">
                  {/* Simulated QR Code */}
                  <div className="h-32 w-32 bg-slate-200 flex flex-col justify-center items-center gap-1.5 border border-dashed border-slate-400">
                    <div className="grid grid-cols-3 gap-2 w-24 h-24 bg-slate-350 p-2">
                      <div className="bg-slate-900 rounded" />
                      <div className="bg-slate-900 rounded" />
                      <div className="bg-slate-900 rounded" />
                      <div className="bg-slate-900 rounded" />
                      <div className="bg-slate-900 rounded" />
                      <div className="bg-slate-900 rounded" />
                      <div className="bg-slate-900 rounded" />
                      <div className="bg-slate-900 rounded" />
                      <div className="bg-slate-900 rounded" />
                    </div>
                    <span className="text-[8px] font-bold font-mono text-slate-800 tracking-wider">SCAN TO PAY</span>
                  </div>
                </div>
                
                <p className="text-[10px] text-slate-500 font-medium">
                  Scan the QR code using any UPI app (PhonePe, GPay, Paytm, BHIM) or enter your UPI ID below.
                </p>

                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">UPI ID / VPA</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="username@okhdfcbank"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="flex-1 rounded-xl bg-slate-950 border border-slate-900 px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:border-eco-500 focus:outline-none transition-all font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 3. Net Banking */}
            {paymentMethod === 'Net Banking' && (
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Popular Banks</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    'State Bank of India', 'HDFC Bank', 'ICICI Bank',
                    'Axis Bank', 'Kotak Mahindra Bank', 'Punjab National Bank'
                  ].map(bank => {
                    const isSelected = selectedBank === bank;
                    return (
                      <button
                        key={bank}
                        type="button"
                        onClick={() => setSelectedBank(bank)}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                          isSelected
                            ? 'bg-eco-500/10 border-eco-500 text-eco-400 font-bold'
                            : 'bg-slate-950 border-slate-900 text-slate-400 hover:border-slate-850'
                        }`}
                      >
                        <Landmark className="h-5 w-5 mb-1" />
                        <span className="text-[10px] truncate max-w-full">{bank}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4. Eco Wallet */}
            {paymentMethod === 'Wallet' && (
              <div className="space-y-4 font-sans">
                <div className="rounded-2xl border border-slate-900 bg-slate-950 p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-eco-400" />
                      <span className="text-xs font-semibold text-slate-300">Your Wallet Balance</span>
                    </div>
                    <span className="text-sm font-bold text-white font-mono">
                      ₹{walletBalance !== null ? walletBalance.toFixed(2) : '0.00'}
                    </span>
                  </div>

                  <div className="border-t border-slate-900 pt-4 flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">Payment Amount</span>
                    <span className="font-bold text-red-400">- ₹{order?.totalAmount}</span>
                  </div>

                  {walletBalance !== null && walletBalance >= order.totalAmount ? (
                    <div className="rounded-xl bg-emerald-950/20 border border-emerald-500/20 p-3 text-emerald-400 text-[10px] flex items-center gap-2 font-sans">
                      <Check className="h-4 w-4 font-sans" />
                      <span>Sufficient balance. Transaction will be authorized instantly.</span>
                    </div>
                  ) : (
                    <div className="rounded-xl bg-red-950/20 border border-red-500/20 p-3 text-red-400 text-[10px] flex items-center gap-2 font-sans">
                      <AlertCircle className="h-4 w-4 font-sans" />
                      <span>Insufficient wallet balance. Recharge your wallet or select another payment option.</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={paymentMethod === 'Wallet' && (walletBalance === null || walletBalance < order.totalAmount)}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-eco-600 hover:bg-eco-500 disabled:bg-slate-900 disabled:text-slate-600 disabled:border-slate-950 px-6 py-3 font-bold text-white shadow-lg transition-all active:scale-95 disabled:scale-100 font-sans"
            >
              <ShieldCheck className="h-4 w-4" />
              Pay {formattedAmount}
            </button>
          </form>
        </div>
      </div>

      {/* Processing overlay loader */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md">
          <div className="max-w-md w-full p-8 text-center space-y-6 animate-scale-up">
            <div className="relative h-16 w-16 mx-auto">
              <div className="absolute inset-0 border-4 border-eco-500/20 rounded-full" />
              <div className="absolute inset-0 border-4 border-eco-500 border-t-transparent rounded-full animate-spin" />
            </div>

            <div className="space-y-2">
              <h2 className="text-base font-bold text-white">Processing Secure Transaction</h2>
              <p className="text-xs text-slate-400 leading-relaxed font-mono transition-all">
                {processingMessages[processingStep]}
              </p>
            </div>

            {/* Loading checklist tracker */}
            <div className="mt-8 border border-slate-900 rounded-2xl bg-slate-950 p-4 space-y-2.5 text-left text-xs max-w-sm mx-auto">
              {processingMessages.map((msg, idx) => {
                const completed = processingStep > idx;
                const active = processingStep === idx;
                return (
                  <div key={idx} className="flex items-center gap-2">
                    {completed ? (
                      <div className="h-4 w-4 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-[9px]">
                        ✓
                      </div>
                    ) : active ? (
                      <div className="h-4 w-4 border-2 border-eco-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-slate-800 bg-slate-900" />
                    )}
                    <span className={`font-mono text-[10px] ${completed ? 'text-slate-400 line-through' : active ? 'text-white font-semibold' : 'text-slate-600'}`}>
                      {msg.substring(0, 30)}...
                    </span>
                  </div>
                );
              })}
            </div>
            
            <p className="text-[10px] text-slate-500">Please do not refresh, close this page, or navigate away.</p>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 pt-6 text-center text-xs text-slate-600 w-full mt-10">
        <p>© {new Date().getFullYear()} The Eco Multi-Tenant E-Commerce SaaS. All Payments Encrypted & Secured.</p>
      </footer>
    </div>
  );
}
