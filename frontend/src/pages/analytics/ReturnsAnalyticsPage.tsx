import React from 'react';
import { ArrowLeft, RotateCcw, Download, Image as ImageIcon } from 'lucide-react';
import { showToast } from '../../components/ToastContainer';

interface ReturnsAnalyticsPageProps {
  onBack?: () => void;
}

export const ReturnsAnalyticsPage: React.FC<ReturnsAnalyticsPageProps> = ({ onBack }) => {
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
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-800">RETURN ORDERS ATELIER</span>
            <h1 className="font-street text-3xl font-black text-slate-900 uppercase">🔄 RETURN REQUESTS & REASONS</h1>
          </div>
        </div>

        <button onClick={() => showToast('Exporting Returns Log...', 'info')} className="px-4 py-2.5 bg-red-800 text-amber-300 font-black text-xs uppercase rounded-xl border border-amber-300 flex items-center gap-1.5 shadow">
          <Download className="w-4 h-4" /> Export Returns CSV
        </button>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-amber-300 shadow-xl space-y-4">
        <h3 className="font-street text-2xl font-black text-slate-900 uppercase">RECENT RETURN REQUESTS</h3>
        <p className="text-xs text-slate-500 font-semibold">0 Active return disputes pending inspection.</p>
      </div>
    </div>
  );
};
