import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { CheckCircle2, Package, Printer, ArrowRight, ShieldCheck } from 'lucide-react';
import { orderApi } from '../services/orderApi';

export const OrderSuccessPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [orderData, setOrderData] = useState<any>(location.state?.order || null);

  useEffect(() => {
    if (!orderData && id) {
      orderApi.getOrderById(id).then((res) => {
        if (res) setOrderData(res);
      }).catch(() => {});
    }
  }, [id, orderData]);

  const handlePrintInvoice = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-slate-900 flex items-center justify-center py-16 px-4 font-sans">
      <div className="max-w-lg w-full bg-white p-8 sm:p-10 rounded-3xl border border-amber-200 shadow-2xl text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-300 flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <div>
          <span className="text-xs font-black tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 uppercase">
            PAYMENT CONFIRMED
          </span>
          <h1 className="font-street text-4xl sm:text-5xl font-black text-slate-900 mt-2">
            ORDER PLACED!
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            Thank you for shopping with EVAN COLLECTIONS. Your heirloom saree order has been confirmed.
          </p>
        </div>

        {/* Invoice Summary Box */}
        <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs text-left space-y-2 font-medium">
          <div className="flex justify-between border-b border-amber-200 pb-2">
            <span className="text-slate-500">Order Reference ID:</span>
            <span className="font-mono font-black text-red-800 text-sm">{id || 'EVAN-984210'}</span>
          </div>

          {orderData?.paymentResult?.id && (
            <div className="flex justify-between">
              <span className="text-slate-500">Razorpay Payment ID:</span>
              <span className="font-mono font-bold text-slate-900">{orderData.paymentResult.id}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-slate-500">Shipping Status:</span>
            <span className="font-bold text-emerald-700">Confirmed (Processing Dispatch)</span>
          </div>

          <div className="flex justify-between pt-1 border-t border-amber-200">
            <span className="text-slate-500">Estimated Delivery:</span>
            <span className="font-bold text-slate-900">3-5 Business Days (Insured Express)</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handlePrintInvoice}
              className="py-3.5 bg-slate-900 hover:bg-slate-800 text-amber-300 font-black text-xs uppercase tracking-wider rounded-xl transition shadow flex items-center justify-center gap-1.5 border border-amber-300"
            >
              <Printer className="w-4 h-4" /> Print Invoice
            </button>

            <Link
              to="/account"
              className="py-3.5 bg-red-800 hover:bg-red-900 text-amber-300 font-black text-xs uppercase tracking-wider rounded-xl transition shadow flex items-center justify-center gap-1.5 border border-amber-300"
            >
              <Package className="w-4 h-4" /> Track Order
            </Link>
          </div>

          <Link
            to="/shop"
            className="block w-full py-3.5 bg-amber-50 hover:bg-amber-100 text-slate-900 font-bold text-xs uppercase tracking-widest rounded-xl border border-amber-300 transition-all text-center"
          >
            Continue Shopping Catalog
          </Link>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-semibold pt-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>100% Authentic Handloom Pure Silk Mark Certified</span>
        </div>
      </div>
    </div>
  );
};

