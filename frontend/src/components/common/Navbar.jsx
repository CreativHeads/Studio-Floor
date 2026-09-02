import React, { useState } from 'react';
import { 
  Radio, Calendar, User, Shield, LogOut, Sparkles, Menu, X 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Navbar({ onOpenBooking, onOpenAuth, onOpenMyBookings, currentView, setCurrentView, adminTab, setAdminTab }) {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogoutClick = () => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-[#111111]">Are you sure you want to sign out?</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              logout();
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    ), {
      duration: Infinity,
      style: {
        background: '#fff',
        color: '#111',
        border: '1px solid #e2e8f0',
        padding: '16px',
        maxWidth: '400px',
      }
    });
  };

  return (
    <header className="w-full bg-[#F3F3F5] pt-4 pb-2 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-4">
        
        {/* Top Navbar Row */}
        <div className="flex items-center justify-between bg-white px-5 sm:px-8 py-3.5 rounded-full border border-[#E5E5E7] shadow-neo-sm">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={() => setCurrentView('public')}>
            <div className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-full bg-[#111111] text-white flex items-center justify-center font-black text-xs sm:text-sm">
              <Radio className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </div>
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-[#111111] whitespace-nowrap">
              Studio Floor<span className="text-slate-400">.</span>
            </span>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-8 text-xs font-semibold text-[#666666]">
            {currentView === 'admin' ? (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setAdminTab('dashboard')} 
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${adminTab === 'dashboard' ? 'bg-[#111111] text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                >
                  Dashboard
                </button>
                <button 
                  onClick={() => setAdminTab('bookings')} 
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${adminTab === 'bookings' ? 'bg-[#111111] text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                >
                  Bookings
                </button>
                <button 
                  onClick={() => setAdminTab('studios')} 
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${adminTab === 'studios' ? 'bg-[#111111] text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                >
                  Studios
                </button>
                <button 
                  onClick={() => setAdminTab('security')} 
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${adminTab === 'security' ? 'bg-[#111111] text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                >
                  Users
                </button>
              </div>
            ) : (
              <>
                <a href="#equipment" onClick={() => setCurrentView('public')} className="hover:text-[#111111] transition-colors">Equipment</a>
                <a href="#testimonials" onClick={() => setCurrentView('public')} className="hover:text-[#111111] transition-colors">Reviews</a>
                <a href="#faq" onClick={() => setCurrentView('public')} className="hover:text-[#111111] transition-colors">FAQ</a>
                <a href="#contact" onClick={() => setCurrentView('public')} className="hover:text-[#111111] transition-colors">Contact</a>
              </>
            )}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">

            {user ? (
              <div className={`${currentView === 'admin' ? 'flex' : 'hidden lg:flex'} items-center gap-2`}>
                {currentView !== 'admin' && (
                  <button 
                    onClick={onOpenMyBookings}
                    className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#111111] bg-slate-100 hover:bg-slate-200 rounded-full border border-slate-200 transition-all"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    My Passes
                  </button>
                )}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-extrabold text-[#111111] hidden md:inline">{user.first_name || user.username}</span>
                  <div className="h-4 w-px bg-slate-300 hidden md:block"></div>
                  <button 
                    onClick={handleLogoutClick}
                    title="Sign Out"
                    className={`bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 rounded-full shadow-sm transition-all flex items-center justify-center ${currentView === 'admin' ? 'px-4 py-2 gap-1.5' : 'p-2.5'}`}
                  >
                    <LogOut className="w-4 h-4" />
                    {currentView === 'admin' && <span className="font-bold text-xs">Sign Out</span>}
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={onOpenAuth}
                className="hidden lg:block px-4 py-2 text-xs font-bold text-[#111111] hover:bg-slate-100 rounded-full border border-slate-200 transition-all"
              >
                Sign In
              </button>
            )}

            {currentView !== 'admin' && (
              <button 
                onClick={() => onOpenBooking(null)}
                className="px-3 py-2 sm:px-5 sm:py-2.5 bg-[#111111] hover:bg-[#222222] text-white font-bold text-xs rounded-full shadow-md transition-all flex items-center gap-1.5 whitespace-nowrap"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 hidden sm:block" />
                <span>Book Studio</span>
              </button>
            )}

          </div>

        </div>



      </div>
    </header>
  );
}
