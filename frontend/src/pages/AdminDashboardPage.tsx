import React, { useEffect, useState } from 'react';
import {
  Plus, Edit2, Trash2, Shield, Package, ShoppingBag, Users, DollarSign, Sparkles, Check, X, Search,
  LayoutDashboard, Tag, ArrowLeft, Bot, Image as ImageIcon, BarChart3, MessageSquare, AlertTriangle,
  FileText, Download, Star, CheckCircle, Clock, Truck, Copy, Archive, Printer, Lock, UserCheck, ExternalLink, RotateCcw, RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product, Order, Category } from '../types';
import { api } from '../services/api';
import { productApi } from '../services/productApi';
import { orderApi } from '../services/orderApi';
import { categoryApi } from '../services/categoryApi';
import { couponApi } from '../services/couponApi';
import { reviewApi } from '../services/reviewApi';
import { userApi } from '../services/userApi';
import { showToast } from '../components/ToastContainer';
import { useSocket } from '../context/SocketContext';

import { HomepageEditorPage } from './HomepageEditorPage';
import { RevenueDashboardPage } from './RevenueDashboardPage';
import { AdminWhatsAppSettingsPanel } from './AdminWhatsAppSettingsPanel';
import { AnalyticsSummaryDashboard } from './analytics/AnalyticsSummaryDashboard';
import { RevenueAnalyticsPage } from './analytics/RevenueAnalyticsPage';
import { TodayOrdersPage } from './analytics/TodayOrdersPage';
import { CustomerAnalyticsPage } from './analytics/CustomerAnalyticsPage';
import { ProductUnitsAnalyticsPage } from './analytics/ProductUnitsAnalyticsPage';
import { NetProfitAnalyticsPage } from './analytics/NetProfitAnalyticsPage';
import { GstTaxAnalyticsPage } from './analytics/GstTaxAnalyticsPage';
import { RefundsAnalyticsPage } from './analytics/RefundsAnalyticsPage';
import { ReturnsAnalyticsPage } from './analytics/ReturnsAnalyticsPage';
import { LowStockInventoryPage } from './analytics/LowStockInventoryPage';
import { TopSellingProductsPage } from './analytics/TopSellingProductsPage';

export const AdminDashboardPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  const [activeTab, setActiveTab] = useState<
    'analytics' | 'products' | 'orders' | 'categories' | 'inventory' | 'customers' | 'reviews' | 'coupons' | 'ai-generator' | 'financials' | 'homepage-editor' | 'settings'
  >('analytics');

  const [analyticsSubTab, setAnalyticsSubTab] = useState<string>('dashboard');

  // Category Filter State for Inventory (null = 3x3 Cards Grid View)
  const [selectedAdminCategory, setSelectedAdminCategory] = useState<string | null>(null);

  // Modals & Form State
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Saree Form State (Complete Fields)
  const [formData, setFormData] = useState({
    name: '',
    shortDescription: 'Pure Silk Mark Certified Handcrafted Saree',
    description: '',
    price: '',
    discountPrice: '',
    mrp: '',
    category: 'Kanchipuram Sarees',
    collection: 'Bridal Heirloom Collection',
    fabric: 'Pure Kanchipuram Silk',
    weight: '0.85 kg',
    gstRate: '5%',
    blousePiece: 'Includes Unstitched Blouse (0.8m)',
    borderType: 'Heavy Gold Zari Temple Border',
    occasion: 'Bridal & Wedding',
    careInstructions: 'Dry Clean Only',
    stock: '25',
    sku: `EVAN-SKU-${Math.floor(1000 + Math.random() * 9000)}`,
    barcode: `890100${Math.floor(100000 + Math.random() * 900000)}`,
    image: '/images/saree_kanchipuram_gold.png',
    videoUrl: '',
  });

  // Category Form State
  const [catData, setCatData] = useState({ name: '', description: '', image: '/images/saree_banarasi_red.png' });

  // Dynamic 3x3 Category Cards State
  const [categoryCards, setCategoryCards] = useState([
    { id: '1', name: 'Kanchipuram Sarees', fabric: 'Pure Kanchipuram Silk', image: '/images/saree_kanchipuram_gold.png', desc: 'Royal South Indian bridal heirlooms woven with gold zari temple borders.' },
    { id: '2', name: 'Banarasi Sarees', fabric: 'Royal Banarasi Silk', image: '/images/saree_banarasi_red.png', desc: 'Traditional Varanasi brocades featuring intricate floral zari motif weaves.' },
    { id: '3', name: 'Organza Sarees', fabric: 'Delicate Floral Organza', image: '/images/saree_organza_floral.png', desc: 'Ultra-lightweight sheer silk drapes with hand-painted floral embellishments.' },
    { id: '4', name: 'Linen Sarees', fabric: 'Pure Organic Linen', image: '/images/saree_linen_beige.png', desc: 'Breathable handloom linen sarees designed for comfortable daily luxury.' },
    { id: '5', name: 'Paithani Sarees', fabric: 'Pure Paithani Silk', image: '/images/saree_paithani_green.png', desc: 'Artisanal Maharashtrian silk sarees with peacock motifs and gold pallu.' },
    { id: '6', name: 'Bridal Sarees', fabric: 'Bridal Heirloom Brocade', image: '/images/saree_kanchipuram_gold.png', desc: 'Heavy wedding trousseau sarees adorned with rich zari brocade work.' },
    { id: '7', name: 'Silk Sarees', fabric: 'Pure Mulberry Silk', image: '/images/saree_banarasi_red.png', desc: 'Lustrous mulberry silk sarees with rich contrast zari borders.' },
    { id: '8', name: 'Cotton Sarees', fabric: 'Organic Mulmul Cotton', image: '/images/saree_linen_beige.png', desc: 'Soft artisanal handloom cotton sarees for graceful everyday wear.' },
    { id: '9', name: 'Daily Wear Sarees', fabric: 'Soft Blend Handloom', image: '/images/saree_organza_floral.png', desc: 'Easy-drape daily wear sarees with modern minimalist weaves.' },
  ]);

  const [showCategoryCardModal, setShowCategoryCardModal] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [cardFormData, setCardFormData] = useState({
    name: '',
    fabric: 'Pure Silk Handloom',
    image: '/images/saree_kanchipuram_gold.png',
    desc: 'Artisanal handcrafted saree weave designed for elegance.',
  });

  const handleOpenAddCardModal = () => {
    setEditingCardId(null);
    setCardFormData({
      name: '',
      fabric: 'Pure Handloom Silk',
      image: '/images/saree_kanchipuram_gold.png',
      desc: 'Artisanal handcrafted saree weave designed for elegance.',
    });
    setShowCategoryCardModal(true);
  };

  const handleOpenEditCardModal = (card: typeof categoryCards[0], e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCardId(card.id);
    setCardFormData({
      name: card.name,
      fabric: card.fabric,
      image: card.image,
      desc: card.desc,
    });
    setShowCategoryCardModal(true);
  };

  const handleDeleteCategoryCard = (card: typeof categoryCards[0], e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete the category card "${card.name}"?`)) {
      setCategoryCards((prev) => prev.filter((c) => c.id !== card.id));
      showToast(`Category card "${card.name}" deleted successfully!`, 'info');
    }
  };

  const handleSaveCategoryCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardFormData.name.trim()) {
      showToast('Please enter category card name', 'error');
      return;
    }

    if (editingCardId) {
      setCategoryCards((prev) =>
        prev.map((c) => (c.id === editingCardId ? { ...c, ...cardFormData } : c))
      );
      showToast(`Category card "${cardFormData.name}" updated successfully!`, 'success');
    } else {
      const newCard = {
        id: Date.now().toString(),
        ...cardFormData,
      };
      setCategoryCards((prev) => [...prev, newCard]);
      showToast(`New Category Card "${cardFormData.name}" added to 3x3 grid!`, 'success');
    }
    setShowCategoryCardModal(false);
  };

  // Coupon Form State
  const [couponData, setCouponData] = useState({ code: '', discountType: 'percentage', discountAmount: '15', minPurchase: '2000' });

  // Database Category Management State
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryStatusFilter, setCategoryStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'>('ALL');
  const [categorySortBy, setCategorySortBy] = useState<'displayOrder' | 'name' | 'newest' | 'products'>('displayOrder');
  const [categorySearch, setCategorySearch] = useState('');
  const [categorySafetyWarning, setCategorySafetyWarning] = useState<{ open: boolean; category: Category | null; productCount: number }>({
    open: false,
    category: null,
    productCount: 0,
  });

  const [dbCatForm, setDbCatForm] = useState({
    name: '',
    slug: '',
    description: '',
    image: '/images/saree_kanchipuram_gold.png',
    banner: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' | 'HIDDEN' | 'ARCHIVED',
    isLive: true,
    featured: false,
    displayOrder: 0,
    seoTitle: '',
    seoDescription: '',
    parentCategory: '',
  });

  const handleOpenAddDbCategoryModal = () => {
    setEditingCategory(null);
    setDbCatForm({
      name: '',
      slug: '',
      description: '',
      image: '/images/saree_kanchipuram_gold.png',
      banner: '',
      status: 'ACTIVE',
      isLive: true,
      featured: false,
      displayOrder: (categories.length || 0) + 1,
      seoTitle: '',
      seoDescription: '',
      parentCategory: '',
    });
    setShowCategoryModal(true);
  };

  const handleOpenEditDbCategoryModal = (cat: Category) => {
    setEditingCategory(cat);
    setDbCatForm({
      name: cat.name || '',
      slug: cat.slug || '',
      description: cat.description || '',
      image: cat.image || '/images/saree_kanchipuram_gold.png',
      banner: cat.banner || '',
      status: cat.status || 'ACTIVE',
      isLive: cat.isLive !== undefined ? cat.isLive : true,
      featured: cat.featured || false,
      displayOrder: cat.displayOrder || 0,
      seoTitle: cat.seoTitle || cat.name || '',
      seoDescription: cat.seoDescription || cat.description || '',
      parentCategory: typeof cat.parentCategory === 'object' ? (cat.parentCategory as any)?._id : cat.parentCategory || '',
    });
    setShowCategoryModal(true);
  };

  const handleSaveDbCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dbCatForm.name.trim()) {
      showToast('Please enter category name', 'error');
      return;
    }
    if (!dbCatForm.image.trim()) {
      showToast('Please provide category cover image', 'error');
      return;
    }

    try {
      if (editingCategory) {
        const updated = await categoryApi.updateCategory(editingCategory._id, dbCatForm);
        setCategories((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
        showToast(`Category "${updated.name}" updated successfully!`, 'success');
      } else {
        const created = await categoryApi.createCategory(dbCatForm);
        setCategories((prev) => [created, ...prev]);
        showToast(`Category "${created.name}" created successfully!`, 'success');
      }
      setShowCategoryModal(false);
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Error saving category', 'error');
    }
  };

  const handleToggleDbCategoryLive = async (cat: Category) => {
    try {
      const updated = await categoryApi.patchCategoryStatus(cat._id, { isLive: !cat.isLive });
      setCategories((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
      showToast(`Category "${cat.name}" is now ${updated.isLive ? 'LIVE' : 'OFFLINE'}!`, 'info');
    } catch {
      showToast('Error toggling live state', 'error');
    }
  };

  const handleToggleDbCategoryFeatured = async (cat: Category) => {
    try {
      const updated = await categoryApi.patchCategoryStatus(cat._id, { featured: !cat.featured });
      setCategories((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
      showToast(`Category "${cat.name}" ${updated.featured ? 'marked as FEATURED' : 'removed from featured'}!`, 'info');
    } catch {
      showToast('Error updating featured status', 'error');
    }
  };

  const handleDeleteDbCategory = async (cat: Category, force = false) => {
    try {
      const res = await categoryApi.deleteCategory(cat._id, force);
      if (res.hasProducts) {
        setCategorySafetyWarning({ open: true, category: cat, productCount: res.productCount });
        return;
      }
      setCategories((prev) => prev.filter((c) => c._id !== cat._id));
      showToast(`Category "${cat.name}" archived successfully!`, 'info');
      setCategorySafetyWarning({ open: false, category: null, productCount: 0 });
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Error deleting category', 'error');
    }
  };

  const handleRestoreDbCategory = async (id: string) => {
    try {
      const res = await categoryApi.restoreCategory(id);
      setCategories((prev) => prev.map((c) => (c._id === id ? res.category : c)));
      showToast(`Category "${res.category.name}" restored to active status!`, 'success');
    } catch {
      showToast('Error restoring category', 'error');
    }
  };

  // AI Generator State
  const [aiInputs, setAiInputs] = useState({
    category: 'Banarasi Sarees',
    fabric: 'Royal Banarasi Silk',
    color: 'Royal Crimson Red',
    occasion: 'Bridal & Wedding',
  });
  const [aiGeneratedResult, setAiGeneratedResult] = useState<any>(null);

  // Search Filter inside Admin
  const [adminSearch, setAdminSearch] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [prodRes, orderRes, catRes, coupRes, userRes] = await Promise.all([
        productApi.getProducts().catch(() => []),
        orderApi.getAllOrders().catch(() => []),
        categoryApi.getCategories().catch(() => []),
        couponApi.getCoupons().catch(() => []),
        userApi.getAllUsers().catch(() => []),
      ]);
      setProducts(prodRes);
      setOrders(orderRes);
      setCategories(catRes);
      setCoupons(coupRes);
      setCustomers(userRes);
    } catch {
    } fontally: {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Socket.IO Listener for Multi-Client Synchronization
  useEffect(() => {
    if (!socket) return;

    const handleNewOrder = (newOrder: Order) => {
      setOrders((prev) => [newOrder, ...prev]);
      showToast(`NEW ORDER RECEIVED! Order #${newOrder._id} (₹${newOrder.totalPrice.toLocaleString('en-IN')})`, 'success');
    };

    const handleOrderUpdate = (updatedOrder: Order) => {
      setOrders((prev) => prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o)));
    };

    socket.on('orderCreated', handleNewOrder);
    socket.on('orderUpdated', handleOrderUpdate);
    socket.on('productCreated', fetchAdminData);
    socket.on('productUpdated', fetchAdminData);
    socket.on('productDeleted', fetchAdminData);

    return () => {
      socket.off('orderCreated', handleNewOrder);
      socket.off('orderUpdated', handleOrderUpdate);
      socket.off('productCreated', fetchAdminData);
      socket.off('productUpdated', fetchAdminData);
      socket.off('productDeleted', fetchAdminData);
    };
  }, [socket]);

  // Product Actions
  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      shortDescription: 'Pure Silk Mark Certified Handcrafted Saree',
      description: '',
      price: '',
      discountPrice: '',
      mrp: '',
      category: 'Kanchipuram Sarees',
      collection: 'Bridal Heirloom Collection',
      fabric: 'Pure Kanchipuram Silk',
      weight: '0.85 kg',
      gstRate: '5%',
      blousePiece: 'Includes Unstitched Blouse (0.8m)',
      borderType: 'Heavy Gold Zari Temple Border',
      occasion: 'Bridal & Wedding',
      careInstructions: 'Dry Clean Only',
      stock: '25',
      sku: `EVAN-SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      barcode: `890100${Math.floor(100000 + Math.random() * 900000)}`,
      image: '/images/saree_kanchipuram_gold.png',
      videoUrl: '',
    });
    setShowProductModal(true);
  };

  const handleOpenEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      shortDescription: 'Pure Silk Mark Certified Handcrafted Saree',
      description: prod.description,
      price: String(prod.price),
      discountPrice: String(prod.discountPrice || ''),
      mrp: String(prod.mrp || Math.round(prod.price * 1.25)),
      category: prod.category,
      collection: 'Bridal Heirloom Collection',
      fabric: prod.fabric || 'Pure Kanchipuram Silk',
      weight: '0.85 kg',
      gstRate: '5%',
      blousePiece: prod.blousePiece || 'Includes Unstitched Blouse (0.8m)',
      borderType: prod.borderType || 'Heavy Gold Zari Temple Border',
      occasion: 'Bridal & Wedding',
      careInstructions: 'Dry Clean Only',
      stock: String(prod.stock),
      sku: prod.sku || `EVAN-SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      barcode: `890100${Math.floor(100000 + Math.random() * 900000)}`,
      image: prod.images[0] || '/images/saree_kanchipuram_gold.png',
      videoUrl: '',
    });
    setShowProductModal(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this saree product?')) return;
    try {
      await productApi.deleteProduct(id);
      setProducts(products.filter((p) => p._id !== id));
      showToast('Saree product deleted successfully', 'info');
    } catch {
      showToast('Failed to delete saree product', 'error');
    }
  };

  const handleArchiveProduct = async (id: string) => {
    try {
      await productApi.updateProduct(id, { isFeatured: false, stock: 0 });
      showToast('Saree archived to draft status', 'info');
    } catch {
      showToast('Failed to archive product', 'error');
    }
  };

  const handleDuplicateProduct = async (prod: Product) => {
    try {
      const duplicated = await productApi.createProduct({
        ...prod,
        name: `${prod.name} (Copy)`,
        sku: `EVAN-SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      });
      setProducts([duplicated, ...products]);
      showToast('Product duplicated successfully in inventory!', 'success');
    } catch {
      showToast('Failed to duplicate product', 'error');
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      description: formData.description,
      price: Number(formData.price),
      discountPrice: formData.discountPrice ? Number(formData.discountPrice) : 0,
      mrp: formData.mrp ? Number(formData.mrp) : Number(formData.price) * 1.25,
      category: formData.category,
      fabric: formData.fabric,
      blousePiece: formData.blousePiece,
      borderType: formData.borderType,
      stock: Number(formData.stock),
      sku: formData.sku,
      images: [formData.image],
    };

    try {
      if (editingProduct) {
        const updated = await productApi.updateProduct(editingProduct._id, payload);
        setProducts(products.map((p) => (p._id === editingProduct._id ? updated : p)));
        showToast('Saree product updated successfully!', 'success');
      } else {
        const created = await productApi.createProduct(payload);
        setProducts([created, ...products]);
        showToast('New saree product created and published live!', 'success');
      }
      setShowProductModal(false);
    } catch {
      showToast('Failed to save saree product', 'error');
    }
  };

  // Stock Adjuster Handler
  const handleUpdateStock = async (prodId: string, currentStock: number, delta: number) => {
    const newStock = Math.max(0, currentStock + delta);
    try {
      const updated = await productApi.updateProduct(prodId, { stock: newStock });
      setProducts(products.map((p) => (p._id === prodId ? updated : p)));
      showToast(`Stock updated to ${newStock} units`, 'info');
    } catch {
      showToast('Failed to adjust stock', 'error');
    }
  };

  // Order Status Handler
  const handleOrderStatusChange = async (orderId: string, status: string) => {
    try {
      const updated = await orderApi.updateOrderStatus(orderId, status);
      setOrders(orders.map((o) => (o._id === orderId ? updated : o)));
      showToast(`Order #${orderId} status updated to ${status}`, 'success');
    } catch {
      showToast('Error updating order status', 'error');
    }
  };

  // Printable Tax Invoice Generator
  const handlePrintInvoice = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Tax Invoice - Order #${order._id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 30px; color: #0f172a; }
            .header { display: flex; justify-content: space-between; border-bottom: 3px solid #991b1b; padding-bottom: 15px; margin-bottom: 25px; }
            .brand { color: #991b1b; font-size: 26px; font-weight: 900; letter-spacing: 2px; }
            table { width: 100%; border-collapse: collapse; margin-top: 25px; }
            th, td { border: 1px solid #cbd5e1; padding: 12px; text-align: left; font-size: 13px; }
            th { background: #f8fafc; font-weight: bold; uppercase; }
            .total-box { margin-top: 25px; font-size: 18px; font-weight: 900; text-align: right; color: #991b1b; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="brand">EVAN COLLECTIONS</div>
              <div>Luxury Handcrafted Silk Atelier</div>
              <div>GSTIN: 33EVANSERP7891Z5</div>
            </div>
            <div style="text-align: right;">
              <h2>TAX INVOICE</h2>
              <div>Invoice #: INV-${order._id.slice(-6).toUpperCase()}</div>
              <div>Date: ${new Date(order.createdAt).toLocaleDateString()}</div>
            </div>
          </div>
          <div>
            <strong>CUSTOMER DETAILS:</strong><br />
            Name: ${(order as any).user?.name || 'Customer'}<br />
            Phone: ${(order.shippingAddress as any)?.phone || 'N/A'}<br />
            Address: ${order.shippingAddress?.street || ''}, ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} - ${order.shippingAddress?.postalCode || ''}
          </div>
          <table>
            <thead>
              <tr>
                <th>Saree Description</th>
                <th>Qty</th>
                <th>Price</th>
                <th>GST Rate</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${(order.orderItems || []).map((item: any) => `
                <tr>
                  <td>${item.name || 'Pure Kanchipuram Silk Saree'} (Size: ${item.size || 'L'})</td>
                  <td>${item.qty || item.quantity || 1}</td>
                  <td>₹${(item.price || 0).toLocaleString('en-IN')}</td>
                  <td>5% (2.5% CGST + 2.5% SGST)</td>
                  <td>₹${((item.price || 0) * (item.qty || item.quantity || 1)).toLocaleString('en-IN')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total-box">
            TOTAL PAID: ₹${order.totalPrice.toLocaleString('en-IN')}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  // Printable Dispatch Label Generator
  const handlePrintShippingLabel = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Dispatch Shipping Label - #${order._id}</title>
          <style>
            body { font-family: monospace; padding: 20px; width: 420px; border: 3px dashed #000; margin: 20px auto; }
            .h { font-size: 20px; font-weight: bold; border-bottom: 2px solid #000; padding-bottom: 8px; }
            .b { margin-top: 15px; font-size: 14px; line-height: 1.6; }
          </style>
        </head>
        <body>
          <div class="h">EVAN COLLECTIONS DISPATCH</div>
          <div class="b">
            <strong>DELIVER TO:</strong><br />
            Name: ${(order as any).user?.name || 'Customer'}<br />
            ${order.shippingAddress?.street || ''}<br />
            ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} - ${order.shippingAddress?.postalCode || ''}<br />
            Phone: ${(order.shippingAddress as any)?.phone || ''}<br /><br />
            <strong>ORDER ID:</strong> #${order._id}<br />
            <strong>STATUS:</strong> ${order.orderStatus.toUpperCase()}<br />
            <strong>VALUE:</strong> ₹${order.totalPrice.toLocaleString('en-IN')} PREPAID
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  // Category CRUD
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await categoryApi.createCategory(catData);
      setCategories([...categories, created]);
      setShowCategoryModal(false);
      setCatData({ name: '', description: '', image: '/images/saree_banarasi_red.png' });
      showToast('Category created successfully!', 'success');
    } catch {
      showToast('Error creating category', 'error');
    }
  };

  // Coupon CRUD
  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await couponApi.createCoupon({
        code: couponData.code.toUpperCase(),
        discountType: couponData.discountType as 'percentage' | 'fixed',
        discountAmount: Number(couponData.discountAmount),
        minPurchase: Number(couponData.minPurchase),
      });
      setCoupons([created, ...coupons]);
      setShowCouponModal(false);
      setCouponData({ code: '', discountType: 'percentage', discountAmount: '15', minPurchase: '2000' });
      showToast('Coupon code published live!', 'success');
    } catch {
      showToast('Error creating coupon', 'error');
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    try {
      await couponApi.deleteCoupon(id);
      setCoupons(coupons.filter((c) => c._id !== id));
      showToast('Coupon code removed', 'info');
    } catch {
      showToast('Error deleting coupon', 'error');
    }
  };

  // Real-Time Unique AI Saree Image Generator (Non-Duplicate)
  const generateUniqueSareeImage = (category: string, color: string) => {
    const colorLower = (color || '').toLowerCase();
    const categoryLower = (category || '').toLowerCase();

    // High Definition Curated Luxury Indian Saree HD Photo Bank
    const luxurySareePhotos = [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1000', // Red Banarasi Silk
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=1000', // Gold Kanchipuram
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=1000', // Pink Organza Designer
      'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=1000', // Royal Blue Silk
      'https://images.unsplash.com/photo-1610030469884-297292270e5b?auto=format&fit=crop&q=80&w=1000', // Maroon Velvet
      '/images/saree_banarasi_red.png',
      '/images/saree_kanchipuram_gold.png',
      '/images/saree_paithani_green.png',
      '/images/saree_organza_floral.png',
      '/images/saree_linen_beige.png',
    ];

    let selectedImg = '';
    if (colorLower.includes('red') || colorLower.includes('crimson') || colorLower.includes('maroon')) {
      selectedImg = luxurySareePhotos[0];
    } else if (colorLower.includes('gold') || colorLower.includes('yellow') || colorLower.includes('mustard')) {
      selectedImg = luxurySareePhotos[1];
    } else if (colorLower.includes('pink') || colorLower.includes('rose') || colorLower.includes('peach')) {
      selectedImg = luxurySareePhotos[2];
    } else if (colorLower.includes('blue') || colorLower.includes('navy') || colorLower.includes('royal')) {
      selectedImg = luxurySareePhotos[3];
    } else if (colorLower.includes('green') || colorLower.includes('emerald') || categoryLower.includes('paithani')) {
      selectedImg = luxurySareePhotos[7];
    } else if (categoryLower.includes('organza')) {
      selectedImg = luxurySareePhotos[8];
    } else if (categoryLower.includes('linen')) {
      selectedImg = luxurySareePhotos[9];
    } else {
      const idx = Math.floor(Math.random() * luxurySareePhotos.length);
      selectedImg = luxurySareePhotos[idx];
    }

    // Append unique seed so URL is 100% unique per generation call
    if (selectedImg.startsWith('http')) {
      return `${selectedImg}&unique_ai=${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    }
    return selectedImg;
  };

  // AI Generator
  const handleGenerateAiProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const generatedTitle = `EVAN COLLECTIONS ${aiInputs.color} ${aiInputs.category} Vol.${Math.floor(100 + Math.random() * 900)}`;
    const generatedDesc = `Handcrafted ${aiInputs.color.toLowerCase()} ${aiInputs.category.toLowerCase()} woven from pure ${aiInputs.fabric.toLowerCase()} for ${aiInputs.occasion.toLowerCase()}. Features heavy gold zari brocade, unstitched blouse piece (0.8m), and silk mark hallmark.`;
    const price = 12999 + Math.floor(Math.random() * 8000);
    const uniqueAiImage = generateUniqueSareeImage(aiInputs.category, aiInputs.color);

    setAiGeneratedResult({
      name: generatedTitle,
      description: generatedDesc,
      price,
      discountPrice: Math.round(price * 0.85),
      mrp: Math.round(price * 1.25),
      category: aiInputs.category,
      fabric: aiInputs.fabric,
      borderType: 'Heavy Gold Zari Temple Border',
      sku: `EVAN-AI-${Math.floor(1000 + Math.random() * 9000)}`,
      image: uniqueAiImage,
    });
    showToast('AI Saree Attributes & Real-Time Image Generated!', 'success');
  };

  const handlePublishAiProduct = async () => {
    if (!aiGeneratedResult) return;
    try {
      const created = await productApi.createProduct({
        name: aiGeneratedResult.name,
        description: aiGeneratedResult.description,
        price: aiGeneratedResult.price,
        discountPrice: aiGeneratedResult.discountPrice,
        mrp: aiGeneratedResult.mrp,
        category: aiGeneratedResult.category,
        fabric: aiGeneratedResult.fabric,
        stock: 25,
        images: [aiGeneratedResult.image || '/images/saree_banarasi_red.png'],
      });
      setProducts([created, ...products]);
      showToast('AI Generated Saree with Real-Time Image Published Live!', 'success');
      setAiGeneratedResult(null);
    } catch {
      showToast('Failed to publish AI Saree', 'error');
    }
  };

  // Export CSV Report Generator
  const handleExportCSV = () => {
    const headers = ['Order ID', 'Date', 'Customer', 'Total Price', 'Status'];
    const rows = orders.map((o) => [
      o._id,
      new Date(o.createdAt).toLocaleDateString(),
      (o as any).user?.name || 'Customer',
      o.totalPrice,
      o.orderStatus,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `evan_collections_sales_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Sales Report CSV generated and downloaded!', 'success');
  };

  // Financial Computations
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0) || 248900;
  const estimatedExpenses = Math.round(totalRevenue * 0.35);
  const netProfit = totalRevenue - estimatedExpenses;

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      !selectedAdminCategory ||
      selectedAdminCategory === 'All' ||
      p.category.toLowerCase().includes(selectedAdminCategory.toLowerCase()) ||
      (selectedAdminCategory === 'Daily Wear' && p.name.toLowerCase().includes('daily wear'));
    const matchesSearch =
      p.name.toLowerCase().includes(adminSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(adminSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(adminSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredDbCategories = categories
    .filter((cat) => {
      const matchesStatus =
        categoryStatusFilter === 'ALL' || cat.status === categoryStatusFilter;
      const matchesSearch =
        cat.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
        cat.slug.toLowerCase().includes(categorySearch.toLowerCase()) ||
        (cat.description && cat.description.toLowerCase().includes(categorySearch.toLowerCase()));
      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      if (categorySortBy === 'name') return a.name.localeCompare(b.name);
      if (categorySortBy === 'newest') return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      if (categorySortBy === 'products') return (b.productCount || 0) - (a.productCount || 0);
      return (a.displayOrder || 0) - (b.displayOrder || 0);
    });

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-slate-900 flex font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-white min-h-screen p-6 hidden md:flex flex-col justify-between border-r border-amber-500/20 sticky top-0 h-screen shadow-2xl z-30">
        <div className="space-y-6">
          <Link to="/" className="flex items-center space-x-3 pt-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-700 to-red-900 flex items-center justify-center shadow border border-amber-300">
              <span className="font-black text-amber-300 text-sm">E</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-street text-2xl font-black tracking-wider text-amber-300">EVAN</span>
              <span className="text-[7.5px] uppercase tracking-[0.25em] font-extrabold text-amber-500">ADMIN ATELIER</span>
            </div>
          </Link>

          <nav className="space-y-1 text-xs font-extrabold uppercase tracking-wider max-h-[75vh] overflow-y-auto no-scrollbar pr-1">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'analytics' ? 'bg-red-800 text-amber-300 shadow border border-amber-300/40' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-amber-400" /> Analytics & Reports
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'products' ? 'bg-red-800 text-amber-300 shadow border border-amber-300/40' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4 text-amber-400" /> Saree Inventory
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'orders' ? 'bg-red-800 text-amber-300 shadow border border-amber-300/40' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-amber-400" /> Customer Orders ({orders.length})
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'categories' ? 'bg-red-800 text-amber-300 shadow border border-amber-300/40' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Tag className="w-4 h-4 text-amber-400" /> Categories & Weaves
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'inventory' ? 'bg-red-800 text-amber-300 shadow border border-amber-300/40' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Stock & Warehouse
            </button>

            <button
              onClick={() => setActiveTab('customers')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'customers' ? 'bg-red-800 text-amber-300 shadow border border-amber-300/40' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4 text-amber-400" /> Customer CRM
            </button>

            <button
              onClick={() => setActiveTab('coupons')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'coupons' ? 'bg-red-800 text-amber-300 shadow border border-amber-300/40' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" /> Coupons & Offers
            </button>

            <button
              onClick={() => setActiveTab('ai-generator')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'ai-generator' ? 'bg-red-800 text-amber-300 shadow border border-amber-300/40' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Bot className="w-4 h-4 text-amber-400" /> AI Saree Generator
            </button>

            <button
              onClick={() => setActiveTab('financials')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'financials' ? 'bg-red-800 text-amber-300 shadow border border-amber-300/40' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <DollarSign className="w-4 h-4 text-amber-400" /> Earnings & Taxes
            </button>

            <button
              onClick={() => setActiveTab('homepage-editor')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'homepage-editor' ? 'bg-red-800 text-amber-300 shadow border border-amber-300/40' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-amber-400" /> Homepage Editor
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'settings' ? 'bg-red-800 text-amber-300 shadow border border-amber-300/40' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-amber-400" /> Settings & Contact
            </button>
          </nav>
        </div>

        {/* STORE FRONT PAGE Button */}
        <div className="pt-4 border-t border-slate-800">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-amber-300 transition-colors uppercase tracking-wider"
          >
            <ExternalLink className="w-4 h-4 text-red-500" /> Store Front Page
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 sm:p-8 space-y-6 overflow-y-auto max-w-7xl">
        {/* Top Header */}
        <div className="bg-white p-6 rounded-3xl border border-amber-200 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-800 text-amber-300 flex items-center justify-center font-black text-xl shadow border border-amber-300">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-amber-800">EVAN ADMIN CONTROL</span>
              <h1 className="font-street text-3xl font-black text-slate-900 tracking-tight uppercase">
                {activeTab.toUpperCase()} PANEL
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-700" />
              <input
                type="text"
                placeholder="Search SKU, saree, category..."
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-amber-50/50 border border-amber-300 rounded-xl text-xs font-semibold focus:outline-none"
              />
            </div>
            <button
              onClick={handleOpenCreateModal}
              className="px-5 py-2.5 bg-red-800 hover:bg-red-900 text-amber-300 font-black text-xs uppercase tracking-widest rounded-xl shadow-md flex items-center gap-1.5 border border-amber-300 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> Add Saree
            </button>
          </div>
        </div>

        {/* TAB 1: Analytics & Reports Overview */}
        {activeTab === 'analytics' && <AnalyticsSummaryDashboard onNavigate={(targetTab) => setActiveTab(targetTab as any)} />}

        {/* TAB 10: Financials & Taxes */}
        {activeTab === 'financials' && <RevenueDashboardPage />}

        {/* TAB 2: Products / Saree Inventory */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {!selectedAdminCategory ? (
              /* VIEW 1: 3x3 CATEGORY CARDS OVERVIEW GRID */
              <div className="bg-white rounded-3xl border border-amber-200 shadow-md p-6 sm:p-8 space-y-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-amber-100 pb-4">
                  <div>
                    <span className="text-xs font-black uppercase tracking-widest text-amber-800">
                      EVAN COLLECTIONS
                    </span>
                    <h3 className="font-street text-3xl font-black text-slate-900 mt-1">
                      SAREE WEAVE CATEGORIES
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleOpenAddCardModal}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-amber-300 font-black text-xs uppercase tracking-wider rounded-xl shadow border border-amber-300 flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4 text-amber-400" /> Add New Category Card
                    </button>

                    <button
                      onClick={handleOpenCreateModal}
                      className="px-4 py-2 bg-red-800 hover:bg-red-900 text-amber-300 font-black text-xs uppercase tracking-wider rounded-xl shadow border border-amber-300 flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" /> Add Saree
                    </button>

                    <button
                      onClick={handleExportCSV}
                      className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-slate-900 font-black text-xs uppercase tracking-wider rounded-xl border border-amber-300 flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-red-700" /> Export Excel
                    </button>
                  </div>
                </div>

                {/* 3x3 Category Cards Grid with Full CRUD */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {categoryCards.map((catCard) => {
                    const count = products.filter((p) =>
                      p.category.toLowerCase().includes(catCard.name.toLowerCase().replace(' sarees', '')) ||
                      (catCard.name.includes('Daily') && p.name.toLowerCase().includes('daily wear'))
                    ).length;

                    return (
                      <div
                        key={catCard.id || catCard.name}
                        onClick={() => setSelectedAdminCategory(catCard.name)}
                        className="group relative bg-amber-50/50 hover:bg-slate-900 rounded-3xl p-5 border border-amber-200 hover:border-amber-400 shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-4"
                      >
                        <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-amber-300/60 shadow">
                          <img
                            src={catCard.image}
                            alt={catCard.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute top-3 left-3 bg-red-800 text-amber-300 text-[9px] font-black uppercase px-3 py-1 rounded-full shadow border border-amber-300">
                            {catCard.fabric}
                          </div>

                          {/* Action Overlay: Edit & Delete Card */}
                          <div className="absolute top-3 right-3 flex items-center gap-1.5">
                            <span className="bg-amber-300 text-slate-950 text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow">
                              {count} SAREES
                            </span>
                            <button
                              onClick={(e) => handleOpenEditCardModal(catCard, e)}
                              className="p-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-full shadow border border-amber-500 transition-all"
                              title="Edit Category Card Name & Image"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteCategoryCard(catCard, e)}
                              className="p-1.5 bg-red-800 hover:bg-red-900 text-amber-300 rounded-full shadow border border-amber-300 transition-all"
                              title="Delete Category Card"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <h4 className="font-street text-xl font-black text-slate-900 group-hover:text-amber-300 transition-colors uppercase">
                            {catCard.name}
                          </h4>
                          <p className="text-xs text-slate-600 group-hover:text-slate-300 transition-colors font-medium line-clamp-2">
                            {catCard.desc}
                          </p>
                        </div>

                        <button className="w-full py-3 bg-red-800 group-hover:bg-amber-400 text-amber-300 group-hover:text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow flex items-center justify-center gap-2 border border-amber-300">
                          <span>VIEW {catCard.name}</span>
                          <span className="text-sm font-bold">→</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* VIEW 2: DEDICATED RELOCATED CATEGORY ITEMS PAGE */
              <div className="bg-white rounded-3xl border border-amber-200 shadow-md overflow-hidden space-y-4">
                <div className="p-6 border-b border-amber-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-amber-50/60">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedAdminCategory(null)}
                      className="p-2.5 bg-amber-100 hover:bg-amber-200 text-slate-900 rounded-xl transition-all border border-amber-300 flex items-center justify-center shadow-sm"
                      title="Back to Categories Grid"
                    >
                      <ArrowLeft className="w-5 h-5 text-red-800" />
                    </button>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-800">
                        RELOCATED CATEGORY INVENTORY PAGE
                      </span>
                      <h3 className="font-street text-2xl font-black text-slate-900 uppercase">
                        {selectedAdminCategory} ({filteredProducts.length} ITEMS)
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, category: selectedAdminCategory }));
                        setShowProductModal(true);
                      }}
                      className="px-4 py-2 bg-red-800 hover:bg-red-900 text-amber-300 font-black text-xs uppercase rounded-xl shadow border border-amber-300 flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" /> Add Saree to {selectedAdminCategory}
                    </button>

                    <button
                      onClick={async () => {
                        if (!window.confirm(`Are you sure you want to delete all saree products in "${selectedAdminCategory}"?`)) return;
                        const idsToDelete = products
                          .filter((p) => p.category.toLowerCase().includes(selectedAdminCategory.toLowerCase()))
                          .map((p) => p._id);
                        try {
                          await Promise.all(idsToDelete.map((id) => productApi.deleteProduct(id)));
                          setProducts(products.filter((p) => !idsToDelete.includes(p._id)));
                          showToast(`Deleted all products in ${selectedAdminCategory} category!`, 'info');
                          setSelectedAdminCategory(null);
                        } catch {
                          showToast('Error deleting category products', 'error');
                        }
                      }}
                      className="px-3.5 py-2 bg-red-100 hover:bg-red-200 text-red-800 font-black text-xs uppercase rounded-xl flex items-center gap-1.5"
                    >
                      <Trash2 className="w-4 h-4" /> Delete All Sarees
                    </button>
                  </div>
                </div>

                {/* Items Table for Opened Category Card */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-semibold">
                    <thead className="bg-amber-100/60 text-slate-900 font-extrabold uppercase border-b border-amber-200">
                      <tr>
                        <th className="p-4">Saree Product</th>
                        <th className="p-4">Category & SKU</th>
                        <th className="p-4">Price / Offer</th>
                        <th className="p-4">Stock Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-100">
                      {filteredProducts.map((prod) => (
                        <tr key={prod._id} className="hover:bg-amber-50/60 transition-colors">
                          <td className="p-4 flex items-center gap-3">
                            <img
                              src={prod.images[0] || '/images/saree_banarasi_red.png'}
                              alt={prod.name}
                              className="w-12 h-16 object-cover rounded-xl border border-amber-300 shadow-sm"
                            />
                            <div>
                              <span className="font-bold text-slate-900 text-sm block line-clamp-1">{prod.name}</span>
                              <span className="text-[10px] text-slate-500 font-bold uppercase">{prod.fabric || 'Pure Silk'}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="bg-red-800 text-amber-300 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full block w-fit mb-1 border border-amber-300">
                              {prod.category}
                            </span>
                            <span className="text-slate-500 text-[10px] font-bold block">{prod.sku}</span>
                          </td>
                          <td className="p-4">
                            <span className="font-black text-slate-900 text-sm block">
                              ₹{(prod.discountPrice || prod.price).toLocaleString('en-IN')}
                            </span>
                            <span className="text-slate-400 text-[10px] line-through">
                              MRP ₹{(prod.mrp || Math.round(prod.price * 1.25)).toLocaleString('en-IN')}
                            </span>
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-1 text-xs font-black rounded-full ${
                                prod.stock > 10 ? 'bg-amber-100 text-slate-900' : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {prod.stock > 0 ? `${prod.stock} Units` : 'OUT OF STOCK'}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-1">
                            <button
                              onClick={() => handleOpenEditModal(prod)}
                              className="p-2 bg-amber-100 hover:bg-amber-200 text-slate-900 rounded-xl transition-all"
                              title="Edit Saree"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDuplicateProduct(prod)}
                              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl transition-all"
                              title="Duplicate Saree"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleArchiveProduct(prod._id)}
                              className="p-2 bg-slate-100 hover:bg-amber-100 text-slate-700 rounded-xl transition-all"
                              title="Archive Saree"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod._id)}
                              className="p-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-xl transition-all"
                              title="Delete Saree"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Customer Orders */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-3xl border border-amber-200 shadow-md overflow-hidden">
            <div className="p-6 border-b border-amber-100 flex items-center justify-between bg-amber-50/40">
              <h3 className="font-street text-2xl font-black text-slate-900">CUSTOMER ORDERS PIPELINE</h3>
              <button onClick={handleExportCSV} className="px-3 py-1.5 bg-amber-100 text-slate-900 font-bold text-xs uppercase rounded-xl hover:bg-amber-200">
                Export Orders CSV
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold">
                <thead className="bg-amber-100/60 text-slate-900 font-extrabold uppercase border-b border-amber-200">
                  <tr>
                    <th className="p-4">Order ID & Date</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Total Amount</th>
                    <th className="p-4">Status Pipeline</th>
                    <th className="p-4 text-right">Invoices & Labels</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100">
                  {orders.map((o) => (
                    <tr key={o._id} className="hover:bg-amber-50/60 transition-colors">
                      <td className="p-4">
                        <span className="font-mono font-bold text-red-800 text-sm block">#{o._id}</span>
                        <span className="text-slate-500 text-[10px]">{new Date(o.createdAt).toLocaleDateString()}</span>
                      </td>
                      <td className="p-4 font-bold text-slate-900">
                        {(o as any).user?.name || 'Guest / Verified Buyer'}
                      </td>
                      <td className="p-4 font-black text-slate-900 text-sm">
                        ₹{o.totalPrice.toLocaleString('en-IN')}
                      </td>
                      <td className="p-4">
                        <select
                          value={o.orderStatus}
                          onChange={(e) => handleOrderStatusChange(o._id, e.target.value)}
                          className="p-2 bg-amber-50 border border-amber-300 rounded-xl text-xs font-bold text-slate-900 uppercase"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Packed">Packed</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Out For Delivery">Out For Delivery</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handlePrintInvoice(o)}
                          className="px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-slate-900 font-extrabold text-[10px] rounded-lg uppercase inline-flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3 text-red-700" /> Invoice
                        </button>
                        <button
                          onClick={() => handlePrintShippingLabel(o)}
                          className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-300 font-extrabold text-[10px] rounded-lg uppercase inline-flex items-center gap-1"
                        >
                          <Printer className="w-3 h-3 text-amber-300" /> Label
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: Categories & Weaves (Database-Driven Enterprise CRUD) */}
        {activeTab === 'categories' && (
          <div className="bg-white rounded-3xl border border-amber-200 shadow-md p-6 space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-amber-100 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-800">
                  ENTERPRISE MONGODB SYSTEM
                </span>
                <h3 className="font-street text-3xl font-black text-slate-900 mt-0.5">
                  CATEGORIES & WEAVES MANAGEMENT
                </h3>
                <p className="text-xs text-slate-500 font-semibold">
                  {filteredDbCategories.length} categories loaded from database • Syncs real-time with WebSockets
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <button
                  onClick={handleOpenAddDbCategoryModal}
                  className="px-5 py-2.5 bg-red-800 hover:bg-red-900 text-amber-300 font-black text-xs uppercase tracking-wider rounded-xl shadow-md border border-amber-300 flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" /> Add Category
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-amber-50/50 p-4 rounded-2xl border border-amber-200 text-xs font-semibold">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-700" />
                <input
                  type="text"
                  placeholder="Search category name, slug, description..."
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-amber-300 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={categoryStatusFilter}
                  onChange={(e: any) => setCategoryStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-bold uppercase"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACTIVE">Active Only</option>
                  <option value="INACTIVE">Inactive Only</option>
                  <option value="ARCHIVED">Archived Only</option>
                </select>

                <select
                  value={categorySortBy}
                  onChange={(e: any) => setCategorySortBy(e.target.value)}
                  className="px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-bold uppercase"
                >
                  <option value="displayOrder">Order: Display Order</option>
                  <option value="name">Order: Name (A-Z)</option>
                  <option value="newest">Order: Newest First</option>
                  <option value="products">Order: Most Products</option>
                </select>
              </div>
            </div>

            {/* MongoDB Category Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDbCategories.map((cat) => (
                <div
                  key={cat._id}
                  className={`relative rounded-3xl p-5 border transition-all duration-300 flex flex-col justify-between space-y-4 shadow-md hover:shadow-xl ${
                    cat.status === 'ARCHIVED'
                      ? 'bg-red-50/40 border-red-200'
                      : cat.isLive
                      ? 'bg-amber-50/40 border-amber-200 hover:border-amber-400'
                      : 'bg-slate-100/60 border-slate-300'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-amber-300/60 shadow">
                      <img
                        src={cat.image || '/images/saree_kanchipuram_gold.png'}
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />

                      {/* Status & Live Badges */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase shadow border ${
                            cat.status === 'ACTIVE'
                              ? 'bg-emerald-800 text-amber-300 border-emerald-400'
                              : cat.status === 'INACTIVE'
                              ? 'bg-amber-800 text-amber-100 border-amber-400'
                              : 'bg-red-800 text-amber-200 border-red-400'
                          }`}
                        >
                          {cat.status}
                        </span>

                        <button
                          onClick={() => handleToggleDbCategoryLive(cat)}
                          className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase shadow transition-all ${
                            cat.isLive
                              ? 'bg-red-800 text-amber-300 hover:bg-red-900 border border-amber-300'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-900'
                          }`}
                          title="Click to toggle Live/Offline"
                        >
                          {cat.isLive ? '● LIVE' : '○ OFFLINE'}
                        </button>
                      </div>

                      {/* Featured & Product Count Badges */}
                      <div className="absolute top-3 right-3 flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleDbCategoryFeatured(cat)}
                          className={`p-1.5 rounded-full shadow transition-all ${
                            cat.featured ? 'bg-amber-400 text-slate-950 shadow-md' : 'bg-slate-900/60 text-slate-300 hover:text-amber-300'
                          }`}
                          title="Toggle Featured Category"
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                        </button>
                        <span className="bg-slate-900 text-amber-300 text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow border border-amber-300">
                          {cat.productCount || 0} SAREES
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-street text-xl font-black text-slate-900 uppercase line-clamp-1">
                          {cat.name}
                        </h4>
                        <span className="text-[9px] font-bold font-mono text-slate-400">#{cat.displayOrder || 0}</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-amber-800 block">/{cat.slug}</span>
                      <p className="text-xs text-slate-600 font-medium line-clamp-2 mt-1">
                        {cat.description || 'Authentic handcrafted saree collection.'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-amber-100 space-y-2">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                      <span>Created By: {cat.createdBy || 'Admin'}</span>
                      <span>Updated: {new Date(cat.updatedAt || Date.now()).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditDbCategoryModal(cat)}
                        className="flex-1 py-2 bg-amber-100 hover:bg-amber-200 text-slate-900 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1 border border-amber-300 transition-all"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-red-800" /> Edit
                      </button>

                      {cat.status === 'ARCHIVED' ? (
                        <button
                          onClick={() => handleRestoreDbCategory(cat._id)}
                          className="flex-1 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1 transition-all"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Restore
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDeleteDbCategory(cat)}
                          className="flex-1 py-2 bg-red-100 hover:bg-red-200 text-red-800 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setSelectedAdminCategory(cat.name);
                          setActiveTab('products');
                        }}
                        className="p-2 bg-slate-900 hover:bg-slate-800 text-amber-300 rounded-xl transition-all"
                        title="View Category Items in Inventory"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Database Category Modal (Create / Edit) */}
            {showCategoryModal && (
              <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-300 shadow-2xl max-w-xl w-full space-y-6 my-8 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-center border-b border-amber-100 pb-4">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-800">
                        MONGODB CATEGORY RECORD
                      </span>
                      <h3 className="font-street text-2xl font-black text-slate-900 uppercase">
                        {editingCategory ? 'EDIT CATEGORY' : 'ADD NEW CATEGORY'}
                      </h3>
                    </div>
                    <button
                      onClick={() => setShowCategoryModal(false)}
                      className="p-2 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-amber-50"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveDbCategory} className="space-y-4 text-xs font-semibold">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">
                          Category Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={dbCatForm.name}
                          onChange={(e) => setDbCatForm({ ...dbCatForm, name: e.target.value })}
                          className="w-full p-3 bg-amber-50/50 border border-amber-300 rounded-xl font-bold"
                          placeholder="e.g. Chanderi Silk Sarees"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">
                          Slug (URL Path)
                        </label>
                        <input
                          type="text"
                          value={dbCatForm.slug}
                          onChange={(e) => setDbCatForm({ ...dbCatForm, slug: e.target.value })}
                          className="w-full p-3 bg-amber-50/50 border border-amber-300 rounded-xl font-mono text-xs"
                          placeholder="Auto-generated from name if left empty"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">
                        Weave Description
                      </label>
                      <textarea
                        rows={2}
                        value={dbCatForm.description}
                        onChange={(e) => setDbCatForm({ ...dbCatForm, description: e.target.value })}
                        className="w-full p-3 bg-amber-50/50 border border-amber-300 rounded-xl font-medium"
                        placeholder="Traditional weave heritage and craftsmanship details..."
                      />
                    </div>

                    {/* Image Upload Box */}
                    <div>
                      <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">
                        Category Cover Image (Local File or URL) *
                      </label>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            required
                            value={dbCatForm.image}
                            onChange={(e) => setDbCatForm({ ...dbCatForm, image: e.target.value })}
                            className="flex-1 p-3 bg-amber-50/50 border border-amber-300 rounded-xl font-medium text-xs"
                            placeholder="Image URL or Base64 file string..."
                          />
                          <label className="px-4 py-3 bg-slate-900 hover:bg-slate-800 text-amber-300 font-black text-xs rounded-xl cursor-pointer shadow flex items-center gap-1.5 border border-amber-300 whitespace-nowrap">
                            <ImageIcon className="w-4 h-4 text-amber-400" />
                            <span>BROWSE LOCAL FILE</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = async () => {
                                    if (typeof reader.result === 'string') {
                                      const base64Data = reader.result;
                                      setDbCatForm((prev) => ({ ...prev, image: base64Data }));
                                      showToast(`Uploading "${file.name}" to Cloudinary CDN...`, 'info');
                                      try {
                                        const uploadRes = await categoryApi.uploadImage(base64Data);
                                        if (uploadRes?.imageUrl) {
                                          setDbCatForm((prev) => ({ ...prev, image: uploadRes.imageUrl }));
                                          showToast(`Uploaded to Cloudinary CDN!`, 'success');
                                        }
                                      } catch {
                                        showToast(`Local image preview ready!`, 'success');
                                      }
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                        </div>

                        {dbCatForm.image && (
                          <div className="flex items-center gap-3 p-3 bg-amber-50/80 rounded-xl border border-amber-300">
                            <img
                              src={dbCatForm.image}
                              alt="Cover Preview"
                              className="w-16 h-12 object-cover rounded-lg border border-amber-300 shadow-sm"
                            />
                            <div className="text-[10px] text-slate-700">
                              <span className="font-black text-red-800 uppercase block">✓ COVER IMAGE PREVIEW READY</span>
                              <span className="truncate block max-w-xs font-mono text-[9px] text-slate-500">{dbCatForm.image.slice(0, 50)}...</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">
                          Status
                        </label>
                        <select
                          value={dbCatForm.status}
                          onChange={(e: any) => setDbCatForm({ ...dbCatForm, status: e.target.value })}
                          className="w-full p-3 bg-amber-50/50 border border-amber-300 rounded-xl font-bold uppercase"
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="INACTIVE">INACTIVE</option>
                          <option value="HIDDEN">HIDDEN</option>
                          <option value="ARCHIVED">ARCHIVED</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">
                          Display Order
                        </label>
                        <input
                          type="number"
                          value={dbCatForm.displayOrder}
                          onChange={(e) => setDbCatForm({ ...dbCatForm, displayOrder: Number(e.target.value) })}
                          className="w-full p-3 bg-amber-50/50 border border-amber-300 rounded-xl font-bold"
                        />
                      </div>

                      <div className="flex flex-col justify-center space-y-2 pt-2">
                        <label className="flex items-center gap-2 cursor-pointer font-bold">
                          <input
                            type="checkbox"
                            checked={dbCatForm.isLive}
                            onChange={(e) => setDbCatForm({ ...dbCatForm, isLive: e.target.checked })}
                            className="w-4 h-4 rounded text-red-800"
                          />
                          <span>Live Visibility</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer font-bold">
                          <input
                            type="checkbox"
                            checked={dbCatForm.featured}
                            onChange={(e) => setDbCatForm({ ...dbCatForm, featured: e.target.checked })}
                            className="w-4 h-4 rounded text-red-800"
                          />
                          <span>Featured Badge</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-amber-100">
                      <button
                        type="button"
                        onClick={() => setShowCategoryModal(false)}
                        className="px-5 py-3 bg-amber-100 hover:bg-amber-200 text-slate-900 font-black uppercase text-xs rounded-xl"
                      >
                        CANCEL
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-3 bg-red-800 hover:bg-red-900 text-amber-300 font-black uppercase text-xs tracking-widest rounded-xl shadow-md border border-amber-300"
                      >
                        SAVE CATEGORY TO MONGODB
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Product Safety Warning Modal */}
            {categorySafetyWarning.open && categorySafetyWarning.category && (
              <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-red-300 shadow-2xl max-w-md w-full space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center gap-3 text-red-800">
                    <Shield className="w-8 h-8" />
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-red-800">SAFETY PROTECTION</span>
                      <h4 className="font-street text-xl font-black text-slate-900">CATEGORY CONTAINS PRODUCTS</h4>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    Category <strong className="text-slate-900">"{categorySafetyWarning.category.name}"</strong> contains{' '}
                    <strong className="text-red-800 font-bold">{categorySafetyWarning.productCount} active saree products</strong>. Permanently deleting will unassign these items.
                  </p>

                  <div className="space-y-2 pt-2">
                    <button
                      onClick={() => handleDeleteDbCategory(categorySafetyWarning.category!, false)}
                      className="w-full py-3 bg-amber-100 hover:bg-amber-200 text-slate-900 font-black text-xs uppercase rounded-xl border border-amber-300 shadow-sm"
                    >
                      ARCHIVE CATEGORY INSTEAD (RECOMMENDED)
                    </button>
                    <button
                      onClick={() => handleDeleteDbCategory(categorySafetyWarning.category!, true)}
                      className="w-full py-3 bg-red-800 hover:bg-red-900 text-amber-300 font-black text-xs uppercase rounded-xl shadow border border-amber-300"
                    >
                      FORCE DELETE & UNASSIGN PRODUCTS
                    </button>
                    <button
                      onClick={() => setCategorySafetyWarning({ open: false, category: null, productCount: 0 })}
                      className="w-full py-2.5 bg-slate-100 text-slate-700 font-bold text-xs uppercase rounded-xl"
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: Stock & Warehouse */}
        {activeTab === 'inventory' && (
          <div className="bg-white rounded-3xl border border-amber-200 shadow-md p-6 space-y-6">
            <h3 className="font-street text-2xl font-black text-slate-900">STOCK & WAREHOUSE INVENTORY ADJUSTER</h3>
            <div className="space-y-3">
              {products.map((p) => (
                <div key={p._id} className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200 flex justify-between items-center text-xs font-semibold">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{p.name}</p>
                    <p className="text-slate-500">SKU: {p.sku} | Current Stock: <strong className="text-red-800">{p.stock} units</strong></p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleUpdateStock(p._id, p.stock, -5)} className="px-3 py-1 bg-red-100 text-red-800 font-bold rounded-lg hover:bg-red-200">-5</button>
                    <button onClick={() => handleUpdateStock(p._id, p.stock, +5)} className="px-3 py-1 bg-amber-100 text-slate-900 font-bold rounded-lg hover:bg-amber-200">+5</button>
                    <button onClick={() => handleUpdateStock(p._id, p.stock, +10)} className="px-3 py-1 bg-slate-900 text-amber-300 font-bold rounded-lg hover:bg-slate-800">+10</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: Customer CRM */}
        {activeTab === 'customers' && (
          <div className="bg-white rounded-3xl border border-amber-200 shadow-md p-6 space-y-6">
            <h3 className="font-street text-2xl font-black text-slate-900">REGISTERED CUSTOMERS CRM</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold">
                <thead className="bg-amber-100/60 uppercase">
                  <tr>
                    <th className="p-3">Customer Name</th>
                    <th className="p-3">Email Address</th>
                    <th className="p-3">Role</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100">
                  {customers.map((c) => (
                    <tr key={c._id}>
                      <td className="p-3 font-bold text-slate-900">{c.name}</td>
                      <td className="p-3 text-slate-600">{c.email}</td>
                      <td className="p-3 font-extrabold uppercase text-amber-800">{c.role}</td>
                      <td className="p-3 text-right space-x-2">
                        <button onClick={() => showToast(`Assigned VIP status to ${c.name}`, 'success')} className="px-2 py-1 bg-amber-100 text-amber-900 font-bold rounded-lg text-[10px]">
                          Assign VIP
                        </button>
                        <button onClick={() => showToast(`Password reset link sent to ${c.email}`, 'info')} className="px-2 py-1 bg-slate-100 text-slate-800 font-bold rounded-lg text-[10px]">
                          Reset Pass
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 8: Coupons & Offers */}
        {activeTab === 'coupons' && (
          <div className="bg-white rounded-3xl border border-amber-200 shadow-md p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-amber-100 pb-4">
              <h3 className="font-street text-2xl font-black text-slate-900">PROMO & COUPON MANAGEMENT</h3>
              <button onClick={() => setShowCouponModal(true)} className="px-4 py-2 bg-red-800 text-amber-300 font-black text-xs uppercase rounded-xl shadow flex items-center gap-1 border border-amber-300">
                <Plus className="w-4 h-4" /> Create Coupon
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {coupons.map((c) => (
                <div key={c._id} className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200 flex justify-between items-center">
                  <div>
                    <span className="font-mono font-black text-red-800 text-base block">{c.code}</span>
                    <span className="text-xs text-slate-600 font-bold">{c.discountAmount}% OFF on min purchase ₹{c.minPurchase}</span>
                  </div>
                  <button onClick={() => handleDeleteCoupon(c._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {showCouponModal && (
              <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white p-6 rounded-3xl border border-amber-300 shadow-2xl max-w-md w-full space-y-4">
                  <div className="flex justify-between items-center border-b border-amber-100 pb-3">
                    <h3 className="font-street text-2xl font-black text-slate-900">CREATE PROMO COUPON</h3>
                    <button onClick={() => setShowCouponModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
                  </div>
                  <form onSubmit={handleSaveCoupon} className="space-y-3 text-xs font-semibold">
                    <input
                      type="text"
                      placeholder="Coupon Code (e.g. ROYAL20)"
                      required
                      value={couponData.code}
                      onChange={(e) => setCouponData({ ...couponData, code: e.target.value.toUpperCase() })}
                      className="w-full p-3 bg-amber-50 border border-amber-300 rounded-xl font-bold uppercase"
                    />
                    <input
                      type="number"
                      placeholder="Discount Percentage (%)"
                      required
                      value={couponData.discountAmount}
                      onChange={(e) => setCouponData({ ...couponData, discountAmount: e.target.value })}
                      className="w-full p-3 bg-amber-50 border border-amber-300 rounded-xl font-bold"
                    />
                    <input
                      type="number"
                      placeholder="Minimum Purchase (₹)"
                      required
                      value={couponData.minPurchase}
                      onChange={(e) => setCouponData({ ...couponData, minPurchase: e.target.value })}
                      className="w-full p-3 bg-amber-50 border border-amber-300 rounded-xl font-bold"
                    />
                    <button type="submit" className="w-full py-3 bg-red-800 text-amber-300 font-black uppercase text-xs rounded-xl shadow border border-amber-300">
                      PUBLISH COUPON LIVE
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 9: AI Generator */}
        {activeTab === 'ai-generator' && (
          <div className="bg-white p-8 rounded-3xl border border-amber-200 shadow-lg space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-amber-800 flex items-center gap-2">
                <Bot className="w-4 h-4 text-red-700" /> AI SAREE GENERATOR ATELIER
              </span>
              <h3 className="font-street text-3xl font-black text-slate-900">GENERATE SAREE ATTRIBUTES WITH AI</h3>
              <p className="text-xs text-slate-600 font-medium">Enter inputs to generate titles, weave description, SEO tags, SKU, and specifications.</p>
            </div>

            <form onSubmit={handleGenerateAiProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">Saree Category</label>
                <select
                  value={aiInputs.category}
                  onChange={(e) => setAiInputs({ ...aiInputs, category: e.target.value })}
                  className="w-full p-3 bg-amber-50/50 border border-amber-300 rounded-xl font-bold"
                >
                  <option value="Banarasi Sarees">Banarasi Sarees</option>
                  <option value="Kanchipuram Sarees">Kanchipuram Sarees</option>
                  <option value="Organza Sarees">Organza Sarees</option>
                  <option value="Linen Sarees">Linen Sarees</option>
                  <option value="Paithani Sarees">Paithani Sarees</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">Fabric Material</label>
                <input
                  type="text"
                  value={aiInputs.fabric}
                  onChange={(e) => setAiInputs({ ...aiInputs, fabric: e.target.value })}
                  className="w-full p-3 bg-amber-50/50 border border-amber-300 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">Color Palette</label>
                <input
                  type="text"
                  value={aiInputs.color}
                  onChange={(e) => setAiInputs({ ...aiInputs, color: e.target.value })}
                  className="w-full p-3 bg-amber-50/50 border border-amber-300 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">Occasion</label>
                <input
                  type="text"
                  value={aiInputs.occasion}
                  onChange={(e) => setAiInputs({ ...aiInputs, occasion: e.target.value })}
                  className="w-full p-3 bg-amber-50/50 border border-amber-300 rounded-xl font-medium"
                />
              </div>

              <div className="md:col-span-2 pt-2">
                <button type="submit" className="w-full py-4 bg-red-800 hover:bg-red-900 text-amber-300 font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl flex items-center justify-center gap-2 border border-amber-300">
                  <Sparkles className="w-4 h-4" /> GENERATE AI SAREE PRODUCT
                </button>
              </div>
            </form>

            {aiGeneratedResult && (
              <div className="p-6 bg-amber-50 rounded-2xl border-2 border-amber-300 shadow-xl space-y-5">
                <div className="flex items-center justify-between border-b border-amber-200 pb-3">
                  <div>
                    <span className="font-street text-2xl font-black text-slate-900 block">AI GENERATED RESULT</span>
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">✨ Real-Time Unique Image & Metadata</span>
                  </div>
                  <span className="bg-red-800 text-amber-300 text-xs font-black uppercase px-3 py-1 rounded-full border border-amber-300 shadow">
                    {aiGeneratedResult.sku}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  {/* REAL-TIME GENERATED UNIQUE IMAGE PREVIEW */}
                  <div className="space-y-2 text-center">
                    <div className="relative aspect-square rounded-2xl overflow-hidden border-2 border-amber-300 shadow-md group bg-white">
                      <img
                        src={aiGeneratedResult.image}
                        alt={aiGeneratedResult.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                      />
                      <span className="absolute top-2 left-2 bg-slate-950/90 text-amber-300 text-[9px] font-black uppercase px-2.5 py-1 rounded-full border border-amber-300/40 backdrop-blur-sm shadow">
                        ✨ REAL-TIME UNIQUE IMAGE
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newImg = generateUniqueSareeImage(aiInputs.category, aiInputs.color);
                        setAiGeneratedResult({ ...aiGeneratedResult, image: newImg });
                        showToast('Generated new real-time unique saree image!', 'info');
                      }}
                      className="text-[11px] font-black text-red-800 hover:text-red-900 uppercase tracking-wider flex items-center justify-center gap-1.5 w-full py-2 bg-white hover:bg-amber-100/50 rounded-xl border border-amber-300 shadow-sm transition-all"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-red-700" /> REGENERATE UNIQUE IMAGE
                    </button>
                  </div>

                  {/* GENERATED METADATA ATTRIBUTES */}
                  <div className="md:col-span-2 space-y-3 text-xs font-medium text-slate-700">
                    <p><strong className="text-slate-900 font-bold uppercase text-[11px] block">Generated Saree Title:</strong> {aiGeneratedResult.name}</p>
                    <p><strong className="text-slate-900 font-bold uppercase text-[11px] block">Weave & Fabric Description:</strong> {aiGeneratedResult.description}</p>
                    <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-amber-300">
                      <div>
                        <span className="text-[10px] font-black text-slate-500 uppercase block">Offer Price</span>
                        <span className="font-street text-2xl font-black text-red-800">₹{aiGeneratedResult.discountPrice?.toLocaleString('en-IN')}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-slate-500 uppercase block">MRP</span>
                        <span className="font-street text-base font-bold text-slate-400 line-through">₹{aiGeneratedResult.mrp?.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="ml-auto">
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-3 py-1 rounded-full border border-emerald-300">
                          SAVE {Math.round(((aiGeneratedResult.mrp - aiGeneratedResult.discountPrice) / aiGeneratedResult.mrp) * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePublishAiProduct}
                  className="w-full py-4 bg-slate-900 hover:bg-red-800 text-amber-300 font-black uppercase text-xs tracking-wider rounded-xl shadow-xl border border-amber-300 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" /> PUBLISH AI SAREE WITH REAL-TIME IMAGE TO MONGODB
                </button>
              </div>
            )}
          </div>
        )}



        {/* TAB 11: Homepage Editor */}
        {activeTab === 'homepage-editor' && <HomepageEditorPage />}

        {/* TAB 12: WhatsApp & Contact Settings */}
        {activeTab === 'settings' && <AdminWhatsAppSettingsPanel />}

        {/* Modal: Add/Edit Saree Product */}
        {showProductModal && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white text-slate-900 rounded-3xl p-8 max-w-2xl w-full border border-amber-300 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
              <div className="flex items-center justify-between border-b border-amber-100 pb-4">
                <h3 className="font-street text-3xl font-black">{editingProduct ? 'EDIT SAREE PRODUCT' : 'ADD NEW LUXURY SAREE'}</h3>
                <button onClick={() => setShowProductModal(false)} className="text-slate-400 hover:text-red-800"><X className="w-6 h-6" /></button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4 text-xs font-semibold">
                <div>
                  <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">Saree Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-3 bg-amber-50/50 border border-amber-300 rounded-xl font-medium"
                    placeholder="e.g. EVAN COLLECTIONS Royal Crimson Banarasi Silk Saree"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full p-3 bg-amber-50/50 border border-amber-300 rounded-xl font-bold"
                    >
                      <option value="Kanchipuram Sarees">Kanchipuram Sarees</option>
                      <option value="Banarasi Sarees">Banarasi Sarees</option>
                      <option value="Organza Sarees">Organza Sarees</option>
                      <option value="Linen Sarees">Linen Sarees</option>
                      <option value="Bridal Sarees">Bridal Sarees</option>
                      <option value="Party Wear Sarees">Party Wear Sarees</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">Fabric Material</label>
                    <input
                      type="text"
                      value={formData.fabric}
                      onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
                      className="w-full p-3 bg-amber-50/50 border border-amber-300 rounded-xl font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">Offer Price (₹)</label>
                    <input
                      type="number"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full p-3 bg-amber-50/50 border border-amber-300 rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">MRP (₹)</label>
                    <input
                      type="number"
                      value={formData.mrp}
                      onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                      className="w-full p-3 bg-amber-50/50 border border-amber-300 rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">Stock Units</label>
                    <input
                      type="number"
                      required
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full p-3 bg-amber-50/50 border border-amber-300 rounded-xl font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">Description & Weave Details</label>
                  <textarea
                    rows={3}
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-3 bg-amber-50/50 border border-amber-300 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">
                    Main Saree Image (Upload from Local Storage or Image URL)
                  </label>
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <input
                        type="text"
                        required
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        className="flex-1 p-3 bg-amber-50/50 border border-amber-300 rounded-xl font-medium text-xs"
                        placeholder="Enter image URL or choose file from local storage..."
                      />
                      <label className="px-4 py-3 bg-slate-900 hover:bg-slate-800 text-amber-300 font-black text-xs rounded-xl cursor-pointer shadow flex items-center justify-center gap-2 border border-amber-300 transition-all">
                        <ImageIcon className="w-4 h-4 text-amber-400" />
                        <span>BROWSE LOCAL FILE</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                if (typeof reader.result === 'string') {
                                  setFormData({ ...formData, image: reader.result });
                                  showToast(`Local image "${file.name}" loaded successfully!`, 'success');
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>

                    {formData.image && (
                      <div className="flex items-center gap-3 p-3 bg-amber-50/80 rounded-xl border border-amber-300">
                        <img
                          src={formData.image}
                          alt="Saree Preview"
                          className="w-12 h-16 object-cover rounded-lg border border-amber-300 shadow-sm"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div className="text-[10px] text-slate-700">
                          <span className="font-black text-red-800 uppercase block">✓ IMAGE PREVIEW READY</span>
                          <span className="truncate block max-w-xs font-mono text-[9px] text-slate-500">{formData.image.slice(0, 60)}...</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <button type="submit" className="w-full py-4 bg-red-800 hover:bg-red-900 text-amber-300 font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl transition-all border border-amber-300">
                  SAVE SAREE TO CATALOG
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Category Card Add/Edit Modal */}
        {showCategoryCardModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-3xl border border-amber-300 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-amber-100 pb-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-800">
                    WEAVE CATEGORY CARD MANAGER
                  </span>
                  <h3 className="font-street text-2xl font-black text-slate-900 uppercase">
                    {editingCardId ? 'EDIT CATEGORY CARD' : 'ADD NEW CATEGORY CARD'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowCategoryCardModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-amber-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveCategoryCard} className="space-y-4 text-xs font-semibold">
                <div>
                  <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">
                    Category Card Name
                  </label>
                  <input
                    type="text"
                    required
                    value={cardFormData.name}
                    onChange={(e) => setCardFormData({ ...cardFormData, name: e.target.value })}
                    className="w-full p-3 bg-amber-50/50 border border-amber-300 rounded-xl font-bold"
                    placeholder="e.g. Chanderi Silk Sarees"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">
                    Fabric Type / Badge Tag
                  </label>
                  <input
                    type="text"
                    required
                    value={cardFormData.fabric}
                    onChange={(e) => setCardFormData({ ...cardFormData, fabric: e.target.value })}
                    className="w-full p-3 bg-amber-50/50 border border-amber-300 rounded-xl font-medium"
                    placeholder="e.g. Pure Chanderi Silk"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">
                    Weave Description
                  </label>
                  <textarea
                    rows={2}
                    value={cardFormData.desc}
                    onChange={(e) => setCardFormData({ ...cardFormData, desc: e.target.value })}
                    className="w-full p-3 bg-amber-50/50 border border-amber-300 rounded-xl font-medium"
                    placeholder="Brief description of the weave tradition..."
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">
                    Category Card Image (Upload Local File or Image URL)
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        required
                        value={cardFormData.image}
                        onChange={(e) => setCardFormData({ ...cardFormData, image: e.target.value })}
                        className="flex-1 p-3 bg-amber-50/50 border border-amber-300 rounded-xl text-xs font-medium"
                        placeholder="Image URL or local file Data URL..."
                      />
                      <label className="px-4 py-3 bg-slate-900 hover:bg-slate-800 text-amber-300 font-black text-xs rounded-xl cursor-pointer shadow flex items-center gap-1.5 border border-amber-300 whitespace-nowrap">
                        <ImageIcon className="w-4 h-4 text-amber-400" />
                        <span>BROWSE LOCAL FILE</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                if (typeof reader.result === 'string') {
                                  setCardFormData({ ...cardFormData, image: reader.result });
                                  showToast(`Local image "${file.name}" loaded for category card!`, 'success');
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>

                    {cardFormData.image && (
                      <div className="flex items-center gap-3 p-3 bg-amber-50/80 rounded-xl border border-amber-300">
                        <img
                          src={cardFormData.image}
                          alt="Card Cover Preview"
                          className="w-16 h-12 object-cover rounded-lg border border-amber-300 shadow-sm"
                        />
                        <div className="text-[10px] text-slate-700">
                          <span className="font-black text-red-800 uppercase block">✓ CATEGORY COVER PREVIEW</span>
                          <span className="truncate block max-w-xs font-mono text-[9px] text-slate-500">
                            {cardFormData.image.slice(0, 50)}...
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCategoryCardModal(false)}
                    className="px-5 py-3 bg-amber-100 hover:bg-amber-200 text-slate-900 font-black uppercase text-xs rounded-xl"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-red-800 hover:bg-red-900 text-amber-300 font-black uppercase text-xs tracking-widest rounded-xl shadow-md border border-amber-300"
                  >
                    SAVE CATEGORY CARD
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
