import React, { useEffect, useState } from 'react';
import { ArrowLeft, DollarSign, Download, TrendingUp, Percent, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';
import { showToast } from '../../components/ToastContainer';

interface NetProfitAnalyticsPageProps {
  onBack?: () => void;
}

export const NetProfitAnalyticsPage: React.FC<NetProfitAnalyticsPageProps> = ({ onBack }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/analytics/revenue?period=thisMonth')
      .then((res) => setData(res.data))
      .catch(() => showToast('Failed to load profit analytics', 'error'))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return <div className="min-h-[50vh] flex items-center justify-center p-8"><div className="w-10 h-10 border-4 border-amber-400 border-t-red-800 rounded-full animate-spin"></div></div>;
  }

<<<<<<< HEAD
  const { profitAndExpenses } = data;
=======
  const profitAndExpenses = data?.profitAndExpenses || {
    grossRevenue: 0,
    grossProfit: 0,
    netProfit: 0,
    cogs: 0,
    shippingCharges: 0,
    gatewayFees: 0,
    totalGstCollected: 0,
    totalDiscounts: 0,
    totalExpenses: 0,
    refundedAmount: 0,
    platformCharges: 0,
  };
  if (profitAndExpenses.totalGstCollected === undefined) {
    profitAndExpenses.totalGstCollected = data?.gst?.totalGstCollected || Math.round((profitAndExpenses.grossRevenue || 0) * 0.05);
  }
>>>>>>> e82de53 (color and ui changed)

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
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800">PROFIT MARGIN ANALYSIS</span>
            <h1 className="font-street text-3xl font-black text-slate-900 uppercase">💵 NET PROFIT & EXPENSES P&L</h1>
          </div>
        </div>

        <button onClick={() => showToast('Exporting Profit & Loss CSV...', 'info')} className="px-4 py-2.5 bg-slate-900 text-amber-300 font-black text-xs uppercase rounded-xl border border-amber-300 flex items-center gap-1.5 shadow">
          <Download className="w-4 h-4 text-amber-400" /> Export P&L Report
        </button>
      </div>

      {/* Main P&L Deduction Waterfall */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-300 shadow-xl space-y-4">
        <h3 className="font-street text-2xl font-black text-slate-900 uppercase border-b border-amber-100 pb-3">NET PROFIT DEDUCTION WATERFALL</h3>
        
        <div className="space-y-3 text-xs font-bold">
          <div className="flex justify-between items-center p-3 bg-amber-50 rounded-xl text-sm">
            <span className="text-slate-800 font-black">Gross Revenue Inflow</span>
            <span className="text-slate-900 font-street font-black text-lg">₹{profitAndExpenses.grossRevenue.toLocaleString('en-IN')}</span>
          </div>

          <div className="flex justify-between items-center p-2.5 border-b border-slate-100 text-slate-600">
            <span>(-) Production & Weaving COGS (40%)</span>
            <span className="text-red-700 font-bold">- ₹{profitAndExpenses.cogs.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between items-center p-2.5 border-b border-slate-100 text-slate-600">
            <span>(-) Shipping & Logistics Charges</span>
            <span className="text-red-700 font-bold">- ₹{profitAndExpenses.shippingCharges.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between items-center p-2.5 border-b border-slate-100 text-slate-600">
            <span>(-) Razorpay Gateway Charges (2%)</span>
            <span className="text-red-700 font-bold">- ₹{profitAndExpenses.gatewayFees.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between items-center p-2.5 border-b border-slate-100 text-slate-600">
            <span>(-) GST Output Tax Liability (5%)</span>
            <span className="text-red-700 font-bold">- ₹{profitAndExpenses.totalGstCollected.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between items-center p-2.5 border-b border-slate-100 text-slate-600">
            <span>(-) Customer Discounts & Coupons</span>
            <span className="text-red-700 font-bold">- ₹{profitAndExpenses.totalDiscounts.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between items-center p-2.5 border-b border-slate-100 text-slate-600">
            <span>(-) Refunds & Returns Deductions</span>
            <span className="text-red-700 font-bold">- ₹{profitAndExpenses.refundedAmount.toLocaleString('en-IN')}</span>
          </div>

          <div className="flex justify-between items-center p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-400 text-emerald-900 mt-4">
            <span className="font-black text-sm uppercase">(=) NET PROFIT MARGIN</span>
            <span className="font-street text-3xl font-black text-emerald-800">₹{profitAndExpenses.netProfit.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
