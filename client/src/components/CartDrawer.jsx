import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { X, Trash2, Plus, Minus, CreditCard, ShoppingBag, ArrowRight } from 'lucide-react';
import { removeFromCart, updateQuantity } from '../store/slices/cartSlice';
import { checkoutCart } from '../store/slices/orderSlice';

export default function CartDrawer({ isOpen, onClose, storeId }) {
  const dispatch = useDispatch();
  const cartData = useSelector(state => state.cart.carts[storeId] || []);
  const { checkoutLoading, error } = useSelector(state => state.orders);
  const { user } = useSelector(state => state.auth);

  // Shipping details state
  const [shipping, setShipping] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US'
  });

  const [validationError, setValidationError] = useState('');

  const subtotal = cartData.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleQtyChange = (productId, variantName, newQty) => {
    dispatch(updateQuantity({ storeId, productId, variantName, quantity: newQty }));
  };

  const handleRemove = (productId, variantName) => {
    dispatch(removeFromCart({ storeId, productId, variantName }));
  };

  const handleCheckout = async (e) => {
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

    if (!shipping.street || !shipping.city || !shipping.state || !shipping.postalCode) {
      setValidationError('Please fill out all shipping fields.');
      return;
    }

    const itemsPayload = cartData.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      variantName: item.variantName
    }));

    const result = await dispatch(checkoutCart({
      items: itemsPayload,
      shippingAddress: shipping,
      tenantId: storeId
    }));

    if (checkoutCart.fulfilled.match(result)) {
      const { url } = result.payload;
      // Redirect to Stripe Checkout or Mock checkout success path
      window.location.href = url;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
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
                <ShoppingBag className="h-5 w-5 text-eco-500" />
                Shopping Cart
              </h2>
              <button
                type="button"
                className="rounded-lg p-2 text-slate-400 hover:text-white hover:bg-slate-900 transition-all"
                onClick={onClose}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
              {cartData.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="rounded-full bg-slate-900 p-6 text-slate-600 mb-4 border border-slate-800">
                    <ShoppingBag className="h-10 w-10" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-300">Your cart is empty</h3>
                  <p className="mt-1 text-xs text-slate-500">Add products to your cart to checkout.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {cartData.map((item, idx) => (
                    <div key={`${item.productId}-${item.variantName}-${idx}`} className="flex items-start gap-4 border-b border-slate-900 pb-4">
                      {/* Thumbnail */}
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=150'}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex flex-1 flex-col">
                        <div>
                          <div className="flex justify-between text-sm font-semibold text-slate-100">
                            <h4>{item.name}</h4>
                            <p className="ml-4">₹{(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                          {item.variantName && (
                            <p className="mt-0.5 text-xs text-slate-500 font-medium">Variant: {item.variantName}</p>
                          )}
                        </div>
                        <div className="flex flex-1 items-end justify-between pt-2">
                          {/* Quantity selector */}
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

                          {/* Delete */}
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

                  {/* Shipping Address fields */}
                  {user && user.role === 'Customer' && (
                    <div className="pt-4 border-t border-slate-850">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Shipping Address</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="col-span-2">
                          <input
                            type="text"
                            placeholder="Street Address"
                            value={shipping.street}
                            onChange={(e) => setShipping({ ...shipping, street: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-2 text-white focus:outline-none focus:border-brand-500"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="City"
                            value={shipping.city}
                            onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-2 text-white focus:outline-none focus:border-brand-500"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="State"
                            value={shipping.state}
                            onChange={(e) => setShipping({ ...shipping, state: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-2 text-white focus:outline-none focus:border-brand-500"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Postal Code"
                            value={shipping.postalCode}
                            onChange={(e) => setShipping({ ...shipping, postalCode: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-2 text-white focus:outline-none focus:border-brand-500"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Country"
                            value={shipping.country}
                            onChange={(e) => setShipping({ ...shipping, country: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-2 text-white focus:outline-none focus:border-brand-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            {cartData.length > 0 && (
              <div className="border-t border-slate-800 bg-slate-900/20 px-4 py-6 sm:px-6">
                <div className="flex justify-between text-base font-semibold text-slate-100">
                  <p>Subtotal</p>
                  <p>₹{subtotal.toFixed(2)}</p>
                </div>
                <p className="mt-0.5 text-xs text-slate-500">Shipping and taxes calculated at checkout.</p>

                {validationError && (
                  <div className="mt-3 rounded-lg border border-red-500/20 bg-red-950/30 p-2.5 text-center text-xs text-red-400">
                    {validationError}
                  </div>
                )}

                {error && (
                  <div className="mt-3 rounded-lg border border-red-500/20 bg-red-950/30 p-2.5 text-center text-xs text-red-400">
                    {error}
                  </div>
                )}

                <div className="mt-6">
                  <button
                    disabled={checkoutLoading}
                    onClick={handleCheckout}
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-eco-600 hover:bg-eco-500 disabled:bg-slate-800 disabled:text-slate-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-eco-600/20 transition-all active:scale-[0.98]"
                  >
                    {checkoutLoading ? (
                      <span>Redirecting to payment...</span>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4" />
                        Proceed to Checkout
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
                <div className="mt-4 flex justify-center text-center text-xs">
                  <p className="text-slate-500">
                    or{' '}
                    <button
                      type="button"
                      className="font-medium text-eco-400 hover:text-eco-300 transition-colors"
                      onClick={onClose}
                    >
                      Continue Shopping
                    </button>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
