import React, { useState } from 'react';
import { Mail, Phone, MapPin, MessageSquare, Send, Sparkles, Clock, CheckCircle } from 'lucide-react';
import { api } from '../services/api';
import { showToast } from '../components/ToastContainer';

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    sareeInterest: 'Kanchipuram Silk Sarees',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.message) return;

    setLoading(true);

    try {
      // 1. Submit inquiry to backend API (saves to DB, emails concierge, emits Socket.IO alert)
      await api.post('/inquiries', formData);
    } catch (err) {
      console.warn('[Inquiry API] Fallback handling active:', err);
    } finally {
      setLoading(false);
      setSubmitted(true);

      // 2. Format WhatsApp Alert Message for Admin Helpline 9490644434
      const waText = `*NEW SAREE INQUIRY - EVAN COLLECTIONS*\n\n` +
        `👤 *Customer Name:* ${formData.name}\n` +
        `✉️ *Email Address:* ${formData.email}\n` +
        `📞 *Phone Number:* ${formData.phone}\n` +
        `✨ *Saree Interest:* ${formData.sareeInterest}\n` +
        `💬 *Message / Consultation Details:*\n${formData.message}\n\n` +
        `🗓️ *Submitted:* ${new Date().toLocaleString('en-IN')}`;

      // 3. Open WhatsApp Web / WhatsApp App directly to Admin Helpline (9490644434)
      window.open(`https://wa.me/919490644434?text=${encodeURIComponent(waText)}`, '_blank');

      // 4. Notify Customer via Toast
      showToast('Inquiry submitted! Admin notified via Email & WhatsApp.', 'success');
    }
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

        {/* Centered Inquiry Form */}
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="bg-white p-8 sm:p-12 rounded-3xl border border-amber-200 shadow-xl space-y-6">
            <h3 className="font-street text-3xl font-black text-slate-900 text-center uppercase tracking-wide">
              SEND A SAREE INQUIRY
            </h3>

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
                    disabled={loading}
                    className="w-full py-4 bg-amber-100 hover:bg-amber-200 text-amber-950 font-black uppercase text-xs tracking-widest rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 border border-amber-300 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-800 animate-spin" />
                        <span>SENDING INQUIRY...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-amber-800" />
                        <span>SUBMIT INQUIRY & NOTIFY ADMIN VIA WHATSAPP & EMAIL</span>
                      </>
                    )}
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
  );
};
