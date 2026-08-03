import React, { useEffect, useState } from 'react';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Percent,
  RotateCcw,
  ShieldCheck,
  Award,
  ArrowRight,
  BarChart3,
  Calendar,
  FileText,
} from 'lucide-react';
import { api } from '../../services/api';
import { showToast } from '../../components/ToastContainer';
import { useSocket } from '../../context/SocketContext';

interface AnalyticsSummaryDashboardProps {
  onNavigate: (subTab: string) => void;
}

export const AnalyticsSummaryDashboard: React.FC<AnalyticsSummaryDashboardProps> = ({ onNavigate }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  const fetchSummary = () => {
    setLoading(true);
    api
      .get('/analytics/revenue?period=today')
      .then((res) => setData(res.data))
      .catch(() => showToast('Failed to load summary analytics', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => {
      fetchSummary();
    };
    socket.on('revenueAnalyticsUpdated', handleUpdate);
    socket.on('orderCreated', handleUpdate);
    socket.on('orderStatusUpdated', handleUpdate);

    return () => {
      socket.off('revenueAnalyticsUpdated', handleUpdate);
      socket.off('orderCreated', handleUpdate);
      socket.off('orderStatusUpdated', handleUpdate);
    };
  }, [socket]);

  if (loading || !data) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-red-800 rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-black text-amber-900 uppercase tracking-widest font-street">
            LOADING EXECUTIVE KPI DASHBOARD...
          </p>
        </div>
      </div>
    );
  }

  const { revenueCards, orderStats, gst, profitAndExpenses, productSales } = data;

  return (
    <div className="space-y-6 text-slate-900 font-sans">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-amber-300 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
              SHOPIFY & AMAZON ENTERPRISE ANALYTICS ENGINE
            </span>
          </div>
          <h1 className="font-street text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tight mt-1">
            📊 MAIN ANALYTICS DASHBOARD
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Click any KPI card or chart to open its dedicated deep-dive analytics module.
          </p>
        </div>

        <button
          onClick={fetchSummary}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-black uppercase tracking-wider rounded-xl border border-amber-300 flex items-center gap-1.5 shadow"
        >
          <RefreshCw className="w-4 h-4 text-amber-400" /> Refresh KPI Metrics
        </button>
      </div>

      {/* EXACTLY 2 EXECUTIVE KPI SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        
        {/* Card 1: Today's Revenue -> opens Earnings & Taxes page */}
        <div
          onClick={() => onNavigate('financials')}
          className="bg-white p-6 rounded-3xl border-2 border-amber-300 shadow-lg space-y-2 cursor-pointer hover:border-red-800 hover:shadow-2xl transition-all group relative overflow-hidden"
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-black text-amber-900 uppercase tracking-widest block">TOTAL REVENUE (TODAY)</span>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-red-800 group-hover:translate-x-1 transition-all" />
          </div>
          <span className="font-street text-4xl font-black text-red-800">₹{revenueCards.revenueToday.toLocaleString('en-IN')}</span>
          <span className="text-emerald-700 text-xs font-bold block">Open Earnings, Taxes & Financial Reports →</span>
        </div>

        {/* Card 2: Today's Orders -> opens Customer Orders page */}
        <div
          onClick={() => onNavigate('orders')}
          className="bg-white p-6 rounded-3xl border-2 border-amber-300 shadow-lg space-y-2 cursor-pointer hover:border-red-800 hover:shadow-2xl transition-all group"
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-black text-amber-900 uppercase tracking-widest block">TOTAL ORDERS OF THE DAY</span>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-red-800 group-hover:translate-x-1 transition-all" />
          </div>
          <span className="font-street text-4xl font-black text-slate-900">{revenueCards.totalOrders} ORDERS</span>
          <span className="text-emerald-700 text-xs font-bold block">Open Customer Orders Pipeline Page →</span>
        </div>

      </div>

      {/* CLICKABLE OVERVIEW CHART */}
      <div
        onClick={() => onNavigate('analytics-revenue')}
        className="bg-white p-6 rounded-3xl border border-amber-300 shadow-xl space-y-4 cursor-pointer hover:border-red-800 transition-all group"
      >
        <div className="flex justify-between items-center border-b border-amber-100 pb-3">
          <div>
            <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest">CLICKABLE GRAPH SHORTCUT</span>
            <h3 className="font-street text-2xl font-black text-slate-900 uppercase flex items-center gap-2">
              REVENUE & SALES TREND CHART <ArrowRight className="w-5 h-5 text-red-800 group-hover:translate-x-1 transition-transform" />
            </h3>
          </div>
          <span className="text-xs font-extrabold text-red-800 uppercase bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
            Click to Open Full Revenue Analytics →
          </span>
        </div>

        <div className="h-44 w-full flex items-end justify-between gap-3 pt-6 px-2 border-b border-amber-100">
          {[40, 65, 30, 85, 55, 95, 75].map((pct, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full">
              <div style={{ height: `${pct}%` }} className="w-full bg-gradient-to-t from-red-900 to-amber-500 rounded-t-xl transition-all"></div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
