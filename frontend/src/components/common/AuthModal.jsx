import React, { useState, useEffect } from 'react';
import { X, User, ArrowRight, RefreshCw, Smartphone, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { setupRecaptcha, sendPhoneOtp, verifyPhoneOtp, clearRecaptcha } from '../../services/firebase';

export default function AuthModal({ isOpen, onClose }) {
  const { loginWithFirebaseToken, devLogin, loading } = useAuth();
  
  // Form States
  const [fullName, setFullName] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setupRecaptcha('recaptcha-container');
    }
    
    return () => {
      clearRecaptcha();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error('Please enter your Full Name.');
      return;
    }

    if (!confirmationResult) {
      if (!phoneNumber || phoneNumber.length < 5) return toast.error('Please enter a valid phone number');
      
      const formattedNumber = `${countryCode}${phoneNumber}`;

      setSubmitting(true);
      const recaptcha = setupRecaptcha('recaptcha-container');
      const res = await sendPhoneOtp(formattedNumber, recaptcha);
      setSubmitting(false);
      
      if (res.success) {
        setConfirmationResult(res.confirmationResult);
        toast.success('OTP sent successfully!');
      } else {
        toast.error(res.error);
      }
    } else {
      if (!otpCode) return toast.error('Please enter the OTP');
      setSubmitting(true);
      const res = await verifyPhoneOtp(confirmationResult, otpCode);
      
      if (res.success) {
        const idToken = await res.user.getIdToken();
        const loginRes = await loginWithFirebaseToken(idToken, fullName);
        setSubmitting(false);
        if (loginRes.success) {
          toast.success('Login successful!');
          setTimeout(() => onClose(), 1500);
        } else {
          toast.error(loginRes.error);
        }
      } else {
        setSubmitting(false);
        toast.error(res.error);
      }
    }
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

        <div className="text-center mb-6 pt-2">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#111111] text-white flex items-center justify-center font-bold shadow-md">
            <Smartphone className="w-5 h-5 text-blue-400" />
          </div>
          <h3 className="text-xl font-extrabold text-[#111111]">
            Welcome to Studio Floor
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Login or register securely with your phone number.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {!confirmationResult ? (
            <>
              <div>
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
              <div>
                <label className="block text-[10px] font-bold text-[#111111] mb-1">Mobile Number</label>
                <div className="relative flex">
                  <div className="flex items-center justify-center pl-3 pr-1 border border-[#E5E5E7] border-r-0 bg-slate-100 rounded-l-xl">
                    <Smartphone className="w-3.5 h-3.5 text-slate-400 mr-1" />
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer outline-none"
                    >
                      <option value="+91">IN (+91)</option>
                      <option value="+1">US (+1)</option>
                      <option value="+44">UK (+44)</option>
                      <option value="+61">AU (+61)</option>
                      <option value="+971">AE (+971)</option>
                    </select>
                  </div>
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="98765 43210"
                    maxLength={15}
                    className="w-full pl-3 pr-2 py-2 bg-slate-50 border border-[#E5E5E7] rounded-r-xl text-xs font-bold text-[#111111] focus:outline-none focus:border-[#111111]"
                  />
                </div>
              </div>
              <div id="recaptcha-container" className="my-2 flex justify-center"></div>
            </>
          ) : (
            <div>
              <label className="block text-[10px] font-bold text-[#111111] mb-1">6-Digit OTP Code</label>
              <div className="relative">
                <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="123456"
                  className="w-full pl-8 pr-2 py-2 bg-slate-50 border border-[#E5E5E7] rounded-xl text-xs font-bold text-[#111111] focus:outline-none focus:border-[#111111] tracking-widest text-center"
                  maxLength={6}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || loading}
            className="w-full py-2.5 mt-4 bg-[#111111] hover:bg-black text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {submitting || loading ? (
              <><RefreshCw className="w-4 h-4 animate-spin text-amber-300" /> Processing...</>
            ) : (
              <>{!confirmationResult ? 'Send OTP' : 'Verify & Login'} <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
          
          {confirmationResult && (
            <button
              type="button"
              onClick={() => {
                setConfirmationResult(null);
                setOtpCode('');
              }}
              disabled={submitting || loading}
              className="w-full py-2.5 mt-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all disabled:opacity-50"
            >
              Change Number / Resend OTP
            </button>
          )}

          {(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && (
            <button
              type="button"
              onClick={async () => {
                if (!phoneNumber || phoneNumber.length < 5) return toast.error('Enter phone number first');
                const formattedNumber = `${countryCode}${phoneNumber}`;
                const res = await devLogin(formattedNumber, fullName);
                if (res.success) {
                  toast.success('Dev Login successful!');
                  setTimeout(() => onClose(), 500);
                } else {
                  toast.error(res.error);
                }
              }}
              disabled={submitting || loading}
              className="w-full py-2.5 mt-2 border-2 border-dashed border-red-500 bg-red-50 text-red-600 hover:bg-red-100 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all disabled:opacity-50"
            >
              🛠️ Localhost DEV LOGIN (No OTP)
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
