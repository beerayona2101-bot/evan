import React, { useEffect, useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Users,
  Package,
  Calendar,
  Filter,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  Sparkles,
  CreditCard,
  Truck,
  Percent,
  FileText,
  RefreshCw,
  Layers,
  Award,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { showToast } from '../components/ToastContainer';
import { useSocket } from '../context/SocketContext';

export const RevenueDashboardPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<string>('thisMonth');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [exporting, setExporting] = useState(false);
  const { socket } = useSocket();

  const fetchRevenueData = () => {
    setLoading(true);
    api
      .get(`/analytics/revenue`, {
        params: {
          period,
          paymentMethod: paymentMethodFilter,
          status: statusFilter,
        },
      })
      .then((res) => setData(res.data))
      .catch((err) => showToast(err?.response?.data?.message || 'Error loading revenue analytics', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRevenueData();
  }, [period, paymentMethodFilter, statusFilter]);

  // Real-time Socket.IO synchronization
  useEffect(() => {
    if (!socket) return;

    const handleUpdate = () => {
      fetchRevenueData();
      showToast('Live Financial Sync: Revenue metrics updated automatically!', 'info');
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

  const handleExportReport = async (reportType: string, format: string = 'csv') => {
    setExporting(true);
    try {
      const res = await api.get(`/analytics/export`, {
        params: { reportType, format },
        responseType: 'blob',
      });
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `EVAN_${reportType}_Report_${Date.now()}.${format}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(`Downloaded ${reportType} report successfully!`, 'success');
    } catch {
      showToast('Failed to export financial report', 'error');
    } finally {
      setExporting(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-amber-400 border-t-red-800 animate-spin mx-auto"></div>
          <p className="text-xs font-black text-amber-900 uppercase tracking-widest font-street">
            COMPUTING FINANCIAL AGGREGATIONS FROM MONGODB ATLAS...
          </p>
        </div>
      </div>
    );
  }

  const {
    revenueCards,
    orderStats,
    gst,
    paymentMethods,
    profitAndExpenses,
    productSales,
    customerRevenue,
    shippingAnalytics,
    dailyChartData,
    alerts,
  } = data;

  return (
    <div className="space-y-6 text-slate-900 font-sans">
      
      {/* Top Title & Real-Time Sync Indicator */}
      <div className="bg-white p-6 rounded-3xl border border-amber-300 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
              REAL-TIME FINANCIAL SYNC CONNECTED
            </span>
          </div>
          <h1 className="font-street text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tight mt-1">
            💰 REVENUE DASHBOARD & FINANCIAL ANALYTICS
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => handleExportReport('Sales', 'csv')}
            disabled={exporting}
            className="px-4 py-2.5 bg-amber-100 hover:bg-amber-200 text-slate-900 text-xs font-black uppercase tracking-wider rounded-xl border border-amber-300 flex items-center gap-1.5 shadow"
          >
            <Download className="w-4 h-4 text-red-800" /> Export CSV Report
          </button>
          <button
            onClick={fetchRevenueData}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-black uppercase tracking-wider rounded-xl border border-amber-300 flex items-center gap-1.5 shadow"
          >
            <RefreshCw className="w-4 h-4 text-amber-400" /> Refresh Metrics
          </button>
        </div>
      </div>

      {/* ⚙️ Master Filter Toolbar */}
      <div className="bg-white p-5 rounded-3xl border border-amber-300 shadow-md flex flex-wrap items-center justify-between gap-4 text-xs font-semibold">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-amber-800" />
          <span className="font-black text-slate-900 uppercase">Period Filter:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'today', label: 'Today' },
            { id: '7days', label: 'Last 7 Days' },
            { id: '30days', label: 'Last 30 Days' },
            { id: 'thisMonth', label: 'This Month' },
            { id: 'lastMonth', label: 'Last Month' },
            { id: 'thisYear', label: 'This Year' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setPeriod(item.id)}
              className={`px-3 py-1.5 rounded-xl font-bold uppercase transition-all ${
                period === item.id
                  ? 'bg-red-800 text-amber-300 shadow border border-amber-300/40'
                  : 'bg-amber-50 text-slate-700 hover:bg-amber-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <select
            value={paymentMethodFilter}
            onChange={(e) => setPaymentMethodFilter(e.target.value)}
            className="px-3 py-1.5 bg-amber-50 border border-amber-300 rounded-xl font-bold text-xs"
          >
            <option value="ALL">All Payment Methods</option>
            <option value="Razorpay">Razorpay / Online</option>
            <option value="COD">Cash on Delivery (COD)</option>
            <option value="UPI">UPI Payment</option>
            <option value="Credit Card">Credit Card</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-amber-50 border border-amber-300 rounded-xl font-bold text-xs"
          >
            <option value="ALL">All Order Statuses</option>
            <option value="Delivered">Delivered</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* 🔔 Automated Financial Alerts */}
      {alerts && alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((al: any, idx: number) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border flex items-center justify-between shadow-sm text-xs ${
                al.type === 'DANGER'
                  ? 'bg-red-50 border-red-300 text-red-900'
                  : al.type === 'WARNING'
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-blue-50 border-blue-300 text-blue-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <div>
                  <span className="font-extrabold uppercase block">{al.title}</span>
                  <span className="font-medium">{al.message}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 💰 12 REVENUE CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Gross Revenue */}
        <div className="bg-white p-5 rounded-3xl border border-amber-300 shadow-md space-y-1">
          <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest block">GROSS REVENUE</span>
          <span className="font-street text-3xl font-black text-slate-900">₹{revenueCards.grossRevenue.toLocaleString('en-IN')}</span>
          <span className="text-emerald-700 text-[10px] font-bold block flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Total Order Inflow
          </span>
        </div>

        {/* Card 2: Net Revenue */}
        <div className="bg-white p-5 rounded-3xl border border-amber-300 shadow-md space-y-1">
          <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest block">NET REVENUE</span>
          <span className="font-street text-3xl font-black text-red-800">₹{revenueCards.netRevenue.toLocaleString('en-IN')}</span>
          <span className="text-slate-500 text-[10px] font-bold block">After Refunds & Returns</span>
        </div>

        {/* Card 3: Total Sales Count */}
        <div className="bg-white p-5 rounded-3xl border border-amber-300 shadow-md space-y-1">
          <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest block">TOTAL COMPLETED SALES</span>
          <span className="font-street text-3xl font-black text-slate-900">{revenueCards.totalSales} Sales</span>
          <span className="text-emerald-700 text-[10px] font-bold block">Delivered Sarees</span>
        </div>

        {/* Card 4: Total Orders */}
        <div className="bg-white p-5 rounded-3xl border border-amber-300 shadow-md space-y-1">
          <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest block">TOTAL ORDERS</span>
          <span className="font-street text-3xl font-black text-slate-900">{revenueCards.totalOrders} Orders</span>
          <span className="text-slate-500 text-[10px] font-bold block">Period Order Volume</span>
        </div>

        {/* Card 5: AOV */}
        <div className="bg-white p-5 rounded-3xl border border-amber-300 shadow-md space-y-1">
          <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest block">AVERAGE ORDER VALUE (AOV)</span>
          <span className="font-street text-3xl font-black text-amber-900">₹{revenueCards.aov.toLocaleString('en-IN')}</span>
          <span className="text-slate-500 text-[10px] font-bold block">Per Cart Spend</span>
        </div>

        {/* Card 6: Total Customers */}
        <div className="bg-white p-5 rounded-3xl border border-amber-300 shadow-md space-y-1">
          <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest block">TOTAL CUSTOMERS</span>
          <span className="font-street text-3xl font-black text-slate-900">{revenueCards.totalCustomers}</span>
          <span className="text-emerald-700 text-[10px] font-bold block">Verified Buyers</span>
        </div>

        {/* Card 7: Total Products Sold */}
        <div className="bg-white p-5 rounded-3xl border border-amber-300 shadow-md space-y-1">
          <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest block">TOTAL PRODUCTS SOLD</span>
          <span className="font-street text-3xl font-black text-slate-900">{revenueCards.totalProductsSold} Units</span>
          <span className="text-amber-800 text-[10px] font-bold block">Artisan Saree Weaves</span>
        </div>

        {/* Card 8: Revenue Today */}
        <div className="bg-white p-5 rounded-3xl border border-amber-300 shadow-md space-y-1">
          <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest block">REVENUE TODAY</span>
          <span className="font-street text-3xl font-black text-red-800">₹{revenueCards.revenueToday.toLocaleString('en-IN')}</span>
          <span className="text-slate-500 text-[10px] font-bold block">Current 24h Inflow</span>
        </div>

        {/* Card 9: Revenue This Week */}
        <div className="bg-white p-5 rounded-3xl border border-amber-300 shadow-md space-y-1">
          <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest block">REVENUE THIS WEEK</span>
          <span className="font-street text-3xl font-black text-slate-900">₹{revenueCards.revenueThisWeek.toLocaleString('en-IN')}</span>
          <span className="text-emerald-700 text-[10px] font-bold block">7-Day Trailing</span>
        </div>

        {/* Card 10: Revenue This Month */}
        <div className="bg-white p-5 rounded-3xl border border-amber-300 shadow-md space-y-1">
          <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest block">REVENUE THIS MONTH</span>
          <span className="font-street text-3xl font-black text-slate-900">₹{revenueCards.revenueThisMonth.toLocaleString('en-IN')}</span>
          <span className="text-amber-800 text-[10px] font-bold block">Calendar Month</span>
        </div>

        {/* Card 11: Revenue This Year */}
        <div className="bg-white p-5 rounded-3xl border border-amber-300 shadow-md space-y-1">
          <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest block">REVENUE THIS YEAR</span>
          <span className="font-street text-3xl font-black text-slate-900">₹{revenueCards.revenueThisYear.toLocaleString('en-IN')}</span>
          <span className="text-slate-500 text-[10px] font-bold block">FY 2026 Inflow</span>
        </div>

        {/* Card 12: Net Profit */}
        <div className="bg-amber-500/10 p-5 rounded-3xl border-2 border-emerald-600 shadow-md space-y-1">
          <span className="text-[10px] font-black text-emerald-900 uppercase tracking-widest block">ESTIMATED NET PROFIT</span>
          <span className="font-street text-3xl font-black text-emerald-800">₹{profitAndExpenses.netProfit.toLocaleString('en-IN')}</span>
          <span className="text-emerald-800 text-[10px] font-bold block">After COGS, Tax & Fees</span>
        </div>

      </div>

      {/* 📈 INTERACTIVE REVENUE & ORDERS CHART */}
      <div className="bg-white p-6 rounded-3xl border border-amber-300 shadow-xl space-y-4">
        <div className="flex justify-between items-center border-b border-amber-100 pb-3">
          <div>
            <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest">REAL-TIME TIME-SERIES</span>
            <h3 className="font-street text-2xl font-black text-slate-900 uppercase">7-DAY REVENUE & ORDER TRENDS</h3>
          </div>
          <span className="text-xs font-extrabold text-red-800 uppercase">📊 Interactive SVG Chart</span>
        </div>

        {/* SVG Line & Bar Chart */}
        <div className="h-56 w-full relative flex items-end justify-between gap-4 pt-8 px-4 border-b border-amber-100">
          {dailyChartData.map((pt: any, idx: number) => {
            const maxRev = Math.max(...dailyChartData.map((d: any) => d.revenue), 30000);
            const heightPct = Math.max(15, Math.round((pt.revenue / maxRev) * 100));

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[10px] font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                  ₹{pt.revenue.toLocaleString('en-IN')}
                </span>
                <div
                  style={{ height: `${heightPct}%` }}
                  className="w-full max-w-[48px] bg-gradient-to-t from-red-900 to-amber-500 rounded-t-xl transition-all duration-500 shadow hover:brightness-110"
                ></div>
                <span className="text-[10px] font-black uppercase text-slate-600">{pt.date}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 📊 ORDER STATISTICS & 🧾 GST TAXES SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 📊 Order Statistics Breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-amber-300 shadow-xl space-y-4">
          <div className="border-b border-amber-100 pb-3">
            <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest">FULFILLMENT PIPELINE</span>
            <h3 className="font-street text-2xl font-black text-slate-900 uppercase">📊 ORDER STATUS STATISTICS</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200">
              <span className="text-slate-600 font-bold block">Pending</span>
              <span className="font-street text-xl font-black text-amber-900">{orderStats.pending}</span>
            </div>
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200">
              <span className="text-slate-600 font-bold block">Confirmed</span>
              <span className="font-street text-xl font-black text-blue-900">{orderStats.confirmed}</span>
            </div>
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200">
              <span className="text-slate-600 font-bold block">Processing</span>
              <span className="font-street text-xl font-black text-indigo-900">{orderStats.processing}</span>
            </div>
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200">
              <span className="text-slate-600 font-bold block">Packed</span>
              <span className="font-street text-xl font-black text-purple-900">{orderStats.packed}</span>
            </div>
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200">
              <span className="text-slate-600 font-bold block">Shipped</span>
              <span className="font-street text-xl font-black text-amber-800">{orderStats.shipped}</span>
            </div>
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-300">
              <span className="text-emerald-800 font-bold block">Delivered</span>
              <span className="font-street text-xl font-black text-emerald-800">{orderStats.delivered}</span>
            </div>
            <div className="p-3 bg-red-50 rounded-2xl border border-red-200">
              <span className="text-red-800 font-bold block">Cancelled</span>
              <span className="font-street text-xl font-black text-red-800">{orderStats.cancelled}</span>
            </div>
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200">
              <span className="text-amber-900 font-bold block">Returned</span>
              <span className="font-street text-xl font-black text-amber-900">{orderStats.returned}</span>
            </div>
            <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200">
              <span className="text-purple-900 font-bold block">Refunded</span>
              <span className="font-street text-xl font-black text-purple-900">{orderStats.refunded}</span>
            </div>
          </div>
        </div>

        {/* 🧾 GST & Taxes Summary */}
        <div className="bg-white p-6 rounded-3xl border border-amber-300 shadow-xl space-y-4">
          <div className="border-b border-amber-100 pb-3 flex justify-between items-center">
            <div>
              <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest">INDIAN TEXTILE TAXES</span>
              <h3 className="font-street text-2xl font-black text-slate-900 uppercase">🧾 GST & TAX BREAKDOWN (5%)</h3>
            </div>
            <button onClick={() => handleExportReport('GST', 'csv')} className="p-2 bg-amber-100 rounded-xl text-red-800 font-bold text-xs">
              <Download className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
            <div className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200">
              <span className="text-slate-600 block text-[10px] uppercase font-bold">Taxable Revenue</span>
              <span className="font-street text-xl font-black text-slate-900">₹{gst.taxableRevenue.toLocaleString('en-IN')}</span>
            </div>
            <div className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200">
              <span className="text-slate-600 block text-[10px] uppercase font-bold">Total GST Collected</span>
              <span className="font-street text-xl font-black text-red-800">₹{gst.totalGstCollected.toLocaleString('en-IN')}</span>
            </div>
            <div className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200">
              <span className="text-slate-600 block text-[10px] uppercase font-bold">CGST (2.5%)</span>
              <span className="font-street text-xl font-black text-red-800">₹{gst.cgst.toLocaleString('en-IN')}</span>
            </div>
            <div className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200">
              <span className="text-slate-600 block text-[10px] uppercase font-bold">SGST (2.5%)</span>
              <span className="font-street text-xl font-black text-red-800">₹{gst.sgst.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

      </div>

      {/* 💵 PROFIT & LOSS STATEMENT (P&L BREAKDOWN) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-300 shadow-xl space-y-4">
        <div className="border-b border-amber-100 pb-3 flex justify-between items-center">
          <div>
            <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest">FINANCIAL STATEMENT</span>
            <h3 className="font-street text-2xl font-black text-slate-900 uppercase">💵 PROFIT & LOSS (P&L) STATEMENT</h3>
          </div>
          <button onClick={() => handleExportReport('ProfitLoss', 'csv')} className="px-4 py-2 bg-slate-900 text-amber-300 font-black text-xs uppercase rounded-xl shadow flex items-center gap-1 border border-amber-300">
            <Download className="w-4 h-4 text-amber-400" /> Export P&L
          </button>
        </div>

        <div className="space-y-2 text-xs font-bold">
          <div className="flex justify-between items-center p-3 bg-amber-50 rounded-xl">
            <span className="text-slate-700">Gross Revenue (Inflow)</span>
            <span className="text-slate-900 font-extrabold text-sm">₹{profitAndExpenses.grossRevenue.toLocaleString('en-IN')}</span>
          </div>

          <div className="flex justify-between items-center p-2.5 border-b border-slate-100 text-slate-600">
            <span>(-) Production & Weave COGS (40%)</span>
            <span className="text-red-700">- ₹{profitAndExpenses.cogs.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between items-center p-2.5 border-b border-slate-100 text-slate-600">
            <span>(-) Shipping & Courier Charges</span>
            <span className="text-red-700">- ₹{profitAndExpenses.shippingCharges.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between items-center p-2.5 border-b border-slate-100 text-slate-600">
            <span>(-) Razorpay / Payment Gateway Fees (2%)</span>
            <span className="text-red-700">- ₹{profitAndExpenses.gatewayFees.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between items-center p-2.5 border-b border-slate-100 text-slate-600">
            <span>(-) GST Tax Output Liability</span>
            <span className="text-red-700">- ₹{profitAndExpenses.totalGstCollected.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between items-center p-2.5 border-b border-slate-100 text-slate-600">
            <span>(-) Customer Coupon Discounts & Offers</span>
            <span className="text-red-700">- ₹{profitAndExpenses.totalDiscounts.toLocaleString('en-IN')}</span>
          </div>

          <div className="flex justify-between items-center p-4 bg-emerald-50 rounded-2xl border border-emerald-300 text-emerald-900 text-sm mt-3">
            <span className="font-black uppercase">(=) NET OPERATING PROFIT</span>
            <span className="font-street text-2xl font-black text-emerald-800">₹{profitAndExpenses.netProfit.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

    </div>
  );
};
