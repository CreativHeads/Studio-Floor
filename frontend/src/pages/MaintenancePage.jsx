import React from 'react';
import { Lock, Wrench } from 'lucide-react';
import SEO from '../components/common/SEO';

export default function MaintenancePage({ onOpenAuth }) {
  return (
    <div className="min-h-screen bg-[#F3F3F5] flex flex-col items-center justify-center relative overflow-hidden text-[#111111] font-sans selection:bg-[#111111] selection:text-white">
      <SEO title="Maintenance" description="We are currently down for maintenance." />

      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[20%] left-[20%] w-[30%] h-[30%] bg-amber-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="z-10 flex flex-col items-center text-center px-4 max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mb-8 shadow-xl border border-slate-200/60 rotate-12">
          <Wrench className="w-10 h-10 text-amber-500 -rotate-12" />
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 text-slate-900">
          Under Maintenance
        </h1>
        <p className="text-lg md:text-xl text-slate-500 font-medium mb-10 max-w-xl">
          We're making some essential updates to improve your experience. We'll be back online shortly. Thank you for your patience!
        </p>
      </div>
    </div>
  );
}
