import React from 'react';
import { Radio, ShieldCheck, Headphones, MapPin, Mail, Phone } from 'lucide-react';

export default function Footer({ currentView }) {
  if (currentView === 'admin') {
    return (
      <footer className="bg-[#F3F3F5] text-slate-500 py-6 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-600">Studio Floor Admin</span>
          </div>
          <p className="text-[10px] font-medium">© {new Date().getFullYear()} Studio Floor Inc. v2.4.1 (Secured Session)</p>
          <div className="flex gap-4 text-[10px] font-medium">
            <a href="#" className="hover:text-slate-800 transition-colors">Documentation</a>
            <a href="#" className="hover:text-slate-800 transition-colors">Support Portal</a>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-[#111111] text-slate-400 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-16">
          
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-white text-[#111111] flex items-center justify-center font-black">
                <Radio className="w-4 h-4 text-[#111111]" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-white">
                Studio Floor<span className="text-emerald-500">.</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm font-medium">
              State-of-the-art broadcast presentation suites & sound-isolated podcast rooms. Built for content creators, corporate keynotes, live streams, and voiceover artists.
            </p>
            <div className="flex items-center gap-3 text-xs pt-2">
              <span className="flex items-center gap-1 bg-white/5 text-slate-300 px-3 py-1.5 rounded-full border border-white/10 font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 24/7 Security
              </span>
              <span className="flex items-center gap-1 bg-white/5 text-slate-300 px-3 py-1.5 rounded-full border border-white/10 font-bold">
                <Headphones className="w-3.5 h-3.5 text-amber-400" /> Sound Engineers
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Studios</h4>
            <ul className="space-y-2.5 text-sm font-medium">
              <li><a href="#studios" className="text-slate-400 hover:text-white transition-colors">All Studios</a></li>
              <li><a href="#equipment" className="text-slate-400 hover:text-white transition-colors">Equipment Specs</a></li>
              <li><a href="#testimonials" className="text-slate-400 hover:text-white transition-colors">Creator Reviews</a></li>
              <li><a href="#pricing" className="text-slate-400 hover:text-white transition-colors">Pricing & Rates</a></li>
            </ul>
          </div>

          {/* Company & Support */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Support</h4>
            <ul className="space-y-2.5 text-sm font-medium">
              <li><a href="#faq" className="text-slate-400 hover:text-white transition-colors">FAQ</a></li>
              <li><a href="#contact" className="text-slate-400 hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Cancellation Policy</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Help Center</a></li>
            </ul>
          </div>

          {/* Location & Contact */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Studio Location</h4>
            <div className="space-y-3 text-sm font-medium">
              <p className="flex items-start gap-2 text-slate-400">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>100 Media Boulevard, Suite 400<br/>San Francisco, CA 94105</span>
              </p>
              <p className="flex items-center gap-2 text-slate-400">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>booking@studiofloor.com</span>
              </p>
              <p className="flex items-center gap-2 text-slate-400">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>+1 (800) 555-STUDIO</span>
              </p>
            </div>
          </div>

        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-500">
          <p>© {new Date().getFullYear()} Studio Floor Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Security Overview</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
