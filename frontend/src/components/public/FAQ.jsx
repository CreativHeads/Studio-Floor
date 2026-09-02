import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  {
    question: 'How do I book a studio space?',
    answer: 'You can easily book a studio space by clicking the "Book Now" button anywhere on our website. Choose your preferred studio, select a time slot, and confirm your reservation.'
  },
  {
    question: 'What equipment is included in the booking?',
    answer: 'All our studios come fully equipped with professional-grade microphones, studio lighting, soundproofing, and high-speed Wi-Fi. Specific equipment varies by room type.'
  },
  {
    question: 'Can I cancel or reschedule my booking?',
    answer: 'Yes, cancellation is possible up to 2 hours before your scheduled booking. If you cancel or reschedule within 2 hours of the booking time, the ₹100 reservation charge will not be refunded.'
  },
  {
    question: 'Is there parking available at the studios?',
    answer: 'Yes, we offer complimentary on-site parking for all our guests. Just follow the signs when you arrive at our facility.'
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white" id="faq">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center mb-12">
          <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-widest block mb-2">Got Questions?</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111111] tracking-tight">Frequently Asked Questions</h2>
        </div>
        
        <div className="space-y-4 mt-12">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="border border-slate-200 rounded-2xl overflow-hidden transition-all duration-300"
            >
              <button
                className="w-full flex items-center justify-between p-6 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-bold text-slate-900">{faq.question}</span>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-slate-500 shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-500 shrink-0" />
                )}
              </button>
              
              {openIndex === index && (
                <div className="p-6 bg-white border-t border-slate-100">
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
