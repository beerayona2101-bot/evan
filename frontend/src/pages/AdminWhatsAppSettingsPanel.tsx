import React, { useEffect, useState } from 'react';
import { MessageSquare, Save, CheckCircle, Smartphone, Sliders, Palette, Eye } from 'lucide-react';
import { api } from '../services/api';
import { showToast } from '../components/ToastContainer';

export const AdminWhatsAppSettingsPanel: React.FC = () => {
  const [whatsappNumber, setWhatsappNumber] = useState('919490644434');
  const [whatsappGreeting, setWhatsappGreeting] = useState('Hello EVAN Collections, I would like to know more about your sarees.');
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [whatsappPosition, setWhatsappPosition] = useState<'bottom-left' | 'bottom-right'>('bottom-left');
  const [whatsappColor, setWhatsappColor] = useState('#25D366');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get('/settings/whatsapp')
      .then((res: any) => {
        if (res.data) {
          setWhatsappNumber(res.data.whatsappNumber || '919490644434');
          setWhatsappGreeting(res.data.whatsappGreeting || 'Hello EVAN Collections, I would like to know more about your sarees.');
          setWhatsappEnabled(res.data.whatsappEnabled !== undefined ? res.data.whatsappEnabled : true);
          setWhatsappPosition(res.data.whatsappPosition || 'bottom-left');
          setWhatsappColor(res.data.whatsappColor || '#25D366');
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/settings/whatsapp', {
        whatsappNumber,
        whatsappGreeting,
        whatsappEnabled,
        whatsappPosition,
        whatsappColor,
      });
      showToast('WhatsApp & Contact Settings updated successfully across all client pages!', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update WhatsApp settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="w-8 h-8 border-4 border-red-800 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-bold text-amber-900">Loading WhatsApp & Contact Settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-amber-200 pb-4">
        <div>
          <span className="font-street text-3xl font-black text-slate-900 block uppercase">WHATSAPP & CONTACT SETTINGS</span>
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Real-time Socket.IO Sync Enabled
          </span>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-amber-50/60 p-8 rounded-3xl border border-amber-300 shadow-xl space-y-6 text-xs font-semibold">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Business WhatsApp Number */}
          <div className="space-y-2">
            <label className="block text-slate-800 font-black uppercase tracking-wider flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-emerald-600" /> Business WhatsApp Phone Number
            </label>
            <input
              type="text"
              required
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="e.g. 919490644434"
              className="w-full p-3.5 bg-white border border-amber-300 rounded-xl font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-800"
            />
            <p className="text-[10px] text-slate-500 font-medium">Include country code without '+' or spaces (e.g. 919490644434 for India).</p>
          </div>

          {/* Default Greeting Message */}
          <div className="space-y-2">
            <label className="block text-slate-800 font-black uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-emerald-600" /> Default Customer Greeting Message
            </label>
            <textarea
              rows={3}
              required
              value={whatsappGreeting}
              onChange={(e) => setWhatsappGreeting(e.target.value)}
              placeholder="Hello EVAN Collections..."
              className="w-full p-3.5 bg-white border border-amber-300 rounded-xl font-medium text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-800"
            />
          </div>

          {/* Button Position */}
          <div className="space-y-2">
            <label className="block text-slate-800 font-black uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-amber-700" /> Floating Button Screen Position
            </label>
            <select
              value={whatsappPosition}
              onChange={(e: any) => setWhatsappPosition(e.target.value)}
              className="w-full p-3.5 bg-white border border-amber-300 rounded-xl font-bold text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-800"
            >
              <option value="bottom-left">Bottom Left (Recommended)</option>
              <option value="bottom-right">Bottom Right</option>
            </select>
          </div>

          {/* Button Color */}
          <div className="space-y-2">
            <label className="block text-slate-800 font-black uppercase tracking-wider flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-amber-700" /> Floating Button Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={whatsappColor}
                onChange={(e) => setWhatsappColor(e.target.value)}
                className="w-12 h-11 p-1 bg-white border border-amber-300 rounded-xl cursor-pointer"
              />
              <input
                type="text"
                value={whatsappColor}
                onChange={(e) => setWhatsappColor(e.target.value)}
                className="flex-1 p-3.5 bg-white border border-amber-300 rounded-xl font-mono text-xs text-slate-900 uppercase"
              />
            </div>
          </div>
        </div>

        {/* Enable / Disable Switch */}
        <div className="p-4 bg-white rounded-2xl border border-amber-300 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Eye className="w-5 h-5 text-emerald-600" />
            <div>
              <span className="font-black text-slate-900 uppercase block">Display Global Floating WhatsApp Button</span>
              <span className="text-[10px] text-slate-500 font-medium">Controls visibility on all customer pages (Home, Shop, Cart, Checkout, Profile, FAQs).</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setWhatsappEnabled(!whatsappEnabled)}
            className={`w-14 h-8 flex items-center rounded-full p-1 transition-all ${whatsappEnabled ? 'bg-emerald-600 justify-end' : 'bg-slate-300 justify-start'}`}
          >
            <div className="w-6 h-6 rounded-full bg-white shadow-md"></div>
          </button>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-4 bg-red-800 hover:bg-red-900 text-amber-300 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg border border-amber-300 flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? 'SAVING SETTINGS...' : 'SAVE WHATSAPP & CONTACT SETTINGS'}
        </button>
      </form>
    </div>
  );
};
