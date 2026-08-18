import React, { useState } from 'react';
import { Crown, Check } from 'lucide-react';
import { paymentApi } from '../api/payment.js';
import { useAuth } from '../context/AuthContext.js';

export const UpgradePage: React.FC = () => {
  const { user, isPro, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubscribe = async (plan: 'monthly' | 'yearly') => {
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const orderData = await paymentApi.createOrder(plan);

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'HabitForge Pro',
        description: `${plan.toUpperCase()} Subscription Plan`,
        order_id: orderData.orderId,
        handler: async (response: any) => {
          await paymentApi.verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            plan,
          });
          await refreshUser();
          setSuccessMsg('Congratulations! Your Pro membership is now active.');
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: {
          color: '#6366F1',
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Payment initiation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Upgrade to Pro 👑</h1>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold">
          {successMsg}
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
          {error}
        </div>
      )}

      {isPro ? (
        <div className="p-8 rounded-3xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-slate-900 border border-amber-500/30 text-center max-w-xl mx-auto">
          <Crown className="w-12 h-12 text-amber-400 mx-auto mb-3" />
          <h2 className="text-2xl font-extrabold text-white">You are a Pro Member!</h2>
          <p className="text-sm text-slate-400 mt-2">
            Enjoy unlimited habit creation, 365-day heatmaps, and monthly daily breakdown reports.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Monthly Plan */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between hover:border-slate-700 transition-all">
            <div>
              <span className="text-xs font-extrabold text-indigo-400 uppercase tracking-wider">
                Monthly Pro
              </span>
              <div className="flex items-baseline gap-1 mt-3">
                <span className="text-4xl font-extrabold text-white">₹199</span>
                <span className="text-sm text-slate-400">/ month</span>
              </div>

              <ul className="space-y-3 mt-6 text-sm text-slate-300">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400" /> Unlimited Habits Creation
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400" /> 365-Day Activity Heatmap
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400" /> Monthly Calendar Daily Report
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400" /> Unlimited Custom Tags
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleSubscribe('monthly')}
              disabled={loading}
              className="w-full mt-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-colors shadow-lg shadow-indigo-600/30"
            >
              {loading ? 'Processing...' : 'Subscribe Monthly'}
            </button>
          </div>

          {/* Yearly Plan */}
          <div className="bg-gradient-to-b from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/40 rounded-3xl p-8 flex flex-col justify-between relative shadow-xl shadow-indigo-500/10">
            <span className="absolute -top-3 right-6 px-3 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-slate-950 uppercase tracking-wider">
              Best Value (Save 37%)
            </span>

            <div>
              <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">
                Yearly Pro Pass
              </span>
              <div className="flex items-baseline gap-1 mt-3">
                <span className="text-4xl font-extrabold text-white">₹1,499</span>
                <span className="text-sm text-slate-400">/ year</span>
              </div>

              <ul className="space-y-3 mt-6 text-sm text-slate-300">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-amber-400" /> Everything in Monthly Plan
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-amber-400" /> Priority Support
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-amber-400" /> Exclusive Pioneer Badge
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleSubscribe('yearly')}
              disabled={loading}
              className="w-full mt-8 py-3 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 font-extrabold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-amber-500/20"
            >
              {loading ? 'Processing...' : 'Subscribe Yearly'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
