import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../components/ToastContainer';

export const RegisterPage: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const { register, loading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectUrl = new URLSearchParams(location.search).get('redirect') || '/shop';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters long');
      return;
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

    try {
      await register(fullName, email, password, phone);
      showToast(`Welcome to Aneera Silks, ${firstName}! A verification email has been dispatched.`, 'success');
      navigate(redirectUrl);
    } catch (err: any) {
      // Handled in context
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-[#FFFDF9] text-slate-900 flex flex-col justify-between p-3.5 sm:p-6 overflow-y-auto sm:overflow-hidden select-none">
      {/* Top Action Bar: Back (Left) & Guest Login (Right) */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between flex-shrink-0 z-10">
        <button
          type="button"
          onClick={() => {
            if (window.history.length > 2) {
              navigate(-1);
            } else {
              navigate('/');
            }
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-amber-100 border border-amber-300 text-slate-800 text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
          aria-label="Go back"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-amber-900" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={() => navigate(redirectUrl)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-100/90 hover:bg-amber-200 border border-amber-300 text-amber-950 text-xs font-black uppercase tracking-wider transition-all shadow-xs active:scale-95 cursor-pointer"
          aria-label="Continue as Guest"
        >
          <ShoppingBag className="w-3.5 h-3.5 text-red-800" />
          <span>Continue as Guest</span>
          <ArrowRight className="w-3 h-3 text-red-800" />
        </button>
      </div>

      {/* Main Centered Register Card */}
      <div className="max-w-md w-full mx-auto my-auto bg-white p-5 sm:p-7 rounded-3xl border border-amber-200 shadow-xl space-y-3.5">
        <div className="text-center space-y-1">
          <div className="flex justify-center pb-0.5">
            <img
              src="/aneera_silks_logo.jpg"
              alt="Aneera Silks Logo"
              className="w-12 h-12 rounded-2xl object-cover shadow-sm border border-amber-300"
            />
          </div>
          <span className="font-serif-luxury text-2xl font-extrabold tracking-wider text-slate-900 block">ANEERA SILKS</span>
          <h2 className="font-serif-luxury text-xs font-bold text-amber-900 uppercase tracking-widest">CREATE AN ACCOUNT</h2>
        </div>

        {(error || localError) && (
          <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold text-center">
            {localError || error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs font-medium">
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-slate-700 font-bold mb-0.5 text-[11px]">FIRST NAME</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Ananya"
                className="w-full p-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-slate-900 focus:border-red-800 focus:outline-none text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-0.5 text-[11px]">LAST NAME</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Sharma"
                className="w-full p-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-slate-900 focus:border-red-800 focus:outline-none text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-slate-700 font-bold mb-0.5 text-[11px]">EMAIL ADDRESS</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ananya@example.com"
                className="w-full p-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-slate-900 focus:border-red-800 focus:outline-none text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-0.5 text-[11px]">PHONE NUMBER</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full p-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-slate-900 focus:border-red-800 focus:outline-none text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-0.5 text-[11px]">PASSWORD (MIN 8 CHARS)</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2.5 pr-10 bg-amber-50/40 border border-amber-200 rounded-xl text-slate-900 focus:border-red-800 focus:outline-none text-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-red-800 focus:outline-none cursor-pointer"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4 text-slate-600" /> : <Eye className="w-4 h-4 text-slate-600" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-0.5 text-[11px]">CONFIRM PASSWORD</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2.5 pr-10 bg-amber-50/40 border border-amber-200 rounded-xl text-slate-900 focus:border-red-800 focus:outline-none text-xs"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-red-800 focus:outline-none cursor-pointer"
                tabIndex={-1}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4 text-slate-600" /> : <Eye className="w-4 h-4 text-slate-600" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-red-800 hover:bg-red-900 text-amber-300 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md border border-amber-300 cursor-pointer active:scale-[0.99] mt-1"
          >
            {loading ? 'CREATING ACCOUNT...' : 'REGISTER ANEERA SILKS ACCOUNT'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-amber-200/80">
          Already have an account?{' '}
          <Link to={`/login${location.search}`} className="text-red-800 font-extrabold hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>

      {/* Footer Branding Note */}
      <div className="w-full text-center flex-shrink-0 z-10 py-1">
        <p className="text-[10px] text-amber-900/60 font-bold uppercase tracking-widest">
          Handcrafted Luxury • Aneera Silks Atelier
        </p>
      </div>
    </div>
  );
};
