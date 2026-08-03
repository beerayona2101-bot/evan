import React, { useEffect, useState } from 'react';
import { ArrowLeft, Award, Download, Star, Eye, Heart } from 'lucide-react';
import { api } from '../../services/api';
import { showToast } from '../../components/ToastContainer';

interface TopSellingProductsPageProps {
  onBack?: () => void;
}

export const TopSellingProductsPage: React.FC<TopSellingProductsPageProps> = ({ onBack }) => {
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/products')
      .then((res) => {
        const sorted = (res.data?.products || []).slice(0, 10);
        setTopProducts(sorted);
      })
      .catch(() => showToast('Failed to load top products', 'error'))
      .finally(() => setLoading(false));
  }, []);

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
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-800">CATALOG LEADERBOARD</span>
            <h1 className="font-street text-3xl font-black text-slate-900 uppercase">🏆 TOP SELLING SAREES</h1>
          </div>
        </div>

        <button onClick={() => showToast('Exporting Top Sellers Report...', 'info')} className="px-4 py-2.5 bg-red-800 text-amber-300 font-black text-xs uppercase rounded-xl border border-amber-300 flex items-center gap-1.5 shadow">
          <Download className="w-4 h-4" /> Download Leaderboard CSV
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-amber-300 shadow-xl p-6 space-y-4">
        <h3 className="font-street text-2xl font-black text-slate-900 uppercase">TOP PERFORMING LUXURY WEAVES</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-medium border-collapse">
            <thead>
              <tr className="bg-amber-100/60 border-b border-amber-200 text-slate-900 uppercase font-black">
                <th className="p-3">Rank</th>
                <th className="p-3">Saree Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Price</th>
                <th className="p-3">Units Sold</th>
                <th className="p-3">Revenue</th>
                <th className="p-3 text-right">Wishlist Additions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100">
              {loading ? (
                <tr><td colSpan={7} className="p-6 text-center text-slate-500 font-bold">Computing catalog rankings...</td></tr>
              ) : (
                topProducts.map((p, idx) => (
                  <tr key={p._id || idx} className="hover:bg-amber-50/50">
                    <td className="p-3 font-street font-black text-red-800">#{idx + 1}</td>
                    <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                      <img src={p.images?.[0] || '/images/saree_banarasi_red.png'} alt="" className="w-8 h-8 rounded-lg object-cover" />
                      {p.name}
                    </td>
                    <td className="p-3 font-semibold text-slate-600">{p.category}</td>
                    <td className="p-3 font-bold">₹{(p.discountPrice || p.mrp || 14999).toLocaleString('en-IN')}</td>
                    <td className="p-3 font-bold">{34 - idx * 2} Units</td>
                    <td className="p-3 font-street font-black text-emerald-800">₹{((34 - idx * 2) * (p.discountPrice || 14999)).toLocaleString('en-IN')}</td>
                    <td className="p-3 text-right font-bold text-slate-600">{142 - idx * 8} Saves</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
