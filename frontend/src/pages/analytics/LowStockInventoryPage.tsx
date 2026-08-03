import React, { useEffect, useState } from 'react';
import { ArrowLeft, AlertTriangle, Download, Package } from 'lucide-react';
import { api } from '../../services/api';
import { showToast } from '../../components/ToastContainer';

interface LowStockInventoryPageProps {
  onBack?: () => void;
}

export const LowStockInventoryPage: React.FC<LowStockInventoryPageProps> = ({ onBack }) => {
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/products')
      .then((res) => {
        const items = (res.data?.products || []).filter((p: any) => p.stock <= 5);
        setLowStockItems(items);
      })
      .catch(() => showToast('Failed to load low stock items', 'error'))
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
            <span className="text-[10px] font-black uppercase tracking-widest text-red-800">WAREHOUSE REORDER ALERTS</span>
            <h1 className="font-street text-3xl font-black text-slate-900 uppercase">⚠️ LOW STOCK WAREHOUSE INVENTORY</h1>
          </div>
        </div>

        <button onClick={() => showToast('Exporting Low Stock Report...', 'info')} className="px-4 py-2.5 bg-red-800 text-amber-300 font-black text-xs uppercase rounded-xl border border-amber-300 flex items-center gap-1.5 shadow">
          <Download className="w-4 h-4" /> Download Reorder CSV
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-amber-300 shadow-xl p-6 space-y-4">
        <h3 className="font-street text-2xl font-black text-slate-900 uppercase">PRODUCTS REQUIRING IMMEDIATE WEAVE REORDER</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-medium border-collapse">
            <thead>
              <tr className="bg-amber-100/60 border-b border-amber-200 text-slate-900 uppercase font-black">
                <th className="p-3">Saree Name</th>
                <th className="p-3">SKU</th>
                <th className="p-3">Category</th>
                <th className="p-3">Remaining Stock</th>
                <th className="p-3">Reorder Threshold</th>
                <th className="p-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100">
              {loading ? (
                <tr><td colSpan={6} className="p-6 text-center text-slate-500 font-bold">Checking warehouse stock levels...</td></tr>
              ) : lowStockItems.length === 0 ? (
                <tr><td colSpan={6} className="p-6 text-center text-slate-500 font-bold">All saree weaves are adequately stocked in warehouse.</td></tr>
              ) : (
                lowStockItems.map((p, idx) => (
                  <tr key={p._id || idx} className="hover:bg-amber-50/50">
                    <td className="p-3 font-bold text-slate-900">{p.name}</td>
                    <td className="p-3 font-mono font-bold text-amber-800">{p.sku || `EVAN-SKU-${idx + 1}`}</td>
                    <td className="p-3 font-semibold text-slate-600">{p.category}</td>
                    <td className="p-3 font-street font-black text-red-800">{p.stock} Units</td>
                    <td className="p-3 font-bold">5 Units</td>
                    <td className="p-3 text-right">
                      <span className="px-2.5 py-0.5 bg-red-100 text-red-800 text-[10px] font-black rounded-full uppercase border border-red-300">
                        REORDER NOW
                      </span>
                    </td>
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
