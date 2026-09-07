import React from 'react';
import { ShieldCheck, Lock, Server, Eye } from 'lucide-react';

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-[#F3F3F5] text-slate-900 pt-32 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-200">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#111111]">Security Overview</h1>
        </div>
        
        <p className="text-lg text-slate-600 font-medium mb-12 max-w-2xl">
          At Studio Floor, we treat the security of your creative work, your personal data, and your physical safety as our top priority. Here is how we protect you.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <Lock className="w-6 h-6 text-indigo-500 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">Data Encryption</h3>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              All data transmitted between your browser and our servers is encrypted using modern TLS 1.3 protocols. Payment information is securely tokenized and handled by PCI-compliant payment processors.
            </p>
          </div>
          
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <Server className="w-6 h-6 text-sky-500 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">Infrastructure Security</h3>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              Our application is hosted on enterprise-grade cloud infrastructure with robust firewalls, DDoS protection, and continuous vulnerability scanning.
            </p>
          </div>
          
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <Eye className="w-6 h-6 text-amber-500 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">Physical Security</h3>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              Our physical studio locations feature 24/7 monitored access, secure entry systems, and continuous surveillance in all common areas and hallways.
            </p>
          </div>
          
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <ShieldCheck className="w-6 h-6 text-emerald-500 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">Audit Trails</h3>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              All bookings, user access logs, and administrative actions are strictly logged in an immutable audit trail to ensure accountability across the platform.
            </p>
          </div>
        </div>
        
        <div className="bg-slate-900 text-white p-8 rounded-2xl text-center">
          <h3 className="text-xl font-bold mb-3">Found a vulnerability?</h3>
          <p className="text-sm text-slate-400 mb-6 max-w-lg mx-auto">
            We work with security researchers to keep our platform safe. If you believe you have discovered a security vulnerability, please let us know.
          </p>
          <a href="mailto:security@studiofloor.com" className="inline-block px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors">
            Report an Issue
          </a>
        </div>
      </div>
    </div>
  );
}
