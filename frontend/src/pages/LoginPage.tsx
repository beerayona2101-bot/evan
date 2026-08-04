import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { showToast } from '../components/ToastContainer';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const [resetSuccessData, setResetSuccessData] = useState<{ message: string; devResetUrl?: string; emailSent?: boolean } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/shop');
    } catch (err) {
      // Handled in context
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotLoading(true);
    setResetSuccessData(null);
    try {
      const res = await api.post('/auth/forgot-password', { email: forgotEmail });
      setResetSuccessData(res.data);
      if (res.data.emailSent !== false) {
        showToast(res.data.message || 'Password reset email sent!', 'success');
      } else {
        showToast('Reset token generated! (Live email failed - see modal to test reset).', 'info');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to dispatch password reset email', 'error');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-slate-900 flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-amber-200 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-red-800 flex items-center justify-center text-amber-300 font-black text-xl mx-auto shadow border border-amber-300">
            E
          </div>
          <span className="font-serif-luxury text-3xl font-extrabold tracking-wider text-slate-900 block">EVAN COLLECTIONS</span>
          <h2 className="font-serif-luxury text-base font-bold text-amber-900 uppercase tracking-widest">WELCOME BACK</h2>
          <p className="text-xs text-slate-500 font-medium">Sign in to access your orders, wishlist, and VIP concierge privileges.</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
          <div>
            <label className="block text-slate-700 font-bold mb-1">EMAIL ADDRESS</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@evan.com or ananya@example.com"
              className="w-full p-3.5 bg-amber-50/40 border border-amber-200 rounded-xl text-slate-900 focus:border-red-800 focus:outline-none"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-slate-700 font-bold">PASSWORD</label>
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(true);
                  setResetSuccessData(null);
                }}
                className="text-[11px] text-red-800 font-bold hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-3.5 pr-11 bg-amber-50/40 border border-amber-200 rounded-xl text-slate-900 focus:border-red-800 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-red-800 focus:outline-none"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-5 h-5 text-slate-600" /> : <Eye className="w-5 h-5 text-slate-600" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-red-800 hover:bg-red-900 text-amber-300 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg border border-amber-300"
          >
            {loading ? 'SIGNING IN...' : 'SIGN IN TO EVAN'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-amber-200">
          Don't have an EVAN account?{' '}
          <Link to="/register" className="text-red-800 font-extrabold hover:underline">
            Register Here
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-3xl border border-amber-200 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-amber-200 pb-3">
              <h3 className="font-serif-luxury text-base font-bold text-amber-900 uppercase">RESET PASSWORD LINK</h3>
              <button onClick={() => setShowForgotModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
            </div>

            {resetSuccessData ? (
              <div className="space-y-4">
                <div className={`p-4 rounded-xl text-xs font-bold ${resetSuccessData.emailSent ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-amber-50 border border-amber-300 text-amber-900'}`}>
                  {resetSuccessData.message}
                </div>

                {resetSuccessData.devResetUrl && (
                  <div className="p-4 bg-slate-900 text-amber-300 rounded-xl text-xs space-y-2 border border-amber-400">
                    <p className="font-bold text-white uppercase text-[11px]">🔧 Dev / Test Shortcut Link:</p>
                    <p className="text-[10px] text-slate-300 leading-normal">
                      Gmail SMTP rejected the app password in <code>.env</code>. You can click below to test the password reset flow directly:
                    </p>
                    <a
                      href={resetSuccessData.devResetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-center w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold rounded-lg text-xs tracking-wider uppercase shadow"
                    >
                      RESET PASSWORD NOW →
                    </a>
                  </div>
                )}

                <button
                  onClick={() => setShowForgotModal(false)}
                  className="w-full py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl"
                >
                  CLOSE
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4 text-xs font-medium">
                <p className="text-xs text-slate-600 font-medium">Enter your registered email address below. We will send you a secure link to reset your password.</p>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">REGISTERED EMAIL ADDRESS</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="ananya@example.com"
                    className="w-full p-3.5 bg-amber-50/40 border border-amber-200 rounded-xl text-slate-900 focus:border-red-800 focus:outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="w-1/2 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-1/2 py-3 bg-red-800 text-amber-300 font-extrabold rounded-xl hover:bg-red-900 border border-amber-300"
                  >
                    {forgotLoading ? 'SENDING...' : 'DISPATCH RESET LINK'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
