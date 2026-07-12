import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { X, Trash2, Plus, Minus, CreditCard, ShoppingBag, ArrowRight, ArrowLeft, Send, Landmark, ShieldCheck, Wallet, ChevronRight } from 'lucide-react';
import { removeFromCart, updateQuantity, clearCart } from '../store/slices/cartSlice';
import { checkoutCart, resetCheckout } from '../store/slices/orderSlice';
import { rechargeWallet } from '../store/slices/authSlice';

export default function CartDrawer({ isOpen, onClose, storeId }) {
  const dispatch = useDispatch();
  const cartCarts = useSelector(state => state.cart.carts);
  const { stores } = useSelector(state => state.stores);
  const { checkoutLoading, error } = useSelector(state => state.orders);
  const { user } = useSelector(state => state.auth);

  // Determine active carts
  const activeStoreIds = Object.keys(cartCarts).filter(id => cartCarts[id] && cartCarts[id].length > 0);

  // Local state for active store context inside drawer
  const [selectedStoreId, setSelectedStoreId] = useState(null);

  // Sync passed storeId
  useEffect(() => {
    if (storeId && cartCarts[storeId] && cartCarts[storeId].length > 0) {
      setSelectedStoreId(storeId);
    } else if (activeStoreIds.length === 1) {
      // Auto-select if only one active cart
      setSelectedStoreId(activeStoreIds[0]);
    } else {
      setSelectedStoreId(null);
    }
  }, [storeId, isOpen, cartCarts]);

  // Checkout Steps: 'cart', 'shipping', 'payment'
  const [step, setStep] = useState('cart');
  const [paymentMethod, setPaymentMethod] = useState('Wallet');
  const [shippingType, setShippingType] = useState('Eco-Friendly');
  const [plantTree, setPlantTree] = useState(false);

  // Reset steps on open/close
  useEffect(() => {
    setStep('cart');
    setValidationError('');
    setShippingType('Eco-Friendly');
    setPlantTree(false);
    dispatch(resetCheckout());
  }, [isOpen, selectedStoreId, dispatch]);

  // Shipping details state
  const [shipping, setShipping] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'IN'
  });

  // Simulated details for payment methods
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [selectedBank, setSelectedBank] = useState('State Bank of India');

  const [validationError, setValidationError] = useState('');
  const [loadingLocal, setLoadingLocal] = useState(false);

  // Resolve cart data for selected store
  const cartData = selectedStoreId ? (cartCarts[selectedStoreId] || []) : [];
  const subtotal = cartData.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Get Store Metadata (name, logo) from redux
  const getStoreMeta = (sId) => {
    return stores.find(s => s._id === sId) || { name: 'Merchant Partner', logo: '', slug: '' };
  };

  const handleQtyChange = (productId, variantName, newQty) => {
    if (!selectedStoreId) return;
    dispatch(updateQuantity({ storeId: selectedStoreId, productId, variantName, quantity: newQty }));
  };

  const handleRemove = (productId, variantName) => {
    if (!selectedStoreId) return;
    dispatch(removeFromCart({ storeId: selectedStoreId, productId, variantName }));
  };

  const validateAddress = () => {
    if (!shipping.street || !shipping.city || !shipping.state || !shipping.postalCode) {
      setValidationError('Please fill out all shipping fields.');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleProceedToPayment = () => {
    if (validateAddress()) {
      setStep('payment');
    }
  };

  const shippingCost = shippingType === 'Express' ? 80 : 0;
  const treeCost = plantTree ? 50 : 0;
  const grandTotal = subtotal + shippingCost + treeCost;

  const executeCheckout = async (chosenMethod, details) => {
    const itemsPayload = cartData.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      variantName: item.variantName
    }));

    const result = await dispatch(checkoutCart({
      items: itemsPayload,
      shippingAddress: shipping,
      tenantId: selectedStoreId,
      paymentMethod: chosenMethod,
      paymentDetails: details,
      shippingType,
      plantTree
    }));

    if (checkoutCart.fulfilled.match(result)) {
      const { url } = result.payload;
      window.location.href = url;
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!user) {
      setValidationError('Please log in as a Customer to check out.');
      return;
    }

    if (user.role !== 'Customer') {
      setValidationError('Only accounts registered as Customer can make purchases.');
      return;
    }

    // Validation per payment method
    let details = {};
    if (paymentMethod === 'Wallet') {
      const balance = user.walletBalance || 0;
      if (balance < grandTotal) {
        setValidationError('Insufficient wallet balance. Please recharge or use another method.');
        return;
      }
      details = { transactionId: `WT-${Date.now()}` };
    } else if (paymentMethod === 'UPI') {
      if (!upiId || !upiId.includes('@')) {
        setValidationError('Please enter a valid UPI ID (e.g. user@okaxis).');
        return;
      }
      details = { upiId };
    } else if (paymentMethod === 'Card') {
      if (!cardNumber || cardNumber.length < 16 || !cardExpiry || !cardCvv) {
        setValidationError('Please complete all Credit/Debit card fields.');
        return;
      }
      details = { cardLast4: cardNumber.slice(-4) };
    } else if (paymentMethod === 'Net Banking') {
      details = { bankName: selectedBank };
    } else if (paymentMethod === 'COD') {
      details = { codCollected: false };
    }

    await executeCheckout(paymentMethod, details);
  };

  // Top Up Wallet deficit and complete checkout instantly
  const handleTopUpAndPay = async () => {
    setValidationError('');
    const deficit = grandTotal - (user.walletBalance || 0);
    if (deficit <= 0) return;

    setLoadingLocal(true);
    try {
      const rechargeResult = await dispatch(rechargeWallet({ amount: deficit }));
      if (rechargeWallet.fulfilled.match(rechargeResult)) {
        await executeCheckout('Wallet', { transactionId: `WT-${Date.now()}` });
      } else {
        setValidationError('Failed to top up wallet. Please try again.');
      }
    } catch (err) {
      setValidationError('Error processing wallet top-up.');
      console.error(err);
    } finally {
      setLoadingLocal(false);
    }
  };

  if (!isOpen) return null;

  const userBalance = user?.walletBalance || 0;
  const isWalletInsufficient = userBalance < grandTotal;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden text-xs">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md transform transition-all duration-300">
          <div className="flex h-full flex-col border-l border-slate-800 bg-slate-950/90 shadow-2xl backdrop-blur-md">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-6 sm:px-6">
              <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                {step === 'cart' && selectedStoreId && activeStoreIds.length > 1 && (
                  <ArrowLeft className="h-5 w-5 text-slate-400 cursor-pointer" onClick={() => setSelectedStoreId(null)} />
                )}
                {step === 'shipping' && (
                  <ArrowLeft className="h-5 w-5 text-slate-400 cursor-pointer" onClick={() => setStep('cart')} />
                )}
                {step === 'payment' && (
                  <ArrowLeft className="h-5 w-5 text-slate-400 cursor-pointer" onClick={() => setStep('shipping')} />
                )}
                
                {!selectedStoreId ? 'Select a Store Cart' : getStoreMeta(selectedStoreId).name}
              </h2>
              <button
                type="button"
                className="rounded-lg p-2 text-slate-400 hover:text-white hover:bg-slate-900 transition-all"
                onClick={onClose}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
              {activeStoreIds.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="rounded-full bg-slate-900 p-6 text-slate-600 mb-4 border border-slate-800">
                    <ShoppingBag className="h-10 w-10" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-300 font-display">Your cart is empty</h3>
                  <p className="mt-1 text-slate-500">Go to any of our seeded storefronts and select items to purchase.</p>
                </div>
              ) : !selectedStoreId ? (
                /* MULTI-TENANT CART SELECTOR */
                <div className="space-y-4">
                  <p className="text-slate-400 leading-normal mb-6">You have active items in multiple store carts. Please select a merchant to view your items and check out:</p>
                  
                  <div className="space-y-3">
                    {activeStoreIds.map(sId => {
                      const meta = getStoreMeta(sId);
                      const items = cartCarts[sId] || [];
                      const count = items.reduce((s, i) => s + i.quantity, 0);
                      const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
                      
                      return (
                        <div 
                          key={sId}
                          onClick={() => setSelectedStoreId(sId)}
                          className="flex items-center justify-between p-4 rounded-xl border border-slate-900 bg-slate-900/30 hover:bg-slate-900/60 hover:border-brand-500/30 cursor-pointer transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center flex-shrink-0">
                              {meta.logo ? (
                                <img src={meta.logo} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <span className="font-bold text-white">{meta.name[0]}</span>
                              )}
                            </div>
                            <div>
                              <h4 className="font-bold text-white text-sm">{meta.name}</h4>
                              <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{count} item{count > 1 ? 's' : ''} in cart</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-eco-400">₹{total.toFixed(2)}</span>
                            <ChevronRight className="h-4 w-4 text-slate-500" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* SINGLE STORE CART VIEW (WITH WIZARD STEPS) */
                <div className="space-y-6">
                  {/* STEP 1: CART LIST */}
                  {step === 'cart' && (
                    <div className="space-y-4">
                      {cartData.map((item, idx) => (
                        <div key={`${item.productId}-${item.variantName}-${idx}`} className="flex items-start gap-4 border-b border-slate-900 pb-4">
                          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
                            <img
                              src={item.image || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=150'}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex flex-1 flex-col">
                            <div>
                              <div className="flex justify-between text-sm font-semibold text-slate-100">
                                <h4>{item.name}</h4>
                                <p className="ml-4">₹{(item.price * item.quantity).toFixed(2)}</p>
                              </div>
                              {item.variantName && (
                                <p className="mt-0.5 text-slate-500 font-medium">Variant: {item.variantName}</p>
                              )}
                            </div>
                            <div className="flex flex-1 items-end justify-between pt-2">
                              <div className="flex items-center gap-1 border border-slate-850 rounded bg-slate-900 px-1.5 py-0.5">
                                <button
                                  onClick={() => handleQtyChange(item.productId, item.variantName, item.quantity - 1)}
                                  className="text-slate-400 hover:text-white p-0.5"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="text-xs font-semibold px-2 text-slate-200">{item.quantity}</span>
                                <button
                                  onClick={() => handleQtyChange(item.productId, item.variantName, item.quantity + 1)}
                                  className="text-slate-400 hover:text-white p-0.5"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                              <button
                                onClick={() => handleRemove(item.productId, item.variantName)}
                                className="text-slate-600 hover:text-red-400 p-1 transition-colors"
                                title="Remove item"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* STEP 2: SHIPPING FORM */}
                  {step === 'shipping' && (
                    <div className="space-y-4">
                      <p className="text-slate-450 leading-normal mb-2">Enter the delivery details for your order. Scoped to the current store tenant.</p>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="text-[9px] uppercase font-bold text-slate-500 block mb-1">Street Address</label>
                          <input
                            type="text"
                            placeholder="e.g. 789 Lotus Blvd"
                            value={shipping.street}
                            onChange={(e) => setShipping({ ...shipping, street: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[9px] uppercase font-bold text-slate-500 block mb-1">City</label>
                            <input
                              type="text"
                              placeholder="e.g. Mumbai"
                              value={shipping.city}
                              onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] uppercase font-bold text-slate-500 block mb-1">State</label>
                            <input
                              type="text"
                              placeholder="e.g. Maharashtra"
                              value={shipping.state}
                              onChange={(e) => setShipping({ ...shipping, state: e.target.value })}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[9px] uppercase font-bold text-slate-500 block mb-1">Postal Code</label>
                            <input
                              type="text"
                              placeholder="e.g. 400001"
                              value={shipping.postalCode}
                              onChange={(e) => setShipping({ ...shipping, postalCode: e.target.value })}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] uppercase font-bold text-slate-500 block mb-1">Country</label>
                            <input
                              type="text"
                              placeholder="e.g. India"
                              value={shipping.country}
                              onChange={(e) => setShipping({ ...shipping, country: e.target.value })}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Green Shipping Selection */}
                      <div className="pt-4 border-t border-slate-900/50 space-y-2">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Shipping Method</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setShippingType('Eco-Friendly')}
                            className={`flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-all ${
                              shippingType === 'Eco-Friendly'
                                ? 'bg-emerald-950/20 border-emerald-500/35 text-white shadow-md'
                                : 'bg-slate-900/30 border-slate-900 text-slate-400 hover:border-slate-800'
                            }`}
                          >
                            <span className="text-[10px] font-bold text-emerald-450 flex items-center gap-1">🌱 Eco-Delivery</span>
                            <span className="text-[9px] text-slate-500 leading-normal mt-0.5">Electric vehicles, optimized routing. (₹0, +10 points)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setShippingType('Express')}
                            className={`flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-all ${
                              shippingType === 'Express'
                                ? 'bg-brand-900/10 border-brand-500/35 text-white shadow-md'
                                : 'bg-slate-900/30 border-slate-900 text-slate-400 hover:border-slate-800'
                            }`}
                          >
                            <span className="text-[10px] font-bold text-slate-200">⚡ Express Delivery</span>
                            <span className="text-[9px] text-slate-500 leading-normal mt-0.5">Fast highway/air shipping. (₹80, standard emissions)</span>
                          </button>
                        </div>
                      </div>

                      {/* Plant a Tree Box */}
                      <div className="pt-4 border-t border-slate-900/50">
                        <label className={`flex items-center gap-3.5 p-3.5 rounded-xl border cursor-pointer transition-all ${
                          plantTree
                            ? 'bg-emerald-950/20 border-emerald-500/35 text-white shadow-md'
                            : 'bg-slate-900/30 border-slate-900 text-slate-400 hover:border-slate-850'
                        }`}>
                          <input
                            type="checkbox"
                            checked={plantTree}
                            onChange={(e) => setPlantTree(e.target.checked)}
                            className="accent-emerald-500 h-4.5 w-4.5 rounded cursor-pointer"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-bold text-emerald-455 flex items-center gap-1.5">
                              🌳 Plant a Real Tree (+₹50)
                            </span>
                            <p className="text-[9px] text-slate-500 leading-normal mt-0.5">
                              We plant a tree in your name, which also adds a growing virtual tree to your garden profile! (+22kg CO₂ saved/yr)
                            </p>
                          </div>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: PAYMENT METHOD FORM */}
                  {step === 'payment' && (
                    <div className="space-y-4">
                      <div className="space-y-2.5">
                        <label className="text-xs font-bold text-slate-455 uppercase tracking-wider block">Choose Payment Mode</label>
                        
                        <div className="space-y-2">
                          {/* Wallet Option */}
                          <label className={`flex flex-col gap-1 rounded-xl border p-3 cursor-pointer transition-all ${
                            paymentMethod === 'Wallet' 
                              ? 'bg-brand-900/10 border-brand-500' 
                              : 'bg-slate-900/30 border-slate-900 hover:border-slate-850'
                          }`}>
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="payment"
                                checked={paymentMethod === 'Wallet'}
                                onChange={() => setPaymentMethod('Wallet')}
                                className="accent-brand-500 h-4 w-4"
                              />
                              <Wallet className="h-4 w-4 text-brand-400" />
                              <span className="text-xs font-bold text-slate-100">Eco Wallet Balance</span>
                            </div>
                            <span className="text-[10px] text-slate-400 pl-6">
                              Balance: <strong className={isWalletInsufficient ? 'text-red-400' : 'text-eco-400'}>₹{userBalance.toFixed(2)}</strong>
                            </span>
                          </label>

                          {/* UPI Option */}
                          <label className={`flex flex-col gap-2 rounded-xl border p-3 cursor-pointer transition-all ${
                            paymentMethod === 'UPI' 
                              ? 'bg-brand-900/10 border-brand-500' 
                              : 'bg-slate-900/30 border-slate-900 hover:border-slate-850'
                          }`}>
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="payment"
                                checked={paymentMethod === 'UPI'}
                                onChange={() => setPaymentMethod('UPI')}
                                className="accent-brand-500 h-4 w-4"
                              />
                              <Send className="h-4 w-4 text-brand-400" />
                              <span className="text-xs font-bold text-slate-100">BHIM UPI / GPAY</span>
                            </div>
                            {paymentMethod === 'UPI' && (
                              <div className="pl-6 pt-1 animate-slide-up">
                                <input
                                  type="text"
                                  placeholder="e.g. user@okaxis"
                                  value={upiId}
                                  onChange={(e) => setUpiId(e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-brand-500"
                                />
                              </div>
                            )}
                          </label>

                          {/* Credit/Debit Card Option */}
                          <label className={`flex flex-col gap-2 rounded-xl border p-3 cursor-pointer transition-all ${
                            paymentMethod === 'Card' 
                              ? 'bg-brand-900/10 border-brand-500' 
                              : 'bg-slate-900/30 border-slate-900 hover:border-slate-850'
                          }`}>
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="payment"
                                checked={paymentMethod === 'Card'}
                                onChange={() => setPaymentMethod('Card')}
                                className="accent-brand-500 h-4 w-4"
                              />
                              <CreditCard className="h-4 w-4 text-brand-400" />
                              <span className="text-xs font-bold text-slate-100">Credit / Debit Card</span>
                            </div>
                            {paymentMethod === 'Card' && (
                              <div className="pl-6 space-y-2 pt-1 animate-slide-up">
                                <input
                                  type="text"
                                  maxLength="16"
                                  placeholder="Card Number (16 Digits)"
                                  value={cardNumber}
                                  onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
                                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-brand-500"
                                />
                                <div className="grid grid-cols-2 gap-2">
                                  <input
                                    type="text"
                                    placeholder="MM/YY"
                                    value={cardExpiry}
                                    onChange={(e) => setCardExpiry(e.target.value)}
                                    className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-brand-500"
                                  />
                                  <input
                                    type="password"
                                    maxLength="3"
                                    placeholder="CVV"
                                    value={cardCvv}
                                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                                    className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-brand-500"
                                  />
                                </div>
                              </div>
                            )}
                          </label>

                          {/* Net Banking Option */}
                          <label className={`flex flex-col gap-2 rounded-xl border p-3 cursor-pointer transition-all ${
                            paymentMethod === 'Net Banking' 
                              ? 'bg-brand-900/10 border-brand-500' 
                              : 'bg-slate-900/30 border-slate-900 hover:border-slate-850'
                          }`}>
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="payment"
                                checked={paymentMethod === 'Net Banking'}
                                onChange={() => setPaymentMethod('Net Banking')}
                                className="accent-brand-500 h-4 w-4"
                              />
                              <Landmark className="h-4 w-4 text-brand-400" />
                              <span className="text-xs font-bold text-slate-100">Net Banking</span>
                            </div>
                            {paymentMethod === 'Net Banking' && (
                              <div className="pl-6 pt-1 animate-slide-up">
                                <select
                                  value={selectedBank}
                                  onChange={(e) => setSelectedBank(e.target.value)}
                                  className="w-full bg-slate-955 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-brand-500"
                                >
                                  <option>State Bank of India</option>
                                  <option>HDFC Bank</option>
                                  <option>ICICI Bank</option>
                                  <option>Axis Bank</option>
                                </select>
                              </div>
                            )}
                          </label>

                          {/* Cash On Delivery Option */}
                          <label className={`flex flex-col gap-1 rounded-xl border p-3 cursor-pointer transition-all ${
                            paymentMethod === 'COD' 
                              ? 'bg-brand-900/10 border-brand-500' 
                              : 'bg-slate-900/30 border-slate-900 hover:border-slate-850'
                          }`}>
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="payment"
                                checked={paymentMethod === 'COD'}
                                onChange={() => setPaymentMethod('COD')}
                                className="accent-brand-500 h-4 w-4"
                              />
                              <ShieldCheck className="h-4 w-4 text-brand-400" />
                              <span className="text-xs font-bold text-slate-100">Cash on Delivery (COD)</span>
                            </div>
                            <span className="text-[10px] text-slate-400 pl-6">Pay at your doorstep.</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            {selectedStoreId && cartData.length > 0 && (
              <div className="border-t border-slate-800 bg-slate-900/20 px-4 py-6 sm:px-6">
                <div className="space-y-1.5 pb-3 border-b border-slate-850 text-[10px] text-slate-400">
                  <div className="flex justify-between">
                    <span>Items Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Shipping ({shippingType})</span>
                    <span>₹{shippingCost.toFixed(2)}</span>
                  </div>
                  {plantTree && (
                    <div className="flex justify-between text-emerald-450">
                      <span>🌳 Tree Planting Donation</span>
                      <span>₹50.00</span>
                    </div>
                  )}
                </div>
                <div className="flex justify-between text-base font-semibold text-slate-100 mt-3">
                  <p>Grand Total</p>
                  <p className="text-emerald-405">₹{grandTotal.toFixed(2)}</p>
                </div>

                {validationError && (
                  <div className="mt-3 rounded-lg border border-red-500/20 bg-red-950/30 p-2.5 text-center text-red-400 font-bold">
                    {validationError}
                  </div>
                )}

                {error && (
                  <div className="mt-3 rounded-lg border border-red-500/20 bg-red-950/30 p-2.5 text-center text-red-400 font-bold flex flex-col items-center justify-center gap-2">
                    <span>{error}</span>
                    {error.includes('not found in the database') && selectedStoreId && (
                      <button
                        type="button"
                        onClick={() => {
                          dispatch(clearCart({ storeId: selectedStoreId }));
                          dispatch(resetCheckout());
                        }}
                        className="mt-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 px-3.5 py-2 text-xs text-red-300 transition-all font-semibold cursor-pointer shadow-sm hover:shadow-red-500/10"
                      >
                        Clear Cart for This Store
                      </button>
                    )}
                  </div>
                )}

                <div className="mt-6 flex flex-col gap-2">
                  {/* Cart View Controls */}
                  {step === 'cart' && (
                    <button
                      onClick={() => {
                        if (!user) setValidationError('Please login as a Customer to check out.');
                        else setStep('shipping');
                      }}
                      className="w-full flex items-center justify-center gap-2 rounded-lg bg-brand-600 hover:bg-brand-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition-all active:scale-[0.98] cursor-pointer"
                    >
                      Proceed to Checkout
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  )}

                  {/* Shipping Address Controls */}
                  {step === 'shipping' && (
                    <button
                      onClick={handleProceedToPayment}
                      className="w-full flex items-center justify-center gap-2 rounded-lg bg-brand-600 hover:bg-brand-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition-all active:scale-[0.98] cursor-pointer"
                    >
                      Proceed to Payment
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  )}

                  {/* Payment Selection Controls */}
                  {step === 'payment' && (
                    <>
                      {paymentMethod === 'Wallet' && isWalletInsufficient ? (
                        <button
                          disabled={loadingLocal || checkoutLoading}
                          onClick={handleTopUpAndPay}
                          className="w-full flex items-center justify-center gap-2 rounded-lg bg-eco-600 hover:bg-eco-500 disabled:bg-slate-800 disabled:text-slate-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-all active:scale-[0.98] cursor-pointer"
                        >
                          {loadingLocal ? 'Processing top-up...' : `Top-up ₹${(subtotal - userBalance).toFixed(2)} & Pay`}
                        </button>
                      ) : (
                        <button
                          disabled={checkoutLoading || loadingLocal}
                          onClick={handlePlaceOrder}
                          className="w-full flex items-center justify-center gap-2 rounded-lg bg-brand-600 hover:bg-brand-500 disabled:bg-slate-800 disabled:text-slate-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition-all active:scale-[0.98] cursor-pointer"
                        >
                          {checkoutLoading ? 'Placing Order...' : 'Pay & Place Order'}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
