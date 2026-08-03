import React, { useEffect, useState } from 'react';
import { ArrowLeft, Download, ShieldCheck, FileText, CheckCircle } from 'lucide-react';
import { api } from '../../services/api';
import { showToast } from '../../components/ToastContainer';

interface GstTaxAnalyticsPageProps {
  onBack?: () => void;
}

export const GstTaxAnalyticsPage: React.FC<GstTaxAnalyticsPageProps> = ({ onBack }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/analytics/revenue?period=thisMonth')
      .then((res) => setData(res.data))
      .catch(() => showToast('Failed to load GST tax data', 'error'))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return <div className="min-h-[50vh] flex items-center justify-center p-8"><div className="w-10 h-10 border-4 border-amber-400 border-t-red-800 rounded-full animate-spin"></div></div>;
  }

  const { gst } = data;

  return (
    <div className="space-y-6 text-slate-900 font-sans">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-amber-300 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {onBack && (
            <button onClick={onBack} className="p-3 bg-amber-100 hover:bg-amber-200 text-slate-900 rounded-2xl border border-amber-300">
              <ArrowLeft className="w-5 h-5 text-red-800" />
            </button>
          )}
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-800">TAX COMPLIANCE ATELIER</span>
            <h1 className="font-street text-3xl font-black text-slate-900 uppercase">🧾 GST & TAX FILING REPORTS (5%)</h1>
          </div>
        </div>

        <button onClick={() => showToast('Exporting GST Tax Return CSV...', 'success')} className="px-4 py-2.5 bg-red-800 text-amber-300 font-black text-xs uppercase rounded-xl border border-amber-300 flex items-center gap-1.5 shadow">
          <Download className="w-4 h-4" /> Download GST Returns Report
        </button>
      </div>

      {/* Tax Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-amber-300 shadow space-y-1">
          <span className="text-[10px] font-black text-amber-800 uppercase block">CGST (2.5%)</span>
          <span className="font-street text-3xl font-black text-red-800">₹{gst.cgst.toLocaleString('en-IN')}</span>
          <span className="text-slate-500 text-[10px] font-bold block">Central GST Share</span>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-amber-300 shadow space-y-1">
          <span className="text-[10px] font-black text-amber-800 uppercase block">SGST (2.5%)</span>
          <span className="font-street text-3xl font-black text-red-800">₹{gst.sgst.toLocaleString('en-IN')}</span>
          <span className="text-slate-500 text-[10px] font-bold block">State GST Share</span>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-amber-300 shadow space-y-1">
          <span className="text-[10px] font-black text-amber-800 uppercase block">IGST (5.0%)</span>
          <span className="font-street text-3xl font-black text-slate-900">₹{gst.igst.toLocaleString('en-IN')}</span>
          <span className="text-amber-800 text-[10px] font-bold block">Inter-State Orders</span>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-amber-300 shadow space-y-1">
          <span className="text-[10px] font-black text-amber-800 uppercase block">TOTAL GST COLLECTED</span>
          <span className="font-street text-3xl font-black text-emerald-800">₹{gst.totalGstCollected.toLocaleString('en-IN')}</span>
          <span className="text-emerald-700 text-[10px] font-bold block">Quarterly Filing</span>
        </div>
      </div>
    </div>
  );
};
