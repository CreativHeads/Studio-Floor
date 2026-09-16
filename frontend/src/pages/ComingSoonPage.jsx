import React from 'react';
import { Lock } from 'lucide-react';
import logoWhite from '../assets/Studiofloor Logo White.png';
import SEO from '../components/common/SEO';

export default function ComingSoonPage({ onOpenAuth }) {
  return (
    <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-center relative overflow-hidden text-white font-sans selection:bg-white selection:text-[#111111]">
      <SEO title="Coming Soon" description="We are launching soon." />

      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/20 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-sky-500/20 rounded-full blur-[120px] mix-blend-screen" />
      </div>

      <div className="z-10 flex flex-col items-center text-center px-4 max-w-3xl animate-in fade-in zoom-in duration-700">
        <div className="mb-12">
          <img src={logoWhite} alt="Studio Floor" className="h-12 md:h-16 object-contain opacity-90 hover:opacity-100 transition-opacity" />
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 pb-4 leading-[1.2] bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
          Something amazing is coming.
        </h1>
        <p className="text-lg md:text-xl text-white/60 font-medium mb-10 max-w-xl">
          We're currently putting the finishing touches on Studio Floor. We'll be ready to welcome you soon.
        </p>
      </div>

      {/* Subtle Grid overlay */}
      <div className="absolute inset-0 z-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz4KPC9zdmc+')] opacity-20 pointer-events-none" />
    </div>
  );
}
