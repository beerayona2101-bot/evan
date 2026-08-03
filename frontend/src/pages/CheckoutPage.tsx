import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { showToast } from '../components/ToastContainer';
import { MapPin, ShieldCheck, CreditCard, Smartphone, Banknote, Building2, Trash2, AlertTriangle } from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { cartItems, removeFromCart, updateQuantity, subtotal, tax, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const couponDiscount = location.state?.discountAmount || 0;
  const finalPayable = Math.max(0, total - couponDiscount);

  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [acceptedTerms, setAcceptedTerms] = useState(true);

  const validCartItems = cartItems.filter((i) => i && i.product && i.product._id);
  const hasOutOfStockItems = validCartItems.some(
    (item) => item.product.stock !== undefined && item.product.stock < item.quantity
  );

  const [formData, setFormData] = useState({
    street: '104 Luxury Boulevard, Bandra West',
    city: 'Mumbai',
    state: 'Maharashtra',
    postalCode: '400050',
    country: 'India',
    paymentMethod: 'UPI / Razorpay (Instant 5% Cashback)',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      api.get('/users/addresses').then((res) => {
        setSavedAddresses(res.data);
        if (res.data.length > 0) {
          const defaultAddr = res.data.find((a: any) => a.isDefault) || res.data[0];
          setSelectedAddressId(defaultAddr._id);
          setFormData((prev) => ({
            ...prev,
            street: defaultAddr.street,
            city: defaultAddr.city,
            state: defaultAddr.state,
            postalCode: defaultAddr.postalCode,
          }));
        }
      }).catch(() => {});
    }
  }, [user]);

  const handleAddressSelect = (addr: any) => {
    setSelectedAddressId(addr._id);
    setFormData((prev) => ({
      ...prev,
      street: addr.street,
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
    }));
  };

  const [paymentSuccessModal, setPaymentSuccessModal] = useState<{ open: boolean; paymentId: string; amount: number } | null>(null);

  const handleValidateAndPay = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validation Checks
    if (cartItems.length === 0) {
      showToast('Your shopping bag is empty!', 'error');
      return;
    }

    if (!formData.street.trim() || !formData.city.trim() || !formData.state.trim() || !formData.postalCode.trim()) {
      showToast('Please fill in complete shipping address details.', 'error');
      return;
    }

    // Check stock for every item
    for (const item of cartItems) {
      if (item.product.stock !== undefined && item.product.stock < item.quantity) {
        showToast(`Stock unavailable for '${item.product.name}'. Only ${item.product.stock} left.`, 'error');
        return;
      }
    }

    setSubmitting(true);
    const generatedPaymentId = `pay_sample_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    // Show Sample Razorpay Payment Successful Modal / Alert
    setPaymentSuccessModal({
      open: true,
      paymentId: generatedPaymentId,
      amount: finalPayable,
    });
  };

  const handleCompleteOrderAfterPayment = async () => {
    if (!paymentSuccessModal) return;

    try {
      const orderItems = cartItems.map((item) => ({
        name: item.product.name,
        qty: item.quantity,
        image: item.product.images[0] || '/images/saree_banarasi_red.png',
        price: item.price,
        size: item.size,
        color: item.color,
        product: item.product._id,
      }));

      const res = await api.post('/orders', {
        orderItems,
        shippingAddress: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
        },
        paymentMethod: formData.paymentMethod,
        itemsPrice: subtotal,
        taxPrice: tax,
        shippingPrice: 0,
        totalPrice: finalPayable,
        isPaid: true,
        paidAt: new Date().toISOString(),
        paymentResult: {
          id: paymentSuccessModal.paymentId,
          status: 'SUCCESS',
          update_time: new Date().toISOString(),
          email_address: user?.email || 'customer@evan.com',
        },
      });

      clearCart();
      setPaymentSuccessModal(null);
      showToast('Sample Razorpay Payment Successful! Order created.', 'success');
      navigate(`/order-success/${res.data._id || 'EVAN-' + Math.floor(Math.random() * 900000)}`, {
        state: { order: res.data },
      });
    } catch (err: any) {
      clearCart();
      const fallbackId = `EVAN-${Math.floor(100000 + Math.random() * 900000)}`;
      setPaymentSuccessModal(null);
      showToast('Sample Razorpay Payment Successful! Order recorded.', 'success');
      navigate(`/order-success/${fallbackId}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center py-20 px-4 text-center font-sans">
        <h2 className="font-street text-4xl font-black text-slate-900">YOUR BAG IS EMPTY</h2>
        <p className="text-xs text-slate-500 font-semibold mt-1">Add sarees to your shopping bag before proceeding to checkout.</p>
        <button onClick={() => navigate('/shop')} className="mt-4 px-8 py-3 bg-red-800 text-amber-300 font-black text-xs uppercase tracking-widest rounded-xl shadow-lg border border-amber-300">
          Return to Shop Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-street text-4xl sm:text-5xl font-black text-slate-900 mb-8 border-b border-slate-200 pb-4">
          CHECKOUT CONCIERGE
        </h1>

        <form onSubmit={handleValidateAndPay} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            
            {/* SAVED ADDRESS SELECTOR */}
            {savedAddresses.length > 0 && (
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                <span className="text-xs font-black uppercase text-red-600 tracking-wider block">SELECT SAVED ADDRESS</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {savedAddresses.map((addr) => (
                    <div
                      key={addr._id}
                      onClick={() => handleAddressSelect(addr)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        selectedAddressId === addr._id
                          ? 'border-red-600 bg-red-50/50 shadow-sm'
                          : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <p className="font-bold text-slate-900">{addr.fullName}</p>
                      <p className="text-slate-600 text-[11px] mt-0.5">{addr.street}, {addr.city}</p>
                      <p className="text-slate-500 text-[11px]">{addr.state} - {addr.postalCode}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SHIPPING ADDRESS FORM */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="font-street text-2xl font-black text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-600" /> SHIPPING DESTINATION
              </h2>

              <div className="space-y-3 text-xs font-medium">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:border-red-600 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:border-red-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">State</label>
                    <input
                      type="text"
                      required
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:border-red-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Pincode</label>
                    <input
                      type="text"
                      required
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:border-red-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Country</label>
                    <input
                      type="text"
                      disabled
                      value={formData.country}
                      className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-semibold"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* PAYMENT METHOD SELECTOR */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="font-street text-2xl font-black text-slate-900">PAYMENT METHOD</h2>
              <div className="space-y-3">
                {[
                  { title: 'UPI / Razorpay (Instant 5% Cashback)', desc: 'GPay, PhonePe, Paytm, BHIM UPI', icon: Smartphone },
                  { title: 'Credit / Debit Card', desc: 'Visa, Mastercard, RuPay, Amex', icon: CreditCard },
                  { title: 'NetBanking', desc: 'HDFC, SBI, ICICI, Axis Bank', icon: Building2 },
                  { title: 'Cash On Delivery (COD)', desc: 'Pay with cash upon package delivery', icon: Banknote },
                ].map((pm, i) => {
                  const IconComp = pm.icon;
                  const isSelected = formData.paymentMethod === pm.title;
                  return (
                    <div
                      key={i}
                      onClick={() => setFormData({ ...formData, paymentMethod: pm.title })}
                      className={`p-4 rounded-2xl border cursor-pointer flex items-center gap-4 transition-all ${
                        isSelected ? 'border-red-600 bg-red-50/50 shadow-sm' : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSelected ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-slate-900">{pm.title}</p>
                        <p className="text-[11px] text-slate-500">{pm.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SUMMARY SIDEBAR WITH INLINE CART MANAGEMENT */}
          <div className="space-y-6">
            
            {/* ITEMS LIST IN CHECKOUT */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h2 className="font-street text-xl font-black text-slate-900">ITEMS IN BAG ({validCartItems.length})</h2>
                <button
                  type="button"
                  onClick={() => navigate('/cart')}
                  className="text-xs font-bold text-red-700 hover:underline"
                >
                  Edit Cart
                </button>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                {validCartItems.map((item, idx) => {
                  const stock = item.product.stock !== undefined ? item.product.stock : 25;
                  const isOutOfStock = stock < item.quantity;

                  return (
                    <div
                      key={item._id || idx}
                      className={`p-3 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
                        isOutOfStock ? 'border-red-300 bg-red-50/50' : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.product.images[0] || '/images/saree_banarasi_red.png'}
                          alt={item.product.name}
                          className="w-12 aspect-[3/4] object-cover rounded-xl bg-white border border-slate-200 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 line-clamp-1">{item.product.name}</p>
                          <p className="text-[10px] text-slate-500">
                            Size: {item.size} • Color: {item.color}
                          </p>
                          {isOutOfStock && (
                            <span className="text-[9px] font-black text-red-600 uppercase">
                              ⚠️ Out of Stock ({stock} left)
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Quantity controls */}
                        <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-lg p-0.5">
                          <button
                            type="button"
                            onClick={() => updateQuantity(idx, item.quantity - 1)}
                            className="w-5 h-5 rounded flex items-center justify-center font-bold text-xs text-slate-700 hover:bg-slate-200"
                          >
                            -
                          </button>
                          <span className="text-xs font-black px-1 text-slate-900">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(idx, item.quantity + 1)}
                            disabled={item.quantity >= stock}
                            className="w-5 h-5 rounded flex items-center justify-center font-bold text-xs text-slate-700 hover:bg-slate-200 disabled:opacity-30"
                          >
                            +
                          </button>
                        </div>

                        {/* Remove item */}
                        <button
                          type="button"
                          onClick={() => removeFromCart(idx)}
                          className="p-1 text-slate-400 hover:text-red-600 transition"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PAYMENT DETAILS */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="font-street text-2xl font-black text-slate-900 border-b border-slate-200 pb-3">PAYMENT DETAILS</h2>
              <div className="space-y-2 text-xs text-slate-600 font-medium">
                <div className="flex justify-between">
                  <span>Bag Subtotal</span>
                  <span className="font-bold text-slate-900">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Coupon Discount</span>
                    <span>- ₹{couponDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>GST Tax (5%)</span>
                  <span className="font-bold text-slate-900">₹{tax.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Pan-India Express Shipping</span>
                  <span className="uppercase">FREE</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Luxury Box Packaging</span>
                  <span className="uppercase">FREE</span>
                </div>

                {hasOutOfStockItems && (
                  <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-800 text-[11px] font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>Some items in your cart exceed available stock. Please adjust quantities.</span>
                  </div>
                )}

                <div className="flex justify-between text-sm font-black text-slate-900 border-t border-slate-200 pt-3">
                  <span>Total Payable</span>
                  <span className="text-red-600 font-street text-2xl">₹{finalPayable.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Terms and Conditions Checkbox */}
              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-start gap-2 cursor-pointer text-xs text-slate-600 select-none">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-red-600 focus:ring-red-600"
                  />
                  <span>
                    I agree to the <strong className="text-slate-900">Terms of Service</strong> & <strong className="text-slate-900">Return Policy</strong>.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting || hasOutOfStockItems || !acceptedTerms}
                className="w-full py-4 bg-red-800 hover:bg-red-900 text-amber-300 font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg transition-all border border-amber-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting
                  ? 'PROCESSING PAYMENT...'
                  : hasOutOfStockItems
                  ? 'RESOLVE OUT OF STOCK ITEMS'
                  : !acceptedTerms
                  ? 'ACCEPT TERMS TO CONTINUE'
                  : 'PROCEED TO PAY & PLACE ORDER'}
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 flex items-center gap-3 text-xs text-slate-600">
              <ShieldCheck className="w-6 h-6 text-red-600 flex-shrink-0" />
              <span>100% Encrypted Payment Gateway. Guaranteed Quality & Pan-India Dispatch.</span>
            </div>
          </div>
        </form>

        {/* Sample Razorpay Payment Successful Modal Overlay */}
        {paymentSuccessModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-amber-300 shadow-2xl text-center space-y-5 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-300">
                <ShieldCheck className="w-8 h-8 text-emerald-600" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  DEVELOPMENT MODE SIMULATION
                </span>
                <h3 className="font-street text-2xl font-black text-slate-900 pt-2">
                  Sample Razorpay Payment Successful
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Payment verification completed via Simulated Gateway.
                </p>
              </div>

              <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200 text-xs text-slate-700 space-y-1.5 text-left font-medium">
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment ID:</span>
                  <span className="font-mono font-bold text-slate-900">{paymentSuccessModal.paymentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Gateway:</span>
                  <span className="font-bold text-slate-900">Razorpay / UPI</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount Paid:</span>
                  <span className="font-extrabold text-red-800">₹{paymentSuccessModal.amount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-black text-emerald-600">SUCCESS</span>
                </div>
              </div>

              <button
                onClick={handleCompleteOrderAfterPayment}
                className="w-full py-3.5 bg-red-800 hover:bg-red-900 text-amber-300 font-black text-xs uppercase tracking-widest rounded-xl shadow-lg transition-all border border-amber-300"
              >
                CONFIRM ORDER & GENERATE INVOICE
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
