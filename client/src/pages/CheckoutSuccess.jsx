import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { CheckCircle, ArrowRight, ShieldCheck, ShoppingBag, Receipt } from 'lucide-react';
import { confirmMockPayment } from '../store/slices/orderSlice';
import { clearCart } from '../store/slices/cartSlice';

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const sessionId = searchParams.get('session_id');
  const type = searchParams.get('type');

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [orderInfo, setOrderInfo] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setLoading(false);
        return;
      }

      try {
        if (sessionId.startsWith('mock_')) {
          // Verify simulation payment on the server
          const result = await dispatch(confirmMockPayment({ sessionId }));
          if (confirmMockPayment.fulfilled.match(result)) {
            const order = result.payload.order;
            setOrderInfo(order);
            setSuccess(true);
            
            // Clear cart for this store tenant
            if (order && order.store) {
              dispatch(clearCart({ storeId: order.store }));
            }
          }
        } else {
          // For real Stripe payment, webhook completes it.
          // Displaying general success message for Stripe completion
          setSuccess(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId, dispatch]);

  return (
    <div className="relative min-h-screen bg-slate-950 flex items-center justify-center p-6 text-xs">
      <div className="absolute top-20 left-20 h-72 w-72 rounded-full bg-eco-600/10 blur-3xl" />

      <div className="max-w-md w-full rounded-2xl glass-panel p-8 text-center space-y-6 relative z-10">
        {loading ? (
          <div className="space-y-4 py-8">
            <div className="h-12 w-12 border-4 border-eco-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <h2 className="text-sm font-semibold text-slate-300">Confirming checkout transaction details...</h2>
            <p className="text-[11px] text-slate-500">Please do not close this window or navigate away.</p>
          </div>
        ) : success ? (
          <div className="space-y-6 animate-fade-in-up">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <CheckCircle className="h-10 w-10 animate-pulse" />
            </div>

            {type === 'wallet' ? (
              <>
                <div className="space-y-2">
                  <h1 className="text-xl font-bold text-white tracking-tight">Wallet Recharge Completed!</h1>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Thank you. Your top-up payment was processed successfully. The funds have been credited to your Eco Wallet.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 justify-center rounded-full bg-emerald-500/5 border border-emerald-500/10 px-3 py-1 text-[10px] text-emerald-400 max-w-fit mx-auto">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Secure wallet transaction</span>
                </div>

                <div className="pt-4 border-t border-slate-900 flex flex-col gap-2">
                  <Link
                    to="/profile"
                    className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-eco-600 hover:bg-eco-500 px-4 py-2.5 font-bold text-white shadow-md transition-all active:scale-95"
                  >
                    Return to Your Profile
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <h1 className="text-xl font-bold text-white tracking-tight">Checkout Completed!</h1>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Thank you for your purchase. Your payment was verified successfully. An invoice has been logged and the merchant has been notified.
                  </p>
                </div>

                {orderInfo && (
                  <div className="rounded-lg border border-slate-900 bg-slate-950/60 p-4 text-left space-y-3 font-medium text-[11px] text-slate-400">
                    <div className="flex justify-between border-b border-slate-900 pb-2 text-slate-300 font-bold uppercase tracking-wider text-[9px]">
                      <span>Order Summary</span>
                      <span>ID: ...{orderInfo._id.substring(orderInfo._id.length - 8)}</span>
                    </div>
                    
                    <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
                      {orderInfo.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <span className="truncate max-w-[180px] text-slate-300">{item.name} {item.variantName ? `(${item.variantName})` : ''} x{item.quantity}</span>
                          <span className="font-bold text-white">₹{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between border-t border-slate-900 pt-2 text-slate-200 font-bold">
                      <span>Grand Total Paid</span>
                      <span className="text-eco-400 text-xs">₹{orderInfo.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-1.5 justify-center rounded-full bg-emerald-500/5 border border-emerald-500/10 px-3 py-1 text-[10px] text-emerald-400 max-w-fit mx-auto">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Secure isolation transaction</span>
                </div>

                <div className="pt-4 border-t border-slate-900 flex flex-col gap-2">
                  <Link
                    to="/"
                    className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-eco-600 hover:bg-eco-500 px-4 py-2.5 font-bold text-white shadow-md transition-all active:scale-95"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Return to Marketplace
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-6 py-6">
            <span className="text-4xl block">⚠️</span>
            <h1 className="text-lg font-bold text-slate-200">Payment Verification Failed</h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              We were unable to verify your Stripe Checkout session. If you completed payment, please contact store support with your Stripe session ID: {sessionId || 'N/A'}.
            </p>
            <Link to="/" className="inline-block mt-4 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 px-6 py-2.5 font-semibold text-slate-300">
              Return to Marketplace
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
