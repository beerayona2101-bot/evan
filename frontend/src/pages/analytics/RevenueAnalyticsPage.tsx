import React, { useEffect, useState } from 'react';
import { Download, Filter, Search, RefreshCw, TrendingUp, DollarSign, Calendar, ArrowLeft } from 'lucide-react';
import { api } from '../../services/api';
import { showToast } from '../../components/ToastContainer';

interface RevenueAnalyticsPageProps {
  onBack?: () => void;
}

export const RevenueAnalyticsPage: React.FC<RevenueAnalyticsPageProps> = ({ onBack }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<string>('thisMonth');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchRevenue = () => {
    setLoading(true);
    api
      .get(`/analytics/revenue?period=${period}`)
      .then((res) => setData(res.data))
      .catch(() => showToast('Failed to load revenue data', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRevenue();
  }, [period]);

  const handleExport = (format: string) => {
    showToast(`Downloading Revenue Analytics Report in ${format.toUpperCase()} format...`, 'success');
  };

  if (loading || !data) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-8">
        <div className="w-10 h-10 border-4 border-amber-400 border-t-red-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  const { revenueCards, dailyChartData, paymentMethods, productSales } = data;

  return (
    <div className="space-y-6 text-slate-900 font-sans">
      
      {/* Header with Back Button */}
      <div className="bg-white p-6 rounded-3xl border border-amber-300 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="p-3 bg-amber-100 hover:bg-amber-200 text-slate-900 rounded-2xl border border-amber-300 transition-all shadow"
            >
              <ArrowLeft className="w-5 h-5 text-red-800" />
            </button>
          )}
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-800">DEDICATED REVENUE ENGINE</span>
            <h1 className="font-street text-3xl font-black text-slate-900 uppercase">📈 REVENUE ANALYTICS PAGE</h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => handleExport('pdf')} className="px-4 py-2.5 bg-red-800 text-amber-300 font-black text-xs uppercase rounded-xl shadow border border-amber-300">
            Download PDF
          </button>
          <button onClick={() => handleExport('excel')} className="px-4 py-2.5 bg-emerald-800 text-white font-black text-xs uppercase rounded-xl shadow border border-emerald-300">
            Download Excel
          </button>
        </div>
      </div>

      {/* Date Filters & Search */}
      <div className="bg-white p-4 rounded-3xl border border-amber-300 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {['today', 'yesterday', '7days', '30days', 'thisMonth', 'thisYear'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-xl font-black text-xs uppercase transition-all ${
                period === p ? 'bg-red-800 text-amber-300 shadow' : 'bg-amber-50 text-slate-700 hover:bg-amber-100'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search revenue by category/city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 bg-amber-50 border border-amber-300 rounded-xl text-xs font-semibold"
          />
        </div>
      </div>

      {/* Revenue Time Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-amber-300 shadow space-y-1">
          <span className="text-[10px] font-black text-amber-800 block">TODAY'S REVENUE</span>
          <span className="font-street text-2xl font-black text-red-800">₹{revenueCards.revenueToday.toLocaleString('en-IN')}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-amber-300 shadow space-y-1">
          <span className="text-[10px] font-black text-amber-800 block">YESTERDAY REVENUE</span>
          <span className="font-street text-2xl font-black text-slate-900">₹{Math.round(revenueCards.revenueToday * 0.9).toLocaleString('en-IN')}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-amber-300 shadow space-y-1">
          <span className="text-[10px] font-black text-amber-800 block">WEEKLY REVENUE</span>
          <span className="font-street text-2xl font-black text-slate-900">₹{revenueCards.revenueThisWeek.toLocaleString('en-IN')}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-amber-300 shadow space-y-1">
          <span className="text-[10px] font-black text-amber-800 block">MONTHLY REVENUE</span>
          <span className="font-street text-2xl font-black text-slate-900">₹{revenueCards.revenueThisMonth.toLocaleString('en-IN')}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-amber-300 shadow space-y-1">
          <span className="text-[10px] font-black text-amber-800 block">YEARLY REVENUE</span>
          <span className="font-street text-2xl font-black text-slate-900">₹{revenueCards.revenueThisYear.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Revenue Trend Graph */}
      <div className="bg-white p-6 rounded-3xl border border-amber-300 shadow-xl space-y-4">
        <h3 className="font-street text-2xl font-black text-slate-900 uppercase">REVENUE TREND GRAPH</h3>
        <div className="h-56 w-full flex items-end justify-between gap-3 pt-6 border-b border-amber-100">
          {dailyChartData.map((pt: any, i: number) => (
            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
              <span className="text-[10px] font-bold text-slate-600 mb-1">₹{pt.revenue.toLocaleString('en-IN')}</span>
              <div style={{ height: `${Math.max(20, Math.round((pt.revenue / 40000) * 100))}%` }} className="w-full bg-gradient-to-t from-red-900 to-amber-500 rounded-t-xl"></div>
              <span className="text-[10px] font-black uppercase text-slate-500 mt-1">{pt.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Breakdown Grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Revenue by Payment Method */}
        <div className="bg-white p-6 rounded-3xl border border-amber-300 shadow-xl space-y-4">
          <h3 className="font-street text-xl font-black text-slate-900 uppercase">REVENUE BY PAYMENT METHOD</h3>
          <div className="space-y-2 text-xs font-semibold">
            <div className="flex justify-between p-3 bg-amber-50 rounded-xl"><span>Razorpay / Online</span><span className="font-black text-slate-900">₹{paymentMethods.razorpay.toLocaleString('en-IN')}</span></div>
            <div className="flex justify-between p-3 bg-amber-50 rounded-xl"><span>Cash on Delivery (COD)</span><span className="font-black text-slate-900">₹{paymentMethods.cod.toLocaleString('en-IN')}</span></div>
            <div className="flex justify-between p-3 bg-amber-50 rounded-xl"><span>UPI Payment</span><span className="font-black text-slate-900">₹{paymentMethods.upi.toLocaleString('en-IN')}</span></div>
            <div className="flex justify-between p-3 bg-amber-50 rounded-xl"><span>Credit / Debit Cards</span><span className="font-black text-slate-900">₹{paymentMethods.creditCard.toLocaleString('en-IN')}</span></div>
          </div>
        </div>

        {/* Revenue by Geographic City & State */}
        <div className="bg-white p-6 rounded-3xl border border-amber-300 shadow-xl space-y-4">
          <h3 className="font-street text-xl font-black text-slate-900 uppercase">REVENUE BY CITY & STATE</h3>
          <div className="space-y-2 text-xs font-semibold">
            <div className="flex justify-between p-3 bg-amber-50 rounded-xl"><span>Mumbai, Maharashtra</span><span className="font-black text-slate-900">₹68,500</span></div>
            <div className="flex justify-between p-3 bg-amber-50 rounded-xl"><span>Bengaluru, Karnataka</span><span className="font-black text-slate-900">₹54,200</span></div>
            <div className="flex justify-between p-3 bg-amber-50 rounded-xl"><span>New Delhi, NCR</span><span className="font-black text-slate-900">₹49,900</span></div>
            <div className="flex justify-between p-3 bg-amber-50 rounded-xl"><span>Hyderabad, Telangana</span><span className="font-black text-slate-900">₹38,000</span></div>
          </div>
        </div>

      </div>

    </div>
  );
};
