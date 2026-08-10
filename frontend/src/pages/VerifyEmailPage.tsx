import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'success' | 'error'>('success');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setStatus('error');
      setMessage('Missing email verification token.');
      return;
    }

    api
      .get(`/auth/verify-email?token=${token}`)
      .then((res: any) => {
        setLoading(false);
        setStatus('success');
        setMessage(res.data.message || 'Your email address has been verified successfully!');
      })
      .catch((err: any) => {
        setLoading(false);
        setStatus('error');
        setMessage(err.response?.data?.message || 'Invalid or expired verification link.');
      });
  }, [token]);

  return (
    <div className="min-h-screen bg-[#FFFDF9] flex items-center justify-center p-6 text-slate-900">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-amber-200 shadow-xl text-center space-y-6">
        <div className="flex justify-center pb-1">
          <img
            src="/kanchanika_attire_logo.svg"
            alt="Kanchanika Logo"
            className="w-16 h-16 object-contain drop-shadow"
          />
        </div>

        {loading ? (
          <div className="space-y-4">
            <h2 className="text-xl font-extrabold text-amber-900">VERIFYING YOUR ACCOUNT...</h2>
            <div className="w-10 h-10 border-4 border-red-800 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-500 font-medium">Please wait while we validate your security token.</p>
          </div>
        ) : status === 'success' ? (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl font-bold mx-auto border border-emerald-300">
              ✓
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">ACCOUNT VERIFIED!</h2>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">{message}</p>
            <Link
              to="/login"
              className="inline-block px-8 py-3.5 bg-red-800 hover:bg-red-900 text-amber-300 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow border border-amber-300"
            >
              SIGN IN TO KANCHANIKA
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xl font-bold mx-auto border border-red-300">
              ✕
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">VERIFICATION FAILED</h2>
            <p className="text-xs text-red-600 font-medium leading-relaxed">{message}</p>
            <Link
              to="/login"
              className="inline-block px-8 py-3.5 bg-slate-800 hover:bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow"
            >
              RETURN TO LOGIN
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
