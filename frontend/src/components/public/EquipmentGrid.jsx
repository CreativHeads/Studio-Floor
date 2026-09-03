import React from 'react';

export default function EquipmentGrid() {
  const gear = [
    { 
      category: 'Cameras', 
      name: 'Sony FX6 Cinema Line', 
      desc: 'Full-frame 4K 10-bit 4:2:2 recording at up to 120fps with real-time eye AF tracking.',
      image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80'
    },
    { 
      category: 'Audio', 
      name: 'Shure SM7B & EV RE20', 
      desc: 'Industry standard vocal dynamic microphones equipped with Cloudlifter inline preamps.',
      image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=600&q=80'
    },
    { 
      category: 'Lighting', 
      name: 'Aputure 600d & DMX Wall', 
      desc: 'Daylight LED monolights with softboxes and app-controlled DMX RGB color accent lighting.',
      image: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=600&q=80'
    },
    { 
      category: 'Consoles', 
      name: 'Rodecaster Pro II', 
      desc: 'Integrated audio mixing console with customizable Smart Pads, Bluetooth, & multitrack.',
      image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=600&q=80'
    },
    { 
      category: 'Prompters', 
      name: '17" Presidential Teleprompter', 
      desc: 'Ultra-clear glass teleprompter with operator iPad app and live speed control.',
      image: 'https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?auto=format&fit=crop&w=600&q=80'
    },
    { 
      category: 'Acoustics', 
      name: 'STC-65 Isolation Shell', 
      desc: 'Floating subfloor construction with sound isolation doors and silent HVAC ductwork.',
      image: 'https://images.unsplash.com/photo-1519677100203-a0e668c92439?auto=format&fit=crop&w=600&q=80'
    }
  ];

  return (
    <section id="equipment" className="py-20 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-widest block mb-2">Enterprise Hardware</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111111] tracking-tight">Broadcast Grade Specs</h2>
          <p className="text-slate-500 text-sm sm:text-base max-w-2xl mx-auto mt-4">We outfit every studio with the exact same gear used by top-tier production networks.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {gear.map((g, idx) => (
            <div key={idx} className="group relative h-[180px] sm:h-[250px] rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500">
              <img 
                src={g.image} 
                alt={g.name} 
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 group-hover:from-black/95 transition-colors duration-500" />
              <div className="absolute inset-0 p-3 sm:p-5 flex flex-col justify-end">
                <span className="text-[8px] sm:text-[9px] font-bold text-emerald-400 uppercase tracking-widest mb-1 opacity-90">{g.category}</span>
                <h3 className="text-sm sm:text-base font-bold text-white mb-1 sm:mb-2 leading-tight">{g.name}</h3>
                <p className="text-[10px] sm:text-xs text-slate-300 leading-relaxed line-clamp-2 sm:line-clamp-3 hidden sm:-webkit-box">
                  {g.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
