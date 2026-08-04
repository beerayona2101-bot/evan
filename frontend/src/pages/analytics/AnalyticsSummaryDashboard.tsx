import React, { useEffect, useState } from 'react';
import {
  RefreshCw,
  ArrowRight,
  ShoppingBag,
  Truck,
  XCircle,
  CreditCard,
  Package,
  Activity,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { api } from '../../services/api';
import { showToast } from '../../components/ToastContainer';
import { useSocket } from '../../context/SocketContext';

interface AnalyticsSummaryDashboardProps {
  onNavigate: (subTab: string) => void;
}

export interface ActivityLogItem {
  id: string;
  type: 'CREATED' | 'STATUS_CHANGE' | 'CANCELLED' | 'DELIVERED' | 'PAYMENT' | 'DELETED';
  title: string;
  subtitle: string;
  amount?: number;
  time: string;
  timestamp: number;
  badgeText: string;
  badgeBg: string;
  badgeTextColor: string;
}

export const AnalyticsSummaryDashboard: React.FC<AnalyticsSummaryDashboardProps> = ({ onNavigate }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<ActivityLogItem[]>([]);
  const { socket } = useSocket();

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const [analyticsRes, ordersRes] = await Promise.all([
        api.get('/analytics/revenue?period=today'),
        api.get('/orders').catch(() => ({ data: [] })),
      ]);

      setData(analyticsRes.data);

      // Transform orders into full day activity log feed
      const rawOrders: any[] = ordersRes.data || [];
      const logs: ActivityLogItem[] = [];

      rawOrders.forEach((o: any) => {
        const timeStr = new Date(o.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const dateStr = new Date(o.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const fullTime = `${dateStr}, ${timeStr}`;
        const custName = o.user?.name || o.shippingAddress?.name || 'Verified Customer';
        const orderNum = o._id ? o._id.toString().slice(-6).toUpperCase() : 'ORDER';

        // 1. Order Creation Event
        logs.push({
          id: `created-${o._id}`,
          type: 'CREATED',
          title: `🛒 Order #${orderNum} Placed by ${custName}`,
          subtitle: `Payment via ${o.paymentMethod || 'Razorpay / Card'} • ${o.orderItems?.length || 1} Item(s)`,
          amount: o.totalPrice,
          time: fullTime,
          timestamp: new Date(o.createdAt).getTime(),
          badgeText: 'NEW ORDER',
          badgeBg: 'bg-emerald-100 border-emerald-300',
          badgeTextColor: 'text-emerald-800',
        });

        // 2. Order Status Specific Event
        if (o.orderStatus === 'Cancelled') {
          logs.push({
            id: `cancelled-${o._id}`,
            type: 'CANCELLED',
            title: `❌ Order #${orderNum} Status Updated to CANCELLED`,
            subtitle: `Customer: ${custName} • Order value: ₹${o.totalPrice?.toLocaleString('en-IN')}`,
            amount: o.totalPrice,
            time: fullTime,
            timestamp: new Date(o.updatedAt || o.createdAt).getTime(),
            badgeText: 'CANCELLED',
            badgeBg: 'bg-red-100 border-red-300',
            badgeTextColor: 'text-red-800',
          });
        } else if (o.orderStatus === 'Delivered') {
          logs.push({
            id: `delivered-${o._id}`,
            type: 'DELIVERED',
            title: `🎉 Order #${orderNum} Successfully DELIVERED`,
            subtitle: `Recipient: ${custName} • Full Payment Verified`,
            amount: o.totalPrice,
            time: fullTime,
            timestamp: new Date(o.updatedAt || o.createdAt).getTime(),
            badgeText: 'DELIVERED',
            badgeBg: 'bg-emerald-100 border-emerald-300',
            badgeTextColor: 'text-emerald-900',
          });
        } else if (o.orderStatus && o.orderStatus !== 'Pending') {
          logs.push({
            id: `status-${o._id}-${o.orderStatus}`,
            type: 'STATUS_CHANGE',
            title: `🚚 Order #${orderNum} Transitioned to ${o.orderStatus.toUpperCase()}`,
            subtitle: `Customer: ${custName} • ${o.shippingAddress?.city || 'India'}`,
            amount: o.totalPrice,
            time: fullTime,
            timestamp: new Date(o.updatedAt || o.createdAt).getTime(),
            badgeText: o.orderStatus.toUpperCase(),
            badgeBg: 'bg-amber-100 border-amber-300',
            badgeTextColor: 'text-amber-900',
          });
        }
      });

      // Sort activity log chronologically (newest first)
      logs.sort((a, b) => b.timestamp - a.timestamp);
      setActivities(logs);

    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to load analytics summary', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  // Listen to live real-time Socket.IO broadcasts
  useEffect(() => {
    if (!socket) return;

    const handleOrderCreated = (newOrder: any) => {
      const orderNum = newOrder._id ? newOrder._id.toString().slice(-6).toUpperCase() : 'ORDER';
      const custName = newOrder.user?.name || 'Verified Buyer';
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const newLog: ActivityLogItem = {
        id: `live-create-${Date.now()}`,
        type: 'CREATED',
        title: `⚡ [LIVE] Order #${orderNum} Placed by ${custName}`,
        subtitle: `Payment via ${newOrder.paymentMethod || 'Card'} • ${newOrder.orderItems?.length || 1} Item(s)`,
        amount: newOrder.totalPrice,
        time: `Just now (${timeStr})`,
        timestamp: Date.now(),
        badgeText: 'LIVE ORDER',
        badgeBg: 'bg-emerald-500 text-white shadow-sm border-emerald-400',
        badgeTextColor: 'text-white font-black',
      };

      setActivities((prev) => [newLog, ...prev]);
      showToast(`Real-Time Alert: New order #${orderNum} placed for ₹${newOrder.totalPrice?.toLocaleString('en-IN')}`, 'success');
    };

    const handleOrderUpdated = (updatedOrder: any) => {
      const orderNum = updatedOrder._id ? updatedOrder._id.toString().slice(-6).toUpperCase() : 'ORDER';
      const statusStr = (updatedOrder.orderStatus || 'Updated').toUpperCase();
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const isCancel = statusStr.includes('CANCEL');
      const isDelivered = statusStr.includes('DELIVER');

      const newLog: ActivityLogItem = {
        id: `live-update-${Date.now()}`,
        type: isCancel ? 'CANCELLED' : isDelivered ? 'DELIVERED' : 'STATUS_CHANGE',
        title: `⚡ [LIVE] Order #${orderNum} Status Updated to ${statusStr}`,
        subtitle: `Order Total: ₹${updatedOrder.totalPrice?.toLocaleString('en-IN')} • ${updatedOrder.user?.name || 'Customer'}`,
        amount: updatedOrder.totalPrice,
        time: `Just now (${timeStr})`,
        timestamp: Date.now(),
        badgeText: statusStr,
        badgeBg: isCancel ? 'bg-red-800 text-white' : isDelivered ? 'bg-emerald-800 text-amber-300' : 'bg-amber-400 text-slate-950',
        badgeTextColor: 'font-black',
      };

      setActivities((prev) => [newLog, ...prev]);
      showToast(`Real-Time Alert: Order #${orderNum} status changed to ${statusStr}`, 'info');
    };

    socket.on('orderCreated', handleOrderCreated);
    socket.on('orderUpdated', handleOrderUpdated);
    socket.on('revenueAnalyticsUpdated', fetchSummary);

    return () => {
      socket.off('orderCreated', handleOrderCreated);
      socket.off('orderUpdated', handleOrderUpdated);
      socket.off('revenueAnalyticsUpdated', fetchSummary);
    };
  }, [socket]);

  if (loading || !data) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-red-800 rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-black text-amber-900 uppercase tracking-widest font-street">
            LOADING EXECUTIVE ANALYTICS ENGINE...
          </p>
        </div>
      </div>
    );
  }

  const { revenueCards } = data;

  return (
    <div className="space-y-5 text-slate-900 font-sans">
      
      {/* Sleek Single-Line Header Bar (Same Height & Size as ANALYTICS PANEL) */}
      <div className="bg-white py-2.5 px-4 sm:px-6 rounded-2xl border border-amber-300 shadow-md flex flex-row items-center justify-between gap-4 overflow-x-auto whitespace-nowrap">
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <h1 className="font-street text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
            📊 MAIN ANALYTICS DASHBOARD
          </h1>
        </div>

        <button
          onClick={fetchSummary}
          className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-300 text-[11px] font-black uppercase tracking-wider rounded-xl border border-amber-300 flex items-center gap-1.5 shadow-md transition-all flex-shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5 text-amber-400" /> REFRESH METRICS
        </button>
      </div>

      {/* EXECUTIVE KPI SUMMARY CARDS (3 CARDS IN ONE ROW) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Card 1: Today's Revenue -> opens Earnings & Taxes page */}
        <div
          onClick={() => onNavigate('financials')}
          className="bg-white p-5 rounded-3xl border border-amber-300 hover:border-red-800 shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer group flex flex-col justify-between space-y-3"
        >
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-black text-amber-900 uppercase tracking-wider block">TOTAL REVENUE (TODAY)</span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-red-800 group-hover:translate-x-1 transition-transform" />
          </div>
          <div>
            <span className="text-2xl font-black text-red-800 font-sans tracking-tight block">
              ₹{revenueCards?.revenueToday?.toLocaleString('en-IN') || '0'}
            </span>
            <span className="text-[11px] text-emerald-700 font-bold block mt-1">
              Open Earnings, Taxes & Financial Reports →
            </span>
          </div>
        </div>

        {/* Card 2: Today's Orders -> opens Orders page */}
        <div
          onClick={() => onNavigate('orders')}
          className="bg-white p-5 rounded-3xl border border-amber-300 hover:border-red-800 shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer group flex flex-col justify-between space-y-3"
        >
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-black text-amber-900 uppercase tracking-wider block">TOTAL ORDERS (TODAY)</span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-red-800 group-hover:translate-x-1 transition-transform" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 font-sans tracking-tight block">
              {revenueCards?.totalOrders || 0} Orders
            </span>
            <span className="text-[11px] text-emerald-700 font-bold block mt-1">
              Open Orders Pipeline Page →
            </span>
          </div>
        </div>

        {/* Card 3: Total Customers -> opens Customer CRM page */}
        <div
          onClick={() => onNavigate('customers')}
          className="bg-white p-5 rounded-3xl border border-amber-300 hover:border-red-800 shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer group flex flex-col justify-between space-y-3"
        >
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-black text-amber-900 uppercase tracking-wider block">REGISTERED CUSTOMERS</span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-red-800 group-hover:translate-x-1 transition-transform" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 font-sans tracking-tight block">
              {revenueCards?.totalCustomers || 0} Customers
            </span>
            <span className="text-[11px] text-emerald-700 font-bold block mt-1">
              Open Customer CRM & Profiles Page →
            </span>
          </div>
        </div>

      </div>

      {/* LIVE REAL-TIME TRANSACTIONS & ORDER STATUS UPDATES (REPLACES OLD REVENUE CHART) */}
      <div className="bg-white p-6 rounded-3xl border border-amber-300 shadow-xl space-y-4">
        
        {/* Card Title & Socket Status Indicator */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-amber-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-800">
                LIVE REAL-TIME STREAM • SOCKET.IO BROADCAST
              </span>
            </div>
            <h3 className="font-street text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2 mt-0.5">
              ⚡ LIVE TRANSACTIONS & ORDER STATUS LOG
            </h3>
          </div>

          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl border border-emerald-300 text-xs font-bold">
            <Activity className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span>SOCKET LIVE FEED ACTIVE</span>
          </div>
        </div>

        {/* Scrollable Container for Full Day Log */}
        <div className="max-h-[380px] overflow-y-auto pr-1 space-y-2.5 custom-scrollbar">
          {activities.length === 0 ? (
            <div className="p-8 text-center bg-amber-50/50 rounded-2xl border border-amber-200 text-slate-600 font-medium text-xs">
              No orders or transactions recorded yet today. Live updates will appear here automatically.
            </div>
          ) : (
            activities.map((act) => {
              let IconComp = ShoppingBag;
              if (act.type === 'CANCELLED') IconComp = XCircle;
              else if (act.type === 'DELIVERED') IconComp = CheckCircle2;
              else if (act.type === 'STATUS_CHANGE') IconComp = Truck;

              return (
                <div
                  key={act.id}
                  className="p-3.5 bg-amber-50/50 hover:bg-amber-100/70 border border-amber-300 rounded-2xl transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-slate-900 text-amber-300 rounded-xl flex-shrink-0 shadow-sm">
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900">{act.title}</h4>
                      <p className="text-slate-600 text-[11px] font-medium mt-0.5">{act.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center flex-shrink-0">
                    {act.amount !== undefined && (
                      <span className="font-black text-red-800 text-sm">
                        ₹{act.amount.toLocaleString('en-IN')}
                      </span>
                    )}
                    <span className={`px-2.5 py-1 rounded-lg border text-[10px] uppercase font-black ${act.badgeBg} ${act.badgeTextColor}`}>
                      {act.badgeText}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-700" />
                      {act.time}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
};
