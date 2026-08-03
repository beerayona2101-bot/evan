import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../services/userApi';
import { orderApi } from '../services/orderApi';
import { showToast } from '../components/ToastContainer';
import { Order, Product } from '../types';
import { User as UserIcon, MapPin, Package, Heart, Settings, Plus, Trash2, CheckCircle, Clock, X, Truck, Printer, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useSocket } from '../context/SocketContext';
import { OrderTrackingModal } from '../components/OrderTrackingModal';

export const AccountPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { wishlist } = useWishlist();
  const { addToCart } = useCart();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'orders' | 'wishlist'>('profile');

  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');

  // Address Book State
  const [addresses, setAddresses] = useState<any[]>([]);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddr, setNewAddr] = useState({ fullName: '', phone: '', street: '', city: '', state: '', postalCode: '' });

  // Orders State & Tracking
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<Order | null>(null);
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('All');
  const [orderSearchQuery, setOrderSearchQuery] = useState<string>('');

  // Delete Account Modal
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState<boolean>(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState<string>('');

  const fetchOrders = () => {
    if (user) {
      orderApi.getMyOrders().then((res) => setOrders(res)).catch(() => {});
    }
  };

  useEffect(() => {
    if (user) {
      userApi.getAddresses().then((res) => setAddresses(res)).catch(() => {});
      fetchOrders();
    }
  }, [user]);

  // Real-Time Socket.IO Synchronization
  useEffect(() => {
    if (!socket || !user) return;

    const handleOrderUpdated = (updatedOrder: Order) => {
      setOrders((prev) => prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o)));
      showToast(`Live Order Update: Order #${updatedOrder._id} status is now ${updatedOrder.orderStatus}!`, 'info');
    };

    socket.on('orderUpdated', handleOrderUpdated);
    socket.on('orderCreated', fetchOrders);

    return () => {
      socket.off('orderUpdated', handleOrderUpdated);
      socket.off('orderCreated', fetchOrders);
    };
  }, [socket, user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userApi.updateProfile({ name, phone });
      showToast('Profile updated successfully!', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error updating profile', 'error');
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await userApi.addAddress(newAddr);
      setAddresses([res, ...addresses]);
      setShowAddAddress(false);
      setNewAddr({ fullName: '', phone: '', street: '', city: '', state: '', postalCode: '' });
      showToast('New address saved successfully!', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error adding address', 'error');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await userApi.deleteAddress(id);
      setAddresses(addresses.filter((a) => a._id !== id));
      showToast('Address deleted', 'info');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error deleting address', 'error');
    }
  };

  const handleReorder = (order: Order) => {
    order.orderItems.forEach((item) => {
      addToCart(
        {
          _id: item.product as string,
          name: item.name,
          images: [item.image],
          price: item.price,
          category: 'Reorder',
        } as any,
        item.size || 'Free Size',
        item.color || 'Royal Red',
        item.qty
      );
    });
    showToast(`Items from Order #${order._id.slice(-6)} added to shopping bag!`, 'success');
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.toUpperCase() !== 'DELETE') {
      showToast("Please type 'DELETE' to confirm account removal.", 'error');
      return;
    }
    showToast('Account deleted permanently.', 'info');
    logout();
    navigate('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center py-20 px-4 text-center font-sans">
        <div className="w-20 h-20 rounded-full bg-red-100/80 text-red-800 flex items-center justify-center mb-4 border border-amber-300 shadow">
          <UserIcon className="w-10 h-10" />
        </div>
        <h2 className="font-street text-4xl font-black text-slate-900">ACCOUNT ACCESS REQUIRED</h2>
        <p className="text-xs text-slate-500 font-semibold mt-1">Please sign in to view your orders, addresses & saved wishlist.</p>
        <Link to="/login" className="mt-6 px-8 py-3 bg-red-800 text-amber-300 font-black text-xs uppercase tracking-widest rounded-xl shadow-lg border border-amber-300">
          SIGN IN / REGISTER
        </Link>
      </div>
    );
  }

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = orderStatusFilter === 'All' || o.orderStatus === orderStatusFilter;
    const matchesQuery = o._id.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      o.orderItems.some((i) => i.name.toLowerCase().includes(orderSearchQuery.toLowerCase()));
    return matchesStatus && matchesQuery;
  });

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-slate-900 py-10 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Profile Info Banner */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-amber-400/40 shadow-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-700 to-red-900 text-amber-300 font-black text-2xl flex items-center justify-center border-2 border-amber-300 shadow-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">AUTHENTICATED CUSTOMER</span>
              <h1 className="font-street text-3xl sm:text-4xl font-black text-amber-300">{user.name}</h1>
              <p className="text-xs text-slate-400 font-medium">{user.email} • {user.phone || 'Phone not set'}</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="px-6 py-2.5 bg-red-900/60 hover:bg-red-800 text-amber-300 text-xs font-black uppercase tracking-widest rounded-xl border border-amber-300/60 transition-all shadow"
          >
            Sign Out
          </button>
        </div>

        {/* Account Tab Selector */}
        <div className="flex items-center gap-2 border-b border-amber-200 pb-3 overflow-x-auto custom-scrollbar">
          {[
            { id: 'profile', label: 'Personal Information', icon: Settings },
            { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
            { id: 'orders', label: `My Orders (${orders.length})`, icon: Package },
            { id: 'wishlist', label: `My Wishlist (${wishlist.length})`, icon: Heart },
          ].map((tab) => {
            const IconComp = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-900 text-amber-300 shadow-md border border-amber-300'
                    : 'bg-white text-slate-700 hover:bg-amber-50 border border-amber-200'
                }`}
              >
                <IconComp className="w-4 h-4 text-amber-500" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: PERSONAL INFORMATION */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200 shadow-md space-y-6">
            <h3 className="font-street text-2xl font-black text-slate-900 border-b border-amber-200 pb-3">
              EDIT PERSONAL INFORMATION
            </h3>

            <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg text-xs font-semibold">
              <div>
                <label className="block text-slate-700 uppercase font-bold text-[10px] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3.5 bg-amber-50/50 border border-amber-300 rounded-xl text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 uppercase font-bold text-[10px] mb-1">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full p-3.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-semibold cursor-not-allowed"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Primary account email cannot be altered.</span>
              </div>

              <div>
                <label className="block text-slate-700 uppercase font-bold text-[10px] mb-1">Mobile Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-3.5 bg-amber-50/50 border border-amber-300 rounded-xl text-slate-900 font-medium"
                  placeholder="9490644434"
                />
              </div>

              <button
                type="submit"
                className="px-8 py-3.5 bg-red-800 hover:bg-red-900 text-amber-300 font-black uppercase text-xs tracking-widest rounded-xl shadow-md transition-all border border-amber-300"
              >
                SAVE CHANGES
              </button>
            </form>

            <div className="pt-6 border-t border-amber-200">
              <span className="text-[10px] font-black uppercase tracking-widest text-red-700 block mb-2">DANGER ZONE</span>
              <button
                onClick={() => setShowDeleteAccountModal(true)}
                className="px-6 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl border border-red-200 transition-colors"
              >
                Delete My Account
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: ADDRESSES */}
        {activeTab === 'addresses' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200 shadow-md space-y-6">
            <div className="flex justify-between items-center border-b border-amber-200 pb-3">
              <h3 className="font-street text-2xl font-black text-slate-900">SAVED ADDRESSES</h3>
              <button
                onClick={() => setShowAddAddress(true)}
                className="px-4 py-2 bg-red-800 text-amber-300 text-xs font-black uppercase tracking-widest rounded-xl shadow border border-amber-300 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Address
              </button>
            </div>

            {addresses.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 font-semibold">No saved addresses found. Add an address for fast checkout.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div key={addr._id} className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 shadow-sm space-y-2 relative">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-xs text-slate-900">{addr.fullName}</span>
                      <button
                        onClick={() => handleDeleteAddress(addr._id)}
                        className="text-slate-400 hover:text-red-700 p-1"
                        title="Delete Address"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-600 font-medium">{addr.street}, {addr.city}</p>
                    <p className="text-xs text-slate-500 font-medium">{addr.state} - {addr.postalCode}</p>
                    <p className="text-[11px] text-slate-500 font-bold">Phone: {addr.phone}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Modal: Add Address */}
            {showAddAddress && (
              <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white p-6 rounded-3xl border border-amber-300 shadow-2xl max-w-md w-full space-y-4">
                  <div className="flex justify-between items-center border-b border-amber-200 pb-3">
                    <h3 className="font-street text-2xl font-black text-slate-900">ADD NEW ADDRESS</h3>
                    <button onClick={() => setShowAddAddress(false)} className="text-slate-400 hover:text-slate-900">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleAddAddress} className="space-y-3 text-xs font-medium">
                    <input
                      type="text"
                      placeholder="Full Name"
                      required
                      value={newAddr.fullName}
                      onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                      className="w-full p-3 bg-amber-50/50 border border-amber-300 rounded-xl text-slate-900"
                    />
                    <input
                      type="text"
                      placeholder="Phone Number"
                      required
                      value={newAddr.phone}
                      onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                      className="w-full p-3 bg-amber-50/50 border border-amber-300 rounded-xl text-slate-900"
                    />
                    <input
                      type="text"
                      placeholder="Street Address"
                      required
                      value={newAddr.street}
                      onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                      className="w-full p-3 bg-amber-50/50 border border-amber-300 rounded-xl text-slate-900"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="City"
                        required
                        value={newAddr.city}
                        onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                        className="w-full p-3 bg-amber-50/50 border border-amber-300 rounded-xl text-slate-900"
                      />
                      <input
                        type="text"
                        placeholder="State"
                        required
                        value={newAddr.state}
                        onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                        className="w-full p-3 bg-amber-50/50 border border-amber-300 rounded-xl text-slate-900"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Pincode / Postal Code"
                      required
                      value={newAddr.postalCode}
                      onChange={(e) => setNewAddr({ ...newAddr, postalCode: e.target.value })}
                      className="w-full p-3 bg-amber-50/50 border border-amber-300 rounded-xl text-slate-900"
                    />

                    <div className="flex gap-3 pt-3">
                      <button type="submit" className="flex-1 py-3 bg-red-800 text-amber-300 font-black text-xs uppercase rounded-xl shadow border border-amber-300">
                        Save Address
                      </button>
                      <button type="button" onClick={() => setShowAddAddress(false)} className="flex-1 py-3 border border-slate-300 text-slate-700 font-bold text-xs uppercase rounded-xl hover:bg-slate-100">
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ORDERS */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200 shadow-md space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-amber-200 pb-4">
              <h3 className="font-street text-2xl font-black text-slate-900">ORDER HISTORY</h3>

              {/* Order Status Filters */}
              <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar">
                {['All', 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                      orderStatusFilter === st
                        ? 'bg-slate-900 text-amber-300 font-black'
                        : 'bg-amber-50 text-slate-600 hover:bg-amber-100 border border-amber-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 font-semibold">No orders found matching status filter '{orderStatusFilter}'.</p>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((o) => (
                  <div key={o._id} className="p-5 rounded-2xl bg-amber-50/40 border border-amber-200 flex flex-col space-y-4 text-xs">
                    <div className="flex flex-wrap justify-between items-center border-b border-amber-200 pb-3 gap-2">
                      <div>
                        <span className="text-slate-500 font-bold">Order Reference: </span>
                        <span className="font-mono text-red-800 font-bold text-sm">#{o._id}</span>
                        <span className="text-slate-400 text-[10px] block">Placed on {new Date(o.createdAt).toLocaleDateString()}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-black text-[10px] border border-amber-300">
                          {o.orderStatus}
                        </span>

                        <button
                          onClick={() => setSelectedOrderForTracking(o)}
                          className="px-3 py-1.5 bg-red-800 hover:bg-red-900 text-amber-300 font-black text-[10px] rounded-lg shadow flex items-center gap-1 border border-amber-300"
                        >
                          <Truck className="w-3.5 h-3.5" /> Track Order
                        </button>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-2">
                      {o.orderItems.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <img src={item.image || '/images/saree_banarasi_red.png'} alt={item.name} className="w-12 h-16 object-cover rounded-xl bg-slate-100 border border-amber-200" />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-900 truncate">{item.name}</p>
                            <p className="text-[10px] text-slate-500 font-semibold">Qty: {item.qty} | Size: {item.size} | Color: {item.color}</p>
                          </div>
                          <span className="font-bold text-slate-900">₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>

                    {/* Order Footer Actions */}
                    <div className="pt-3 border-t border-amber-200 flex flex-wrap justify-between items-center gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleReorder(o)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold rounded-lg text-[10px] flex items-center gap-1 border border-amber-300"
                        >
                          <RefreshCw className="w-3 h-3" /> Reorder Saree
                        </button>

                        <Link
                          to={`/order-success/${o._id}`}
                          className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-slate-900 font-bold rounded-lg text-[10px] flex items-center gap-1 border border-amber-300"
                        >
                          <Printer className="w-3 h-3" /> View Invoice
                        </Link>
                      </div>

                      <div className="font-extrabold text-slate-900 text-sm">
                        Total Amount: <span className="text-red-800 font-street text-base">₹{o.totalPrice.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: WISHLIST */}
        {activeTab === 'wishlist' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200 shadow-md space-y-4">
            <h3 className="font-street text-2xl font-black text-slate-900">MY WISHLIST ({wishlist.length})</h3>
            {wishlist.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 font-semibold">Your wishlist is currently empty.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {wishlist.map((p) => (
                  <div key={p._id} className="p-3.5 rounded-2xl bg-amber-50/40 border border-amber-200 flex flex-col justify-between space-y-2">
                    <img src={p.images[0] || '/images/saree_banarasi_red.png'} alt="" className="aspect-[3/4] object-cover rounded-xl bg-slate-100" />
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{p.name}</h4>
                      <p className="font-extrabold text-red-800 text-xs mt-0.5">₹{p.price.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Order Tracking Modal Component */}
        <OrderTrackingModal
          isOpen={!!selectedOrderForTracking}
          onClose={() => setSelectedOrderForTracking(null)}
          order={selectedOrderForTracking}
        />

        {/* Delete Account Modal Confirmation Overlay */}
        {showDeleteAccountModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-red-300 shadow-2xl space-y-5 text-center">
              <div className="w-14 h-14 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto border border-red-300">
                <AlertTriangle className="w-8 h-8 text-red-700" />
              </div>

              <div className="space-y-1">
                <h3 className="font-street text-2xl font-black text-slate-900">DELETE ACCOUNT PERMANENTLY?</h3>
                <p className="text-xs text-slate-500 font-medium">
                  This action will permanently erase your order history, saved addresses, and wishlist.
                </p>
              </div>

              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black uppercase text-slate-700 block">
                  Type 'DELETE' to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full p-3 bg-red-50/50 border border-red-300 rounded-xl text-xs font-mono font-bold text-red-900 uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleDeleteAccount}
                  className="py-3 bg-red-800 hover:bg-red-900 text-white font-black text-xs uppercase rounded-xl shadow"
                >
                  Confirm Delete
                </button>
                <button
                  onClick={() => setShowDeleteAccountModal(false)}
                  className="py-3 border border-slate-300 text-slate-700 font-bold text-xs uppercase rounded-xl hover:bg-slate-100"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
