import React from 'react';
import SEO from '../components/common/SEO';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F3F3F5] text-slate-900 pt-32 pb-24 px-4 sm:px-6 lg:px-8">
      <SEO title="Privacy Policy" description="Privacy policy and data handling practices for Studio Floor." />
      <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-200">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#111111] mb-6">Privacy Policy</h1>
        <p className="text-slate-500 font-medium mb-12">Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className="space-y-10 text-slate-700 leading-relaxed font-medium">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">1. Information We Collect</h2>
            <p className="mb-4">
              At Studio Floor, we collect information that you provide directly to us when booking a studio, creating an account, or contacting our support team. This includes your name, email address, phone number, and payment information.
            </p>
            <p>
              We also automatically collect certain technical information when you visit our website, such as your IP address, browser type, and usage data to help us improve our platform experience.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">2. How We Use Your Information</h2>
            <p className="mb-4">We use the information we collect to:</p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li>Process your studio bookings and payments.</li>
              <li>Communicate with you regarding your reservations.</li>
              <li>Provide customer support and security during your visit.</li>
              <li>Analyze usage trends and improve our digital platform.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">3. Data Security & Storage</h2>
            <p>
              We take the security of your data seriously. We use industry-standard encryption and security protocols to protect your personal and payment information. Your data is stored securely on our servers and we do not sell your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">4. Facility Surveillance</h2>
            <p>
              For the safety of our guests and equipment, our studio facilities employ 24/7 security cameras in common areas and hallways. We do not place cameras inside the private studio rooms to ensure your creative privacy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">5. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact our Data Protection Officer at privacy@studiofloor.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
