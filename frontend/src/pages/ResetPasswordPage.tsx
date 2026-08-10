import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { api } from '../services/api';
import { showToast } from '../components/ToastContainer';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Missing reset password token.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', { token, newPassword: password });
      showToast(res.data.message || 'Password reset successfully!', 'success');
      navigate('/login');
    } catch (err: any) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to reset password. Link may be expired.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] flex items-center justify-center p-6 text-slate-900">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-amber-200 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center pb-1">
            <img
              src="/kanchanika_attire_logo.svg"
              alt="Kanchanika Logo"
              className="w-14 h-14 object-contain drop-shadow"
            />
          </div>
          <span className="font-serif-luxury text-2xl font-extrabold tracking-wider text-slate-900 block">KANCHANIKA</span>
          <h2 className="font-serif-luxury text-base font-bold text-amber-900 uppercase tracking-widest">RESET YOUR PASSWORD</h2>
          <p className="text-xs text-slate-500 font-medium">Enter your new secure password below.</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
          <div>
            <label className="block text-slate-700 font-bold mb-1">NEW PASSWORD (MIN 8 CHARS)</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-3 pr-11 bg-amber-50/40 border border-amber-200 rounded-xl text-slate-900 focus:border-red-800 focus:outline-none"
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

          <div>
            <label className="block text-slate-700 font-bold mb-1">CONFIRM NEW PASSWORD</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-3 pr-11 bg-amber-50/40 border border-amber-200 rounded-xl text-slate-900 focus:border-red-800 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-red-800 focus:outline-none"
                tabIndex={-1}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5 text-slate-600" /> : <Eye className="w-5 h-5 text-slate-600" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-red-800 hover:bg-red-900 text-amber-300 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg border border-amber-300"
          >
            {loading ? 'SAVING PASSWORD...' : 'UPDATE PASSWORD'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-amber-200">
          Remembered your password?{' '}
          <Link to="/login" className="text-red-800 font-extrabold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
