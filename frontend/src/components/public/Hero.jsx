import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, Clock, ArrowUpRight, Search, MapPin, Users, Video } from 'lucide-react';
import { api, MOCK_ROOMS } from '../../services/api';

export default function Hero({ onOpenBooking }) {
  const [rooms, setRooms] = useState(MOCK_ROOMS);
  const [selectedStudio, setSelectedStudio] = useState(null);

  useEffect(() => {
    api.getRooms().then(data => {
      setRooms(data);
      if (data.length > 0) setSelectedStudio(data[0]);
    }).catch(console.error);
  }, []);

  const [guests, setGuests] = useState('2 People (Host + Guest)');

  const capacities = [
    { value: '1 Creator', label: '1 Creator', detail: 'Solo Recording' },
    { value: '2 People (Host + Guest)', label: '2 People', detail: 'Host + Guest' },
    { value: '4 People (Panel Session)', label: '4 People', detail: 'Panel Session' },
    { value: 'Full Production Team (8 Max)', label: '8 Max', detail: 'Full Team' }
  ];

  const handleHeroSubmit = (e) => {
    e.preventDefault();
    onOpenBooking(null, {
      capacity: guests
    });
  };

  return (
    <section className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">

        {/* Main Hero Card Container (Matching Reference Image 1) */}
        <div className="relative rounded-[2.5rem] sm:rounded-[3rem] overflow-hidden min-h-[520px] lg:min-h-[580px] flex flex-col lg:flex-row items-center justify-between p-5 sm:p-12 shadow-neo-md border border-[#E5E5E7] gap-8 lg:gap-0">

          {/* Background Studio Video */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <video
              autoPlay
              loop
              muted
              playsInline
              poster="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1800&q=80"
              className="w-full h-full object-cover scale-105"
            >
              <source src="/videos/hero-bg.mp4" type="video/mp4" />
              <source src="https://videos.pexels.com/video-files/2022395/2022395-hd_1920_1080_30fps.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            {/* Dark Soft Overlay for enhanced text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/40 lg:to-black/35" />
          </div>

          {/* Hero Left Content Text */}
          <div className="relative z-10 max-w-xl text-center lg:text-left text-white space-y-5 lg:space-y-6 w-full mt-4 lg:mt-0">

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-[10px] sm:text-xs font-bold text-white mx-auto lg:mx-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Studio Reservation Platform</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-[1.15]">
              Where You Record <br /> Studio Quality <br /> Sound & Unforgettable Broadcasts!
            </h1>

            <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal max-w-lg mx-auto lg:mx-0">
              Book sound-isolated 4K presentation suites & acoustic podcast lounges with on-site engineers, teleprompters, and instant ISO file exports.
            </p>

            <div className="pt-2 flex justify-center lg:justify-start">
              <button
                onClick={() => onOpenBooking(null)}
                className="px-8 py-3.5 bg-[#111111] hover:bg-black text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-xl flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 w-full sm:w-auto"
              >
                <Sparkles className="w-4 h-4 text-amber-300" /> Book Session Now
              </button>
            </div>
          </div>

          {/* Floating Studio Reservation Card (Matching Reference Image 1) */}
          <div className="relative z-10 w-full max-w-md bg-white rounded-[2rem] p-6 sm:p-8 shadow-2xl border border-[#E5E5E7] text-[#111111]">

            <div className="mb-6">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-3">
                <Video className="w-5 h-5 text-[#111111]" />
                <h3 className="font-extrabold text-base text-[#111111]">Quick Reservation</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tell us how many creators will be in your session, and we'll instantly match you with the perfect studio setup.
              </p>
            </div>

            <form onSubmit={handleHeroSubmit} className="space-y-5">

              {/* Date, Duration and Studio selection removed for simplicity */}

              {/* Guests Selection Cards */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Select Capacity</label>
                <div className="grid grid-cols-2 gap-3">
                  {capacities.map((cap, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setGuests(cap.value)}
                      className={`w-full p-3.5 rounded-xl border-2 text-left flex flex-col justify-between transition-all duration-200 ${guests === cap.value
                          ? 'border-[#111111] bg-slate-50 shadow-md scale-[1.02]'
                          : 'border-[#E5E5E7] hover:border-slate-300 bg-white opacity-80 hover:opacity-100'
                        }`}
                    >
                      <div className="flex justify-between items-start w-full mb-1">
                        <div className="font-extrabold text-sm text-[#111111]">{cap.label}</div>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${guests === cap.value ? 'border-[#111111]' : 'border-slate-300'}`}>
                          {guests === cap.value && <div className="w-2 h-2 rounded-full bg-[#111111]" />}
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">{cap.detail}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Black Search Pill Button */}
              <button
                type="submit"
                className="w-full py-3.5 bg-[#111111] hover:bg-[#222222] text-white font-extrabold text-xs uppercase tracking-wider rounded-full shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <Search className="w-4 h-4" /> Search & Reserve Studio
              </button>

            </form>
          </div>

        </div>

        {/* Asymmetric Promo Grid (Matching Reference Image 1 & 2) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* Promo Card 1: Limited Time Offer */}
          <div className="md:col-span-7 bg-white rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 border border-[#E5E5E7] shadow-neo-sm flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Big Promo</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111111] mt-2 mb-3">
                Limited Time Offer: Book Now & Save 20%!
              </h2>
              <p className="text-sm text-[#666666] leading-relaxed max-w-lg mb-6">
                Ready for the ultimate studio recording experience at an unbeatable rate? Reserve any half-day session pass this month and receive free sound engineering & 4K teleprompter setup.
              </p>
            </div>

            <div>
              <button
                onClick={() => onOpenBooking(null)}
                className="px-6 py-3 bg-[#111111] hover:bg-[#222222] text-white font-bold text-xs rounded-full shadow-sm"
              >
                Book Now
              </button>
            </div>
          </div>

          {/* Promo Card 2: Explore Together Photo Card */}
          <div className="md:col-span-5 bg-white rounded-[2.5rem] p-6 border border-[#E5E5E7] shadow-neo-sm flex flex-col sm:flex-row items-center gap-4">
            <img
              src="https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=600&q=80"
              alt="Podcast Lounge"
              className="w-full sm:w-44 h-44 object-cover rounded-[1.8rem]"
            />
            <div className="space-y-2">
              <h3 className="font-extrabold text-base text-[#111111]">Let's Record Together</h3>
              <p className="text-xs text-[#666666] leading-relaxed">
                Enjoy sound isolation and crisp multitrack audio output.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => onOpenBooking(null)}
                  className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-[#111111] flex items-center justify-center transition-all"
                >
                  <ArrowUpRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
