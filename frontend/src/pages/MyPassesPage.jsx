import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertCircle, RefreshCw, ChevronLeft, Share2, Download } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function MyPassesPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    if (user) {
      setLoading(true);
      api.getBookings(user.email)
        .then(data => {
          setBookings(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setBookings([]);
          setLoading(false);
          if (err.message && (err.message.toLowerCase().includes('authentication') || err.message.toLowerCase().includes('token'))) {
            toast.error('Your session has expired. Please log out and log in again to view your reservations.');
          }
        });
    }
  }, [user]);

  const handleCancelBooking = async (id) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-[#111111]">Are you sure you want to cancel this reservation?</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
          >
            No, Keep It
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await api.updateBookingStatus(id, 'CANCELLED');
                setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'CANCELLED' } : b));
                if (selectedBooking && selectedBooking.id === id) {
                  setSelectedBooking(prev => ({ ...prev, status: 'CANCELLED' }));
                }
                toast.success('Reservation cancelled successfully.');
              } catch (e) {
                console.error('Failed to cancel booking:', e);
                toast.error('Failed to cancel the reservation. Please try again.');
              }
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors"
          >
            Yes, Cancel It
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
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12 sm:pt-8 sm:pb-16 min-h-screen">
      <div className="relative bg-white text-[#111111] rounded-[2rem] p-6 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#E5E5E7] mt-4">

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-[#F3F3F5] border border-[#E5E5E7] flex items-center justify-center text-[#111111] shadow-sm">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#111111] tracking-tight mb-0.5">My Studio Passes</h1>
            <p className="text-xs sm:text-sm font-semibold text-slate-500">View and manage your upcoming sessions.</p>
          </div>
        </div>

        <div className="relative z-10">
          {loading ? (
            <div className="py-20 text-center text-slate-500 text-xs font-bold flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-[#111111]" /> Loading your passes...
            </div>
          ) : bookings.length === 0 ? (
            <div className="py-20 text-center text-slate-500 border-2 border-dashed border-[#E5E5E7] bg-[#F3F3F5]/50 rounded-2xl">
              <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <p className="text-base font-extrabold text-[#111111]">No active bookings found</p>
              <p className="text-xs font-medium text-slate-500 mt-1">Book your first studio session to get a digital pass.</p>
            </div>
          ) : selectedBooking ? (
            <div className="animate-in fade-in zoom-in-95 duration-300">
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-xs font-bold text-slate-500 hover:text-[#111111] mb-6 flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-full bg-[#F3F3F5] hover:bg-[#E5E5E7] w-fit"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Back to all reservations
              </button>

              <div className="relative p-5 sm:p-8 bg-[#F3F3F5] border border-[#E5E5E7] rounded-3xl max-w-xl mx-auto shadow-sm print-only-card">
                {/* Ticket cutouts */}
                <div className="absolute top-1/2 -left-3 -mt-3 w-6 h-6 bg-white border-r border-[#E5E5E7] rounded-full z-10 print-hide"></div>
                <div className="absolute top-1/2 -right-3 -mt-3 w-6 h-6 bg-white border-l border-[#E5E5E7] rounded-full z-10 print-hide"></div>

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-dashed border-[#d1d1d6] gap-2">
                  <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-md w-fit ${selectedBooking.status === 'CONFIRMED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : selectedBooking.status === 'CANCELLED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                    {selectedBooking.status}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] font-bold text-slate-400 tracking-wider">REF: <span className="text-[#111111]">{selectedBooking.booking_reference}</span></span>
                    <div className="flex items-center gap-1 border-l border-[#d1d1d6] pl-3 ml-1 print-hide">
                      <button onClick={() => window.print()} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md text-slate-500 hover:text-[#111111] transition-all" title="Download Pass">
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="pt-6 pb-8">
                  <h4 className="font-black text-xl sm:text-2xl text-[#111111] tracking-tight mb-5">{selectedBooking.studio_details?.name || 'Studio Room'}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <p className="text-[9px] uppercase font-bold text-slate-500 tracking-widest">Date</p>
                      <p className="text-xs font-bold text-[#111111] flex items-center gap-1.5 bg-white px-3 py-2.5 rounded-lg shadow-sm border border-[#E5E5E7]">
                        <Calendar className="w-3.5 h-3.5 text-amber-500" /> {selectedBooking.booking_date}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[9px] uppercase font-bold text-slate-500 tracking-widest">Time</p>
                      <p className="text-xs font-bold text-[#111111] flex items-center gap-1.5 bg-white px-3 py-2.5 rounded-lg shadow-sm border border-[#E5E5E7]">
                        <Clock className="w-3.5 h-3.5 text-amber-500" /> {selectedBooking.start_time} — {selectedBooking.end_time}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[9px] uppercase font-bold text-slate-500 tracking-widest">Team Size</p>
                      <p className="text-xs font-bold text-[#111111] bg-white px-3 py-2.5 rounded-lg shadow-sm border border-[#E5E5E7]">
                        {selectedBooking.guests_count || '1-4'} People
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[9px] uppercase font-bold text-slate-500 tracking-widest">Payment</p>
                      <p className="text-xs font-bold text-[#111111] bg-white px-3 py-2.5 rounded-lg shadow-sm border border-[#E5E5E7] flex items-center gap-1.5">
                        {selectedBooking.reservation_fee_paid ? (
                          <><div className="w-2 h-2 rounded-full bg-emerald-500"></div> ₹100 Paid</>
                        ) : (
                          <><div className="w-2 h-2 rounded-full bg-amber-500"></div> Pending</>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-6 border-t border-dashed border-[#d1d1d6]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                    <div className="flex space-x-[2px] opacity-40 justify-center">
                      {/* Stylized Barcode */}
                      {[1, 3, 1, 4, 2, 1, 5, 1, 2, 4, 1, 2, 3, 1].map((w, i) => (
                        <div key={i} className={`h-8 bg-[#111111] rounded-full min-w-[${w * 1.5}px]`} style={{ width: `${w * 2}px` }}></div>
                      ))}
                    </div>

                    {selectedBooking.status !== 'CANCELLED' && (
                      <button
                        onClick={() => handleCancelBooking(selectedBooking.id)}
                        className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-5 py-2.5 rounded-xl transition-all w-full sm:w-auto print-hide"
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {bookings.map(b => (
                <div
                  key={b.id || b.booking_reference}
                  onClick={() => setSelectedBooking(b)}
                  className="relative p-5 sm:p-6 bg-white border border-[#E5E5E7] hover:border-[#111111] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 rounded-3xl overflow-hidden group cursor-pointer"
                >
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-[#111111] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg ${b.status === 'CONFIRMED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : b.status === 'CANCELLED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                        {b.status}
                      </span>
                      <span className="font-mono text-[10px] font-bold text-slate-400 group-hover:text-slate-600 transition-colors">REF: {b.booking_reference}</span>
                    </div>

                    <h4 className="font-black text-lg sm:text-xl text-[#111111] tracking-tight group-hover:text-emerald-700 transition-colors">{b.studio_details?.name || 'Studio Room'}</h4>

                    <div className="flex flex-col sm:flex-row gap-2 mt-2">
                      <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 bg-[#F3F3F5] px-3 py-2 rounded-lg border border-[#E5E5E7]">
                        <Calendar className="w-3.5 h-3.5 text-amber-500" />
                        {b.booking_date}
                      </div>
                      <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 bg-[#F3F3F5] px-3 py-2 rounded-lg border border-[#E5E5E7]">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        {b.start_time} — {b.end_time}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
