import React, { useState } from 'react';
import { Mail, Phone, MapPin, MessageSquare, Send, Sparkles, Clock } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    sareeInterest: 'Kanchipuram Silk',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-slate-900 py-12 px-4 sm:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-black uppercase tracking-[0.25em] text-amber-800 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-red-700" /> SILK STYLIST CONCIERGE
          </span>
          <h1 className="font-street text-5xl sm:text-6xl font-black text-slate-900 tracking-tight leading-none uppercase">
            CONTACT EVAN COLLECTIONS
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Have a query regarding bridal sarees, silk mark verification, or custom blouse tailoring? Our luxury saree concierge is at your service.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          {/* Left Business Details */}
          <div className="lg:col-span-5 bg-slate-900 text-white p-8 sm:p-10 rounded-3xl space-y-8 shadow-2xl border border-amber-400/30">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block mb-1">HERITAGE ATELIER</span>
              <h3 className="font-street text-3xl font-black text-amber-300">EVAN COLLECTIONS</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Connect with our expert drape consultants for personalized wedding trousseau consultations.
              </p>
            </div>

            <div className="space-y-4 text-xs font-medium">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">Atelier Address</span>
                  <span className="text-slate-300">Heritage Silk House, MG Road, Bengaluru - 560001</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <div>
                  <span className="font-bold text-white block">Phone / Helpline</span>
                  <span className="text-slate-300">9490644434</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <div>
                  <span className="font-bold text-white block">Email Concierge</span>
                  <span className="text-slate-300">concierge@evan.com</span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">Business Hours</span>
                  <span className="text-slate-300">Monday – Sunday: 10:00 AM – 8:30 PM IST</span>
                </div>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 block">FOLLOW OUR HANDLOOM ATELIER</span>
              <div className="flex items-center space-x-3 text-xs font-bold text-slate-300">
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-amber-300 transition-colors">Instagram</a>
                <span>•</span>
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-amber-300 transition-colors">Facebook</a>
                <span>•</span>
                <a href="https://pinterest.com" target="_blank" rel="noreferrer" className="hover:text-amber-300 transition-colors">Pinterest</a>
                <span>•</span>
                <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-amber-300 transition-colors">YouTube</a>
              </div>
            </div>

            {/* WhatsApp Link Button */}
            <div className="pt-2">
              <a
                href="https://wa.me/919490644434?text=Hi%20EVAN%20Collections,%20I%20am%20interested%20in%20your%20saree%20collection."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 border border-emerald-400"
              >
                <MessageSquare className="w-4 h-4" /> CHAT ON WHATSAPP
              </a>
            </div>
          </div>

          {/* Right Contact Form & Google Map */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-amber-200 shadow-xl space-y-6">
              <h3 className="font-street text-3xl font-black text-slate-900">SEND A SAREE INQUIRY</h3>

              {submitted ? (
                <div className="p-8 bg-amber-50 rounded-2xl border border-amber-300 text-center space-y-3">
                  <Sparkles className="w-8 h-8 text-amber-700 mx-auto" />
                  <h4 className="font-bold text-base text-slate-900">Thank You! Your Inquiry Has Been Received.</h4>
                  <p className="text-xs text-slate-600 font-medium">
                    Our silk stylist concierge will get back to you within 2 business hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">Your Full Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full p-3.5 bg-amber-50/50 border border-amber-300 rounded-xl font-medium"
                        placeholder="e.g. Ananya Sharma"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full p-3.5 bg-amber-50/50 border border-amber-300 rounded-xl font-medium"
                        placeholder="ananya@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full p-3.5 bg-amber-50/50 border border-amber-300 rounded-xl font-medium"
                        placeholder="9490644434"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">Saree Category Interest</label>
                      <select
                        value={formData.sareeInterest}
                        onChange={(e) => setFormData({ ...formData, sareeInterest: e.target.value })}
                        className="w-full p-3.5 bg-amber-50/50 border border-amber-300 rounded-xl font-bold"
                      >
                        <option value="Banarasi Silk">Banarasi Silk Sarees</option>
                        <option value="Kanchipuram Silk">Kanchipuram Silk Sarees</option>
                        <option value="Bridal Collection">Bridal Trousseau Collection</option>
                        <option value="Floral Organza">Floral Organza Sarees</option>
                        <option value="Handloom Linen">Handloom Linen Sarees</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">Message / Consultation Details</label>
                    <textarea
                      rows={4}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full p-3.5 bg-amber-50/50 border border-amber-300 rounded-xl font-medium"
                      placeholder="Tell us about your wedding date, color preferences, or blouse fitting requirements..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-red-800 hover:bg-red-900 text-amber-300 font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 border border-amber-300"
                  >
                    <Send className="w-4 h-4" /> SUBMIT INQUIRY
                  </button>
                </form>
              )}
            </div>

            {/* Visual Google Map Embed Container */}
            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-amber-200 shadow-xl space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-800 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-red-700" /> ATELIER LOCATION MAP
              </span>
              <div className="w-full h-64 rounded-2xl overflow-hidden border border-amber-200 shadow-inner">
                <iframe
                  title="EVAN COLLECTIONS Atelier Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.9798544976774!2d77.60945831482205!3d12.973121990854898!2m3!1f0!2f0!3f0!2m3!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae167e42f61a11%3A0xf6d8d6ff84e8f731!2sMG%20Road%2C%20Bengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1680000000000!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
