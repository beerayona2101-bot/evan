import React, { useState } from 'react';
import { X, AlertTriangle, ShieldAlert } from 'lucide-react';
import { Order } from '../types';
import { orderApi } from '../services/orderApi';
import { showToast } from './ToastContainer';

interface AdminCancelOrderModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderCancelled: (updatedOrder: Order) => void;
}

const ADMIN_PREDEFINED_REASONS = [
  'Damaged Product / Quality Inspection Failure',
  'Out of Stock / Warehouse Inventory Deficit',
  'Undeliverable Shipping Address / Courier Restriction',
  'Payment Verification / Fraud Protection Flag',
  'Duplicate Order Placed by Customer',
  'Customer Requested Order Cancellation',
];

export const AdminCancelOrderModal: React.FC<AdminCancelOrderModalProps> = ({
  order,
  isOpen,
  onClose,
  onOrderCancelled,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>(ADMIN_PREDEFINED_REASONS[0]);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !order) return null;

  const handleSubmitAdminCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedOrder = await orderApi.updateOrderStatus(order._id, 'Cancelled', selectedReason);
      showToast(`Order #${order._id.slice(-6)} cancelled with explanation: "${selectedReason}"`, 'success');
      onOrderCancelled(updatedOrder);
      onClose();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to cancel order', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-red-300 shadow-2xl max-w-md w-full max-h-[90vh] my-auto flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Fixed Header */}
        <div className="flex-shrink-0 flex justify-between items-center px-5 sm:px-6 py-4 border-b border-red-100 bg-white z-10">
          <div className="flex items-center gap-2 text-red-800">
            <ShieldAlert className="w-6 h-6 text-red-800" />
            <h3 className="font-street text-xl sm:text-2xl font-black text-slate-900 uppercase">
              ADMIN CANCELLATION
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-red-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body Form */}
        <form onSubmit={handleSubmitAdminCancel} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs font-semibold">
            {/* Info Banner */}
            <div className="bg-red-50 p-3.5 rounded-2xl border border-red-200 text-xs text-red-950 flex items-start gap-2.5">
              <AlertTriangle className="w-4.5 h-4.5 text-red-700 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold uppercase block text-red-900">Selecting Cancellation Explanation</span>
                <span className="text-[11px] text-red-800 font-medium block mt-0.5">
                  Order #{order._id} (₹{order.totalPrice.toLocaleString('en-IN')}). The customer will be notified via email with this official reason.
                </span>
              </div>
            </div>

            <div>
              <label className="block text-slate-800 font-bold uppercase text-[10px] tracking-wider mb-2">
                CHOOSE PREDEFINED EXPLANATION *
              </label>
              <div className="space-y-2">
                {ADMIN_PREDEFINED_REASONS.map((reason) => (
                  <label
                    key={reason}
                    onClick={() => setSelectedReason(reason)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                      selectedReason === reason
                        ? 'bg-red-100/80 border-red-400 text-red-950 font-black shadow-sm'
                        : 'bg-white border-amber-200 text-slate-700 hover:bg-amber-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="adminCancelReason"
                      checked={selectedReason === reason}
                      onChange={() => setSelectedReason(reason)}
                      className="w-4 h-4 accent-red-800"
                    />
                    <span className="flex-1">{reason}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Fixed Footer Buttons */}
          <div className="flex-shrink-0 p-4 sm:p-5 border-t border-red-100 bg-slate-50/80 backdrop-blur-sm flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-black text-xs uppercase tracking-wider rounded-xl transition-all"
            >
              Keep Active
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-red-800 hover:bg-red-900 text-amber-300 font-black text-xs uppercase tracking-wider rounded-xl shadow-md border border-amber-300 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'CANCELLING...' : 'CONFIRM CANCELLATION'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
