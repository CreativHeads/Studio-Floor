import React, { useState, useEffect } from 'react';
import { Home, Phone, Calendar, User, Shield, Plus, LogIn, LogOut, CalendarPlus, Activity, Users, Layers, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function MobileBottomBar({ currentView, setCurrentView, onOpenBooking, onOpenAuth, onOpenMyBookings, adminTab, setAdminTab }) {
  const { user, isAdmin, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      if (currentView !== 'public') return;
      
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        const rect = contactSection.getBoundingClientRect();
        // If contact section is in the top half of the viewport, mark it active
        if (rect.top <= window.innerHeight * 0.75) {
          setActiveTab('contact');
          return;
        }
      }
      
      setActiveTab('home');
    };
    
    // Check initially
    handleScroll();
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentView]);

  if (currentView === 'admin') {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 lg:hidden w-[90%] max-w-md">
        <div className="bg-[#111111] text-white rounded-full p-2 shadow-2xl border border-white/20 flex items-center justify-around">
          
          <button 
            onClick={() => setAdminTab('dashboard')}
            className={`flex flex-col items-center gap-0.5 p-2 rounded-full transition-all ${
              adminTab === 'dashboard' ? 'text-amber-300 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-5 h-5" />
            <span className="text-[9px]">Dashboard</span>
          </button>

          <button 
            onClick={() => setAdminTab('bookings')}
            className={`flex flex-col items-center gap-0.5 p-2 rounded-full transition-all ${
              adminTab === 'bookings' ? 'text-amber-300 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-[9px]">Bookings</span>
          </button>

          <button 
            onClick={() => setAdminTab('studios')}
            className={`flex flex-col items-center gap-0.5 p-2 rounded-full transition-all ${
              adminTab === 'studios' ? 'text-amber-300 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-5 h-5" />
            <span className="text-[9px]">Studios</span>
          </button>

          <button 
            onClick={() => setAdminTab('security')}
            className={`flex flex-col items-center gap-0.5 p-2 rounded-full transition-all ${
              adminTab === 'security' ? 'text-amber-300 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[9px]">Users</span>
          </button>
          <button 
            onClick={() => setAdminTab('blogs')}
            className={`flex flex-col items-center gap-0.5 p-2 rounded-full transition-all ${
              adminTab === 'blogs' ? 'text-amber-300 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span className="text-[9px]">Blogs</span>
          </button>


        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 lg:hidden w-[90%] max-w-md">
      <div className="bg-[#111111] text-white rounded-full p-2 shadow-2xl border border-white/20 flex items-center justify-around">
        
        {/* Home */}
        <button 
          onClick={() => {
            setCurrentView('public');
            setActiveTab('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-0.5 p-2 rounded-full transition-all ${
            currentView === 'public' && activeTab === 'home' ? 'text-amber-300 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[9px]">Home</span>
        </button>

        {/* Contact (Replaced Suites) */}
        <a 
          href="#contact"
          onClick={() => {
            if (currentView !== 'public') setCurrentView('public');
            setActiveTab('contact');
          }}
          className={`flex flex-col items-center gap-0.5 p-2 rounded-full transition-all ${
            currentView === 'public' && activeTab === 'contact' ? 'text-amber-300 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Phone className="w-5 h-5" />
          <span className="text-[9px]">Contact</span>
        </a>

        {/* Book Now Main Center CTA */}
        <button 
          onClick={() => onOpenBooking(null)}
          className="p-3 bg-white text-[#111111] rounded-full shadow-md transform -translate-y-2 hover:scale-105 transition-all"
        >
          <CalendarPlus className="w-6 h-6 text-[#111111]" />
        </button>

        {/* My Passes */}
        <button 
          onClick={user ? onOpenMyBookings : onOpenAuth}
          className={`flex flex-col items-center gap-0.5 p-2 rounded-full transition-all ${
            currentView === 'my-passes' ? 'text-amber-300 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[9px]">Passes</span>
        </button>

        {/* Admin Portal Toggle OR Logout/Login */}
        {user && isAdmin ? (
          <button 
            onClick={() => setCurrentView(currentView === 'admin' ? 'public' : 'admin')}
            className={`flex flex-col items-center gap-0.5 p-2 rounded-full transition-all ${
              currentView === 'admin' ? 'text-amber-300 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-5 h-5" />
            <span className="text-[9px]">Admin</span>
          </button>
        ) : (
          <button 
            onClick={() => {
              if (user) {
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
                ), { duration: Infinity, style: { background: '#fff', color: '#111', border: '1px solid #e2e8f0', padding: '16px' } });
              } else {
                onOpenAuth();
              }
            }}
            className="flex flex-col items-center gap-0.5 p-2 text-slate-400 hover:text-red-400 rounded-full transition-all"
          >
            {user ? <LogOut className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
            <span className="text-[9px]">{user ? 'Logout' : 'Sign In'}</span>
          </button>
        )}

      </div>
    </div>
  );
}
