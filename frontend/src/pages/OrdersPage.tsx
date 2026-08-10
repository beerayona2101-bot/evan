import React, { useEffect, useState } from 'react';
import { Package, Clock } from 'lucide-react';
import { Order } from '../types';
import { api } from '../services/api';

import { useSocket } from '../context/SocketContext';
import { showToast } from '../components/ToastContainer';
import { CancelOrderModal } from '../components/CancelOrderModal';

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelModalOrder, setCancelModalOrder] = useState<Order | null>(null);
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const { socket } = useSocket();

  const fetchOrders = () => {
    api
      .get('/orders/myorders')
      .then((res) => setOrders(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Real-Time Socket.IO Synchronization
  useEffect(() => {
    if (!socket) return;

    const handleOrderUpdated = (updatedOrder: Order) => {
      setOrders((prev) => prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o)));
      showToast(`Live Update: Order #${updatedOrder._id} status is now ${updatedOrder.orderStatus}`, 'info');
    };

    socket.on('orderUpdated', handleOrderUpdated);
    socket.on('orderCreated', fetchOrders);

    return () => {
      socket.off('orderUpdated', handleOrderUpdated);
      socket.off('orderCreated', fetchOrders);
    };
  }, [socket]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-street text-4xl sm:text-5xl font-black text-slate-900 mb-8 border-b border-slate-200 pb-4">
          MY ORDERS
        </h1>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((n) => (
              <div key={n} className="h-40 rounded-3xl bg-white border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl text-center space-y-4 border border-slate-200 shadow-sm">
            <Package className="w-12 h-12 text-slate-400 mx-auto" />
            <h2 className="text-xl font-bold text-slate-900">No Orders Found</h2>
            <p className="text-xs text-slate-500">You haven't placed any orders yet with Kanchanika.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-wrap justify-between items-center border-b border-slate-200 pb-3 text-xs gap-2">
                  <div>
                    <span className="text-slate-500 font-medium">Order ID: </span>
                    <span className="font-mono text-red-600 font-bold">{order._id}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Placed on: </span>
                    <span className="text-slate-900 font-semibold">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-black">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{order.orderStatus}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {order.orderItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 text-xs">
                      <img src={item.image} alt={item.name} className="w-12 h-16 object-cover rounded-xl border border-slate-200 bg-slate-100" />
                      <div className="flex-1">
                        <p className="font-bold text-slate-900">{item.name}</p>
                        <p className="text-slate-500 font-medium">
                          Qty: {item.qty} | Size: {item.size} | Color: {item.color}
                        </p>
                      </div>
                      <span className="font-extrabold text-red-600">₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-200 flex flex-wrap justify-between items-center text-xs gap-3">
                  <span className="text-slate-500 font-medium">Delivery to: {order.shippingAddress.city}, {order.shippingAddress.state}</span>
                  <div className="flex items-center gap-4">
                    {order.orderStatus !== 'Cancelled' && order.orderStatus !== 'Delivered' && (
                      <button
                        onClick={() => {
                          setCancelModalOrder(order);
                          setShowCancelModal(true);
                        }}
                        className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 font-extrabold rounded-xl text-[11px] flex items-center gap-1 border border-red-300 transition-colors"
                      >
                        Cancel Order
                      </button>
                    )}
                    <div className="font-bold text-sm text-slate-900">
                      Total: <span className="text-red-600 font-black">₹{order.totalPrice.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {order.orderStatus === 'Cancelled' && (order as any).cancelReason && (
                  <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-900 font-semibold text-[11px]">
                    Cancellation Reason: <strong>{(order as any).cancelReason}</strong>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <CancelOrderModal
          isOpen={showCancelModal}
          order={cancelModalOrder}
          onClose={() => setShowCancelModal(false)}
          onOrderCancelled={(updatedOrder) => {
            setOrders((prev) => prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o)));
          }}
        />
      </div>
    </div>
  );
};
