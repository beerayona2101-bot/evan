import React, { useEffect, useState } from 'react';
import { ArrowLeft, Download, Search, Filter, FileText, CheckCircle, Clock, Truck, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import { showToast } from '../../components/ToastContainer';

interface TodayOrdersPageProps {
  onBack?: () => void;
}

export const TodayOrdersPage: React.FC<TodayOrdersPageProps> = ({ onBack }) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchTodayOrders = () => {
    setLoading(true);
    api
      .get('/orders')
      .then((res) => setOrders(res.data || []))
      .catch(() => showToast('Failed to load orders', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTodayOrders();
  }, []);

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
      o.shippingAddress?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      o.shippingAddress?.phone?.includes(search);
    const matchesStatus = statusFilter === 'ALL' || o.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-800">LIVE FULFILLMENT PIPELINE</span>
            <h1 className="font-street text-3xl font-black text-slate-900 uppercase">📦 TODAY'S & LIVE ORDERS</h1>
          </div>
        </div>

        <button onClick={() => showToast('Exporting Today Orders CSV...', 'info')} className="px-4 py-2.5 bg-red-800 text-amber-300 font-black text-xs uppercase rounded-xl border border-amber-300 flex items-center gap-1.5 shadow">
          <Download className="w-4 h-4" /> Export Orders CSV
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-amber-300 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Order #, Customer, Phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-amber-50 border border-amber-300 rounded-xl text-xs font-semibold"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-amber-800" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-amber-50 border border-amber-300 rounded-xl text-xs font-bold"
          >
            <option value="ALL">All Order Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-amber-300 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-medium border-collapse">
            <thead>
              <tr className="bg-amber-100/60 border-b border-amber-200 text-slate-900 uppercase font-black tracking-wider">
                <th className="p-4">Order #</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Products</th>
                <th className="p-4">Qty</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Amount</th>
                <th className="p-4">GST (5%)</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-500 font-bold">
                    Loading orders from MongoDB Atlas...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-500 font-bold">
                    No matching orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o: any, idx: number) => {
                  const qty = (o.orderItems || []).reduce((acc: number, it: any) => acc + (it.quantity || 1), 0);
                  const gstVal = Math.round((o.totalPrice || 0) * 0.05);

                  return (
                    <tr key={o._id || idx} className="hover:bg-amber-50/50 transition-colors">
                      <td className="p-4 font-street font-black text-red-800">{o.orderNumber || `EVAN-2026-${idx + 101}`}</td>
                      <td className="p-4 font-bold text-slate-900">{o.shippingAddress?.fullName || 'Customer'}</td>
                      <td className="p-4 font-bold text-slate-600">{o.shippingAddress?.phone || '+91 98765 43210'}</td>
                      <td className="p-4 line-clamp-1 max-w-[180px] font-medium">{o.orderItems?.[0]?.name || 'Paithani Saree'}</td>
                      <td className="p-4 font-bold">{qty}</td>
                      <td className="p-4 font-bold uppercase text-amber-800">{o.paymentMethod || 'Online'}</td>
                      <td className="p-4 font-black text-slate-900">₹{(o.totalPrice || 0).toLocaleString('en-IN')}</td>
                      <td className="p-4 font-bold text-slate-600">₹{gstVal.toLocaleString('en-IN')}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase shadow-sm ${
                          o.orderStatus === 'Delivered' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                          o.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-800 border border-red-300' :
                          'bg-amber-100 text-amber-900 border border-amber-300'
                        }`}>
                          {o.orderStatus || 'Pending'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button onClick={() => showToast(`Generating PDF invoice for ${o.orderNumber || 'Order'}`, 'success')} className="p-2 bg-slate-900 hover:bg-red-800 text-amber-300 rounded-xl shadow transition-all">
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
