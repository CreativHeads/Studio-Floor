import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Contact() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast.success('Message sent successfully! We will get back to you soon.');
      e.target.reset();
    }, 1500);
  };

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#F3F3F5]" id="contact">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-widest block mb-2">Get In Touch</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111111] tracking-tight">Contact Our Team</h2>
          <p className="mt-4 text-slate-600 max-w-2xl mx-auto text-sm">
            Have a special requirement or need help choosing the right studio? Our team of audio engineers and producers is here to help you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-start">
          
          {/* Contact Information */}
          <div className="bg-[#111111] text-white rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3" />
            
            <div className="relative z-10">
              <h3 className="text-2xl font-black mb-6">Contact Information</h3>
              <p className="text-slate-400 text-sm mb-10">
                Reach out to us directly through any of these channels. We typically respond within 1-2 hours during business hours.
              </p>

              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200 mb-1">Phone Support</h4>
                    <p className="text-slate-400 text-sm font-mono">+1 (800) 123-4567</p>
                    <p className="text-xs text-slate-500 mt-1">Mon-Fri from 8am to 8pm</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200 mb-1">Email Us</h4>
                    <p className="text-slate-400 text-sm">hello@studioplus.com</p>
                    <p className="text-xs text-slate-500 mt-1">For general inquiries</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200 mb-1">Studio Location</h4>
                    <p className="text-slate-400 text-sm">123 Creator Blvd, Suite 400<br/>Los Angeles, CA 90028</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Location Map */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden h-full min-h-[400px]">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d105658.07920311546!2d-118.411732!3d34.0207305!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2c75ddc27da13%3A0xe22fdf6f254608f4!2sLos%20Angeles%2C%20CA!5e0!3m2!1sen!2sus!4v1709240450000!5m2!1sen!2sus" 
              width="100%" 
              height="100%" 
              style={{ border: 0, minHeight: '100%' }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Studio Location Map"
              className="w-full h-full"
            ></iframe>
          </div>
          
        </div>
      </div>
    </section>
  );
}
