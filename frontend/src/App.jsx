import React, { useState } from 'react';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import AuthModal from './components/common/AuthModal';
import BookingModal from './components/common/BookingModal';
import MobileBottomBar from './components/common/MobileBottomBar';
import PublicWebsite from './pages/PublicWebsite';
import AdminDashboard from './pages/AdminDashboard';
import MyPassesPage from './pages/MyPassesPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

function MainApp() {
  const { user, isAdmin } = useAuth();
  const [currentView, setCurrentView] = useState('public'); // 'public' | 'admin'
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedStudioForBooking, setSelectedStudioForBooking] = useState(null);
  const [bookingInitialData, setBookingInitialData] = useState(null);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [adminTab, setAdminTab] = useState('dashboard');

  React.useEffect(() => {
    if (user && isAdmin) {
      setCurrentView('admin');
    } else {
      setCurrentView('public');
    }
  }, [user, isAdmin]);

  const handleOpenBooking = (studio = null, initialData = null) => {
    setSelectedStudioForBooking(studio);
    setBookingInitialData(initialData);
    setIsBookingOpen(true);
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#F3F3F5] text-[#111111] flex flex-col justify-between selection:bg-[#111111] selection:text-white">
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            background: '#111111',
            color: '#fff',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600'
          }
        }} 
      />
      
      {/* Navigation */}
      <Navbar 
        onOpenBooking={() => handleOpenBooking(null)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenMyBookings={() => setCurrentView('my-passes')}
        currentView={currentView}
        setCurrentView={setCurrentView}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        adminTab={adminTab}
        setAdminTab={setAdminTab}
      />

      {/* Main View Router */}
      {currentView === 'public' ? (
        <PublicWebsite onOpenBooking={handleOpenBooking} />
      ) : currentView === 'admin' ? (
        <AdminDashboard adminTab={adminTab} setAdminTab={setAdminTab} />
      ) : currentView === 'my-passes' ? (
        <MyPassesPage />
      ) : null}

      {/* Footer */}
      <Footer currentView={currentView} />

      {/* Mobile Floating Bottom Bar (Matching Reference Image 2) */}
      <MobileBottomBar 
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenBooking={handleOpenBooking}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenMyBookings={() => setCurrentView('my-passes')}
        adminTab={adminTab}
        setAdminTab={setAdminTab}
      />

      {/* Modals */}
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
      />

      <BookingModal 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
        selectedStudio={selectedStudioForBooking}
        initialData={bookingInitialData}
        onRequireAuth={() => setIsAuthOpen(true)}
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
