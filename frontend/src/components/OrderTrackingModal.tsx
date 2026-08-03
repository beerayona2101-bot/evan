import React from 'react';
import { X, Package, Truck, CheckCircle2, Clock, MapPin, ShieldCheck } from 'lucide-react';
import { Order } from '../types';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

const TIMELINE_STEPS = [
  { key: 'Pending', label: 'Order Placed', desc: 'Order received & payment verified' },
  { key: 'Confirmed', label: 'Confirmed', desc: 'Silk quality check & hallmarking' },
  { key: 'Packed', label: 'Packed', desc: 'Secure gift box packaging' },
  { key: 'Shipped', label: 'Shipped', desc: 'Handed over to BlueDart Express' },
  { key: 'Out For Delivery', label: 'Out For Delivery', desc: 'Courier agent on the way' },
  { key: 'Delivered', label: 'Delivered', desc: 'Package delivered to recipient' },
];

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  const currentStatus: string = order.orderStatus || 'Pending';
  const isCancelled = currentStatus === 'Cancelled';
  const isReturned = currentStatus === 'Returned';
  const isRefunded = currentStatus === 'Refunded';

  // Determine current step index
  let activeIndex = TIMELINE_STEPS.findIndex((s) => s.key === currentStatus);
  if (activeIndex === -1) {
    if (currentStatus === 'Processing') activeIndex = 1;
    else activeIndex = 0;
  }

  const trackingNumber = `TRK-EVAN-${order._id ? order._id.slice(-6).toUpperCase() : '984210'}`;
  const courierName = 'BlueDart Express (Air Cargo)';
  const estimatedDelivery = new Date(new Date(order.createdAt).getTime() + 4 * 86400000).toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-amber-300 shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-amber-200 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-red-800 text-amber-300 flex items-center justify-center border border-amber-300 shadow-sm">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-amber-800 block">REAL-TIME ORDER TRACKING</span>
              <h3 className="font-street text-2xl font-black text-slate-900 leading-none">
                ORDER #{order._id ? order._id.slice(-8).toUpperCase() : '984210'}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-red-800 transition-colors rounded-full hover:bg-amber-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Courier Info Card */}
        <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-slate-500 font-bold uppercase text-[9px] block">Tracking Number</span>
            <span className="font-mono font-black text-red-800">{trackingNumber}</span>
          </div>
          <div>
            <span className="text-slate-500 font-bold uppercase text-[9px] block">Courier Partner</span>
            <span className="font-bold text-slate-900">{courierName}</span>
          </div>
          <div>
            <span className="text-slate-500 font-bold uppercase text-[9px] block">Estimated Delivery</span>
            <span className="font-bold text-slate-900">{estimatedDelivery}</span>
          </div>
          <div>
            <span className="text-slate-500 font-bold uppercase text-[9px] block">Destination</span>
            <span className="font-bold text-slate-900 truncate block">
              {order.shippingAddress?.city}, {order.shippingAddress?.state}
            </span>
          </div>
        </div>

        {/* Status Alert for Cancelled / Returned */}
        {(isCancelled || isReturned || isRefunded) && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center gap-2">
            <Clock className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span>Order status updated to: {currentStatus}. Please contact support for assistance.</span>
          </div>
        )}

        {/* Vertical / Horizontal Progress Timeline */}
        {!isCancelled && !isReturned && !isRefunded && (
          <div className="space-y-4 py-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">SHIPMENT TIMELINE</span>
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-amber-200">
              {TIMELINE_STEPS.map((step, idx) => {
                const isPassed = idx <= activeIndex;
                const isCurrent = idx === activeIndex;

                return (
                  <div key={step.key} className="relative flex items-start space-x-3">
                    <div
                      className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all ${
                        isPassed
                          ? 'bg-red-800 border-amber-300 text-amber-300 shadow-md'
                          : 'bg-white border-amber-300 text-slate-300'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-3 h-3" /> : <div className="w-1.5 h-1.5 rounded-full bg-amber-300" />}
                    </div>

                    <div className="leading-snug">
                      <h4
                        className={`text-xs uppercase tracking-wider font-extrabold ${
                          isCurrent ? 'text-red-800 font-black' : isPassed ? 'text-slate-900 font-bold' : 'text-slate-400'
                        }`}
                      >
                        {step.label} {isCurrent && '(CURRENT STATUS)'}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer info & button */}
        <div className="pt-4 border-t border-amber-200 flex justify-between items-center text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% Insured Transit</span>
          </div>

          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-900 text-amber-300 font-black uppercase text-xs rounded-xl shadow border border-amber-300"
          >
            Close Tracker
          </button>
        </div>

      </div>
    </div>
  );
};
