import React, { useEffect, useState } from 'react';
import { ArrowLeft, Package, Download, Search, TrendingUp, Layers, Tag } from 'lucide-react';
import { api } from '../../services/api';
import { showToast } from '../../components/ToastContainer';

interface ProductUnitsAnalyticsPageProps {
  onBack?: () => void;
}

export const ProductUnitsAnalyticsPage: React.FC<ProductUnitsAnalyticsPageProps> = ({ onBack }) => {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    api
      .get('/products')
      .then((res) => setProducts(res.data?.products || []))
      .catch(() => showToast('Failed to load products', 'error'));
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
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-800">SAREE CATALOG MOVEMENTS</span>
            <h1 className="font-street text-3xl font-black text-slate-900 uppercase">📦 UNITS SOLD & PRODUCT ANALYTICS</h1>
          </div>
        </div>

        <button onClick={() => showToast('Exporting Product Sales CSV...', 'info')} className="px-4 py-2.5 bg-red-800 text-amber-300 font-black text-xs uppercase rounded-xl border border-amber-300 flex items-center gap-1.5 shadow">
          <Download className="w-4 h-4" /> Export Units Report
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-amber-300 shadow space-y-1">
          <span className="text-[10px] font-black text-amber-800 uppercase block">UNITS SOLD TODAY</span>
          <span className="font-street text-3xl font-black text-red-800">14 Units</span>
          <span className="text-emerald-700 text-[10px] font-bold block">Artisan Saree Weaves</span>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-amber-300 shadow space-y-1">
          <span className="text-[10px] font-black text-amber-800 uppercase block">UNITS SOLD THIS WEEK</span>
          <span className="font-street text-3xl font-black text-slate-900">86 Units</span>
          <span className="text-slate-500 text-[10px] font-bold block">7-Day Trailing</span>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-amber-300 shadow space-y-1">
          <span className="text-[10px] font-black text-amber-800 uppercase block">TOP CATEGORY BY UNITS</span>
          <span className="font-street text-xl font-black text-slate-900">Banarasi Silk</span>
          <span className="text-amber-800 text-[10px] font-bold block">38% Total Share</span>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-amber-300 shadow space-y-1">
          <span className="text-[10px] font-black text-amber-800 uppercase block">WAREHOUSE STOCK MOVEMENT</span>
          <span className="font-street text-3xl font-black text-emerald-800">High Demand</span>
          <span className="text-emerald-700 text-[10px] font-bold block">Inventory Turnover: 4.2x</span>
        </div>
      </div>

      {/* Category Wise Sales Breakdown */}
      <div className="bg-white p-6 rounded-3xl border border-amber-300 shadow-xl space-y-4">
        <h3 className="font-street text-2xl font-black text-slate-900 uppercase">CATEGORY WISE SALES & UNITS DISTRIBUTION</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-bold">
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-1">
            <span className="text-amber-800 block text-[10px] uppercase font-black">Banarasi Silk Sarees</span>
            <span className="font-street text-xl font-black text-slate-900">42 Units (₹1,48,000)</span>
          </div>
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-1">
            <span className="text-amber-800 block text-[10px] uppercase font-black">Kanchipuram Silk Sarees</span>
            <span className="font-street text-xl font-black text-slate-900">28 Units (₹1,12,000)</span>
          </div>
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-1">
            <span className="text-amber-800 block text-[10px] uppercase font-black">Paithani Silk Sarees</span>
            <span className="font-street text-xl font-black text-slate-900">18 Units (₹95,000)</span>
          </div>
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-1">
            <span className="text-amber-800 block text-[10px] uppercase font-black">Organza & Linen Sarees</span>
            <span className="font-street text-xl font-black text-slate-900">15 Units (₹48,000)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
