import React, { useRef, useEffect, useState } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Testimonials() {
  const scrollRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const reviews = [
    {
      name: 'Elena Rostova',
      role: 'Head of Media',
      text: 'Studio Floor transformed our quarterly investor webcasts. The Sony FX6 cameras made our broadcast look like a national network show.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
    },
    {
      name: 'Marcus Vance',
      role: 'Podcast Host',
      text: 'The acoustic sound isolation in Studio B is phenomenal. We walked out with multi-track audio and ISO video files on a high-speed drive.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
    },
    {
      name: 'Sophia Thorne',
      role: 'Creative Director',
      text: 'Booking a studio used to require endless phone calls. Studio Floor allows us to reserve time slots and add sound engineers in under 60 seconds.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80'
    },
    {
      name: 'David Chen',
      role: 'Indie Filmmaker',
      text: 'The lighting grid in the main stage is incredible. Having DMX control right from the iPad saved us hours of setup time on our last film.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'
    },
    {
      name: 'Sarah Jenkins',
      role: 'YouTube Creator',
      text: 'Finally, a studio that understands modern creators! The instant SSD transfers and pre-lit sets mean I can shoot 3 videos in one day.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80'
    },
    {
      name: 'James Wilson',
      role: 'Audio Engineer',
      text: 'The vocal booth acoustics are dead quiet. I have recorded everything from voiceovers to full bands here and the quality is consistently perfect.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80'
    }
  ];

  // Duplicate reviews to create an infinite scrolling effect
  const infiniteReviews = [...reviews, ...reviews, ...reviews, ...reviews];

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    // Start near the middle so we can scroll both left and right infinitely
    container.scrollLeft = container.scrollWidth / 3;

    let interval;
    if (!isHovered) {
      interval = setInterval(() => {
        if (container) {
          container.scrollBy({ left: 350, behavior: 'smooth' });
        }
      }, 3000);
    }

    return () => clearInterval(interval);
  }, [isHovered]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container) return;

    // Reset scroll position to create endless "360 degree" illusion
    if (container.scrollLeft <= 0) {
      container.scrollLeft = container.scrollWidth / 3;
    } else if (container.scrollLeft >= (container.scrollWidth * 2) / 3) {
      container.scrollLeft = container.scrollWidth / 3;
    }
  };

  return (
    <section id="testimonials" className="py-20 relative bg-slate-50 border-t border-slate-200 overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 flex flex-col items-center">
        <div className="text-center">
          <h2 className="text-xs font-extrabold text-emerald-600 uppercase tracking-widest block mb-2">Creator Proof</h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-[#111111] tracking-tight">Trusted by Broadcasters</p>
        </div>
      </div>

      <div 
        className="relative max-w-7xl mx-auto"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Scroll Buttons - Left */}
        <button 
          onClick={() => scroll('left')}
          className="absolute left-4 top-[40%] -translate-y-1/2 w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-lg z-10 hidden sm:flex"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory px-4 sm:px-6 lg:px-8 pb-8 no-scrollbar scroll-smooth"
        >
          {infiniteReviews.map((r, idx) => (
            <div key={idx} className="snap-center w-[85vw] sm:w-[300px] shrink-0 bg-white p-6 rounded-[1.5rem] border border-emerald-100 shadow-sm flex flex-col justify-between transition-transform hover:scale-[1.02]">
              <div>
                <div className="flex gap-0.5 text-amber-500 mb-4">
                  {[...Array(r.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed italic mb-6 font-medium line-clamp-4">
                  "{r.text}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <img src={r.avatar} alt={r.name} className="w-10 h-10 rounded-full object-cover border-2 border-emerald-50" />
                <div>
                  <div className="text-sm font-extrabold text-slate-900 leading-none mb-1">{r.name}</div>
                  <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">{r.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Scroll Buttons - Right */}
        <button 
          onClick={() => scroll('right')}
          className="absolute right-4 top-[40%] -translate-y-1/2 w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-lg z-10 hidden sm:flex"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

    </section>
  );
}
