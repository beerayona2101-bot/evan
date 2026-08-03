import React from 'react';
import { ArrowLeft, RotateCcw, Download, CheckCircle, Clock } from 'lucide-react';
import { showToast } from '../../components/ToastContainer';

interface RefundsAnalyticsPageProps {
  onBack?: () => void;
}

export const RefundsAnalyticsPage: React.FC<RefundsAnalyticsPageProps> = ({ onBack }) => {
  return (
    <div className="space-y-6 text-slate-900 font-sans">
      <div className="bg-white p-6 rounded-3xl border border-amber-300 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {onBack && (
            <button onClick={onBack} className="p-3 bg-amber-100 hover:bg-amber-200 text-slate-900 rounded-2xl border border-amber-300">
              <ArrowLeft className="w-5 h-5 text-red-800" />
            </button>
          )}
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-800">REFUNDS MANAGEMENT</span>
            <h1 className="font-street text-3xl font-black text-slate-900 uppercase">↩️ REFUND REQUESTS & REPORTS</h1>
          </div>
        </div>

        <button onClick={() => showToast('Exporting Refund Reports...', 'info')} className="px-4 py-2.5 bg-red-800 text-amber-300 font-black text-xs uppercase rounded-xl border border-amber-300 flex items-center gap-1.5 shadow">
          <Download className="w-4 h-4" /> Download Refund CSV
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-amber-300 shadow space-y-1">
          <span className="text-[10px] font-black text-amber-800 uppercase block">APPROVED REFUNDS</span>
          <span className="font-street text-3xl font-black text-emerald-800">₹14,999</span>
          <span className="text-emerald-700 text-[10px] font-bold block">1 Completed Request</span>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-amber-300 shadow space-y-1">
          <span className="text-[10px] font-black text-amber-800 uppercase block">PENDING REFUNDS</span>
          <span className="font-street text-3xl font-black text-amber-900">0 Pending</span>
          <span className="text-slate-500 text-[10px] font-bold block">0 Requests Awaiting</span>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-amber-300 shadow space-y-1">
          <span className="text-[10px] font-black text-amber-800 uppercase block">REJECTED REFUNDS</span>
          <span className="font-street text-3xl font-black text-red-800">0 Rejected</span>
          <span className="text-slate-500 text-[10px] font-bold block">Policy Violations</span>
        </div>
      </div>
    </div>
  );
};
