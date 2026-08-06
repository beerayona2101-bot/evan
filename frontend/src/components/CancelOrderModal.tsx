import React, { useState } from 'react';
import { X, AlertTriangle, XCircle } from 'lucide-react';
import { Order } from '../types';
import { orderApi } from '../services/orderApi';
import { showToast } from './ToastContainer';

interface CancelOrderModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderCancelled: (updatedOrder: Order) => void;
}

const PRESET_CANCEL_REASONS = [
  'Ordered by mistake / Change of mind',
  'Found a better saree / alternate weave design',
  'Incorrect shipping address or phone number',
  'Delivery time is too long / delayed',
  'Applied wrong coupon code or wanted discount',
  'Other Reason (Please specify below)',
];

export const CancelOrderModal: React.FC<CancelOrderModalProps> = ({
  order,
  isOpen,
  onClose,
  onOrderCancelled,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>('Ordered by mistake / Change of mind');
  const [customReasonText, setCustomReasonText] = useState<string>('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !order) return null;

  const handleSubmitCancel = async (e: React.FormEvent) => {
    e.preventDefault();

    let finalReason = selectedReason;
    if (selectedReason === 'Other Reason (Please specify below)') {
      if (!customReasonText.trim()) {
        showToast('Please enter your cancellation reason', 'error');
        return;
      }
      finalReason = customReasonText.trim();
    } else if (customReasonText.trim()) {
      finalReason = `${selectedReason} - ${customReasonText.trim()}`;
    }

    setLoading(true);
    try {
      const updatedOrder = await orderApi.cancelOrder(order._id, finalReason);
      showToast(`Order #${order._id} cancelled successfully!`, 'success');
      onOrderCancelled(updatedOrder);
      onClose();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to cancel order', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
<<<<<<< HEAD
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-amber-300 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-amber-100 pb-3">
=======
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-amber-300 shadow-2xl max-w-lg w-full max-h-[90vh] my-auto flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Fixed Header */}
        <div className="flex-shrink-0 flex justify-between items-center px-5 sm:px-6 py-4 border-b border-amber-100 bg-white z-10">
>>>>>>> e82de53 (color and ui changed)
          <div className="flex items-center gap-2 text-red-800">
            <XCircle className="w-5 h-5" />
            <h3 className="font-street text-xl sm:text-2xl font-black text-slate-900 uppercase">
              CANCEL ORDER #{order._id.slice(-6).toUpperCase()}
            </h3>
          </div>
          <button
<<<<<<< HEAD
=======
            type="button"
>>>>>>> e82de53 (color and ui changed)
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-amber-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

<<<<<<< HEAD
        {/* Warning Banner */}
        <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-300 text-xs text-amber-950 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-extrabold uppercase block text-amber-900">Are you sure you want to cancel this order?</span>
            <span className="text-[11px] text-amber-800 font-medium block mt-0.5">
              Total Amount: ₹{order.totalPrice.toLocaleString('en-IN')} • {order.orderItems?.length || 1} Item(s).
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmitCancel} className="space-y-4 text-xs font-semibold">
          <div>
            <label className="block text-slate-800 font-bold uppercase text-[10px] tracking-wider mb-2">
              SELECT CANCELLATION REASON *
            </label>
            <div className="space-y-2">
              {PRESET_CANCEL_REASONS.map((reason) => (
                <label
                  key={reason}
                  onClick={() => setSelectedReason(reason)}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedReason === reason
                      ? 'bg-amber-100/70 border-amber-400 text-slate-900 font-bold shadow-sm'
                      : 'bg-white border-amber-200 text-slate-600 hover:bg-amber-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="cancelReason"
                    checked={selectedReason === reason}
                    onChange={() => setSelectedReason(reason)}
                    className="w-4 h-4 accent-red-800"
                  />
                  <span className="flex-1">{reason}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Custom Reason Textarea */}
          <div>
            <label className="block text-slate-800 font-bold uppercase text-[10px] tracking-wider mb-1">
              ADDITIONAL COMMENTS / CUSTOM REASON {selectedReason === 'Other Reason (Please specify below)' && '*'}
            </label>
            <textarea
              rows={3}
              value={customReasonText}
              onChange={(e) => setCustomReasonText(e.target.value)}
              placeholder="Tell us more about why you're cancelling..."
              required={selectedReason === 'Other Reason (Please specify below)'}
              className="w-full p-3 bg-amber-50/50 border border-amber-300 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs uppercase tracking-wider rounded-xl transition-all"
=======
        {/* Scrollable Content Body Form */}
        <form onSubmit={handleSubmitCancel} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs font-semibold">
            {/* Warning Banner */}
            <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-300 text-xs text-amber-950 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold uppercase block text-amber-900">Are you sure you want to cancel this order?</span>
                <span className="text-[11px] text-amber-800 font-medium block mt-0.5">
                  Total Amount: ₹{order.totalPrice.toLocaleString('en-IN')} • {order.orderItems?.length || 1} Item(s).
                </span>
              </div>
            </div>

            <div>
              <label className="block text-slate-800 font-bold uppercase text-[10px] tracking-wider mb-2">
                SELECT CANCELLATION REASON *
              </label>
              <div className="space-y-2">
                {PRESET_CANCEL_REASONS.map((reason) => (
                  <label
                    key={reason}
                    onClick={() => setSelectedReason(reason)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                      selectedReason === reason
                        ? 'bg-amber-100/70 border-amber-400 text-slate-900 font-bold shadow-sm'
                        : 'bg-white border-amber-200 text-slate-600 hover:bg-amber-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="cancelReason"
                      checked={selectedReason === reason}
                      onChange={() => setSelectedReason(reason)}
                      className="w-4 h-4 accent-red-800"
                    />
                    <span className="flex-1">{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Custom Reason Textarea */}
            <div>
              <label className="block text-slate-800 font-bold uppercase text-[10px] tracking-wider mb-1">
                ADDITIONAL COMMENTS / CUSTOM REASON {selectedReason === 'Other Reason (Please specify below)' && '*'}
              </label>
              <textarea
                rows={3}
                value={customReasonText}
                onChange={(e) => setCustomReasonText(e.target.value)}
                placeholder="Tell us more about why you're cancelling..."
                required={selectedReason === 'Other Reason (Please specify below)'}
                className="w-full p-3 bg-amber-50/50 border border-amber-300 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Fixed Footer Buttons */}
          <div className="flex-shrink-0 p-4 sm:p-5 border-t border-amber-100 bg-slate-50/80 backdrop-blur-sm flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-black text-xs uppercase tracking-wider rounded-xl transition-all"
>>>>>>> e82de53 (color and ui changed)
            >
              Keep My Order
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
