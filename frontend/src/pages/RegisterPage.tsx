import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
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
      showToast(`Welcome to Kanchanika, ${firstName}! A verification email has been dispatched.`, 'success');
      navigate('/shop');
    } catch (err: any) {
      // Handled in context
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-slate-900 flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-amber-200 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center pb-1">
            <img
              src="/kanchanika_attire_logo.svg"
              alt="Kanchanika Logo"
              className="w-14 h-14 object-contain drop-shadow"
            />
          </div>
          <span className="font-serif-luxury text-3xl font-extrabold tracking-wider text-slate-900 block">KANCHANIKA</span>
          <h2 className="font-serif-luxury text-base font-bold text-amber-900 uppercase tracking-widest">CREATE AN ACCOUNT</h2>
          <p className="text-xs text-slate-500 font-medium">Join Kanchanika to unlock luxury handloom previews, order tracking, and VIP perks.</p>
        </div>

        {(error || localError) && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold text-center">
            {localError || error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">FIRST NAME</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Ananya"
                className="w-full p-3 bg-amber-50/40 border border-amber-200 rounded-xl text-slate-900 focus:border-red-800 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">LAST NAME</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Sharma"
                className="w-full p-3 bg-amber-50/40 border border-amber-200 rounded-xl text-slate-900 focus:border-red-800 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">EMAIL ADDRESS</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ananya@example.com"
              className="w-full p-3 bg-amber-50/40 border border-amber-200 rounded-xl text-slate-900 focus:border-red-800 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">PHONE NUMBER</label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 9876543210"
              className="w-full p-3 bg-amber-50/40 border border-amber-200 rounded-xl text-slate-900 focus:border-red-800 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">PASSWORD (MIN 8 CHARS)</label>
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
            <label className="block text-slate-700 font-bold mb-1">CONFIRM PASSWORD</label>
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
            {loading ? 'CREATING ACCOUNT...' : 'REGISTER KANCHANIKA ACCOUNT'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-amber-200">
          Already have an account?{' '}
          <Link to="/login" className="text-red-800 font-extrabold hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};
