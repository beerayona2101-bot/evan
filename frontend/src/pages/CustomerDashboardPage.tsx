import React, { useState, useEffect } from 'react';
import { ShoppingBag, Heart, MapPin, Ticket, Wallet, RefreshCw, MessageSquare, ShieldCheck, CheckCircle2, Clock, Truck, Package, Sparkles, ChevronRight, User, Plus, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import { Order } from '../types';

export const CustomerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'wallet' | 'returns' | 'support'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Address State
  const [addresses, setAddresses] = useState([
    { id: '1', type: 'Home', name: user?.name || 'Ananya Sharma', address: 'Heritage Silk Villa, 4th Block, Koramangala', city: 'Bengaluru', state: 'Karnataka', pincode: '560034', phone: '9490644434', isDefault: true },
    { id: '2', type: 'Office', name: user?.name || 'Ananya Sharma', address: 'Tech Park Tower B, Outer Ring Road', city: 'Bengaluru', state: 'Karnataka', pincode: '560103', phone: '9490644434', isDefault: false },
  ]);

  // Support Ticket Form
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  useEffect(() => {
    fetchUserOrders();
  }, []);

  const fetchUserOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders/myorders').catch(() => ({
        data: [
          {
            _id: 'ord-saree-101',
            createdAt: '2026-07-28',
            orderStatus: 'Shipped',
            totalPrice: 14999,
            orderItems: [
              {
                name: 'EVAN COLLECTIONS Royal Crimson Banarasi Silk Saree',
                quantity: 1,
                price: 14999,
                image: '/images/saree_banarasi_red.png',
              },
            ],
            shippingAddress: {
              address: 'Heritage Silk Villa, Koramangala',
              city: 'Bengaluru',
              postalCode: '560034',
              country: 'India',
            },
            paymentMethod: 'UPI / PhonePe',
            isPaid: true,
          },
        ],
      }));
      setOrders(res.data);
      if (res.data.length > 0) setSelectedOrder(res.data[0]);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    setTicketSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-slate-900 py-8 px-4 sm:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Customer Header Banner */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-200 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-red-800 text-amber-300 flex items-center justify-center font-black text-2xl shadow-xl border-2 border-amber-300">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-800 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-red-700" /> LUXURY ATELIER MEMBER
              </span>
              <h1 className="font-street text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-none uppercase">
                {user?.name || 'ANANYA SHARMA'}
              </h1>
              <p className="text-xs text-slate-500 font-bold mt-1">{user?.email || 'ananya@example.com'} • +91 9490644434</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-center">
              <span className="text-[10px] font-black text-amber-800 block uppercase">EVAN WALLET</span>
              <span className="font-street text-2xl font-black text-red-800">₹2,500</span>
            </div>
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-center">
              <span className="text-[10px] font-black text-amber-800 block uppercase">MY SAREE ORDERS</span>
              <span className="font-street text-2xl font-black text-slate-900">{orders.length}</span>
            </div>
          </div>
        </div>

        {/* Dashboard Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Navigation Sidebar */}
          <aside className="lg:col-span-3 bg-white p-5 rounded-3xl border border-amber-200 shadow-md space-y-2 sticky top-24">
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === 'orders' ? 'bg-red-800 text-amber-300 shadow' : 'text-slate-700 hover:bg-amber-50'
              }`}
            >
              <ShoppingBag className="w-4 h-4" /> My Saree Orders
            </button>

            <button
              onClick={() => setActiveTab('addresses')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === 'addresses' ? 'bg-red-800 text-amber-300 shadow' : 'text-slate-700 hover:bg-amber-50'
              }`}
            >
              <MapPin className="w-4 h-4" /> Address Book
            </button>

            <button
              onClick={() => setActiveTab('wallet')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === 'wallet' ? 'bg-red-800 text-amber-300 shadow' : 'text-slate-700 hover:bg-amber-50'
              }`}
            >
              <Wallet className="w-4 h-4" /> EVAN Wallet & Coupons
            </button>

            <button
              onClick={() => setActiveTab('returns')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === 'returns' ? 'bg-red-800 text-amber-300 shadow' : 'text-slate-700 hover:bg-amber-50'
              }`}
            >
              <RefreshCw className="w-4 h-4" /> Returns & Exchanges
            </button>

            <button
              onClick={() => setActiveTab('support')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === 'support' ? 'bg-red-800 text-amber-300 shadow' : 'text-slate-700 hover:bg-amber-50'
              }`}
            >
              <MessageSquare className="w-4 h-4" /> Concierge & Support
            </button>
          </aside>

          {/* Main Dashboard Content */}
          <main className="lg:col-span-9 space-y-6">

            {/* TAB 1: Orders History & Tracking Lifecycle */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-amber-200 shadow-md">
                  <h3 className="font-street text-3xl font-black text-slate-900 mb-6">SAREE ORDERS HISTORY</h3>

                  {orders.map((ord) => (
                    <div key={ord._id} className="border border-amber-200 rounded-2xl p-6 mb-6 space-y-6 bg-amber-50/30">
                      {/* Order Header */}
                      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-amber-100 pb-4">
                        <div>
                          <span className="text-[10px] font-black text-amber-800 uppercase block">ORDER ID</span>
                          <span className="font-bold text-slate-900 text-sm">#{ord._id}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-black text-amber-800 uppercase block">PLACED ON</span>
                          <span className="font-bold text-slate-700 text-xs">{ord.createdAt}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-black text-amber-800 uppercase block">TOTAL AMOUNT</span>
                          <span className="font-black text-red-800 text-sm">₹{ord.totalPrice?.toLocaleString('en-IN')}</span>
                        </div>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-3 py-1 rounded-full border border-emerald-300">
                          {ord.orderStatus || 'SHIPPED'}
                        </span>
                      </div>

                      {/* Order Lifecycle Tracking Timeline (from dashboards.md) */}
                      <div className="py-2 space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">ORDER STATUS TIMELINE</span>
                        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 text-center text-[9px] font-extrabold uppercase">
                          <div className="p-2 bg-emerald-700 text-white rounded-xl flex flex-col items-center gap-1 shadow">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Pending
                          </div>
                          <div className="p-2 bg-emerald-700 text-white rounded-xl flex flex-col items-center gap-1 shadow">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
                          </div>
                          <div className="p-2 bg-emerald-700 text-white rounded-xl flex flex-col items-center gap-1 shadow">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Packed
                          </div>
                          <div className="p-2 bg-emerald-700 text-white rounded-xl flex flex-col items-center gap-1 shadow">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Ready To Ship
                          </div>
                          <div className="p-2 bg-red-800 text-amber-300 rounded-xl flex flex-col items-center gap-1 shadow border border-amber-300">
                            <Truck className="w-3.5 h-3.5" /> Shipped
                          </div>
                          <div className="p-2 bg-amber-100 text-slate-600 rounded-xl flex flex-col items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> Out For Delivery
                          </div>
                          <div className="p-2 bg-amber-100 text-slate-600 rounded-xl flex flex-col items-center gap-1">
                            <Package className="w-3.5 h-3.5" /> Delivered
                          </div>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="space-y-3 pt-2">
                        {ord.orderItems?.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-xl border border-amber-200">
                            <div className="flex items-center gap-3">
                              <img src={item.image || '/images/saree_banarasi_red.png'} alt={item.name} className="w-12 h-14 object-cover rounded-lg border border-amber-300" />
                              <div>
                                <span className="font-bold text-slate-900 text-xs block">{item.name}</span>
                                <span className="text-[10px] text-slate-500 font-semibold">Qty: {item.qty || item.quantity || 1} • Free Size</span>
                              </div>
                            </div>
                            <span className="font-black text-red-800 text-xs">₹{(item.price * (item.qty || item.quantity || 1)).toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: Address Book */}
            {activeTab === 'addresses' && (
              <div className="bg-white p-6 rounded-3xl border border-amber-200 shadow-md space-y-6">
                <div className="flex items-center justify-between border-b border-amber-100 pb-4">
                  <h3 className="font-street text-3xl font-black text-slate-900">SAVED DELIVERY ADDRESSES</h3>
                  <button className="px-4 py-2 bg-red-800 text-amber-300 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow">
                    <Plus className="w-3.5 h-3.5" /> Add Address
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div key={addr.id} className="p-5 rounded-2xl border border-amber-300 bg-amber-50/40 space-y-2 relative">
                      <span className="bg-red-800 text-amber-300 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border border-amber-300">
                        {addr.type}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900">{addr.name}</h4>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        {addr.address}, {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                      <p className="text-xs text-slate-500 font-bold">Phone: {addr.phone}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: EVAN Wallet & Active Coupons */}
            {activeTab === 'wallet' && (
              <div className="bg-white p-6 rounded-3xl border border-amber-200 shadow-md space-y-6">
                <h3 className="font-street text-3xl font-black text-slate-900">EVAN WALLET & PROMOTIONS</h3>
                
                <div className="p-6 bg-gradient-to-r from-red-900 to-slate-900 text-white rounded-2xl space-y-2 shadow-xl border border-amber-400">
                  <span className="text-[10px] font-black uppercase text-amber-400">TOTAL WALLET BALANCE</span>
                  <div className="font-street text-5xl font-black text-amber-300">₹2,500.00</div>
                  <p className="text-xs text-slate-300">Applicable instantly at checkout on all handcrafted silk sarees.</p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-amber-800">AVAILABLE PROMOTIONAL COUPONS</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 space-y-1">
                      <span className="font-black text-red-800 text-sm block">ROYAL10</span>
                      <span className="text-xs text-slate-700 font-bold block">10% OFF on Min. Purchase ₹1,999</span>
                      <span className="text-[9px] text-slate-400 uppercase block font-semibold">Valid Till Dec 2026</span>
                    </div>

                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 space-y-1">
                      <span className="font-black text-red-800 text-sm block">BRIDAL20</span>
                      <span className="text-xs text-slate-700 font-bold block">20% OFF on Min. Purchase ₹4,999</span>
                      <span className="text-[9px] text-slate-400 uppercase block font-semibold">Valid Till Dec 2026</span>
                    </div>

                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 space-y-1">
                      <span className="font-black text-red-800 text-sm block">EVAN1000</span>
                      <span className="text-xs text-slate-700 font-bold block">Flat ₹1,000 OFF on Min. ₹7,999</span>
                      <span className="text-[9px] text-slate-400 uppercase block font-semibold">Valid Till Dec 2026</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Returns & Exchange Request */}
            {activeTab === 'returns' && (
              <div className="bg-white p-6 rounded-3xl border border-amber-200 shadow-md space-y-6">
                <h3 className="font-street text-3xl font-black text-slate-900">7-DAY RETURN & EXCHANGE REQUEST</h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Initiate a hassle-free return or exchange for unworn sarees in original fold with Silk Mark tags intact.
                </p>

                <div className="p-6 bg-amber-50 rounded-2xl border border-amber-300 text-center space-y-3">
                  <ShieldCheck className="w-8 h-8 text-amber-700 mx-auto" />
                  <h4 className="font-bold text-sm text-slate-900">No Active Return Requests</h4>
                  <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
                    Select an order from your Orders History tab to initiate a return or blouse alteration exchange.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 5: Concierge & Support */}
            {activeTab === 'support' && (
              <div className="bg-white p-6 rounded-3xl border border-amber-200 shadow-md space-y-6">
                <h3 className="font-street text-3xl font-black text-slate-900">CUSTOMER CONCIERGE & TICKETS</h3>

                {ticketSubmitted ? (
                  <div className="p-6 bg-amber-50 rounded-2xl border border-amber-300 text-center space-y-2">
                    <Sparkles className="w-8 h-8 text-amber-700 mx-auto" />
                    <h4 className="font-bold text-base text-slate-900">Support Ticket Created!</h4>
                    <p className="text-xs text-slate-600 font-medium">
                      Our silk concierge team will reply within 2 business hours. Helpline: 9490644434.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleCreateTicket} className="space-y-4 text-xs font-semibold">
                    <div>
                      <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">Inquiry Subject</label>
                      <input
                        type="text"
                        required
                        value={ticketSubject}
                        onChange={(e) => setTicketSubject(e.target.value)}
                        className="w-full p-3 bg-amber-50/50 border border-amber-300 rounded-xl font-medium"
                        placeholder="e.g. Custom Blouse Stitching / Delivery Inquiry"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">Message Details</label>
                      <textarea
                        rows={4}
                        required
                        value={ticketMessage}
                        onChange={(e) => setTicketMessage(e.target.value)}
                        className="w-full p-3 bg-amber-50/50 border border-amber-300 rounded-xl font-medium"
                        placeholder="Provide details about your saree consultation or order tracking query..."
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-red-800 hover:bg-red-900 text-amber-300 font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl transition-all border border-amber-300"
                    >
                      SUBMIT SUPPORT TICKET
                    </button>
                  </form>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
