import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, NavLink } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, Loader2, ArrowRight } from 'lucide-react';
import { authClient } from '../lib/auth-client.js';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. Missing verification token.');
      return;
    }

    authClient
      .verifyEmail({
        query: { token },
      })
      .then((res) => {
        if (res.error) {
          setStatus('error');
          setMessage(res.error.message || 'Verification failed or link expired.');
        } else {
          setStatus('success');
          setMessage('Your email address has been verified successfully!');
          setTimeout(() => navigate('/'), 3000);
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Failed to verify email. Please try again.');
      });
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-[#070A12] text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center">
        {status === 'loading' && (
          <div className="flex flex-col items-center py-6">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
            <h2 className="text-xl font-bold text-white">Verifying Your Email...</h2>
            <p className="text-sm text-slate-400 mt-2">Please wait while we activate your HabitForge account.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
              <ShieldCheck className="w-9 h-9 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-extrabold text-white">Email Verified! 🎉</h2>
            <p className="text-sm text-slate-300 mt-2 mb-6">{message}</p>
            <NavLink
              to="/"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/30"
            >
              Continue to Dashboard <ArrowRight className="w-4 h-4" />
            </NavLink>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center py-4">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4">
              <ShieldAlert className="w-9 h-9 text-rose-400" />
            </div>
            <h2 className="text-xl font-extrabold text-white">Verification Failed</h2>
            <p className="text-sm text-rose-400 mt-2 mb-6">{message}</p>
            <div className="flex gap-3 w-full">
              <NavLink
                to="/login"
                className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-200 font-bold text-sm text-center border border-slate-700 hover:bg-slate-750"
              >
                Go to Login
              </NavLink>
              <NavLink
                to="/register"
                className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm text-center hover:bg-indigo-500 shadow-md shadow-indigo-600/30"
              >
                Register Again
              </NavLink>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
