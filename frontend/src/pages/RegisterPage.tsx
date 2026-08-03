import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../components/ToastContainer';

export const RegisterPage: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
      showToast(`Welcome to EVAN, ${firstName}! A verification email has been dispatched.`, 'success');
      navigate('/shop');
    } catch (err: any) {
      // Handled in context
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
          <h2 className="font-serif-luxury text-base font-bold text-amber-900 uppercase tracking-widest">CREATE AN ACCOUNT</h2>
          <p className="text-xs text-slate-500 font-medium">Join EVAN to unlock luxury handloom previews, order tracking, and VIP perks.</p>
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
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-3 bg-amber-50/40 border border-amber-200 rounded-xl text-slate-900 focus:border-red-800 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">CONFIRM PASSWORD</label>
            <input
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-3 bg-amber-50/40 border border-amber-200 rounded-xl text-slate-900 focus:border-red-800 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-red-800 hover:bg-red-900 text-amber-300 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg border border-amber-300"
          >
            {loading ? 'CREATING ACCOUNT...' : 'REGISTER EVAN ACCOUNT'}
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
