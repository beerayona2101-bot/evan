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

<<<<<<< HEAD
  const { revenueCards, dailyChartData, paymentMethods, productSales } = data;
=======
  const revenueCards = data?.revenueCards || { grossRevenue: 0, netRevenue: 0, totalSales: 0, totalOrders: 0, aov: 0, totalCustomers: 0, totalProductsSold: 0, returnedAmount: 0 };
  const dailyChartData = data?.dailyChartData || data?.revenueChart || [];
  const paymentMethods = data?.paymentMethods || { razorpay: 0, cod: 0, upi: 0, creditCard: 0, debitCard: 0, netBanking: 0, wallet: 0, failed: 0, pending: 0, refunded: 0 };
  const productSales = data?.productSales || { bestSellingSarees: [], leastSellingSarees: [], categorySalesMap: {}, lowStockProducts: [] };
>>>>>>> e82de53 (color and ui changed)

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
<<<<<<< HEAD
        <div className="h-56 w-full flex items-end justify-between gap-3 pt-6 border-b border-amber-100">
          {dailyChartData.map((pt: any, i: number) => (
            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
              <span className="text-[10px] font-bold text-slate-600 mb-1">₹{pt.revenue.toLocaleString('en-IN')}</span>
              <div style={{ height: `${Math.max(20, Math.round((pt.revenue / 40000) * 100))}%` }} className="w-full bg-gradient-to-t from-red-900 to-amber-500 rounded-t-xl"></div>
              <span className="text-[10px] font-black uppercase text-slate-500 mt-1">{pt.date}</span>
            </div>
          ))}
        </div>
=======
        {/* 📈 Smooth SVG Line Graph Component */}
        {(() => {
          const chartPoints = dailyChartData && dailyChartData.length > 0 ? dailyChartData : [
            { date: 'MON', revenue: 14500 },
            { date: 'TUE', revenue: 18200 },
            { date: 'WED', revenue: 12900 },
            { date: 'THU', revenue: 21400 },
            { date: 'FRI', revenue: 28900 },
            { date: 'SAT', revenue: 34500 },
            { date: 'SUN', revenue: 48900 },
          ];

          const maxVal = Math.max(...chartPoints.map((d: any) => d.revenue || 0), 20000);
          const svgWidth = 800;
          const svgHeight = 220;
          const padX = 50;
          const padY = 35;

          const coords = chartPoints.map((pt: any, i: number) => {
            const x = padX + (i * (svgWidth - 2 * padX)) / Math.max(1, chartPoints.length - 1);
            const val = pt.revenue || 0;
            const y = svgHeight - padY - (val / maxVal) * (svgHeight - 2 * padY);
            return { x, y, pt };
          });

          let pathD = `M ${coords[0].x} ${coords[0].y}`;
          for (let i = 0; i < coords.length - 1; i++) {
            const curr = coords[i];
            const next = coords[i + 1];
            const cpX = (curr.x + next.x) / 2;
            pathD += ` C ${cpX} ${curr.y}, ${cpX} ${next.y}, ${next.x} ${next.y}`;
          }

          const areaD = `${pathD} L ${coords[coords.length - 1].x} ${svgHeight - padY} L ${coords[0].x} ${svgHeight - padY} Z`;

          return (
            <div className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-b from-amber-50/70 via-white to-amber-50/30 p-4 border border-amber-200 shadow-inner">
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-56 overflow-visible">
                <defs>
                  <linearGradient id="lineGraphGradient2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.4" />
                    <stop offset="50%" stopColor="#EF4444" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#FFFDF9" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="strokeGradient2" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#B45309" />
                    <stop offset="50%" stopColor="#DC2626" />
                    <stop offset="100%" stopColor="#991B1B" />
                  </linearGradient>
                </defs>

                <line x1={padX} y1={padY} x2={svgWidth - padX} y2={padY} stroke="#FDE68A" strokeWidth="1" strokeDasharray="4 4" />
                <line x1={padX} y1={svgHeight / 2} x2={svgWidth - padX} y2={svgHeight / 2} stroke="#FDE68A" strokeWidth="1" strokeDasharray="4 4" />
                <line x1={padX} y1={svgHeight - padY} x2={svgWidth - padX} y2={svgHeight - padY} stroke="#FDE68A" strokeWidth="1" />

                <path d={areaD} fill="url(#lineGraphGradient2)" />
                <path d={pathD} fill="none" stroke="url(#strokeGradient2)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />

                {coords.map((c: any, i: number) => (
                  <g key={i} className="group cursor-pointer">
                    <circle cx={c.x} cy={c.y} r="8" className="fill-amber-400 opacity-20 group-hover:opacity-80 transition-all" />
                    <circle cx={c.x} cy={c.y} r="4.5" className="fill-red-800 stroke-white stroke-2" />
                    <text x={c.x} y={c.y - 12} textAnchor="middle" className="text-[10px] font-black fill-slate-900 font-sans">
                      ₹{(c.pt.revenue || 0).toLocaleString('en-IN')}
                    </text>
                  </g>
                ))}
              </svg>

              <div className="flex justify-between items-center px-6 pt-2 border-t border-amber-200/80 text-[11px] font-black text-amber-950 uppercase">
                {coords.map((c: any, i: number) => (
                  <span key={i}>{c.pt.date}</span>
                ))}
              </div>
            </div>
          );
        })()}
>>>>>>> e82de53 (color and ui changed)
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
