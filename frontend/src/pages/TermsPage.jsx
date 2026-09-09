import React from 'react';
import SEO from '../components/common/SEO';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F3F3F5] text-slate-900 pt-32 pb-24 px-4 sm:px-6 lg:px-8">
      <SEO title="Terms of Service" description="Terms of service and booking agreement for Studio Floor." />
      <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-200">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#111111] mb-6">Terms of Service</h1>
        <p className="text-slate-500 font-medium mb-12">Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className="space-y-10 text-slate-700 leading-relaxed font-medium">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using the Studio Floor platform and booking our facilities, you accept and agree to be bound by the terms and provisions of this agreement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">2. Studio Usage & Conduct</h2>
            <p className="mb-4">
              When booking a studio, you agree to respect the space, equipment, and our staff. You are responsible for any damages caused to the studio or equipment during your booking period.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li>No smoking or open flames allowed in any studio space.</li>
              <li>Food and drinks must be kept away from delicate equipment.</li>
              <li>Your session must end on time to accommodate the next creator.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">3. Booking, Payments, and Cancellations</h2>
            <p className="mb-4">
              All bookings require a reservation fee to secure your time slot. Full payment may be required upfront depending on the studio suite.
            </p>
            <p>
              Cancellations must be made at least 48 hours in advance for a full refund. Cancellations made within 48 hours may be subject to a cancellation fee equivalent to 50% of the booking cost. No-shows will be charged the full amount.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">4. Intellectual Property</h2>
            <p>
              You retain all rights and ownership to the content you create within our studios. Studio Floor claims no ownership over your recordings, broadcasts, or creative works.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
