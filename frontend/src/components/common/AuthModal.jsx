import React, { useState } from 'react';
import { X, User, ArrowRight, CheckCircle2, RefreshCw, ShieldAlert, UserPlus, LogIn, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function AuthModal({ isOpen, onClose }) {
  const { login, register, loading } = useAuth();

  const [activeTab, setActiveTab] = useState('LOGIN');
  
  // Form States
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (activeTab === 'REGISTER') {
      if (!fullName.trim()) {
        toast.error('Please enter your Full Name.');
        return;
      }
      if (!username.trim()) {
        toast.error('Please enter a Username.');
        return;
      }
      if (!email.includes('@')) {
        toast.error('Please enter a valid Email Address.');
        return;
      }
      if (password.length < 8) {
        toast.error('Password must be at least 8 characters long.');
        return;
      }
      if (password !== passwordConfirm) {
        setError('Passwords do not match.');
        return;
      }

      setSubmitting(true);
      const nameParts = fullName.trim().split(' ');
      const firstName = nameParts[0] || 'Creator';
      const lastName = nameParts.slice(1).join(' ') || '';

      const userData = {
        first_name: firstName,
        last_name: lastName,
        username: username,
        email: email,
        password: password,
        password_confirm: passwordConfirm,
        role: 'CUSTOMER',
      };

      const res = await register(userData);
      setSubmitting(false);

      if (res.success) {
        toast.success('Registration successful! Logging in...');
        setTimeout(() => onClose(), 1500);
      } else {
        toast.error(res.error || 'Registration failed.');
      }
    } else {
      // LOGIN
      if (!email.includes('@')) {
        toast.error('Please enter a valid Email Address.');
        return;
      }
      if (!password) {
        toast.error('Please enter your password.');
        return;
      }

      setSubmitting(true);
      const res = await login(email, password);
      setSubmitting(false);

      if (res.success) {
        toast.success('Login successful!');
        setTimeout(() => onClose(), 1500);
      } else {
        toast.error(res.error || 'Invalid credentials.');
      }
    }
  };

  const resetForm = () => {
    setFullName('');
    setUsername('');
    setEmail('');
    setPassword('');
    setPasswordConfirm('');
  };

  const toggleTab = (tab) => {
    setActiveTab(tab);
    resetForm();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="relative w-full max-w-[360px] bg-white border border-[#E5E5E7] rounded-3xl p-5 shadow-2xl flex flex-col">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-4 pt-2">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#111111] text-white flex items-center justify-center font-bold shadow-md">
            {activeTab === 'REGISTER' ? <UserPlus className="w-5 h-5 text-emerald-400" /> : <LogIn className="w-5 h-5 text-indigo-400" />}
          </div>
          <h3 className="text-xl font-extrabold text-[#111111]">
            {activeTab === 'REGISTER' ? 'Register Studio Account' : 'Sign In to Studio Floor'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {activeTab === 'REGISTER'
              ? 'Create a new account with your email.'
              : 'Sign in securely to your account.'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-full mb-5">
          <button
            type="button"
            onClick={() => toggleTab('REGISTER')}
            className={`py-1.5 px-3 rounded-full text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'REGISTER'
                ? 'bg-[#111111] text-white shadow-sm'
                : 'text-slate-600 hover:text-[#111111]'
              }`}
          >
            <UserPlus className="w-3.5 h-3.5" /> Register
          </button>
          <button
            type="button"
            onClick={() => toggleTab('LOGIN')}
            className={`py-1.5 px-3 rounded-full text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'LOGIN'
                ? 'bg-[#111111] text-white shadow-sm'
                : 'text-slate-600 hover:text-[#111111]'
              }`}
          >
            <LogIn className="w-3.5 h-3.5" /> Sign In
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">

          {activeTab === 'REGISTER' && (
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-[#111111] mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Sarah Jenkins"
                    className="w-full pl-8 pr-2 py-2 bg-slate-50 border border-[#E5E5E7] rounded-xl text-xs font-bold text-[#111111] focus:outline-none focus:border-[#111111]"
                  />
                </div>
              </div>

              <div className="flex-1">
                <label className="block text-[10px] font-bold text-[#111111] mb-1">Username</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="sarah_j"
                    className="w-full pl-8 pr-2 py-2 bg-slate-50 border border-[#E5E5E7] rounded-xl text-xs font-bold text-[#111111] focus:outline-none focus:border-[#111111]"
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-[#111111] mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sarah@studiofloor.com"
                className="w-full pl-8 pr-2 py-2 bg-slate-50 border border-[#E5E5E7] rounded-xl text-xs font-bold text-[#111111] focus:outline-none focus:border-[#111111]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#111111] mb-1">Password</label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-8 pr-2 py-2 bg-slate-50 border border-[#E5E5E7] rounded-xl text-xs font-bold text-[#111111] focus:outline-none focus:border-[#111111]"
              />
            </div>
          </div>

          {activeTab === 'REGISTER' && (
            <div>
              <label className="block text-[10px] font-bold text-[#111111] mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-8 pr-2 py-2 bg-slate-50 border border-[#E5E5E7] rounded-xl text-xs font-bold text-[#111111] focus:outline-none focus:border-[#111111]"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || loading}
            className="w-full py-2.5 mt-2 bg-[#111111] hover:bg-black text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {submitting || loading ? (
              <><RefreshCw className="w-4 h-4 animate-spin text-amber-300" /> Processing...</>
            ) : (
              <>{activeTab === 'REGISTER' ? 'Register Account' : 'Sign In'} <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
