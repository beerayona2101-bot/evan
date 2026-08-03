import React, { useEffect, useState } from 'react';
import { ArrowLeft, Users, Award, TrendingUp, Search, Download, ShieldCheck, Heart } from 'lucide-react';
import { api } from '../../services/api';
import { showToast } from '../../components/ToastContainer';

interface CustomerAnalyticsPageProps {
  onBack?: () => void;
}

export const CustomerAnalyticsPage: React.FC<CustomerAnalyticsPageProps> = ({ onBack }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/users')
      .then((res) => setUsers(res.data || []))
      .catch(() => showToast('Failed to load customers', 'error'))
      .finally(() => setLoading(false));
  }, []);

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
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-800">CUSTOMER INTELLIGENCE ENGINE</span>
            <h1 className="font-street text-3xl font-black text-slate-900 uppercase">👥 CUSTOMER ANALYTICS & CLV</h1>
          </div>
        </div>

        <button onClick={() => showToast('Exporting Customer Report...', 'info')} className="px-4 py-2.5 bg-red-800 text-amber-300 font-black text-xs uppercase rounded-xl border border-amber-300 flex items-center gap-1.5 shadow">
          <Download className="w-4 h-4" /> Export Customer CRM
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-amber-300 shadow space-y-1">
          <span className="text-[10px] font-black text-amber-800 uppercase block">NEW CUSTOMERS TODAY</span>
          <span className="font-street text-3xl font-black text-slate-900">4 New</span>
          <span className="text-emerald-700 text-[10px] font-bold block">Verified Accounts</span>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-amber-300 shadow space-y-1">
          <span className="text-[10px] font-black text-amber-800 uppercase block">RETURNING BUYERS</span>
          <span className="font-street text-3xl font-black text-red-800">68%</span>
          <span className="text-slate-500 text-[10px] font-bold block">Repeat Weave Purchases</span>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-amber-300 shadow space-y-1">
          <span className="text-[10px] font-black text-amber-800 uppercase block">VIP CUSTOMERS</span>
          <span className="font-street text-3xl font-black text-amber-900">18 Buyers</span>
          <span className="text-amber-800 text-[10px] font-bold block">Spend &gt; ₹30,000</span>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-amber-300 shadow space-y-1">
          <span className="text-[10px] font-black text-amber-800 uppercase block">AVG LIFETIME VALUE (CLV)</span>
          <span className="font-street text-3xl font-black text-emerald-800">₹40,600</span>
          <span className="text-emerald-700 text-[10px] font-bold block">Estimated Lifetime Spend</span>
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="bg-white rounded-3xl border border-amber-300 shadow-xl p-6 space-y-4">
        <h3 className="font-street text-2xl font-black text-slate-900 uppercase">HIGH-VALUE VIP CUSTOMER SPENDERS</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-medium border-collapse">
            <thead>
              <tr className="bg-amber-100/60 border-b border-amber-200 text-slate-900 uppercase font-black">
                <th className="p-3">Customer Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Tier</th>
                <th className="p-3">Total Spend</th>
                <th className="p-3">Orders Count</th>
                <th className="p-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100">
              {[
                { name: 'Ananya Sharma', email: 'ananya@example.com', tier: 'GOLD VIP', spend: '₹68,900', orders: 4 },
                { name: 'Priya Iyer', email: 'priya.iyer@example.com', tier: 'PLATINUM VIP', spend: '₹54,200', orders: 3 },
                { name: 'Meera Rajput', email: 'meera.r@example.com', tier: 'GOLD VIP', spend: '₹48,000', orders: 3 },
                { name: 'Sunita Reddy', email: 'sunita.reddy@example.com', tier: 'SILVER', spend: '₹32,500', orders: 2 },
              ].map((c, i) => (
                <tr key={i} className="hover:bg-amber-50/50">
                  <td className="p-3 font-bold text-slate-900">{c.name}</td>
                  <td className="p-3 text-slate-600 font-semibold">{c.email}</td>
                  <td className="p-3 font-black text-amber-800">{c.tier}</td>
                  <td className="p-3 font-street font-black text-red-800">{c.spend}</td>
                  <td className="p-3 font-bold">{c.orders} Orders</td>
                  <td className="p-3 text-right"><span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full uppercase">Active</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
