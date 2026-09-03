import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, CheckCircle2, ShieldCheck, Sparkles, ChevronRight, ChevronLeft, QrCode, CreditCard, Sun, Sunset, Moon } from 'lucide-react';
import { MOCK_ROOMS, api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function BookingModal({ isOpen, onClose, selectedStudio: initialStudio, onRequireAuth, initialData }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [step1SubStep, setStep1SubStep] = useState('CAPACITY'); // 'CAPACITY' | 'STUDIO'
  const [rooms, setRooms] = useState([]);

  const [selectedStudio, setSelectedStudio] = useState(initialStudio || null);
  const [guestCapacity, setGuestCapacity] = useState('1 Creator');
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectionStartBlock, setSelectionStartBlock] = useState(null);
  const [selectionEndBlock, setSelectionEndBlock] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [name, setName] = useState(user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username : '');
  const [email, setEmail] = useState(user ? user.email : '');
  const [phone, setPhone] = useState('+1 (555) 382-9910');
  const [notes, setNotes] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [holdId, setHoldId] = useState(null);
  const [holdExpiresAt, setHoldExpiresAt] = useState(null);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

  useEffect(() => {
    let interval;
    if (step === 3 && holdExpiresAt) {
      interval = setInterval(() => {
        const now = new Date().getTime();
        const expires = new Date(holdExpiresAt).getTime();
        const diff = Math.max(0, Math.floor((expires - now) / 1000));
        setTimeLeft(diff);

        if (diff <= 0) {
          clearInterval(interval);
          toast.error("Your reservation hold has expired. Please select a slot again.");
          setStep(2);
          setHoldId(null);
          setHoldExpiresAt(null);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, holdExpiresAt]);

  useEffect(() => {
    if (user) {
      setName(prev => prev || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username);
      setEmail(prev => prev || user.email);
    }
  }, [user]);

  useEffect(() => {
    if (isOpen) {
      api.getRooms().then(data => {
        setRooms(data);
        if (!initialStudio && data.length > 0) setSelectedStudio(data[0]);
      }).catch(console.error);
    }
  }, [isOpen, initialStudio]);

  useEffect(() => {
    if (selectedStudio && bookingDate) {
      api.getBookedSlots(selectedStudio.id, bookingDate)
        .then(data => setBookedSlots(data))
        .catch(console.error);
    } else {
      setBookedSlots([]);
    }
  }, [selectedStudio, bookingDate]);

  useEffect(() => {
    if (!isOpen) {
      // If modal is closed while a hold is active, release it
      if (holdId) {
        api.cancelHold(holdId).catch(console.error);
      }
      
      // Reset modal state when closed so it starts fresh next time
      setStep(1);
      setStep1SubStep('CAPACITY');
      setGuestCapacity('1 Creator');
      setBookingDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      setConfirmedBooking(null);
      setSubmitting(false);
      setHoldId(null);
      setHoldExpiresAt(null);
      setSelectionStartBlock(null);
      setSelectionEndBlock(null);
    } else if (initialData) {
      if (initialData.capacity) setGuestCapacity(initialData.capacity);
      if (initialData.date) setBookingDate(initialData.date);

      if (!initialStudio) {
        setStep(1);
        setStep1SubStep('STUDIO');
      } else {
        setStep(2);
      }
    }
  }, [isOpen, initialData, initialStudio]);

  if (!isOpen) return null;

  // Next 7 Days Date Strip Generator
  const getNext7Days = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.getDate();
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });
      days.push({ iso, dayName, dayNum, monthName, isToday: i === 0 });
    }
    return days;
  };

  const next7Days = getNext7Days();



  let requiredCapacity = 1;
  if (guestCapacity.includes('2 People')) requiredCapacity = 2;
  if (guestCapacity.includes('3 People')) requiredCapacity = 3;
  if (guestCapacity.includes('4 People')) requiredCapacity = 4;

  const filteredRooms = rooms.filter(room => room.max_capacity === requiredCapacity);
  const isSelectedStudioValid = selectedStudio && filteredRooms.some(r => r.id === selectedStudio.id);

  const formatAMPM = (h) => {
      const ampm = h >= 12 ? 'PM' : 'AM';
      const hr12 = h % 12 || 12;
      return `${hr12.toString().padStart(2, '0')}:00 ${ampm}`;
  };

  let selectedSlot = null;
  if (selectionStartBlock !== null && selectionEndBlock !== null) {
    const endBlockPlusOne = selectionEndBlock + 1;
    selectedSlot = {
      start: `${selectionStartBlock.toString().padStart(2, '0')}:00`,
      end: `${endBlockPlusOne.toString().padStart(2, '0')}:00`,
      hours: endBlockPlusOne - selectionStartBlock,
      label: `${formatAMPM(selectionStartBlock)} - ${formatAMPM(endBlockPlusOne)}`
    };
  }

  const roomPrice = parseFloat(selectedStudio?.hourly_rate || 100) * (selectedSlot ? selectedSlot.hours : 0);
  const totalAmount = roomPrice;

  const handleHoldSlot = async () => {
    setSubmitting(true);
    try {
      const payload = {
        studio: selectedStudio.id,
        booking_date: bookingDate,
        start_time: `${selectedSlot.start}:00`,
        end_time: `${selectedSlot.end}:00`,
        duration_hours: selectedSlot.hours
      };
      const res = await api.holdSlot(payload);
      setHoldId(res.id);
      setHoldExpiresAt(res.expires_at);
      setStep(3);
    } catch (err) {
      toast.error(err.message || 'Slot is no longer available. Please select another time.');
      // Refresh booked slots just in case
      api.getBookedSlots(selectedStudio.id, bookingDate)
        .then(data => setBookedSlots(data))
        .catch(console.error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinalBooking = async (e) => {
    e.preventDefault();
    if (!user) {
      if (onRequireAuth) onRequireAuth();
      return;
    }

    if (phone === '+1 (555) 382-9910') {
      toast.error('Please replace the demo phone number with your actual number.');
      return;
    }

    if (!phone || phone.replace(/[^0-9]/g, '').length < 10) {
      toast.error('Please enter a valid 10-digit phone number.');
      return;
    }

    setSubmitting(true);

    const customerData = {
      customer_name: name || 'Guest Creator',
      customer_email: email || 'guest@studiofloor.com',
      customer_phone: phone,
      notes: notes
    };

    try {
      // Create payment order
      const res = await api.createPaymentOrder(holdId, customerData);

      if (res.payment_session_id) {
        // Initialize Cashfree
        const cashfree = window.Cashfree({
          mode: "sandbox" // Change to "production" when live
        });

        let checkoutOptions = {
          paymentSessionId: res.payment_session_id,
          redirectTarget: "_modal",
        };

        cashfree.checkout(checkoutOptions).then((result) => {
          if (result.error) {
            toast.error(result.error.message);
            setSubmitting(false);
          }
          if (result.redirect) {
            console.log("Payment will be redirected");
          }
          if (result.paymentDetails) {
            // Payment completed (either success or failure, need to verify)
            api.verifyPayment(holdId, res.order_id).then((verifyRes) => {
              setConfirmedBooking(verifyRes);
              setStep(4);
              setSubmitting(false);
            }).catch(err => {
              toast.error("Payment verification failed. Please contact support.");
              setSubmitting(false);
            });
          }
        });
      } else {
        toast.error('Failed to initiate payment.');
        setSubmitting(false);
      }
    } catch (err) {
      console.error('Payment initiation failed:', err);
      toast.error('Failed to initialize payment gateway: ' + (err.message || 'Check your Cashfree API Keys.'));
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-[420px] bg-white border border-[#E5E5E7] rounded-[2rem] p-5 shadow-2xl my-4">

        {/* Close Button */}
        <button
          onClick={() => {
            if (holdId && step === 3) api.cancelHold(holdId).catch(console.error);
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-[#111111] bg-slate-100 rounded-full transition-all z-20"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Wizard Progress Header (3 Streamlined Steps) */}
        {step < 4 && (
          <div className="mb-5 pr-10">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1.5">
              <span className="text-[#111111] shrink-0">Step {step} of 3</span>
              <span className="truncate text-right pl-2 font-extrabold text-[#111111]">
                {step === 1 && (step1SubStep === 'CAPACITY' ? 'Session Capacity' : 'Choose Studio Suite')}
                {step === 2 && 'Schedule Time Slot'}
                {step === 3 && 'Checkout & Confirm'}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#111111] transition-all duration-300 rounded-full"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* STEP 1 - PHASE A: Session Capacity Only */}
        {step === 1 && step1SubStep === 'CAPACITY' && (
          <div className="animate-in fade-in duration-300">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-[#111111] tracking-tight mb-1">Session Capacity</h3>
              <p className="text-xs text-slate-500 font-medium">Select how many guests will attend your session.</p>
            </div>

            {/* Session Capacity List */}
            <div className="flex flex-col gap-2 mb-8">
              {[
                { value: '1 Creator', label: '1 Creator', detail: 'Solo Recording' },
                { value: '2 People (Host + Guest)', label: '2 People', detail: 'Host & Guest' },
                { value: '3 People (Small Group)', label: '3 People', detail: 'Small Group' },
                { value: '4 People (Panel Session)', label: '4 People', detail: 'Panel Session' }
              ].map((cap, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setGuestCapacity(cap.value)}
                  className={`px-4 py-3.5 rounded-xl border transition-all flex items-center justify-between group ${guestCapacity === cap.value
                      ? 'border-[#111111] bg-slate-50 ring-1 ring-[#111111]'
                      : 'border-[#E5E5E7] bg-white hover:border-slate-300'
                    }`}
                >
                  <div className="flex flex-col text-left">
                    <span className={`text-sm font-bold ${guestCapacity === cap.value ? 'text-[#111111]' : 'text-slate-700 group-hover:text-[#111111]'}`}>{cap.label}</span>
                    <span className="text-xs font-medium text-slate-500 mt-0.5">{cap.detail}</span>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${guestCapacity === cap.value
                      ? 'border-[#111111] bg-[#111111]'
                      : 'border-slate-300 bg-white group-hover:border-slate-400'
                    }`}>
                    {guestCapacity === cap.value && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                </button>
              ))}
            </div>

            {/* Continue to Studio Button */}
            <button
              onClick={() => setStep1SubStep('STUDIO')}
              disabled={!guestCapacity}
              className="w-full py-3 bg-[#111111] hover:bg-[#222222] text-white font-extrabold text-xs uppercase tracking-wider rounded-full flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-40"
            >
              <span>Continue to Choose Studio</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* STEP 1 - PHASE B: Choose Studio Space */}
        {step === 1 && step1SubStep === 'STUDIO' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => setStep1SubStep('CAPACITY')}
                className="hover:text-[#111111] text-[10px] text-slate-400 font-bold flex items-center gap-0.5 transition-all"
              >
                <ChevronLeft className="w-3 h-3" /> Back
              </button>
              <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-500 px-2.5 py-0.5 rounded-full font-bold">
                {guestCapacity}
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-widest">Choose Studio Space</h3>

            {/* Studio Cards Visual Image Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {filteredRooms.length === 0 ? (
                <div className="col-span-full py-8 text-center bg-slate-50 border border-slate-200 border-dashed rounded-2xl">
                  <p className="text-xs font-bold text-slate-500 mb-1">No studios available for this capacity.</p>
                  <p className="text-[10px] text-slate-400">Total rooms loaded: {rooms.length}.</p>
                  <p className="text-[10px] text-slate-400">Please go back and choose a smaller capacity, or contact support.</p>
                </div>
              ) : (
                filteredRooms.map((room) => {
                  const isSelected = selectedStudio?.id === room.id;
                  return (
                    <div
                      key={room.id}
                      onClick={() => setSelectedStudio(room)}
                      className={`relative aspect-square rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 group border-2 ${isSelected
                        ? 'border-[#111111] shadow-lg scale-[1.02]'
                        : 'border-transparent hover:border-slate-300 opacity-90 hover:opacity-100'
                        }`}
                    >
                      {/* Studio Image */}
                      <img
                        src={room.image}
                        alt={room.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Gradient Overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity ${isSelected ? 'opacity-100' : 'opacity-70 group-hover:opacity-90'}`} />

                      {/* Content */}
                      <div className="absolute inset-x-0 bottom-0 p-4 flex justify-between items-end">
                        <div className="flex-1 pr-2">
                          <h4 className="text-white font-extrabold text-sm leading-tight drop-shadow-md">{room.name}</h4>
                        </div>
                        {isSelected && (
                          <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-lg shrink-0">
                            <CheckCircle2 className="w-4 h-4 text-[#111111]" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex gap-2.5">
              <button
                onClick={() => setStep1SubStep('CAPACITY')}
                className="w-1/3 py-3 bg-slate-100 hover:bg-slate-200 text-[#111111] font-bold text-xs rounded-full transition-all flex items-center justify-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Capacity
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={!isSelectedStudioValid}
                className="w-2/3 py-3 bg-[#111111] hover:bg-[#222222] text-white font-bold text-xs uppercase tracking-wider rounded-full flex items-center justify-center gap-1.5 shadow-md transition-all disabled:opacity-40"
              >
                <span>Continue to Schedule</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: ULTRA-MODERN DATE STRIP & CATEGORIZED TIME SLOTS */}
        {step === 2 && (
          <div className="animate-in fade-in duration-300">
            <h3 className="text-lg font-extrabold text-[#111111] mb-0.5">Select Date & Time</h3>
            <p className="text-[11px] text-slate-500 mb-4">Select your reservation date and preferred session time block.</p>

            {/* 1. INTERACTIVE 7-DAY DATE STRIP */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-extrabold text-[#111111] uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  Reservation Date
                </label>
                <div className="relative flex items-center gap-1">
                  <input
                    type="date"
                    value={bookingDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                  />
                  <span className="text-[10px] font-bold text-indigo-600 hover:underline cursor-pointer flex items-center gap-1">
                    Custom Date <Calendar className="w-3 h-3" />
                  </span>
                </div>
              </div>

              {/* Day Pills Carousel Strip */}
              <div className="grid grid-cols-7 gap-1 p-1 bg-slate-100 rounded-xl">
                {next7Days.map((day) => {
                  const isSelected = bookingDate === day.iso;
                  return (
                    <button
                      key={day.iso}
                      type="button"
                      onClick={() => setBookingDate(day.iso)}
                      className={`py-1.5 px-0.5 rounded-lg text-center transition-all duration-200 flex flex-col items-center justify-center ${isSelected
                        ? 'bg-[#111111] text-white shadow-md scale-105'
                        : 'hover:bg-slate-200/70 text-slate-700'
                        }`}
                    >
                      <span className={`text-[8px] font-black uppercase tracking-wider ${isSelected ? 'text-amber-400' : 'text-slate-400'}`}>
                        {day.dayName}
                      </span>
                      <span className="text-xs font-extrabold my-0.5 leading-none">
                        {day.dayNum}
                      </span>
                      <span className={`text-[7px] font-bold uppercase ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                        {day.monthName}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. DYNAMIC HOUR GRID SELECTION */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-extrabold text-[#111111] uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  Select Time Range
                </label>
                <span className="text-[9px] text-slate-500 font-bold">
                  {selectionStartBlock !== null && selectionEndBlock === null ? "Select end time..." : "Click start, then end time"}
                </span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar pb-2">
                {Array.from({ length: 14 }, (_, i) => i + 8).map((hour) => {
                  const slotInfo = bookedSlots.find(b => b.hour === hour);
                  const isBooked = !!slotInfo;
                  const isHold = slotInfo?.status === 'HOLD';
                  const isStart = selectionStartBlock === hour;
                  const isEnd = selectionEndBlock === hour;
                  const isInRange = selectionStartBlock !== null && selectionEndBlock !== null && hour >= selectionStartBlock && hour <= selectionEndBlock;
                  
                  return (
                    <button
                      key={hour}
                      type="button"
                      disabled={isBooked}
                      onClick={() => {
                        if (isBooked) return;
                        if (selectionStartBlock === null || (selectionStartBlock !== null && selectionEndBlock !== null) || hour < selectionStartBlock) {
                          setSelectionStartBlock(hour);
                          setSelectionEndBlock(null);
                        } else {
                          // Check if any blocked hour is in between
                          for (let h = selectionStartBlock; h <= hour; h++) {
                            if (bookedSlots.some(b => b.hour === h)) {
                              toast.error("Cannot select across a booked time slot.");
                              setSelectionStartBlock(hour);
                              setSelectionEndBlock(null);
                              return;
                            }
                          }
                          setSelectionEndBlock(hour);
                        }
                      }}
                      className={`py-2 px-1 rounded-xl text-center transition-all flex flex-col items-center justify-center border-2 ${
                        isBooked
                          ? isHold ? 'bg-amber-50 border-amber-200 opacity-60 cursor-not-allowed' : 'bg-slate-100 border-slate-200 opacity-40 cursor-not-allowed'
                          : (isStart || isEnd)
                            ? 'bg-[#111111] border-[#111111] text-white shadow-md transform scale-105 z-10'
                            : isInRange
                              ? 'bg-slate-800 border-slate-800 text-white'
                              : 'bg-white border-[#E5E5E7] text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span className={`text-[10px] sm:text-xs font-extrabold ${isBooked ? (isHold ? 'text-amber-500' : 'text-slate-400') : (isInRange || isStart || isEnd) ? 'text-white' : 'text-[#111111]'}`}>
                        {formatAMPM(hour).replace(':00', '')}
                      </span>
                      {isHold && <span className="text-[7px] font-black text-amber-500 uppercase tracking-widest mt-0.5">Held</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* LIVE SELECTION RIBBON */}
            <div className="p-2.5 bg-slate-100 border border-[#E5E5E7] rounded-xl mb-4 flex items-center justify-between text-[11px] font-bold text-[#111111]">
              <span className="flex items-center gap-1.5 truncate">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="truncate">
                  {selectedSlot ? `${bookingDate} \u2022 ${selectedSlot.label} (${selectedSlot.hours} hrs)` : "No time selected"}
                </span>
              </span>
              <span className="text-emerald-600 text-[9px] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0 font-extrabold">
                Available
              </span>
            </div>

            <div className="flex gap-2.5">
              <button
                onClick={() => { setStep(1); setStep1SubStep('STUDIO'); }}
                className="w-1/3 py-3 bg-slate-100 hover:bg-slate-200 text-[#111111] font-bold text-xs rounded-full transition-all flex items-center justify-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Back
              </button>
              <button
                onClick={handleHoldSlot}
                disabled={submitting || !selectedSlot}
                className="w-2/3 py-3 bg-[#111111] hover:bg-[#222222] text-white font-bold text-xs uppercase tracking-wider rounded-full flex items-center justify-center gap-1.5 shadow-md transition-all disabled:opacity-40"
              >
                <span>{submitting ? 'Holding Slot...' : 'Proceed to Checkout'}</span>
                {!submitting && <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: CHECKOUT & CONFIRM (Phone Number, Message Notes & Clean Summary without price) */}
        {step === 3 && (
          <form onSubmit={handleFinalBooking} className="animate-in fade-in duration-300 space-y-3">
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <h3 className="text-lg font-extrabold text-[#111111]">Creator Details & Summary</h3>
                {holdExpiresAt && (
                  <div className="text-[10px] bg-amber-50 border border-amber-200 text-amber-700 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 shadow-sm animate-pulse">
                    <Clock className="w-3 h-3" />
                    {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
                  </div>
                )}
              </div>
              <p className="text-[11px] text-slate-500">Your slot is reserved for 10 minutes. Finalize your details below.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-[#111111] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Sarah Jenkins"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-[#E5E5E7] rounded-full text-xs font-bold text-[#111111] focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#111111] mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sarah@creator.com"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-[#E5E5E7] rounded-full text-xs font-bold text-[#111111] focus:outline-none focus:border-[#111111]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#111111] mb-1">Phone Number</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 382-9910"
                className="w-full px-3.5 py-2 bg-slate-50 border border-[#E5E5E7] rounded-full text-xs font-bold text-[#111111] focus:outline-none focus:border-[#111111]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#111111] mb-1">Session Message / Special Notes</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Mention any custom gear, mic preferences, or lighting instructions..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-[#E5E5E7] rounded-2xl text-xs font-bold text-[#111111] focus:outline-none focus:border-[#111111] resize-none"
              />
            </div>

            {/* Session Summary Card (No Price/Dollar Amounts Displayed) */}
            <div className="p-3.5 bg-slate-50 border border-[#E5E5E7] rounded-xl space-y-1.5 text-xs">
              <div className="flex justify-between items-center text-[#111111] font-bold">
                <span className="text-slate-500 font-medium">Studio Suite</span>
                <span className="font-extrabold text-[#111111]">{selectedStudio?.name} ({selectedSlot ? selectedSlot.hours : 0} hrs)</span>
              </div>
              <div className="text-[11px] text-slate-500 flex justify-between">
                <span>Reservation Date</span>
                <span className="font-bold text-[#111111]">{bookingDate} [{selectedSlot ? selectedSlot.label : ''}]</span>
              </div>
              <div className="text-[11px] text-slate-500 flex justify-between">
                <span>Session Capacity</span>
                <span className="font-bold text-[#111111]">{guestCapacity}</span>
              </div>
            </div>

            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  if (holdId) {
                    api.cancelHold(holdId).catch(console.error);
                    setHoldId(null);
                    setHoldExpiresAt(null);
                  }
                  setStep(2);
                }}
                className="w-1/3 py-3 bg-slate-100 hover:bg-slate-200 text-[#111111] font-bold text-xs rounded-full transition-all flex items-center justify-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Back
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="w-2/3 py-3 bg-[#111111] hover:bg-[#222222] text-white font-bold text-xs uppercase tracking-wider rounded-full flex items-center justify-center gap-1.5 shadow-md transition-all"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {submitting ? 'Processing...' : 'Pay ₹100 & Confirm'}
              </button>
            </div>
          </form>
        )}

        {/* STEP 4: Digital Session Pass */}
        {step === 4 && confirmedBooking && (
          <div className="text-center py-2 animate-in fade-in duration-300">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#111111] text-white flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-7 h-7 text-amber-300" />
            </div>
            <h3 className="text-xl font-extrabold text-[#111111] mb-0.5">Booking Confirmed!</h3>
            <p className="text-[11px] text-slate-500 mb-2">Your studio session pass has been reserved and registered.</p>
            <div className="inline-block px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full mb-4">
              We will contact you soon with further details!
            </div>

            {/* Pass Ticket Box */}
            <div className="p-5 bg-[#111111] text-white rounded-[1.8rem] text-left relative overflow-hidden mb-4 shadow-xl">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-[9px] uppercase font-bold text-amber-400 tracking-wider">STUDIO PASS #</span>
                  <div className="text-base font-mono font-extrabold text-white">{confirmedBooking.booking_reference}</div>
                </div>
                <div className="p-1.5 bg-white rounded-lg">
                  <QrCode className="w-6 h-6 text-[#111111]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                <div>
                  <span className="text-slate-400 text-[9px]">STUDIO SUITE</span>
                  <p className="font-semibold text-white text-[11px]">{selectedStudio?.name}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[9px]">CREATOR NAME</span>
                  <p className="font-semibold text-white text-[11px]">{confirmedBooking.customer_name}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[9px]">DATE & TIME</span>
                  <p className="font-semibold text-amber-300 text-[11px]">{confirmedBooking.booking_date} [{selectedSlot ? selectedSlot.start : ''} - {selectedSlot ? selectedSlot.end : ''}]</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[9px]">SESSION CAPACITY</span>
                  <p className="font-semibold text-emerald-400 text-[11px]">{guestCapacity}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 text-[9px] text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>Show digital pass upon arrival at 100 Media Blvd. Access Granted.</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setStep(1);
                  setStep1SubStep('CAPACITY');
                  setConfirmedBooking(null);
                }}
                className="w-full py-3 bg-[#111111] hover:bg-[#222222] text-amber-300 font-bold text-xs uppercase tracking-wider rounded-full transition-all border border-[#111111]"
              >
                Book Another Session
              </button>
              <button
                onClick={onClose}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-[#111111] font-bold text-xs uppercase tracking-wider rounded-full transition-all"
              >
                Done & Close
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
