import React, { useState, Suspense, lazy } from 'react';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import AuthModal from './components/common/AuthModal';
import BookingModal from './components/common/BookingModal';
import MobileBottomBar from './components/common/MobileBottomBar';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

const PublicWebsite = lazy(() => import('./pages/PublicWebsite'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const MyPassesPage = lazy(() => import('./pages/MyPassesPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));

function MainApp() {
  const { user, isAdmin } = useAuth();
  const [currentView, setCurrentView] = useState('public'); // 'public' | 'admin' | 'blogs'
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

  const [initialOrderId, setInitialOrderId] = useState(null);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('order_id');
    const storedHoldId = localStorage.getItem('studio_hold_id');

    if (orderId && storedHoldId) {
      setInitialOrderId(orderId);
      setIsBookingOpen(true);
      
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

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
      <Suspense fallback={null}>
        {currentView === 'public' ? (
          <PublicWebsite onOpenBooking={handleOpenBooking} />
        ) : currentView === 'admin' ? (
          <AdminDashboard adminTab={adminTab} setAdminTab={setAdminTab} />
        ) : currentView === 'my-passes' ? (
          <MyPassesPage />
        ) : currentView === 'blogs' ? (
          <BlogPage />
        ) : null}
      </Suspense>

      {/* Footer */}
      <Footer currentView={currentView} setCurrentView={setCurrentView} />

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
        initialOrderId={initialOrderId}
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
