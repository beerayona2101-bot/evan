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

  const revenueCards = data?.revenueCards || (data?.kpis ? {
    grossRevenue: data.kpis.grossRevenue || 0,
    netRevenue: data.kpis.netRevenue || 0,
    totalSales: data.kpis.successfulOrders || 0,
    totalOrders: data.kpis.totalOrders || 0,
    aov: data.kpis.avgOrderValue || 0,
    totalCustomers: data.kpis.totalCustomers || 100,
    totalProductsSold: data.kpis.totalProductsSold || 0,
    returnedAmount: data.kpis.returnedAmount || 0,
  } : {
    grossRevenue: 0,
    netRevenue: 0,
    totalSales: 0,
    totalOrders: 0,
    aov: 0,
    totalCustomers: 0,
    totalProductsSold: 0,
    returnedAmount: 0,
  });

  const orderStats = data?.orderStats || {
    pending: 0,
    confirmed: 0,
    processing: 0,
    packed: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    returned: 0,
    refunded: 0,
    failedPayments: 0,
  };

  const gst = data?.gst || {
    cgst: 0,
    sgst: 0,
    igst: 0,
    totalGstCollected: 0,
    taxableRevenue: 0,
    nonTaxableRevenue: 0,
    gstPayable: 0,
    gstPaid: 0,
    pendingGst: 0,
  };

  const paymentMethods = data?.paymentMethods || {
    razorpay: 0,
    cod: 0,
    upi: 0,
    creditCard: 0,
    debitCard: 0,
    netBanking: 0,
    wallet: 0,
    failed: 0,
    pending: 0,
    refunded: 0,
  };

  const profitAndExpenses = data?.profitAndExpenses || {
    grossRevenue: revenueCards.grossRevenue || 0,
    grossProfit: Math.round((revenueCards.grossRevenue || 0) * 0.6),
    netProfit: Math.round((revenueCards.grossRevenue || 0) * 0.55),
    cogs: Math.round((revenueCards.grossRevenue || 0) * 0.4),
    shippingCharges: 0,
    gatewayFees: 0,
    totalDiscounts: 0,
    totalExpenses: Math.round((revenueCards.grossRevenue || 0) * 0.45),
    refundedAmount: 0,
    platformCharges: 0,
  };

  const productSales = data?.productSales || {
    bestSellingSarees: [],
    leastSellingSarees: [],
    categorySalesMap: {},
    lowStockProducts: [],
  };

  const customerRevenue = data?.customerRevenue || {
    vipCustomers: [],
    averageCustomerSpend: 0,
    clv: 0,
  };

  const shippingAnalytics = data?.shippingAnalytics || {
    freeShippingOrdersCount: 0,
    shippingRevenueCollected: 0,
  };

  const dailyChartData = data?.dailyChartData || data?.revenueChart || [];
  const alerts = data?.alerts || [];

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
        <div className="flex flex-wrap items-center gap-3">
          {/* FIRST PLACE: Period Filter Pill Dropdown */}
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-5 py-2.5 bg-amber-50 hover:bg-amber-100/80 border-2 border-amber-400 rounded-full font-bold text-xs text-amber-900 shadow-sm outline-none cursor-pointer"
          >
            <option value="today">Today</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="thisMonth">This Month</option>
            <option value="lastMonth">Last Month</option>
            <option value="thisYear">This Year</option>
          </select>

          {/* Payment Methods Dropdown */}
          <select
            value={paymentMethodFilter}
            onChange={(e) => setPaymentMethodFilter(e.target.value)}
            className="px-5 py-2.5 bg-amber-50 hover:bg-amber-100/80 border-2 border-amber-400 rounded-full font-bold text-xs text-slate-900 shadow-sm outline-none cursor-pointer"
          >
            <option value="ALL">All Payment Methods</option>
            <option value="Razorpay">Razorpay / Online</option>
            <option value="COD">Cash on Delivery (COD)</option>
            <option value="UPI">UPI Payment</option>
            <option value="Credit Card">Credit Card</option>
          </select>

          {/* Order Statuses Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-5 py-2.5 bg-amber-50 hover:bg-amber-100/80 border-2 border-amber-400 rounded-full font-bold text-xs text-slate-900 shadow-sm outline-none cursor-pointer"
          >
            <option value="ALL">All Order Statuses</option>
            <option value="Delivered">Delivered</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Refunded">Refunded</option>
          </select>
        </div>

        <div className="text-xs font-black text-slate-700 uppercase tracking-wide">
          FILTER APPLIED: <span className="text-red-800">{period}</span>
        </div>
      </div>

      {/* 🔔 Automated Financial Alerts */}
      {alerts && alerts.filter((al: any) => !al.title?.toLowerCase().includes('stock')).length > 0 && (
        <div className="space-y-2">
          {alerts.filter((al: any) => !al.title?.toLowerCase().includes('stock')).map((al: any, idx: number) => (
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

      {/* 💰 EXACT 5 METRIC CARDS IN SINGLE ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        
        {/* Card 1: TOTAL EARNINGS */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-amber-300 shadow-md space-y-1">
          <span className="text-xs font-black text-amber-800 uppercase tracking-tight block leading-tight">
            TOTAL EARNINGS
          </span>
          <span className="font-street text-xl sm:text-2xl font-black text-slate-900 block whitespace-nowrap">
            ₹{(revenueCards?.grossRevenue || 0).toLocaleString('en-IN')}
          </span>
          <span className="text-emerald-700 text-[10px] font-bold block flex items-center gap-1 whitespace-nowrap">
            <TrendingUp className="w-3.5 h-3.5 flex-shrink-0" /> Order Inflow
          </span>
        </div>

        {/* Card 2: ESTIMATED NET PROFIT */}
        <div className="bg-amber-50/60 p-4 sm:p-5 rounded-3xl border-2 border-emerald-600 shadow-md space-y-1">
          <span className="text-xs font-black text-emerald-900 uppercase tracking-tight block leading-tight">
            ESTIMATED NET PROFIT
          </span>
          <span className="font-street text-xl sm:text-2xl font-black text-emerald-800 block whitespace-nowrap">
            ₹{(profitAndExpenses?.netProfit || Math.round((revenueCards?.grossRevenue || 0) * 0.55)).toLocaleString('en-IN')}
          </span>
          <span className="text-emerald-800 text-[10px] font-bold block whitespace-nowrap">After COGS & Tax</span>
        </div>

        {/* Card 3: TOTAL COMPLETED SALES */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-amber-300 shadow-md space-y-1">
          <span className="text-xs font-black text-amber-800 uppercase tracking-tight block leading-tight">
            TOTAL COMPLETED SALES
          </span>
          <span className="font-street text-xl sm:text-2xl font-black text-slate-900 block whitespace-nowrap">
            {revenueCards?.totalSales || 0} Sales
          </span>
          <span className="text-emerald-700 text-[10px] font-bold block whitespace-nowrap">Delivered Sarees</span>
        </div>

        {/* Card 4: TOTAL ORDERS */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-amber-300 shadow-md space-y-1">
          <span className="text-xs font-black text-amber-800 uppercase tracking-tight block leading-tight">
            TOTAL ORDERS
          </span>
          <span className="font-street text-xl sm:text-2xl font-black text-slate-900 block whitespace-nowrap">
            {revenueCards?.totalOrders || 0} Orders
          </span>
          <span className="text-slate-500 text-[10px] font-bold block whitespace-nowrap">Period Volume</span>
        </div>

        {/* Card 5: RETURNED AMOUNT */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-amber-300 shadow-md space-y-1">
          <span className="text-xs font-black text-amber-800 uppercase tracking-tight block leading-tight">
            RETURNED AMOUNT
          </span>
          <span className="font-street text-xl sm:text-2xl font-black text-red-800 block whitespace-nowrap">
            ₹{(revenueCards?.returnedAmount || profitAndExpenses?.refundedAmount || 0).toLocaleString('en-IN')}
          </span>
          <span className="text-slate-500 text-[10px] font-bold block whitespace-nowrap">Refunds & Returns</span>
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

        {/* 📈 Smooth SVG Line Graph Component (Replaces Bar Poles) */}
        {(() => {
          const chartPoints = dailyChartData && dailyChartData.length > 0 ? dailyChartData : [
            { date: 'MON', revenue: 14500, orders: 4 },
            { date: 'TUE', revenue: 18200, orders: 5 },
            { date: 'WED', revenue: 12900, orders: 3 },
            { date: 'THU', revenue: 21400, orders: 6 },
            { date: 'FRI', revenue: 28900, orders: 8 },
            { date: 'SAT', revenue: 34500, orders: 11 },
            { date: 'SUN', revenue: 48900, orders: 15 },
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
            <div className="space-y-3">
              <div className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-b from-amber-50/70 via-white to-amber-50/30 p-4 border border-amber-200 shadow-inner">
                <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-56 overflow-visible">
                  <defs>
                    <linearGradient id="lineGraphGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.4" />
                      <stop offset="50%" stopColor="#EF4444" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#FFFDF9" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#B45309" />
                      <stop offset="50%" stopColor="#DC2626" />
                      <stop offset="100%" stopColor="#991B1B" />
                    </linearGradient>
                    <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#B45309" floodOpacity="0.3" />
                    </filter>
                  </defs>

                  {/* Horizontal Guide Lines */}
                  <line x1={padX} y1={padY} x2={svgWidth - padX} y2={padY} stroke="#FDE68A" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1={padX} y1={svgHeight / 2} x2={svgWidth - padX} y2={svgHeight / 2} stroke="#FDE68A" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1={padX} y1={svgHeight - padY} x2={svgWidth - padX} y2={svgHeight - padY} stroke="#FDE68A" strokeWidth="1" />

                  {/* Area Fill */}
                  <path d={areaD} fill="url(#lineGraphGradient)" />

                  {/* Curved Trend Line */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke="url(#strokeGradient)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#glowEffect)"
                  />

                  {/* Data Dots & Value Labels */}
                  {coords.map((c: any, i: number) => (
                    <g key={i} className="group cursor-pointer">
                      <circle
                        cx={c.x}
                        cy={c.y}
                        r="8"
                        className="fill-amber-400 opacity-20 group-hover:opacity-80 group-hover:scale-125 transition-all duration-300"
                      />
                      <circle
                        cx={c.x}
                        cy={c.y}
                        r="4.5"
                        className="fill-red-800 stroke-white stroke-2 group-hover:fill-amber-500 transition-colors"
                      />
                      <text
                        x={c.x}
                        y={c.y - 12}
                        textAnchor="middle"
                        className="text-[10px] font-black fill-slate-900 font-sans shadow-sm group-hover:fill-red-800 transition-colors"
                      >
                        ₹{(c.pt.revenue || 0).toLocaleString('en-IN')}
                      </text>
                    </g>
                  ))}
                </svg>

                {/* X-Axis Labels */}
                <div className="flex justify-between items-center px-6 pt-2 border-t border-amber-200/80 text-[11px] font-black text-amber-950 uppercase">
                  {coords.map((c: any, i: number) => (
                    <span key={i} className="hover:text-red-800 transition-colors">
                      {c.pt.date}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* 🧾 GST & TAXES SUMMARY */}
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

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-semibold">
          <div className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200">
            <span className="text-slate-600 block text-[10px] uppercase font-bold">Taxable Revenue</span>
            <span className="font-street text-xl font-black text-slate-900">₹{(gst?.taxableRevenue || 0).toLocaleString('en-IN')}</span>
          </div>
          <div className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200">
            <span className="text-slate-600 block text-[10px] uppercase font-bold">Total GST Collected</span>
            <span className="font-street text-xl font-black text-red-800">₹{(gst?.totalGstCollected || 0).toLocaleString('en-IN')}</span>
          </div>
          <div className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200">
            <span className="text-slate-600 block text-[10px] uppercase font-bold">CGST (2.5%)</span>
            <span className="font-street text-xl font-black text-red-800">₹{(gst?.cgst || 0).toLocaleString('en-IN')}</span>
          </div>
          <div className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200">
            <span className="text-slate-600 block text-[10px] uppercase font-bold">SGST (2.5%)</span>
            <span className="font-street text-xl font-black text-red-800">₹{(gst?.sgst || 0).toLocaleString('en-IN')}</span>
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
            <span className="text-slate-900 font-extrabold text-sm">₹{(profitAndExpenses?.grossRevenue || 0).toLocaleString('en-IN')}</span>
          </div>

          <div className="flex justify-between items-center p-2.5 border-b border-slate-100 text-slate-600">
            <span>(-) Production & Weave COGS (40%)</span>
            <span className="text-red-700">- ₹{(profitAndExpenses?.cogs || 0).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between items-center p-2.5 border-b border-slate-100 text-slate-600">
            <span>(-) Shipping & Courier Charges</span>
            <span className="text-red-700">- ₹{(profitAndExpenses?.shippingCharges || 0).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between items-center p-2.5 border-b border-slate-100 text-slate-600">
            <span>(-) Razorpay / Payment Gateway Fees (2%)</span>
            <span className="text-red-700">- ₹{(profitAndExpenses?.gatewayFees || 0).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between items-center p-2.5 border-b border-slate-100 text-slate-600">
            <span>(-) GST Tax Output Liability</span>
            <span className="text-red-700">- ₹{(profitAndExpenses?.totalGstCollected || gst?.totalGstCollected || 0).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between items-center p-2.5 border-b border-slate-100 text-slate-600">
            <span>(-) Customer Coupon Discounts & Offers</span>
            <span className="text-red-700">- ₹{(profitAndExpenses?.totalDiscounts || 0).toLocaleString('en-IN')}</span>
          </div>

          <div className="flex justify-between items-center p-4 bg-emerald-50 rounded-2xl border border-emerald-300 text-emerald-900 text-sm mt-3">
            <span className="font-black uppercase">(=) NET OPERATING PROFIT</span>
            <span className="font-street text-2xl font-black text-emerald-800">₹{(profitAndExpenses?.netProfit || 0).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

    </div>
  );
};
