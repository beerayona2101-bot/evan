import React, { useEffect, useState } from 'react';
import {
  Plus, Edit2, Trash2, Shield, Package, ShoppingBag, Users, DollarSign, Sparkles, Check, X, Menu, Search,
  LayoutDashboard, Tag, ArrowLeft, Bot, Image as ImageIcon, BarChart3, MessageSquare, AlertTriangle,
  FileText, Download, Star, CheckCircle, Clock, Truck, Copy, Archive, Printer, Lock, UserCheck, ExternalLink, RotateCcw, RefreshCw, Eye
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { Product, ProductVariant, Order, Category } from '../types';
import { api } from '../services/api';
import { productApi } from '../services/productApi';
import { orderApi } from '../services/orderApi';
import { categoryApi } from '../services/categoryApi';
import { couponApi } from '../services/couponApi';
import { reviewApi } from '../services/reviewApi';
import { userApi } from '../services/userApi';
import { showToast } from '../components/ToastContainer';
import { useSocket } from '../context/SocketContext';
import { formatSareeName } from '../utils/sareeUtils';
import { compressImage } from '../utils/imageCompressor';
import { getColorNameFromHex } from '../utils/colorUtils';

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
import { StockWarehouseInventoryAdjuster } from '../components/StockWarehouseInventoryAdjuster';
import { AdminCancelOrderModal } from '../components/AdminCancelOrderModal';

export const AdminDashboardPage: React.FC = () => {
  const [isAdminSidebarOpen, setIsAdminSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return false;
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') || 'analytics') as any;
  const initialCategory = searchParams.get('category');

  const [activeTabState, setActiveTabState] = useState<
    'analytics' | 'products' | 'orders' | 'categories' | 'inquiries' | 'inventory' | 'customers' | 'reviews' | 'coupons' | 'ai-generator' | 'financials' | 'gst-tax' | 'net-profit' | 'revenue' | 'today-orders' | 'customer-analytics' | 'product-units' | 'refunds' | 'returns' | 'low-stock' | 'top-selling' | 'homepage-editor' | 'settings'
  >(initialTab);

  const [selectedAdminCategoryState, setSelectedAdminCategoryState] = useState<string | null>(initialCategory);

  // Sync state when browser history changes (e.g. Backspace or Back button)
  useEffect(() => {
    const currentTab = (searchParams.get('tab') || 'analytics') as any;
    const currentCategory = searchParams.get('category');
    setActiveTabState(currentTab);
    setSelectedAdminCategoryState(currentCategory || null);
  }, [searchParams]);

  const activeTab = activeTabState;
  const selectedAdminCategory = selectedAdminCategoryState;

  const setActiveTab = (newTab: any) => {
    setActiveTabState(newTab);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', newTab);
    if (newTab !== 'products') {
      newParams.delete('category');
      setSelectedAdminCategoryState(null);
    }
    setSearchParams(newParams, { replace: false });
  };

  const setSelectedAdminCategory = (catName: string | null) => {
    setSelectedAdminCategoryState(catName);
    const newParams = new URLSearchParams(searchParams);
    if (catName) {
      newParams.set('tab', 'products');
      newParams.set('category', catName);
    } else {
      newParams.delete('category');
    }
    setSearchParams(newParams, { replace: false });
  };

  const [analyticsSubTab, setAnalyticsSubTab] = useState<string>('dashboard');

  // Orders Filter States (Time Period, Custom Calendar Date)
  const [orderPeriodFilter, setOrderPeriodFilter] = useState<string>('all');
  const [orderCustomDate, setOrderCustomDate] = useState<string>('');

  // Admin Cancel Order Modal State
  const [adminCancelModalOrder, setAdminCancelModalOrder] = useState<Order | null>(null);
  const [showAdminCancelModal, setShowAdminCancelModal] = useState<boolean>(false);

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
    galleryImages: ['', '', '', ''],
    variants: [
      { colorName: 'Royal Crimson Red', hexColor: '#990000', stock: 15, status: 'active', sku: 'SKU-RED-01', price: 0, images: [] },
      { colorName: 'Mustard Gold', hexColor: '#D4AF37', stock: 8, status: 'active', sku: 'SKU-GLD-02', price: 0, images: [] },
      { colorName: 'Emerald Green', hexColor: '#006633', stock: 0, status: 'inactive', sku: 'SKU-GRN-03', price: 0, images: [] },
      { colorName: 'Peacock Blue', hexColor: '#003366', stock: 12, status: 'active', sku: 'SKU-BLU-04', price: 0, images: [] },
    ] as ProductVariant[],
  });

  // Custom Color State
  const [customColorName, setCustomColorName] = useState('Royal Crimson Red');
  const [customColorHex, setCustomColorHex] = useState('#990000');
  const [customColorStock, setCustomColorStock] = useState(10);
  const [customColorSku, setCustomColorSku] = useState('');

  // Image Lightbox Preview Modal State
  const [previewImageModal, setPreviewImageModal] = useState<{ open: boolean; url: string; title: string }>({
    open: false,
    url: '',
    title: '',
  });

  const validateImageFile = (file: File): string | null => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      return 'Invalid file format! Only JPG, JPEG, PNG, and WEBP images are supported.';
    }
    const maxSizeInBytes = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxSizeInBytes) {
      return `File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds maximum limit of 5 MB.`;
    }
    return null;
  };

  const handleHexChange = (newHex: string) => {
    setCustomColorHex(newHex);
    const autoGeneratedName = getColorNameFromHex(newHex);
    setCustomColorName(autoGeneratedName);
  };

  // Category Form State
  const [catData, setCatData] = useState({ name: '', description: '', image: '/images/saree_banarasi_red.png' });

  // Dynamic 3x3 Category Cards State with persistent local storage sync
  const [categoryCards, setCategoryCards] = useState(() => {
    const saved = localStorage.getItem('evan_category_cards');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return [
      { id: '1', name: 'Kanchipuram Sarees', fabric: 'Pure Kanchipuram Silk', image: '/images/saree_kanchipuram_gold.png', desc: 'Royal South Indian bridal heirlooms woven with gold zari temple borders.' },
      { id: '2', name: 'Banarasi Sarees', fabric: 'Royal Banarasi Silk', image: '/images/saree_banarasi_red.png', desc: 'Traditional Varanasi brocades featuring intricate floral zari motif weaves.' },
      { id: '3', name: 'Organza Sarees', fabric: 'Delicate Floral Organza', image: '/images/saree_organza_floral.png', desc: 'Ultra-lightweight sheer silk drapes with hand-painted floral embellishments.' },
      { id: '4', name: 'Linen Sarees', fabric: 'Pure Organic Linen', image: '/images/saree_linen_beige.png', desc: 'Breathable handloom linen sarees designed for comfortable daily luxury.' },
      { id: '5', name: 'Paithani Sarees', fabric: 'Pure Paithani Silk', image: '/images/saree_paithani_green.png', desc: 'Artisanal Maharashtrian silk sarees with peacock motifs and gold pallu.' },
      { id: '6', name: 'Bridal Sarees', fabric: 'Bridal Heirloom Brocade', image: '/images/saree_kanchipuram_gold.png', desc: 'Heavy wedding trousseau sarees adorned with rich zari brocade work.' },
      { id: '7', name: 'Silk Sarees', fabric: 'Pure Mulberry Silk', image: '/images/saree_banarasi_red.png', desc: 'Lustrous mulberry silk sarees with rich contrast zari borders.' },
      { id: '8', name: 'Cotton Sarees', fabric: 'Organic Mulmul Cotton', image: '/images/saree_linen_beige.png', desc: 'Soft artisanal handloom cotton sarees for graceful everyday wear.' },
      { id: '9', name: 'Daily Wear Sarees', fabric: 'Soft Blend Handloom', image: '/images/saree_organza_floral.png', desc: 'Easy-drape daily wear sarees with modern minimalist weaves.' },
    ];
  });

  useEffect(() => {
    localStorage.setItem('evan_category_cards', JSON.stringify(categoryCards));
  }, [categoryCards]);

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
    const nextLiveState = !cat.isLive;
    setCategories((prev) =>
      prev.map((c) => (c._id === cat._id ? { ...c, isLive: nextLiveState } : c))
    );
    try {
      const updated = await categoryApi.patchCategoryStatus(cat._id, { isLive: nextLiveState });
      if (updated && updated._id) {
        setCategories((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
      }
      showToast(`Category "${cat.name}" is now ${nextLiveState ? 'LIVE' : 'OFFLINE'}!`, 'info');
    } catch {
      // Retain optimistic update
    }
  };

  const handleToggleDbCategoryFeatured = async (cat: Category) => {
    const nextFeaturedState = !cat.featured;
    setCategories((prev) =>
      prev.map((c) => (c._id === cat._id ? { ...c, featured: nextFeaturedState } : c))
    );
    try {
      const updated = await categoryApi.patchCategoryStatus(cat._id, { featured: nextFeaturedState });
      if (updated && updated._id) {
        setCategories((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
      }
      showToast(`Category "${cat.name}" ${nextFeaturedState ? 'marked as STARRED' : 'removed from starred'}!`, 'info');
    } catch {
      // Retain optimistic update
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
  // Order Status Filter inside Customer Orders Pipeline
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('ALL');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [prodRes, orderRes, catRes, coupRes, userRes, inqRes] = await Promise.all([
        productApi.getProducts().catch(() => []),
        orderApi.getAllOrders().catch(() => []),
        categoryApi.getCategories().catch(() => []),
        couponApi.getCoupons().catch(() => []),
        userApi.getAllUsers().catch(() => []),
        api.get('/inquiries').then((r) => r.data).catch(() => []),
      ]);
      setProducts(prodRes);
      setOrders(orderRes);
      setCategories(catRes);
      setCoupons(coupRes);
      setCustomers(userRes);
      setInquiries(inqRes || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Listen for global Escape key closeActiveModals event
  useEffect(() => {
    const handleClose = () => {
      setShowProductModal(false);
      setShowCategoryModal(false);
      setShowCategoryCardModal(false);
      setShowCouponModal(false);
    };
    window.addEventListener('closeActiveModals', handleClose);
    return () => window.removeEventListener('closeActiveModals', handleClose);
  }, []);

  // Socket.IO Listener for Multi-Client Synchronization
  useEffect(() => {
    if (!socket) return;

    const handleNewOrder = (newOrder: Order) => {
      setOrders((prev) => [newOrder, ...prev]);
      showToast(`NEW ORDER RECEIVED! Order #${newOrder._id} (₹${newOrder.totalPrice.toLocaleString('en-IN')})`, 'success');
    };

    const handleInquirySubmitted = (newInquiry: any) => {
      setInquiries((prev) => [newInquiry, ...prev]);
      showToast(`NEW SAREE INQUIRY! ${newInquiry.name} (${newInquiry.phone}) - ${newInquiry.sareeInterest}`, 'success');
    };

    const handleOrderUpdate = (updatedOrder: Order) => {
      setOrders((prev) => prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o)));
    };

    const handleProductUpdated = (updatedProd: any) => {
      if (updatedProd && updatedProd._id) {
        setProducts((prev) =>
          prev.map((p) => (p._id === updatedProd._id ? { ...p, ...updatedProd } : p))
        );
      } else {
        fetchAdminData();
      }
    };

    const handleInventoryUpdated = (data: { productId: string; stock: number }) => {
      if (data && data.productId) {
        setProducts((prev) =>
          prev.map((p) => (p._id === data.productId ? { ...p, stock: data.stock } : p))
        );
      }
    };

    socket.on('orderCreated', handleNewOrder);
    socket.on('inquirySubmitted', handleInquirySubmitted);
    socket.on('orderUpdated', handleOrderUpdate);
    socket.on('productCreated', fetchAdminData);
    socket.on('productUpdated', handleProductUpdated);
    socket.on('inventoryUpdated', handleInventoryUpdated);
    socket.on('productDeleted', fetchAdminData);

    return () => {
      socket.off('orderCreated', handleNewOrder);
      socket.off('inquirySubmitted', handleInquirySubmitted);
      socket.off('orderUpdated', handleOrderUpdate);
      socket.off('productCreated', fetchAdminData);
      socket.off('productUpdated', handleProductUpdated);
      socket.off('inventoryUpdated', handleInventoryUpdated);
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
      galleryImages: ['', '', '', ''],
      variants: [
        { colorName: 'Royal Crimson Red', hexColor: '#990000', stock: 15, status: 'active', sku: 'SKU-RED-01', price: 0, images: [] },
        { colorName: 'Mustard Gold', hexColor: '#D4AF37', stock: 8, status: 'active', sku: 'SKU-GLD-02', price: 0, images: [] },
        { colorName: 'Emerald Green', hexColor: '#006633', stock: 0, status: 'inactive', sku: 'SKU-GRN-03', price: 0, images: [] },
        { colorName: 'Peacock Blue', hexColor: '#003366', stock: 12, status: 'active', sku: 'SKU-BLU-04', price: 0, images: [] },
      ] as ProductVariant[],
    });
    setShowProductModal(true);
  };

  const handleOpenEditModal = (prod: Product) => {
    setEditingProduct(prod);
    const prodImgs = prod.images || (prod as any).galleryImages || [];
    
    // Parse variants if available, or build from prod.colors
    let parsedVariants: ProductVariant[] = [];
    if (prod.variants && prod.variants.length > 0) {
      parsedVariants = prod.variants;
    } else if (prod.colors && prod.colors.length > 0) {
      parsedVariants = prod.colors.map((cName, idx) => {
        let hex = '#990000';
        if (cName.toLowerCase().includes('gold') || cName.toLowerCase().includes('mustard')) hex = '#D4AF37';
        else if (cName.toLowerCase().includes('green') || cName.toLowerCase().includes('emerald')) hex = '#006633';
        else if (cName.toLowerCase().includes('blue')) hex = '#003366';
        else if (cName.toLowerCase().includes('purple') || cName.toLowerCase().includes('magenta')) hex = '#800080';
        else if (cName.toLowerCase().includes('pink')) hex = '#FFB6C1';
        return {
          colorName: cName,
          hexColor: hex,
          stock: idx === 2 ? 0 : 10,
          status: idx === 2 ? 'inactive' : 'active',
          sku: `SKU-${prod._id}-${idx}`,
          price: prod.price,
          images: prodImgs,
        };
      });
    } else {
      parsedVariants = [
        { colorName: 'Royal Crimson Red', hexColor: '#990000', stock: 15, status: 'active', sku: `SKU-${prod._id}-RED`, price: prod.price, images: prodImgs },
        { colorName: 'Mustard Gold', hexColor: '#D4AF37', stock: 8, status: 'active', sku: `SKU-${prod._id}-GLD`, price: prod.price, images: prodImgs },
        { colorName: 'Emerald Green', hexColor: '#006633', stock: 0, status: 'inactive', sku: `SKU-${prod._id}-GRN`, price: prod.price, images: prodImgs },
        { colorName: 'Peacock Blue', hexColor: '#003366', stock: 12, status: 'active', sku: `SKU-${prod._id}-BLU`, price: prod.price, images: prodImgs },
      ];
    }

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
      image: prodImgs[0] || '/images/saree_kanchipuram_gold.png',
      videoUrl: '',
      galleryImages: [
        prodImgs[1] || '',
        prodImgs[2] || '',
        prodImgs[3] || '',
        prodImgs[4] || '',
      ],
      variants: parsedVariants,
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
    const formattedName = formatSareeName(formData.name, formData.category);
    const compiledImages = [
      formData.image,
      ...formData.galleryImages.filter((img) => Boolean(img && img.trim())),
    ];

    const activeColors = (formData.variants && formData.variants.length > 0)
      ? formData.variants.map((v) => v.colorName)
      : ['Royal Crimson Red', 'Mustard Gold', 'Emerald Green', 'Peacock Blue'];

    const sanitizedVariants = (formData.variants || []).map((v, idx) => ({
      ...v,
      colorName: v.colorName || 'Royal Crimson Red',
      hexColor: v.hexColor || '#990000',
      sku: v.sku && v.sku.trim() ? v.sku : `SKU-${Date.now()}-${idx}-${(v.colorName || 'VAR').slice(0, 3).toUpperCase()}`,
      price: v.price && Number(v.price) > 0 ? Number(v.price) : Number(formData.price) || 4999,
      stock: v.stock !== undefined ? Number(v.stock) : 10,
      status: v.status || (v.stock > 0 ? 'active' : 'inactive'),
      images: (v.images || []).filter((img) => Boolean(img && img.trim())),
    }));

    const payload = {
      name: formattedName,
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
      images: compiledImages,
      galleryImages: compiledImages,
      colors: activeColors,
      variants: sanitizedVariants,
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
    } catch (error: any) {
      console.error('Save saree product error:', error);
      const errMsg = error?.response?.data?.message || error?.message || 'Failed to save saree product';
      showToast(errMsg, 'error');
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
    if (status === 'Cancelled') {
      const targetOrder = orders.find((o) => o._id === orderId);
      if (targetOrder) {
        setAdminCancelModalOrder(targetOrder);
        setShowAdminCancelModal(true);
        return;
      }
    }

    const order = orders.find((o) => o._id === orderId);
    if (order) {
      const pipeline = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Out For Delivery', 'Delivered', 'Cancelled'];
      const currentIdx = pipeline.findIndex((s) => s.toLowerCase() === (order.orderStatus || '').toLowerCase());
      const newIdx = pipeline.findIndex((s) => s.toLowerCase() === status.toLowerCase());

      if (currentIdx !== -1 && newIdx !== -1 && newIdx < currentIdx && status !== 'Cancelled') {
        showToast(`Cannot step back from "${order.orderStatus}" to "${status}". Fulfillment progress is one-way only.`, 'error');
        return;
      }
    }

    try {
      const updated = await orderApi.updateOrderStatus(orderId, status);
      setOrders(orders.map((o) => (o._id === orderId ? updated : o)));
      showToast(`Order #${orderId.slice(-6)} status updated to ${status.toUpperCase()}!`, 'success');
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Error updating order status', 'error');
    }
  };

  // Order Deletion Handler
  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm(`Are you sure you want to delete order #${orderId}? This action cannot be undone.`)) return;
    try {
      await orderApi.deleteOrder(orderId);
      setOrders(orders.filter((o) => o._id !== orderId));
      showToast(`Order #${orderId} deleted successfully`, 'success');
    } catch {
      showToast('Error deleting order', 'error');
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

  // AI Generator with Full Saree Specifications
  const handleGenerateAiProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const cat = aiInputs.category || 'Banarasi Sarees';
    const fab = aiInputs.fabric || 'Royal Handloom Silk';
    const col = aiInputs.color || 'Royal Crimson Red';
    const occ = aiInputs.occasion || 'Bridal & Wedding';

    const generatedTitle = `EVAN COLLECTIONS ${col} ${cat} Vol.${Math.floor(100 + Math.random() * 900)}`;
    const generatedDesc = `Exquisite ${col.toLowerCase()} handwoven ${cat.toLowerCase()} by master artisans in India. Features rich zari brocade, unstitched contrast blouse piece, and lustrous silk drape. Certified pure silk mark.`;
    const price = 15999 + Math.floor(Math.random() * 9000);
    const discountPrice = Math.round(price * 0.85);
    const mrp = Math.round(price * 1.35);
    const uniqueAiImage = generateUniqueSareeImage(cat, col);

    setAiGeneratedResult({
      name: generatedTitle,
      shortDescription: `Pure Silk Mark Certified Handcrafted ${cat}`,
      description: generatedDesc,
      detailedDescription: generatedDesc,
      price,
      discountPrice,
      mrp,
      category: cat,
      fabric: fab,
      material: fab,
      clothType: `100% Pure Mulberry ${fab}`,
      threadMaterial: `Tested Gold Zari & Fine Silk Threads`,
      comfortLevel: `Soft, Lightweight & Skin-Friendly for All-Day Wear`,
      colorDetails: `${col} - Organic Eco-Friendly Dyes`,
      borderType: 'Heavy Gold Zari Temple Border',
      blousePiece: 'Includes Unstitched Blouse Piece (0.8m)',
      occasion: occ,
      sareeLength: '5.5 Meters + Includes Unstitched Blouse (0.8m)',
      sareeWeight: '750 Grams',
      washCare: 'Dry Clean Only. Store wrapped in soft cotton fabric.',
      colors: [col, 'Mustard Gold', 'Emerald Green'],
      sku: `EVAN-AI-${Math.floor(1000 + Math.random() * 9000)}`,
      stock: 25,
      image: uniqueAiImage,
      images: [uniqueAiImage],
    });
    showToast('Full Saree Product Attributes & Real-Time Image Generated!', 'success');
  };

  const handlePublishAiProduct = async () => {
    if (!aiGeneratedResult) return;
    try {
      const created = await productApi.createProduct({
        name: aiGeneratedResult.name,
        shortDescription: aiGeneratedResult.shortDescription,
        description: aiGeneratedResult.description,
        detailedDescription: aiGeneratedResult.detailedDescription,
        price: Number(aiGeneratedResult.price),
        discountPrice: Number(aiGeneratedResult.discountPrice),
        mrp: Number(aiGeneratedResult.mrp),
        category: aiGeneratedResult.category,
        fabric: aiGeneratedResult.fabric,
        material: aiGeneratedResult.material,
        clothType: aiGeneratedResult.clothType,
        threadMaterial: aiGeneratedResult.threadMaterial,
        comfortLevel: aiGeneratedResult.comfortLevel,
        colorDetails: aiGeneratedResult.colorDetails,
        borderType: aiGeneratedResult.borderType,
        blousePiece: aiGeneratedResult.blousePiece,
        occasion: aiGeneratedResult.occasion,
        sareeLength: aiGeneratedResult.sareeLength,
        sareeWeight: aiGeneratedResult.sareeWeight,
        washCare: aiGeneratedResult.washCare,
        colors: aiGeneratedResult.colors || [aiInputs.color],
        sku: aiGeneratedResult.sku,
        stock: Number(aiGeneratedResult.stock || 25),
        images: aiGeneratedResult.images || [aiGeneratedResult.image || '/images/saree_banarasi_red.png'],
      });
      setProducts([created, ...products]);
      showToast('Full AI Saree Product Card Published Live to MongoDB!', 'success');
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
    <div className="h-screen w-screen bg-[#FFFDF9] text-slate-900 flex flex-col font-sans overflow-hidden relative">
      {/* Mobile Top Navigation Bar */}
      <header className="lg:hidden bg-[#FFFDF9]/95 backdrop-blur-md text-slate-900 px-4 py-3 border-b border-amber-200/80 shadow-sm flex items-center justify-between z-30 flex-shrink-0">
        {/* Left: Hamburger Icon Button to open/close sidebar */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsAdminSidebarOpen((prev) => !prev);
          }}
          className="p-2 rounded-xl bg-amber-100/70 text-slate-800 hover:text-red-800 focus:outline-none transition-colors border border-amber-300 flex items-center justify-center shadow-sm"
          aria-label="Toggle Navigation Sidebar"
        >
          {isAdminSidebarOpen ? <X className="w-5 h-5 text-red-700" /> : <Menu className="w-5 h-5 text-red-700" />}
        </button>

        {/* Center: Kanchanika Logo & Brand Name */}
        <div className="flex items-center space-x-2">
          <img
            src="/kanchanika_attire_logo.svg"
            alt="Kanchanika Logo"
            className="w-7 h-7 object-contain drop-shadow-sm"
          />
          <div className="flex flex-col leading-none text-center">
            <span className="font-street text-base font-black tracking-wider text-slate-900">
              KANCHANIKA
            </span>
            <span className="text-[7px] uppercase tracking-[0.2em] font-extrabold text-amber-800">
              ADMIN DASHBOARD
            </span>
          </div>
        </div>

        {/* Right Spacer for balanced centering */}
        <div className="w-9" />
      </header>

      {/* Invisible Hover Sensor Zone along left screen edge (Desktop only) */}
      <div
        onMouseEnter={() => {
          if (window.innerWidth >= 1024) setIsAdminSidebarOpen(true);
        }}
        className="hidden lg:block fixed top-0 left-0 bottom-0 w-5 z-30"
      />

      {/* Dismissal Backdrop when Sidebar is Open */}
      {isAdminSidebarOpen && (
        <div
          onClick={() => setIsAdminSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-30 transition-opacity"
        />
      )}

      {/* Sidebar Navigation - Hover-Triggered Auto Sidebar / Mobile Drawer */}
      <aside
        onMouseEnter={() => {
          if (window.innerWidth >= 1024) setIsAdminSidebarOpen(true);
        }}
        className={`fixed top-0 left-0 h-full bg-[#FFFDF9] text-slate-900 p-6 flex flex-col justify-between border-r border-amber-300/80 shadow-2xl z-40 flex-shrink-0 transition-all duration-300 ease-in-out ${
          isAdminSidebarOpen
            ? 'w-64 translate-x-0 opacity-100 shadow-2xl pointer-events-auto'
            : 'w-64 -translate-x-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between pt-2">
            <Link to="/" className="flex items-center space-x-2.5" onClick={() => setIsAdminSidebarOpen(false)}>
              <img
                src="/kanchanika_attire_logo.svg"
                alt="Kanchanika Logo"
                className="w-9 h-9 object-contain drop-shadow-sm"
              />
              <div className="flex flex-col leading-none">
                <span className="font-street text-xl font-black tracking-wider text-slate-900">KANCHANIKA</span>
                <span className="text-[7.5px] uppercase tracking-[0.25em] font-extrabold text-amber-800">ADMIN ATELIER</span>
              </div>
            </Link>
            <button
              onClick={() => setIsAdminSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:text-red-800 hover:bg-amber-100/60 transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5 text-red-700" />
            </button>
          </div>

          <nav className="space-y-1 text-xs font-extrabold uppercase tracking-wider max-h-[75vh] overflow-y-auto no-scrollbar pr-1">
            <button
              onClick={() => { setActiveTab('analytics'); setIsAdminSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${activeTab === 'analytics' ? 'bg-amber-100 text-amber-950 shadow-sm border border-amber-300 font-black' : 'text-slate-700 hover:bg-amber-100/60 hover:text-red-900'
                }`}
            >
              <BarChart3 className="w-4 h-4 text-amber-700" /> Analytics & Reports
            </button>

            <button
              onClick={() => { setActiveTab('products'); setIsAdminSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${activeTab === 'products' ? 'bg-amber-100 text-amber-950 shadow-sm border border-amber-300 font-black' : 'text-slate-700 hover:bg-amber-100/60 hover:text-red-900'
                }`}
            >
              <Package className="w-4 h-4 text-amber-700" /> Saree Inventory
            </button>

            <button
              onClick={() => { setActiveTab('orders'); setIsAdminSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${activeTab === 'orders' ? 'bg-amber-100 text-amber-950 shadow-sm border border-amber-300 font-black' : 'text-slate-700 hover:bg-amber-100/60 hover:text-red-900'
                }`}
            >
              <ShoppingBag className="w-4 h-4 text-amber-700" /> Orders ({orders.length})
            </button>

            <button
              onClick={() => { setActiveTab('categories'); setIsAdminSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${activeTab === 'categories' ? 'bg-amber-100 text-amber-950 shadow-sm border border-amber-300 font-black' : 'text-slate-700 hover:bg-amber-100/60 hover:text-red-900'
                }`}
            >
              <Tag className="w-4 h-4 text-amber-700" /> Categories & Weaves
            </button>

            <button
              onClick={() => { setActiveTab('inquiries'); setIsAdminSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${activeTab === 'inquiries' ? 'bg-amber-100 text-amber-950 shadow-sm border border-amber-300 font-black' : 'text-slate-700 hover:bg-amber-100/60 hover:text-red-900'
                }`}
            >
              <MessageSquare className="w-4 h-4 text-amber-700" /> Inquiries & Alerts ({inquiries.length})
            </button>

            <button
              onClick={() => { setActiveTab('inventory'); setIsAdminSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${activeTab === 'inventory' ? 'bg-amber-100 text-amber-950 shadow-sm border border-amber-300 font-black' : 'text-slate-700 hover:bg-amber-100/60 hover:text-red-900'
                }`}
            >
              <AlertTriangle className="w-4 h-4 text-amber-700" /> Stock & Warehouse
            </button>

            <button
              onClick={() => { setActiveTab('customers'); setIsAdminSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${activeTab === 'customers' ? 'bg-amber-100 text-amber-950 shadow-sm border border-amber-300 font-black' : 'text-slate-700 hover:bg-amber-100/60 hover:text-red-900'
                }`}
            >
              <Users className="w-4 h-4 text-amber-700" /> Customer CRM
            </button>

            <button
              onClick={() => { setActiveTab('coupons'); setIsAdminSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${activeTab === 'coupons' ? 'bg-amber-100 text-amber-950 shadow-sm border border-amber-300 font-black' : 'text-slate-700 hover:bg-amber-100/60 hover:text-red-900'
                }`}
            >
              <Sparkles className="w-4 h-4 text-amber-700" /> Coupons & Offers
            </button>

            <button
              onClick={() => { setActiveTab('financials'); setIsAdminSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${activeTab === 'financials' ? 'bg-amber-100 text-amber-950 shadow-sm border border-amber-300 font-black' : 'text-slate-700 hover:bg-amber-100/60 hover:text-red-900'
                }`}
            >
              <DollarSign className="w-4 h-4 text-amber-700" /> Earnings & Taxes
            </button>

            <button
              onClick={() => { setActiveTab('homepage-editor'); setIsAdminSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${activeTab === 'homepage-editor' ? 'bg-amber-100 text-amber-950 shadow-sm border border-amber-300 font-black' : 'text-slate-700 hover:bg-amber-100/60 hover:text-red-900'
                }`}
            >
              <LayoutDashboard className="w-4 h-4 text-amber-700" /> Homepage Editor
            </button>

            <button
              onClick={() => { setActiveTab('settings'); setIsAdminSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-amber-100 text-amber-950 shadow-sm border border-amber-300 font-black' : 'text-slate-700 hover:bg-amber-100/60 hover:text-red-900'
                }`}
            >
              <MessageSquare className="w-4 h-4 text-amber-700" /> Settings & Contact
            </button>
          </nav>
        </div>

        {/* STORE FRONT PAGE Button */}
        <div className="pt-4 border-t border-amber-200">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs font-extrabold text-slate-700 hover:text-red-900 transition-colors uppercase tracking-wider"
          >
            <ExternalLink className="w-4 h-4 text-red-700" /> Store Front Page
          </a>
        </div>
      </aside>

      {/* Main Content Area - Independently scrollable with click-outside auto-close */}
      <main
        onClick={() => {
          if (isAdminSidebarOpen) {
            setIsAdminSidebarOpen(false);
          }
        }}
        className="flex-1 h-full overflow-y-auto p-2 sm:p-3 space-y-4"
      >

        {/* TAB 1: Analytics & Reports Overview */}
        {activeTab === 'analytics' && <AnalyticsSummaryDashboard onNavigate={(targetTab) => setActiveTab(targetTab as any)} />}

        {/* TAB 10: Financials & Taxes / Earnings & GST (With Sub-Navigation Tabs) */}
        {(activeTab === 'financials' || activeTab === 'gst-tax' || activeTab === 'net-profit' || activeTab === 'revenue') && (
          <div className="space-y-6">
            {/* Top Sub-Navigation Pill Toolbar for Financials & Tax Filings */}
            <div className="bg-white p-3 rounded-2xl border border-amber-300 shadow-md flex flex-wrap items-center gap-2 text-xs font-black">
              <button
                onClick={() => setActiveTab('financials')}
                className={`px-4 py-2 rounded-xl transition-all uppercase tracking-wider ${
                  activeTab === 'financials'
                    ? 'bg-red-800 text-amber-300 shadow border border-amber-300/50 font-black'
                    : 'bg-amber-50 text-slate-700 hover:bg-amber-100'
                }`}
              >
                💰 EARNINGS OVERVIEW
              </button>
              <button
                onClick={() => setActiveTab('gst-tax')}
                className={`px-4 py-2 rounded-xl transition-all uppercase tracking-wider ${
                  activeTab === 'gst-tax'
                    ? 'bg-red-800 text-amber-300 shadow border border-amber-300/50 font-black'
                    : 'bg-amber-50 text-slate-700 hover:bg-amber-100'
                }`}
              >
                🧾 GST & TAX FILING (5%)
              </button>
              <button
                onClick={() => setActiveTab('net-profit')}
                className={`px-4 py-2 rounded-xl transition-all uppercase tracking-wider ${
                  activeTab === 'net-profit'
                    ? 'bg-red-800 text-amber-300 shadow border border-amber-300/50 font-black'
                    : 'bg-amber-50 text-slate-700 hover:bg-amber-100'
                }`}
              >
                💵 NET PROFIT & P&L
              </button>
              <button
                onClick={() => setActiveTab('revenue')}
                className={`px-4 py-2 rounded-xl transition-all uppercase tracking-wider ${
                  activeTab === 'revenue'
                    ? 'bg-red-800 text-amber-300 shadow border border-amber-300/50 font-black'
                    : 'bg-amber-50 text-slate-700 hover:bg-amber-100'
                }`}
              >
                📈 DETAILED REVENUE ENGINE
              </button>
            </div>

            {activeTab === 'financials' && <RevenueDashboardPage />}
            {activeTab === 'gst-tax' && <GstTaxAnalyticsPage onBack={() => setActiveTab('financials')} />}
            {activeTab === 'net-profit' && <NetProfitAnalyticsPage onBack={() => setActiveTab('financials')} />}
            {activeTab === 'revenue' && <RevenueAnalyticsPage onBack={() => setActiveTab('financials')} />}
          </div>
        )}

        {/* Analytics Deep-Dive Sub-Pages */}
        {activeTab === 'today-orders' && <TodayOrdersPage onBack={() => setActiveTab('analytics')} />}
        {activeTab === 'customer-analytics' && <CustomerAnalyticsPage onBack={() => setActiveTab('analytics')} />}
        {activeTab === 'product-units' && <ProductUnitsAnalyticsPage onBack={() => setActiveTab('analytics')} />}
        {activeTab === 'refunds' && <RefundsAnalyticsPage onBack={() => setActiveTab('analytics')} />}
        {activeTab === 'returns' && <ReturnsAnalyticsPage onBack={() => setActiveTab('analytics')} />}
        {activeTab === 'low-stock' && <LowStockInventoryPage onBack={() => setActiveTab('analytics')} />}
        {activeTab === 'top-selling' && <TopSellingProductsPage onBack={() => setActiveTab('analytics')} />}

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
                      className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-sm border border-amber-300 flex items-center gap-1.5 transition-all"
                    >
                      <Plus className="w-4 h-4 text-amber-700" /> Add New Category Card
                    </button>

                    <button
                      onClick={handleOpenCreateModal}
                      className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-900 font-black text-xs uppercase tracking-wider rounded-xl shadow-sm border border-red-300 flex items-center gap-1.5 transition-all"
                    >
                      <Plus className="w-4 h-4 text-red-700" /> Add Saree
                    </button>

                    <button
                      onClick={handleExportCSV}
                      className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-slate-900 font-black text-xs uppercase tracking-wider rounded-xl border border-amber-300 flex items-center gap-1.5 transition-all"
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
                        className="group relative bg-white hover:bg-amber-50/80 rounded-3xl overflow-hidden border border-amber-200 hover:border-amber-400 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
                      >
                        {/* Full-Bleed Image Header (0 margin/padding around top image) */}
                        <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-amber-200 shadow-sm bg-amber-50">
                          <img
                            src={catCard.image}
                            alt={catCard.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-3 left-3 bg-red-100/90 text-red-950 text-[9px] font-black uppercase px-3 py-1 rounded-full shadow-sm border border-red-300 backdrop-blur-sm">
                            {catCard.fabric}
                          </div>

                          {/* Action Overlay: Edit & Delete Card */}
                          <div className="absolute top-3 right-3 flex items-center gap-1.5">
                            <span className="bg-amber-100/90 text-amber-950 text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-sm border border-amber-300 backdrop-blur-sm">
                              {count} SAREES
                            </span>
                            <button
                              onClick={(e) => handleOpenEditCardModal(catCard, e)}
                              className="p-1.5 bg-amber-100 hover:bg-amber-200 text-amber-950 rounded-full shadow-sm border border-amber-300 transition-all"
                              title="Edit Category Card Name & Image"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteCategoryCard(catCard, e)}
                              className="p-1.5 bg-red-100 hover:bg-red-200 text-red-900 rounded-full shadow-sm border border-red-300 transition-all"
                              title="Delete Category Card"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Padded Content Area */}
                        <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 space-y-4">
                          <div className="space-y-1">
                            <h4 className="font-street text-xl font-black text-slate-900 group-hover:text-red-900 transition-colors uppercase">
                              {catCard.name}
                            </h4>
                            <p className="text-xs text-slate-600 font-medium line-clamp-2">
                              {catCard.desc}
                            </p>
                          </div>

                          <button className="w-full py-3 bg-red-100 hover:bg-red-200 text-red-900 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 border border-red-300">
                            <span>VIEW {catCard.name}</span>
                            <span className="text-sm font-bold">→</span>
                          </button>
                        </div>
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
                              <span className="font-bold text-slate-900 text-sm block line-clamp-1">{formatSareeName(prod.name, prod.category, true)}</span>
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
                              className={`px-2.5 py-1 text-xs font-black rounded-full ${prod.stock > 10 ? 'bg-amber-100 text-slate-900' : 'bg-red-100 text-red-800'
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
        {activeTab === 'orders' && (() => {
          const matchesOrderPeriod = (createdAtStr: string) => {
            if (orderPeriodFilter === 'all') return true;
            const createdDate = new Date(createdAtStr);
            const now = new Date();

            if (orderPeriodFilter === 'today') {
              return createdDate.toDateString() === now.toDateString();
            }

            if (orderPeriodFilter === '7days') {
              const past7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
              return createdDate >= past7;
            }

            if (orderPeriodFilter === '30days') {
              const past30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
              return createdDate >= past30;
            }

            if (orderPeriodFilter === 'this_month') {
              return createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear();
            }

            if (orderPeriodFilter === 'last_month') {
              const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
              return createdDate.getMonth() === lastMonthDate.getMonth() && createdDate.getFullYear() === lastMonthDate.getFullYear();
            }

            if (orderPeriodFilter === 'this_year') {
              return createdDate.getFullYear() === now.getFullYear();
            }

            if (orderPeriodFilter === 'custom' && orderCustomDate) {
              const [y, m, d] = orderCustomDate.split('-').map(Number);
              return (
                createdDate.getFullYear() === y &&
                createdDate.getMonth() + 1 === m &&
                createdDate.getDate() === d
              );
            }

            return true;
          };

          const getOrderStatusCount = (statusKey: string) => {
            const dateFiltered = orders.filter((o) => matchesOrderPeriod(o.createdAt));
            if (statusKey === 'ALL') return dateFiltered.length;
            return dateFiltered.filter((o) => (o.orderStatus || '').toLowerCase() === statusKey.toLowerCase()).length;
          };

          const filteredOrders = orders.filter((o) => {
            const matchesStatus = orderStatusFilter === 'ALL' || (o.orderStatus || '').toLowerCase() === orderStatusFilter.toLowerCase();
            const matchesDate = matchesOrderPeriod(o.createdAt);
            return matchesStatus && matchesDate;
          });

          return (
            <div className="bg-white rounded-3xl border border-amber-200 shadow-md overflow-hidden space-y-0">
              {/* Header Bar */}
              <div className="p-6 border-b border-amber-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-amber-50/40">
                <div>
                  <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest block">FULFILLMENT PIPELINE</span>
                  <h3 className="font-street text-2xl sm:text-3xl font-black text-slate-900">ORDERS PIPELINE</h3>
                </div>
                <button onClick={handleExportCSV} className="px-3.5 py-2 bg-amber-100 text-slate-900 font-extrabold text-xs uppercase rounded-xl hover:bg-amber-200 border border-amber-300 shadow-sm">
                  Export Orders CSV
                </button>
              </div>

              {/* Single-Line Interactive Status Filter Buttons Bar */}
              <div className="p-2 sm:p-2.5 bg-amber-50/60 border-b border-amber-200 flex items-center justify-between gap-1 sm:gap-1.5 w-full overflow-x-auto custom-scrollbar whitespace-nowrap">
                {[
                  { key: 'ALL', label: 'ALL ORDERS' },
                  { key: 'Pending', label: 'PENDING' },
                  { key: 'Confirmed', label: 'CONFIRMED' },
                  { key: 'Processing', label: 'PROCESSING' },
                  { key: 'Packed', label: 'PACKED' },
                  { key: 'Shipped', label: 'SHIPPED' },
                  { key: 'Out For Delivery', label: 'OUT FOR DELIVERY' },
                  { key: 'Delivered', label: 'DELIVERED' },
                  { key: 'Cancelled', label: 'CANCELLED' },
                ].map((st) => {
                  const count = getOrderStatusCount(st.key);
                  const isActive = orderStatusFilter.toLowerCase() === st.key.toLowerCase();
                  return (
                    <button
                      key={st.key}
                      onClick={() => setOrderStatusFilter(st.key)}
                      className={`flex-1 min-w-0 px-2 py-1.5 sm:px-2.5 sm:py-2 rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-tight transition-all flex items-center justify-center gap-1 sm:gap-1.5 border shadow-sm ${
                        isActive
                          ? 'bg-red-800 text-amber-300 border-amber-300 shadow-md ring-1 ring-amber-400/50'
                          : 'bg-white text-slate-800 hover:bg-amber-100 border-amber-300/80'
                      }`}
                    >
                      <span className="truncate">{st.label}</span>
                      <span className={`px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] flex-shrink-0 ${isActive ? 'bg-amber-300 text-red-950 font-black' : 'bg-amber-100 text-slate-900 font-extrabold'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* 📅 Date & Time Period Filter Bar (Day, Month, Year, Calendar Date Picker) */}
              <div className="p-4 bg-amber-100/50 border-b border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5 font-black text-amber-900 uppercase tracking-wider text-[11px]">
                    <Clock className="w-4 h-4 text-red-800" />
                    <span>TIME PERIOD FILTER:</span>
                  </div>

                  {/* Dropdown presets */}
                  <select
                    value={orderPeriodFilter}
                    onChange={(e: any) => {
                      setOrderPeriodFilter(e.target.value);
                      if (e.target.value !== 'custom') setOrderCustomDate('');
                    }}
                    className="px-3.5 py-2 bg-white border border-amber-300 rounded-xl font-bold text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 uppercase cursor-pointer"
                  >
                    <option value="all">🗓️ ALL TIME ORDERS</option>
                    <option value="today">⚡ TODAY</option>
                    <option value="7days">📅 LAST 7 DAYS</option>
                    <option value="30days">📆 LAST 30 DAYS</option>
                    <option value="this_month">📊 THIS MONTH</option>
                    <option value="last_month">📜 LAST MONTH</option>
                    <option value="this_year">🏆 THIS YEAR</option>
                    <option value="custom">🔍 CHOOSE SPECIFIC DATE (CALENDAR)</option>
                  </select>

                  {/* Calendar Date Picker Input */}
                  {(orderPeriodFilter === 'custom' || orderCustomDate) && (
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-amber-400 shadow-sm">
                      <span className="text-[10px] font-black text-amber-800 uppercase">PICK DATE:</span>
                      <input
                        type="date"
                        value={orderCustomDate}
                        onChange={(e) => {
                          setOrderCustomDate(e.target.value);
                          setOrderPeriodFilter('custom');
                        }}
                        className="bg-transparent font-mono text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
                      />
                      {orderCustomDate && (
                        <button
                          onClick={() => {
                            setOrderCustomDate('');
                            setOrderPeriodFilter('all');
                          }}
                          className="px-2 py-0.5 bg-red-100 text-red-800 rounded-md text-[9px] font-black uppercase hover:bg-red-200 border border-red-300"
                        >
                          ✕ Clear
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Filter Summary & Reset Button */}
                <div className="flex items-center gap-3 text-[11px] font-bold text-slate-700">
                  <span>
                    Showing <strong className="text-red-800 font-black font-mono text-xs">{filteredOrders.length}</strong> of {orders.length} Orders
                  </span>
                  {(orderPeriodFilter !== 'all' || orderStatusFilter !== 'ALL' || orderCustomDate) && (
                    <button
                      onClick={() => {
                        setOrderStatusFilter('ALL');
                        setOrderPeriodFilter('all');
                        setOrderCustomDate('');
                      }}
                      className="px-2.5 py-1 bg-red-800 text-amber-300 rounded-lg text-[10px] font-black uppercase hover:bg-red-900 border border-amber-300 shadow-sm"
                    >
                      Reset All Filters
                    </button>
                  )}
                </div>
              </div>

              {/* Orders Table */}
              <div className="overflow-x-auto">
                {filteredOrders.length === 0 ? (
                  <div className="p-12 text-center bg-amber-50/30 text-slate-600 font-semibold text-xs space-y-2">
                    <p>
                      No customer orders found matching current filter parameters:
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2 text-[11px]">
                      <span className="bg-amber-100 text-amber-900 px-2.5 py-1 rounded-lg border border-amber-300 font-bold uppercase">
                        Status: {orderStatusFilter}
                      </span>
                      <span className="bg-amber-100 text-amber-900 px-2.5 py-1 rounded-lg border border-amber-300 font-bold uppercase">
                        Period: {orderPeriodFilter.replace('_', ' ')}
                      </span>
                      {orderCustomDate && (
                        <span className="bg-amber-100 text-amber-900 px-2.5 py-1 rounded-lg border border-amber-300 font-bold font-mono">
                          Date: {orderCustomDate}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
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
                      {filteredOrders.map((o) => (
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
                            {(() => {
                              const pipelineOptions = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Out For Delivery', 'Delivered', 'Cancelled'];
                              const currentIdx = pipelineOptions.findIndex((s) => s.toLowerCase() === (o.orderStatus || '').toLowerCase());
                              const isTerminal = o.orderStatus === 'Cancelled' || o.orderStatus === 'Delivered';

                              return (
                                <select
                                  value={o.orderStatus}
                                  disabled={isTerminal}
                                  onChange={(e) => handleOrderStatusChange(o._id, e.target.value)}
                                  className={`p-2 border rounded-xl text-xs font-bold uppercase transition-all ${
                                    isTerminal
                                      ? 'bg-slate-100 border-slate-300 text-slate-500 cursor-not-allowed opacity-80'
                                      : 'bg-amber-50 border-amber-300 text-slate-900 cursor-pointer'
                                  }`}
                                >
                                  {pipelineOptions.map((opt, idx) => {
                                    const isPassedStep = currentIdx !== -1 && idx < currentIdx && opt !== 'Cancelled';
                                    const isCurrentStep = idx === currentIdx;
                                    return (
                                      <option
                                        key={opt}
                                        value={opt}
                                        disabled={isPassedStep}
                                        className={
                                          isPassedStep
                                            ? 'text-slate-400 font-normal bg-slate-100 cursor-not-allowed'
                                            : isCurrentStep
                                            ? 'font-black text-amber-900 bg-amber-100'
                                            : 'font-bold text-slate-900 bg-white'
                                        }
                                      >
                                        {isPassedStep ? `✓ ${opt} (Completed)` : opt}
                                      </option>
                                    );
                                  })}
                                </select>
                              );
                            })()}

                            {o.orderStatus === 'Cancelled' && (() => {
                              const isCust = (o as any).cancelledBy === 'Customer' || (o.cancelReason || '').toLowerCase().includes('customer');
                              return (
                                <div className="mt-1.5 text-[10px] font-bold text-red-900 bg-red-100/80 p-2 rounded-xl border border-red-300 flex flex-col gap-0.5">
                                  <span className="uppercase text-[9px] font-black tracking-wider text-red-800">
                                    {isCust ? '🚫 CANCELLED BY CUSTOMER' : '🛡️ CANCELLED BY ADMIN'}
                                  </span>
                                  {o.cancelReason && (
                                    <span className="text-[10px] text-red-950 font-semibold">
                                      <strong>Reason:</strong> {o.cancelReason}
                                    </span>
                                  )}
                                </div>
                              );
                            })()}
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
                            <button
                              onClick={() => handleDeleteOrder(o._id)}
                              className="px-2.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 font-extrabold text-[10px] rounded-lg uppercase inline-flex items-center gap-1 transition-colors"
                              title="Delete Order"
                            >
                              <Trash2 className="w-3 h-3 text-red-700" /> Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          );
        })()}

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
            {/* Full-Width Database Category Cards (One by One in Rows) */}
            <div className="flex flex-col gap-4 w-full">
              {filteredDbCategories.map((cat) => (
                <div
                  key={cat._id}
                  className={`relative w-full rounded-3xl p-5 sm:p-6 border transition-all duration-300 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-sm hover:shadow-lg ${
                    cat.status === 'ARCHIVED'
                      ? 'bg-red-50/40 border-red-200'
                      : cat.isLive
                        ? 'bg-white border-amber-200/90 hover:border-amber-400'
                        : 'bg-slate-100/60 border-slate-300'
                  }`}
                >
                  {/* Left Section: Name, Order Index, Description & Metadata */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h4 className="font-street text-xl sm:text-2xl font-black text-slate-900 uppercase">
                        {cat.name}
                      </h4>
                      <span className="text-[10px] font-bold font-mono text-slate-500 bg-amber-100/80 px-2 py-0.5 rounded-md border border-amber-200">
                        Order #{cat.displayOrder || 0}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 font-medium max-w-3xl">
                      {cat.description || 'Authentic handcrafted saree collection.'}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-500 font-semibold pt-1">
                      <span>Created By: <strong className="text-slate-800">{cat.createdBy || 'Admin'}</strong></span>
                      <span>• Last Updated: <strong className="text-slate-800">{new Date(cat.updatedAt || Date.now()).toLocaleDateString()}</strong></span>
                    </div>
                  </div>

                  {/* Right Section: Badges Toolbar & Action Buttons */}
                  <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-start sm:items-center gap-3 flex-shrink-0">
                    
                    {/* Status & Live & Starred Badges Toolbar */}
                    <div className="flex flex-wrap items-center gap-1.5 p-2 bg-amber-50/80 rounded-2xl border border-amber-200">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase shadow-sm border ${
                          cat.status === 'ACTIVE'
                            ? 'bg-amber-100 text-amber-950 border-amber-300'
                            : 'bg-red-100 text-red-950 border-red-300'
                        }`}
                      >
                        {cat.status}
                      </span>

                      <button
                        onClick={() => handleToggleDbCategoryLive(cat)}
                        className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase shadow-sm transition-all border ${
                          cat.isLive
                            ? 'bg-red-100 text-red-950 hover:bg-red-200 border-red-300'
                            : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border-amber-200 font-bold'
                        }`}
                        title="Click to toggle Live/Offline"
                      >
                        {cat.isLive ? '● LIVE' : '○ OFFLINE'}
                      </button>

                      <button
                        onClick={() => handleToggleDbCategoryFeatured(cat)}
                        className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase shadow-sm transition-all border ${
                          cat.featured
                            ? 'bg-amber-100 text-amber-950 hover:bg-amber-200 border-amber-300 font-black'
                            : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border-amber-200 font-bold'
                        }`}
                        title="Click to toggle Starred Category"
                      >
                        {cat.featured ? '★ STARRED' : '☆ STAR'}
                      </button>

                      <span className="bg-amber-100 text-amber-950 text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-sm border border-amber-300">
                        {cat.productCount || 0} SAREES
                      </span>
                    </div>

                    {/* Action Buttons: Edit, Delete, View */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => handleOpenEditDbCategoryModal(cat)}
                        className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-slate-900 font-extrabold text-xs rounded-xl flex items-center gap-1 border border-amber-300 transition-all shadow-sm"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-red-800" /> Edit
                      </button>

                      {cat.status === 'ARCHIVED' ? (
                        <button
                          onClick={() => handleRestoreDbCategory(cat._id)}
                          className="px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-extrabold text-xs rounded-xl flex items-center gap-1 transition-all shadow-sm"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Restore
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDeleteDbCategory(cat)}
                          className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 font-extrabold text-xs rounded-xl flex items-center gap-1 transition-all shadow-sm"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setSelectedAdminCategory(cat.name);
                          setActiveTab('products');
                        }}
                        className="p-2.5 bg-amber-100/70 hover:bg-amber-200 text-slate-900 rounded-xl transition-all border border-amber-300 shadow-sm"
                        title="View Category Items in Inventory"
                      >
                        <ExternalLink className="w-4 h-4 text-red-800" />
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

        {/* TAB 5: Stock & Warehouse (Category-Wise Cards & Manual Stock Adjuster) */}
        {activeTab === 'inventory' && (
          <StockWarehouseInventoryAdjuster
            products={products}
            onRefreshProducts={fetchAdminData}
          />
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
                      <td className="p-3 font-bold text-slate-900 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-300 font-extrabold text-xs flex items-center justify-center border border-amber-300 shadow overflow-hidden flex-shrink-0">
                          {c.avatar ? (
                            <img src={c.avatar} alt={c.name} className="w-full h-full object-cover" />
                          ) : (
                            c.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <span>{c.name}</span>
                      </td>
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
          <div className="bg-white p-8 rounded-3xl border border-amber-200 shadow-lg space-y-6 text-slate-900 font-sans">
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-amber-800 flex items-center gap-2">
                <Bot className="w-4 h-4 text-red-700" /> AI SAREE GENERATOR ATELIER
              </span>
              <h3 className="font-street text-3xl font-black text-slate-900">GENERATE SAREE ATTRIBUTES WITH AI</h3>
              <p className="text-xs text-slate-600 font-medium">Enter inputs to generate full titles, fabric specifications, thread & zari details, SKU, and product imagery.</p>
            </div>

            <form onSubmit={handleGenerateAiProduct} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-semibold">
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
                  <option value="Silk Sarees">Silk Sarees</option>
                  <option value="Partywear Sarees">Partywear Sarees</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">Fabric Material</label>
                <input
                  type="text"
                  value={aiInputs.fabric}
                  onChange={(e) => setAiInputs({ ...aiInputs, fabric: e.target.value })}
                  placeholder="e.g. Royal Banarasi Silk"
                  className="w-full p-3 bg-amber-50/50 border border-amber-300 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">Color Palette</label>
                <input
                  type="text"
                  value={aiInputs.color}
                  onChange={(e) => setAiInputs({ ...aiInputs, color: e.target.value })}
                  placeholder="e.g. Royal Crimson Red"
                  className="w-full p-3 bg-amber-50/50 border border-amber-300 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">Occasion</label>
                <input
                  type="text"
                  value={aiInputs.occasion}
                  onChange={(e) => setAiInputs({ ...aiInputs, occasion: e.target.value })}
                  placeholder="e.g. Bridal & Wedding"
                  className="w-full p-3 bg-amber-50/50 border border-amber-300 rounded-xl font-medium"
                />
              </div>

              <div className="lg:col-span-4 pt-2">
                <button type="submit" className="w-full py-4 bg-red-800 hover:bg-red-900 text-amber-300 font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl flex items-center justify-center gap-2 border border-amber-300 transition-all">
                  <Sparkles className="w-4 h-4 text-amber-300" /> ✨ GENERATE FULL AI SAREE PRODUCT CARD ATTRIBUTES
                </button>
              </div>
            </form>

            {aiGeneratedResult && (
              <div className="p-6 bg-amber-50/70 rounded-3xl border-2 border-amber-300 shadow-xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
                
                {/* Result Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-200 pb-4">
                  <div>
                    <span className="font-street text-2xl font-black text-slate-900 block">AI GENERATED SAREE PRODUCT CARD</span>
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-600" /> Complete Specifications & Real-Time Imagery Ready for Live Store
                    </span>
                  </div>
                  <span className="bg-red-800 text-amber-300 text-xs font-mono font-black uppercase px-3.5 py-1.5 rounded-full border border-amber-300 shadow">
                    SKU: {aiGeneratedResult.sku}
                  </span>
                </div>

                {/* Main Product Card Preview Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left Column: Real-Time Generated Image & Cloudinary Controls */}
                  <div className="space-y-3">
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-amber-300 shadow-lg bg-slate-900 group">
                      <img
                        src={aiGeneratedResult.image}
                        alt={aiGeneratedResult.name}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-all duration-500"
                      />
                      <span className="absolute top-3 left-3 bg-slate-950/90 text-amber-300 text-[9px] font-black uppercase px-3 py-1 rounded-full border border-amber-300/40 backdrop-blur-md shadow">
                        ✨ REAL-TIME UNIQUE SAREE IMAGE
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const newImg = generateUniqueSareeImage(aiInputs.category, aiInputs.color);
                        setAiGeneratedResult({ ...aiGeneratedResult, image: newImg, images: [newImg] });
                        showToast('Generated new real-time unique saree image!', 'info');
                      }}
                      className="text-xs font-black text-red-800 hover:text-red-900 uppercase tracking-wider flex items-center justify-center gap-1.5 w-full py-2.5 bg-white hover:bg-amber-100 rounded-xl border border-amber-300 shadow-sm transition-all"
                    >
                      <RefreshCw className="w-4 h-4 text-red-700" /> REGENERATE UNIQUE IMAGE
                    </button>
                  </div>

                  {/* Right 2 Columns: Editable Title, Price & Full Specifications Grid */}
                  <div className="lg:col-span-2 space-y-5">
                    
                    {/* Title & Description */}
                    <div className="space-y-2">
                      <label className="block text-slate-700 font-bold uppercase text-[10px]">Saree Product Headline Name</label>
                      <input
                        type="text"
                        value={aiGeneratedResult.name}
                        onChange={(e) => setAiGeneratedResult({ ...aiGeneratedResult, name: e.target.value })}
                        className="w-full p-3 bg-white border border-amber-300 rounded-xl font-street text-xl font-black text-slate-900 shadow-sm"
                      />
                    </div>

                    {/* Pricing Box */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-2xl border border-amber-300 shadow-sm">
                      <div>
                        <span className="text-[10px] font-black text-slate-500 uppercase block">Offer Price (₹)</span>
                        <input
                          type="number"
                          value={aiGeneratedResult.discountPrice}
                          onChange={(e) => setAiGeneratedResult({ ...aiGeneratedResult, discountPrice: Number(e.target.value) })}
                          className="w-full p-2 bg-amber-50 border border-amber-300 rounded-lg font-black text-lg text-red-800"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-slate-500 uppercase block">MRP (₹)</span>
                        <input
                          type="number"
                          value={aiGeneratedResult.mrp}
                          onChange={(e) => setAiGeneratedResult({ ...aiGeneratedResult, mrp: Number(e.target.value) })}
                          className="w-full p-2 bg-amber-50 border border-amber-300 rounded-lg font-bold text-base text-slate-500 line-through"
                        />
                      </div>
                      <div className="flex flex-col justify-center items-center bg-emerald-50 rounded-xl border border-emerald-200">
                        <span className="text-[9px] font-black text-emerald-800 uppercase">DISCOUNT SAVINGS</span>
                        <span className="font-street text-xl font-black text-emerald-700">
                          {Math.round(((aiGeneratedResult.mrp - aiGeneratedResult.discountPrice) / aiGeneratedResult.mrp) * 100)}% OFF
                        </span>
                      </div>
                    </div>

                    {/* FULL SAREE SPECIFICATIONS GRID (MATCHES PRODUCT CARD SCREENSHOT 3) */}
                    <div className="space-y-3 pt-1">
                      <span className="text-xs font-black uppercase tracking-widest text-amber-900 border-b border-amber-200 pb-1 block">
                        SAREE PRODUCT CARD SPECIFICATIONS (AUTOMATICALLY POPULATED)
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold">
                        <div className="p-3 bg-white rounded-xl border border-amber-300 space-y-1">
                          <span className="text-[9px] font-black text-amber-900 uppercase block">CLOTH & FABRIC TYPE</span>
                          <input
                            type="text"
                            value={aiGeneratedResult.clothType}
                            onChange={(e) => setAiGeneratedResult({ ...aiGeneratedResult, clothType: e.target.value })}
                            className="w-full p-1.5 bg-amber-50/50 border border-amber-200 rounded font-bold text-slate-900 text-xs"
                          />
                        </div>

                        <div className="p-3 bg-white rounded-xl border border-amber-300 space-y-1">
                          <span className="text-[9px] font-black text-amber-900 uppercase block">THREAD & ZARI MATERIAL</span>
                          <input
                            type="text"
                            value={aiGeneratedResult.threadMaterial}
                            onChange={(e) => setAiGeneratedResult({ ...aiGeneratedResult, threadMaterial: e.target.value })}
                            className="w-full p-1.5 bg-amber-50/50 border border-amber-200 rounded font-bold text-slate-900 text-xs"
                          />
                        </div>

                        <div className="p-3 bg-white rounded-xl border border-amber-300 space-y-1">
                          <span className="text-[9px] font-black text-amber-900 uppercase block">COMFORT & BREATHABILITY</span>
                          <input
                            type="text"
                            value={aiGeneratedResult.comfortLevel}
                            onChange={(e) => setAiGeneratedResult({ ...aiGeneratedResult, comfortLevel: e.target.value })}
                            className="w-full p-1.5 bg-amber-50/50 border border-amber-200 rounded font-bold text-slate-900 text-xs"
                          />
                        </div>

                        <div className="p-3 bg-white rounded-xl border border-amber-300 space-y-1">
                          <span className="text-[9px] font-black text-amber-900 uppercase block">COLOR & DYE DETAILS</span>
                          <input
                            type="text"
                            value={aiGeneratedResult.colorDetails}
                            onChange={(e) => setAiGeneratedResult({ ...aiGeneratedResult, colorDetails: e.target.value })}
                            className="w-full p-1.5 bg-amber-50/50 border border-amber-200 rounded font-bold text-slate-900 text-xs"
                          />
                        </div>

                        <div className="p-3 bg-white rounded-xl border border-amber-300 space-y-1">
                          <span className="text-[9px] font-black text-amber-900 uppercase block">DIMENSIONS & WEIGHT</span>
                          <input
                            type="text"
                            value={aiGeneratedResult.sareeLength}
                            onChange={(e) => setAiGeneratedResult({ ...aiGeneratedResult, sareeLength: e.target.value })}
                            className="w-full p-1.5 bg-amber-50/50 border border-amber-200 rounded font-bold text-slate-900 text-xs"
                          />
                        </div>

                        <div className="p-3 bg-white rounded-xl border border-amber-300 space-y-1">
                          <span className="text-[9px] font-black text-amber-900 uppercase block">GARMENT CARE</span>
                          <input
                            type="text"
                            value={aiGeneratedResult.washCare}
                            onChange={(e) => setAiGeneratedResult({ ...aiGeneratedResult, washCare: e.target.value })}
                            className="w-full p-1.5 bg-amber-50/50 border border-amber-200 rounded font-bold text-slate-900 text-xs"
                          />
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                <button
                  onClick={handlePublishAiProduct}
                  className="w-full py-4 bg-slate-900 hover:bg-red-800 text-amber-300 font-black uppercase text-xs tracking-wider rounded-2xl shadow-xl border border-amber-300 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" /> ✨ PUBLISH FULL AI SAREE PRODUCT CARD TO MONGODB
                </button>
              </div>
            )}
          </div>
        )}



        {/* TAB 10.5: Inquiries & WhatsApp Alerts Feed */}
        {activeTab === 'inquiries' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-amber-200 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-red-700" /> LIVE SAREE INQUIRIES & CONCIERGE FEED
                </span>
                <h2 className="font-street text-2xl sm:text-3xl font-black text-slate-900 uppercase mt-0.5">
                  CUSTOMER INQUIRIES ({inquiries.length})
                </h2>
              </div>
              <button
                onClick={fetchAdminData}
                className="px-4 py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-950 font-extrabold text-xs uppercase tracking-wider rounded-xl border border-amber-300 shadow-sm flex items-center justify-center gap-2 self-start sm:self-auto"
              >
                <RefreshCw className="w-4 h-4 text-amber-800" /> REFRESH INQUIRIES
              </button>
            </div>

            {inquiries.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-amber-200 text-center space-y-3 shadow-md">
                <MessageSquare className="w-10 h-10 text-amber-400 mx-auto" />
                <h3 className="font-street text-xl font-black text-slate-900">NO INQUIRIES RECEIVED YET</h3>
                <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
                  Customer consultation requests submitted via the Contact page or WhatsApp will appear here in real-time.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inquiries.map((inq: any, idx: number) => (
                  <div key={inq._id || idx} className="bg-white p-6 rounded-2xl border border-amber-200/90 shadow-md space-y-3 hover:border-amber-400 transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-amber-800 block">SAREE INTEREST</span>
                        <span className="font-street font-extrabold text-base text-slate-900">{inq.sareeInterest || 'General Inquiry'}</span>
                      </div>
                      <span className="bg-emerald-100 text-emerald-950 border border-emerald-300 text-[8px] font-black px-2.5 py-0.5 rounded-full uppercase">
                        {inq.status || 'New'}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="flex flex-wrap items-center gap-2 text-slate-800 font-bold">
                        <span>👤 {inq.name}</span>
                        <span>•</span>
                        <span>📞 {inq.phone}</span>
                      </div>
                      <p className="text-slate-500 font-medium">✉️ {inq.email}</p>
                    </div>

                    <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200 text-xs font-medium text-slate-800 leading-relaxed">
                      "{inq.message}"
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-amber-100 text-[10px] text-slate-500 font-bold">
                      <span>🗓️ {new Date(inq.createdAt || Date.now()).toLocaleString('en-IN')}</span>
                      <a
                        href={`https://wa.me/91${inq.phone.replace(/\D/g, '')}?text=Hi%20${encodeURIComponent(inq.name)},%20thank%20you%20for%20contacting%20EVAN%20COLLECTIONS%20regarding%20your%20${encodeURIComponent(inq.sareeInterest)}%20inquiry!`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-lg uppercase tracking-wider text-[9px] flex items-center gap-1.5 shadow-sm"
                      >
                        <MessageSquare className="w-3 h-3" /> REPLY VIA WHATSAPP
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 11: Homepage Editor */}
        {activeTab === 'homepage-editor' && <HomepageEditorPage />}

        {/* TAB 12: WhatsApp & Contact Settings */}
        {activeTab === 'settings' && <AdminWhatsAppSettingsPanel />}

        {/* Full-Page Saree Add/Edit View (Not a Popup) */}
        {showProductModal && (
          <div className="fixed inset-0 bg-[#FFFDF9] z-50 overflow-y-auto flex flex-col font-sans animate-in fade-in zoom-in-95 duration-200">
            {/* Sticky Header Bar */}
            <div className="sticky top-0 z-30 bg-slate-900 text-white px-4 sm:px-8 py-3.5 border-b border-amber-400/40 shadow-lg flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="flex items-center space-x-2 bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border border-amber-400/30 transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>BACK TO CATALOG</span>
                </button>
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-amber-400 block">
                    EVAN COLLECTIONS • SAREE EDITOR ATELIER
                  </span>
                  <h2 className="font-street text-xl sm:text-2xl font-black tracking-tight text-white uppercase leading-none">
                    {editingProduct ? 'EDIT SAREE PRODUCT' : 'ADD NEW LUXURY SAREE'}
                  </h2>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleSaveProduct}
                  className="px-6 py-2 bg-red-800 hover:bg-red-700 text-amber-300 text-xs font-black uppercase tracking-widest rounded-xl shadow-lg border border-amber-300 transition-all cursor-pointer"
                >
                  SAVE SAREE
                </button>
              </div>
            </div>

            {/* Main Full-Page Form Body - Full Width Single Column Layout */}
            <div className="max-w-7xl w-full mx-auto p-4 sm:p-8 flex-1">
              <form onSubmit={handleSaveProduct} className="space-y-8 w-full">
                
                {/* SECTION 1: BASIC SAREE & PRICING DETAILS */}
                <div className="w-full bg-white p-6 sm:p-8 rounded-3xl border border-amber-200 shadow-md space-y-6">
                  <div className="border-b border-amber-100 pb-3 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-red-800">SECTION 1</span>
                      <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase">BASIC SAREE & PRICING DETAILS</h3>
                    </div>
                    <span className="text-[9px] font-bold text-amber-900 bg-amber-100 px-3 py-1 rounded-full uppercase">CORE SPECIFICATIONS</span>
                  </div>

                  <div>
                    <label className="block text-slate-800 font-black uppercase text-[11px] mb-1.5">Saree Product Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-3.5 bg-amber-50/40 border border-amber-300 rounded-xl font-bold text-sm text-slate-900 focus:outline-none focus:border-red-800"
                      placeholder="e.g. EVAN COLLECTIONS Royal Crimson Banarasi Silk Saree"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-800 font-black uppercase text-[11px] mb-1.5">Saree Category *</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full p-3.5 bg-amber-50/40 border border-amber-300 rounded-xl font-black text-xs text-slate-900 focus:outline-none focus:border-red-800 cursor-pointer"
                      >
                        {[
                          'Kanchipuram Sarees',
                          'Banarasi Sarees',
                          'Organza Sarees',
                          'Paithani Sarees',
                          'Linen Sarees',
                          'Silk Sarees',
                          'Cotton Sarees',
                          'Handloom Sarees',
                          'Bandhani Sarees',
                          'Designer Sarees',
                          'Printed Sarees',
                          'Crepe Sarees',
                          'Georgette Sarees',
                          'Chiffon Sarees',
                          'Tussar Silk Sarees',
                          'Embroidery Sarees',
                          'Zari Brocade Sarees',
                        ].map((cat: string) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-800 font-black uppercase text-[11px] mb-1.5">Fabric & Weave Material *</label>
                      <input
                        type="text"
                        required
                        value={formData.fabric}
                        onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
                        className="w-full p-3.5 bg-amber-50/40 border border-amber-300 rounded-xl font-bold text-xs text-slate-900 focus:outline-none focus:border-red-800"
                        placeholder="e.g. Pure Kanchipuram Silk"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-800 font-black uppercase text-[11px] mb-1.5">Offer Price (₹) *</label>
                      <input
                        type="number"
                        required
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full p-3.5 bg-amber-50/40 border border-amber-300 rounded-xl font-black text-sm text-red-800 focus:outline-none focus:border-red-800"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-800 font-black uppercase text-[11px] mb-1.5">MRP (₹)</label>
                      <input
                        type="number"
                        value={formData.mrp}
                        onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                        className="w-full p-3.5 bg-amber-50/40 border border-amber-300 rounded-xl font-bold text-sm text-slate-500 focus:outline-none focus:border-red-800"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-800 font-black uppercase text-[11px] mb-1.5">Total Stock Units *</label>
                      <input
                        type="number"
                        required
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                        className="w-full p-3.5 bg-amber-50/40 border border-amber-300 rounded-xl font-black text-sm text-slate-900 focus:outline-none focus:border-red-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-800 font-black uppercase text-[11px] mb-1.5">Product SKU Code</label>
                      <input
                        type="text"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        className="w-full p-3.5 bg-amber-50/40 border border-amber-300 rounded-xl font-mono font-bold text-xs text-slate-900"
                        placeholder="EVAN-SKU-9901"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-800 font-black uppercase text-[11px] mb-1.5">Product Status</label>
                      <select
                        value={editingProduct?.status || 'active'}
                        onChange={(e: any) => {
                          if (editingProduct) {
                            setEditingProduct({ ...editingProduct, status: e.target.value });
                          }
                        }}
                        className="w-full p-3.5 bg-amber-50/40 border border-amber-300 rounded-xl font-extrabold text-xs text-slate-900 uppercase"
                      >
                        <option value="active">ACTIVE (PUBLIC STOREFRONT)</option>
                        <option value="inactive">INACTIVE (DRAFT / ARCHIVED)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-800 font-black uppercase text-[11px] mb-1.5">Description & Weave Craftsmanship *</label>
                    <textarea
                      rows={4}
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full p-3.5 bg-amber-50/40 border border-amber-300 rounded-xl font-medium text-xs text-slate-800 focus:outline-none focus:border-red-800"
                      placeholder="Describe zari work, border motif, pallu pattern, blouse fabric..."
                    />
                  </div>
                </div>

                {/* SECTION 2: SAREE PRODUCT IMAGES (GENERAL DRAPE SHOTS) */}
                <div className="w-full bg-white p-6 sm:p-8 rounded-3xl border border-amber-200 shadow-md space-y-6">
                  <div className="border-b border-amber-100 pb-3 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-red-800">SECTION 2</span>
                      <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase">GENERAL SAREE PRODUCT IMAGES</h3>
                    </div>
                    <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full uppercase">MAX 5 GENERAL SHOTS • MAX 5 MB</span>
                  </div>

                  <p className="text-xs text-slate-600 font-medium">
                    Upload general saree drape images (Featured Front Drape, Pallu Close-up, Back View, Pleats Detail). Supported formats: <strong className="text-slate-900">JPG, JPEG, PNG, WEBP</strong>. Max size: <strong className="text-slate-900">5 MB per image</strong>.
                  </p>

                  {/* General Image Upload Grid (5 Slots) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {[0, 1, 2, 3, 4].map((slotIdx) => {
                      const imgUrl = slotIdx === 0 ? formData.image : formData.galleryImages[slotIdx - 1];
                      const isFeatured = slotIdx === 0;

                      return (
                        <div key={slotIdx} className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${isFeatured ? 'bg-amber-50/70 border-amber-400 shadow-sm' : 'bg-slate-50/60 border-amber-200'}`}>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-slate-700">
                              {slotIdx === 0 ? '✨ FEATURED SHOT #1' : `SHOT #${slotIdx + 1}`}
                            </span>
                            {imgUrl && (
                              <button
                                type="button"
                                onClick={() => setPreviewImageModal({ open: true, url: imgUrl, title: `General Image Shot #${slotIdx + 1}` })}
                                className="p-1 text-slate-600 hover:text-red-800 transition-colors"
                                title="View Full Image"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <div className="relative aspect-[3/4] bg-white rounded-xl border border-amber-200 overflow-hidden flex items-center justify-center shadow-xs">
                            {imgUrl ? (
                              <img src={imgUrl} alt={`Shot ${slotIdx + 1}`} className="w-full h-full object-cover" onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }} />
                            ) : (
                              <div className="text-center p-3 text-slate-400 space-y-1">
                                <ImageIcon className="w-6 h-6 mx-auto opacity-50" />
                                <span className="text-[9px] font-bold block uppercase">SLOT #${slotIdx + 1} EMPTY</span>
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <input
                              type="text"
                              value={imgUrl || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (slotIdx === 0) setFormData({ ...formData, image: val });
                                else {
                                  const updated = [...formData.galleryImages];
                                  updated[slotIdx - 1] = val;
                                  setFormData({ ...formData, galleryImages: updated });
                                }
                              }}
                              placeholder="Image URL or Browse..."
                              className="w-full p-2 bg-white border border-amber-200 rounded-lg text-[10px] font-mono"
                            />

                            <div className="flex items-center gap-1.5">
                              <label className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-300 text-[10px] font-bold uppercase rounded-lg cursor-pointer flex items-center justify-center gap-1 border border-amber-300 transition-all">
                                <ImageIcon className="w-3 h-3 text-amber-400" />
                                <span>{imgUrl ? 'REPLACE' : 'UPLOAD'}</span>
                                <input
                                  type="file"
                                  accept="image/jpeg,image/jpg,image/png,image/webp"
                                  className="hidden"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const err = validateImageFile(file);
                                      if (err) {
                                        showToast(err, 'error');
                                        return;
                                      }
                                      showToast(`Uploading image "${file.name}"...`, 'info');
                                      try {
                                        const compressed = await compressImage(file, 1200, 1200, 0.82);
                                        const uploadRes = await api.post('/upload', { image: compressed, folder: 'evan_products_general' }).catch(() => null);
                                        const finalUrl = uploadRes?.data?.imageUrl || uploadRes?.data?.url || compressed;

                                        if (slotIdx === 0) setFormData({ ...formData, image: finalUrl });
                                        else {
                                          const updated = [...formData.galleryImages];
                                          updated[slotIdx - 1] = finalUrl;
                                          setFormData({ ...formData, galleryImages: updated });
                                        }
                                        showToast(`General Image Shot #${slotIdx + 1} uploaded!`, 'success');
                                      } catch {
                                        const compressed = await compressImage(file, 1000, 1000, 0.78);
                                        if (slotIdx === 0) setFormData({ ...formData, image: compressed });
                                        else {
                                          const updated = [...formData.galleryImages];
                                          updated[slotIdx - 1] = compressed;
                                          setFormData({ ...formData, galleryImages: updated });
                                        }
                                        showToast('Image loaded locally!', 'info');
                                      }
                                    }
                                  }}
                                />
                              </label>

                              {imgUrl && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (slotIdx === 0) setFormData({ ...formData, image: '' });
                                    else {
                                      const updated = [...formData.galleryImages];
                                      updated[slotIdx - 1] = '';
                                      setFormData({ ...formData, galleryImages: updated });
                                    }
                                    showToast(`Cleared Slot #${slotIdx + 1}`, 'info');
                                  }}
                                  className="p-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg transition-all"
                                  title="Delete Image"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* SECTION 3: COLORS & COLOR-SPECIFIC IMAGES */}
                <div className="w-full bg-white p-6 sm:p-8 rounded-3xl border border-amber-200 shadow-md space-y-6">
                  <div className="border-b border-amber-100 pb-3 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-red-800">SECTION 3</span>
                      <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase">COLOR MANAGEMENT & PER-COLOR IMAGE GALLERIES</h3>
                    </div>
                    <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full uppercase">
                      {formData.variants?.length || 0} CONFIGURED COLORS
                    </span>
                  </div>

                  {/* 1-Click Preset Luxury Color Swatches */}
                  <div className="space-y-2 bg-amber-50/50 p-4 rounded-2xl border border-amber-200">
                    <span className="text-[10px] font-black uppercase text-amber-950 block">PRESET LUXURY COLOR PALETTE (1-CLICK QUICK ADD)</span>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { name: 'Royal Crimson Red', hex: '#990000' },
                        { name: 'Mustard Gold', hex: '#D4AF37' },
                        { name: 'Emerald Green', hex: '#006633' },
                        { name: 'Peacock Blue', hex: '#003366' },
                        { name: 'Royal Magenta', hex: '#800080' },
                        { name: 'Deep Maroon', hex: '#800000' },
                        { name: 'Metallic Copper', hex: '#B87333' },
                        { name: 'Pastel Pink', hex: '#FFB6C1' },
                        { name: 'Ivory White', hex: '#FFFDD0' },
                        { name: 'Midnight Black', hex: '#1A1A1A' },
                      ].map((preset) => {
                        const exists = formData.variants?.some((v) => v.colorName.toLowerCase() === preset.name.toLowerCase());
                        return (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => {
                              if (exists) return;
                              const newVar: ProductVariant = {
                                colorName: preset.name,
                                hexColor: preset.hex,
                                stock: 10,
                                status: 'active',
                                sku: `SKU-${Date.now()}-${preset.name.slice(0, 3).toUpperCase()}`,
                                price: Number(formData.price) || 4999,
                                isDefault: (formData.variants || []).length === 0,
                                images: [],
                              };
                              setFormData((prev) => ({ ...prev, variants: [...(prev.variants || []), newVar] }));
                              showToast(`Added color "${preset.name}"! Immediately upload its color images below.`, 'success');
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              exists
                                ? 'bg-slate-200 text-slate-500 border-slate-300 opacity-60 cursor-not-allowed'
                                : 'bg-white text-slate-900 border-amber-300 hover:border-red-800 hover:bg-amber-100 shadow-xs'
                            }`}
                          >
                            <span className="w-3.5 h-3.5 rounded-full border border-slate-300 flex-shrink-0" style={{ backgroundColor: preset.hex }} />
                            <span>{preset.name}</span>
                            {exists ? <Check className="w-3.5 h-3.5 text-slate-500" /> : <Plus className="w-3.5 h-3.5 text-red-800" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Color Selector with Auto Color Name Generator */}
                  <div className="bg-white p-4 rounded-2xl border border-amber-200 space-y-3 shadow-xs">
                    <span className="text-[11px] font-black uppercase text-slate-800 block">CUSTOM COLOR PICKER (AUTO COLOR NAME GENERATOR)</span>
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                      <div className="sm:col-span-3 flex items-center gap-2 bg-amber-50/70 p-2 rounded-xl border border-amber-200">
                        <input
                          type="color"
                          value={customColorHex}
                          onChange={(e) => handleHexChange(e.target.value)}
                          className="w-8 h-8 rounded cursor-pointer border-none bg-transparent flex-shrink-0"
                          title="Pick Custom HEX Color"
                        />
                        <div>
                          <span className="text-[9px] font-black uppercase text-slate-400 block">HEX CODE</span>
                          <input
                            type="text"
                            value={customColorHex}
                            onChange={(e) => handleHexChange(e.target.value)}
                            className="font-mono text-xs font-bold text-slate-800 uppercase bg-transparent focus:outline-none w-20"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-5">
                        <span className="text-[9px] font-black uppercase text-slate-500 block mb-0.5">EDITABLE COLOR NAME *</span>
                        <input
                          type="text"
                          value={customColorName}
                          onChange={(e) => setCustomColorName(e.target.value)}
                          placeholder="e.g. Royal Wine (Auto-generated name can be edited)"
                          className="w-full p-2.5 bg-amber-50/40 border border-amber-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-red-800"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <span className="text-[9px] font-black uppercase text-slate-500 block mb-0.5">STOCK UNITS</span>
                        <input
                          type="number"
                          value={customColorStock}
                          onChange={(e) => setCustomColorStock(Number(e.target.value))}
                          placeholder="Stock"
                          className="w-full p-2.5 bg-amber-50/40 border border-amber-300 rounded-xl text-xs font-bold text-slate-900"
                        />
                      </div>

                      <div className="sm:col-span-2 pt-3 sm:pt-0">
                        <button
                          type="button"
                          onClick={() => {
                            if (!customColorName.trim()) {
                              showToast('Please enter a color name', 'info');
                              return;
                            }
                            const newVar: ProductVariant = {
                              colorName: customColorName.trim(),
                              hexColor: customColorHex,
                              stock: customColorStock,
                              status: customColorStock > 0 ? 'active' : 'inactive',
                              sku: customColorSku || `SKU-${Date.now()}-${customColorName.slice(0, 3).toUpperCase()}`,
                              price: Number(formData.price) || 4999,
                              isDefault: (formData.variants || []).length === 0,
                              images: [],
                            };
                            setFormData((prev) => ({ ...prev, variants: [...(prev.variants || []), newVar] }));
                            showToast(`Custom color "${newVar.colorName}" created! Upload images below.`, 'success');
                          }}
                          className="w-full py-2.5 bg-red-800 hover:bg-red-900 text-amber-300 font-black text-xs uppercase rounded-xl border border-amber-300 shadow-sm flex items-center justify-center gap-1 cursor-pointer transition-all"
                        >
                          <Plus className="w-4 h-4" /> Add Color
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* List of Configured Colors & PER-COLOR IMAGE GALLERIES */}
                  <div className="space-y-6 pt-2">
                    <span className="text-[11px] font-black uppercase text-amber-950 block">COLOR VARIANTS & PER-COLOR GALLERIES</span>

                    {(!formData.variants || formData.variants.length === 0) ? (
                      <div className="p-6 bg-amber-50/50 rounded-2xl border border-dashed border-amber-300 text-center text-xs text-slate-500">
                        No color variants created yet. Pick a color above to generate a color name & add its specific image gallery!
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {formData.variants.map((variant, vIdx) => {
                          const isOutOfStock = variant.stock === 0 || variant.status === 'inactive';
                          const colorImgs = variant.images || [];

                          return (
                            <div key={vIdx} className="bg-amber-50/30 p-5 rounded-3xl border border-amber-300 shadow-sm space-y-4">
                              
                              {/* Color Card Top Bar */}
                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-200 pb-3">
                                <div className="flex items-center gap-3">
                                  <span className="w-8 h-8 rounded-full border-2 border-white shadow-sm flex-shrink-0 relative overflow-hidden" style={{ backgroundColor: variant.hexColor }}>
                                    {isOutOfStock && (
                                      <span className="absolute inset-0 flex items-center justify-center">
                                        <span className="w-full h-0.5 bg-red-700 -rotate-45" />
                                      </span>
                                    )}
                                  </span>
                                  <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="text"
                                        value={variant.colorName}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          setFormData((prev) => {
                                            const updated = [...prev.variants];
                                            updated[vIdx] = { ...updated[vIdx], colorName: val };
                                            return { ...prev, variants: updated };
                                          });
                                        }}
                                        className="font-street text-lg font-black text-slate-900 bg-transparent border-b border-amber-300 focus:outline-none focus:border-red-800"
                                        placeholder="Color Name"
                                      />
                                      {variant.isDefault && (
                                        <span className="bg-amber-100 text-amber-950 border border-amber-400 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                                          DEFAULT COLOR
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="color"
                                        value={variant.hexColor}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          setFormData((prev) => {
                                            const updated = [...prev.variants];
                                            updated[vIdx] = { ...updated[vIdx], hexColor: val };
                                            return { ...prev, variants: updated };
                                          });
                                        }}
                                        className="w-4 h-4 rounded cursor-pointer border-none bg-transparent"
                                      />
                                      <span className="font-mono text-[10px] text-slate-500 uppercase">{variant.hexColor}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  {/* Set Default Color Button */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setFormData((prev) => {
                                        const updated = prev.variants.map((v, idx) => ({
                                          ...v,
                                          isDefault: idx === vIdx,
                                        }));
                                        return { ...prev, variants: updated };
                                      });
                                      showToast(`Set "${variant.colorName}" as DEFAULT color!`, 'info');
                                    }}
                                    className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase border transition-all cursor-pointer ${
                                      variant.isDefault ? 'bg-amber-400 text-slate-950 border-amber-500' : 'bg-white text-slate-700 border-amber-300 hover:bg-amber-100'
                                    }`}
                                  >
                                    {variant.isDefault ? '✓ DEFAULT' : 'SET DEFAULT'}
                                  </button>

                                  {/* Enable / Disable Button */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setFormData((prev) => {
                                        const updated = [...prev.variants];
                                        const newStatus = updated[vIdx].status === 'active' ? 'inactive' : 'active';
                                        updated[vIdx] = { ...updated[vIdx], status: newStatus };
                                        return { ...prev, variants: updated };
                                      });
                                    }}
                                    className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase border transition-all cursor-pointer ${
                                      variant.status === 'active' ? 'bg-emerald-100 text-emerald-950 border-emerald-300' : 'bg-red-100 text-red-900 border-red-300 line-through'
                                    }`}
                                  >
                                    {variant.status === 'active' ? 'ENABLED' : 'DISABLED'}
                                  </button>

                                  {/* Delete Color */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setFormData((prev) => ({
                                        ...prev,
                                        variants: prev.variants.filter((_, idx) => idx !== vIdx),
                                      }));
                                      showToast(`Deleted color "${variant.colorName}"`, 'info');
                                    }}
                                    className="p-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-xl transition-all"
                                    title="Delete Color Variant"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              {/* Variant Details Inputs */}
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                  <label className="block text-[9px] font-black uppercase text-slate-500 mb-1">Color Variant Stock (Units)</label>
                                  <input
                                    type="number"
                                    value={variant.stock}
                                    onChange={(e) => {
                                      const val = Math.max(0, Number(e.target.value));
                                      setFormData((prev) => {
                                        const updated = [...prev.variants];
                                        updated[vIdx] = { ...updated[vIdx], stock: val, status: val > 0 ? 'active' : 'inactive' };
                                        return { ...prev, variants: updated };
                                      });
                                    }}
                                    className="w-full p-2 bg-white border border-amber-300 rounded-xl font-black text-xs text-slate-900"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[9px] font-black uppercase text-slate-500 mb-1">Color SKU Code</label>
                                  <input
                                    type="text"
                                    value={variant.sku}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setFormData((prev) => {
                                        const updated = [...prev.variants];
                                        updated[vIdx] = { ...updated[vIdx], sku: val };
                                        return { ...prev, variants: updated };
                                      });
                                    }}
                                    className="w-full p-2 bg-white border border-amber-300 rounded-xl font-mono text-xs text-slate-900"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[9px] font-black uppercase text-slate-500 mb-1">Variant Price (₹)</label>
                                  <input
                                    type="number"
                                    value={variant.price || Number(formData.price) || 0}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      setFormData((prev) => {
                                        const updated = [...prev.variants];
                                        updated[vIdx] = { ...updated[vIdx], price: val };
                                        return { ...prev, variants: updated };
                                      });
                                    }}
                                    className="w-full p-2 bg-white border border-amber-300 rounded-xl font-bold text-xs text-red-800"
                                  />
                                </div>
                              </div>

                              {/* PER-COLOR IMAGE GALLERY (MAX 5 IMAGES FOR THIS COLOR) */}
                              <div className="bg-white p-4 rounded-2xl border border-amber-200 space-y-3 shadow-xs">
                                <div className="flex items-center justify-between border-b border-amber-100 pb-2">
                                  <span className="text-[10px] font-black uppercase tracking-wider text-red-800 flex items-center gap-1.5">
                                    <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                                    <span>IMAGE GALLERY FOR {variant.colorName.toUpperCase()} (MAX 5 IMAGES)</span>
                                  </span>
                                  <span className="text-[9px] font-bold text-slate-500">
                                    {colorImgs.filter(Boolean).length} / 5 Images Uploaded
                                  </span>
                                </div>

                                <p className="text-[10px] text-slate-500 font-medium">
                                  Images uploaded here belong strictly to <strong className="text-slate-900">{variant.colorName}</strong> and will be displayed on the customer product page when {variant.colorName} is selected.
                                </p>

                                {/* 5 Color-Specific Image Upload Slots */}
                                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                                  {[0, 1, 2, 3, 4].map((imgIdx) => {
                                    const cImgUrl = colorImgs[imgIdx] || '';
                                    return (
                                      <div key={imgIdx} className="bg-amber-50/50 p-2.5 rounded-xl border border-amber-200 flex flex-col justify-between space-y-2">
                                        <div className="flex items-center justify-between">
                                          <span className="text-[9px] font-black text-amber-950 uppercase">SHOT #{imgIdx + 1}</span>
                                          {cImgUrl && (
                                            <button
                                              type="button"
                                              onClick={() => setPreviewImageModal({ open: true, url: cImgUrl, title: `${variant.colorName} - Shot #${imgIdx + 1}` })}
                                              className="text-slate-600 hover:text-red-800"
                                              title="View Full Image"
                                            >
                                              <Eye className="w-3 h-3" />
                                            </button>
                                          )}
                                        </div>

                                        <div className="relative aspect-[3/4] bg-white rounded-lg border border-amber-200 overflow-hidden flex items-center justify-center shadow-2xs">
                                          {cImgUrl ? (
                                            <img src={cImgUrl} alt={`${variant.colorName} ${imgIdx + 1}`} className="w-full h-full object-cover" onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }} />
                                          ) : (
                                            <div className="text-center p-2 text-slate-400">
                                              <ImageIcon className="w-5 h-5 mx-auto opacity-40" />
                                              <span className="text-[8px] font-bold block uppercase">EMPTY</span>
                                            </div>
                                          )}
                                        </div>

                                        <div className="space-y-1.5">
                                          <input
                                            type="text"
                                            value={cImgUrl}
                                            onChange={(e) => {
                                              const val = e.target.value;
                                              setFormData((prev) => {
                                                const updated = [...prev.variants];
                                                const targetImgs = [...(updated[vIdx].images || [])];
                                                targetImgs[imgIdx] = val;
                                                updated[vIdx] = { ...updated[vIdx], images: targetImgs };
                                                return { ...prev, variants: updated };
                                              });
                                            }}
                                            placeholder="URL..."
                                            className="w-full p-1.5 bg-white border border-amber-200 rounded text-[9px] font-mono"
                                          />

                                          <div className="flex items-center gap-1">
                                            <label className="flex-1 py-1 bg-slate-900 hover:bg-slate-800 text-amber-300 text-[9px] font-bold uppercase rounded cursor-pointer flex items-center justify-center gap-1 border border-amber-300">
                                              <ImageIcon className="w-3 h-3 text-amber-400" />
                                              <span>{cImgUrl ? 'REPLACE' : 'UPLOAD'}</span>
                                              <input
                                                type="file"
                                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                                className="hidden"
                                                onChange={async (e) => {
                                                  const file = e.target.files?.[0];
                                                  if (file) {
                                                    const err = validateImageFile(file);
                                                    if (err) {
                                                      showToast(err, 'error');
                                                      return;
                                                    }
                                                    showToast(`Uploading image for ${variant.colorName}...`, 'info');
                                                    try {
                                                      const compressed = await compressImage(file, 1200, 1200, 0.82);
                                                      const uploadRes = await api.post('/upload', { image: compressed, folder: 'evan_color_variants' }).catch(() => null);
                                                      const finalUrl = uploadRes?.data?.imageUrl || uploadRes?.data?.url || compressed;

                                                      setFormData((prev) => {
                                                        const updated = [...prev.variants];
                                                        const targetImgs = [...(updated[vIdx].images || [])];
                                                        targetImgs[imgIdx] = finalUrl;
                                                        updated[vIdx] = { ...updated[vIdx], images: targetImgs };
                                                        return { ...prev, variants: updated };
                                                      });
                                                      showToast(`Image #${imgIdx + 1} added to ${variant.colorName}!`, 'success');
                                                    } catch {
                                                      const compressed = await compressImage(file, 1000, 1000, 0.78);
                                                      setFormData((prev) => {
                                                        const updated = [...prev.variants];
                                                        const targetImgs = [...(updated[vIdx].images || [])];
                                                        targetImgs[imgIdx] = compressed;
                                                        updated[vIdx] = { ...updated[vIdx], images: targetImgs };
                                                        return { ...prev, variants: updated };
                                                      });
                                                      showToast('Loaded image locally!', 'info');
                                                    }
                                                  }
                                                }}
                                              />
                                            </label>

                                            {cImgUrl && (
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  setFormData((prev) => {
                                                    const updated = [...prev.variants];
                                                    const targetImgs = [...(updated[vIdx].images || [])];
                                                    targetImgs[imgIdx] = '';
                                                    updated[vIdx] = { ...updated[vIdx], images: targetImgs };
                                                    return { ...prev, variants: updated };
                                                  });
                                                }}
                                                className="p-1 bg-red-100 hover:bg-red-200 text-red-800 rounded transition-all"
                                                title="Delete Color Image"
                                              >
                                                <Trash2 className="w-3 h-3" />
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* SECTION 4: STOCK / VARIANT STATUS */}
                <div className="w-full bg-white p-6 sm:p-8 rounded-3xl border border-amber-200 shadow-md space-y-6">
                  <div className="border-b border-amber-100 pb-3 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-red-800">SECTION 4</span>
                      <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase">STOCK / VARIANT STATUS SUMMARY</h3>
                    </div>
                    <span className="text-[9px] font-black text-red-950 bg-amber-200 px-3 py-1 rounded-full uppercase">
                      TOTAL INVENTORY: {formData.variants?.reduce((sum, v) => sum + (v.status === 'active' ? v.stock : 0), 0) || Number(formData.stock) || 0} UNITS
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-semibold">
                      <thead className="bg-amber-100/60 uppercase text-[10px] text-slate-700">
                        <tr>
                          <th className="p-3">Color Swatch</th>
                          <th className="p-3">Color Name</th>
                          <th className="p-3">SKU Code</th>
                          <th className="p-3">Price (₹)</th>
                          <th className="p-3">Stock Units</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Default State</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-amber-100">
                        {(formData.variants || []).map((v, i) => {
                          const isOutOfStock = v.stock === 0 || v.status === 'inactive';
                          return (
                            <tr key={i} className={isOutOfStock ? 'bg-red-50/40' : ''}>
                              <td className="p-3">
                                <span className="w-5 h-5 rounded-full border border-white shadow-sm block" style={{ backgroundColor: v.hexColor }} />
                              </td>
                              <td className="p-3 font-bold text-slate-900">{v.colorName}</td>
                              <td className="p-3 font-mono text-[10px] text-slate-500">{v.sku}</td>
                              <td className="p-3 font-bold text-red-800">₹{(v.price || Number(formData.price) || 0).toLocaleString('en-IN')}</td>
                              <td className="p-3 font-black">{v.stock} Units</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${isOutOfStock ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-950'}`}>
                                  {isOutOfStock ? 'OUT OF STOCK' : 'IN STOCK'}
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                {v.isDefault ? (
                                  <span className="bg-amber-200 text-amber-950 px-2 py-0.5 rounded-full text-[9px] font-black uppercase">
                                    ★ DEFAULT
                                  </span>
                                ) : (
                                  <span className="text-slate-400 text-[10px] font-medium">—</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Final Save Button */}
                <div className="sticky bottom-4 z-20 pt-4">
                  <button
                    type="submit"
                    className="w-full py-4 bg-red-800 hover:bg-red-900 text-amber-300 font-black uppercase text-sm tracking-widest rounded-2xl shadow-xl transition-all border border-amber-300 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    <span>SAVE SAREE PRODUCT TO CATALOG</span>
                  </button>
                </div>

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
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              showToast(`Optimizing & uploading category image "${file.name}"...`, 'info');
                              try {
                                const compressedBase64 = await compressImage(file, 1200, 1200, 0.82);
                                const uploadRes = await api.post('/upload', { image: compressedBase64, folder: 'evan_categories' });
                                const finalUrl = uploadRes.data?.imageUrl || uploadRes.data?.url || compressedBase64;
                                setCardFormData({ ...cardFormData, image: finalUrl });
                                showToast('Category image uploaded successfully!', 'success');
                              } catch {
                                const compressedBase64 = await compressImage(file, 1000, 1000, 0.78);
                                setCardFormData({ ...cardFormData, image: compressedBase64 });
                                showToast('Image compressed & loaded locally!', 'info');
                              }
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
        {/* Full Image Lightbox Preview Modal */}
        {previewImageModal.open && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white p-4 sm:p-6 rounded-3xl border border-amber-300 shadow-2xl max-w-2xl w-full space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-amber-100 pb-3">
                <span className="font-street text-lg font-black text-slate-900 uppercase">
                  {previewImageModal.title || 'FULL IMAGE PREVIEW'}
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewImageModal({ open: false, url: '', title: '' })}
                  className="p-1.5 text-slate-500 hover:text-red-800 rounded-full hover:bg-amber-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="max-h-[70vh] overflow-hidden rounded-2xl border border-amber-200 bg-slate-950 flex items-center justify-center">
                <img
                  src={previewImageModal.url}
                  alt="Full Preview"
                  className="max-h-[65vh] w-auto object-contain rounded-xl"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setPreviewImageModal({ open: false, url: '', title: '' })}
                  className="px-5 py-2 bg-slate-900 text-amber-300 font-black text-xs uppercase rounded-xl border border-amber-300 cursor-pointer"
                >
                  CLOSE PREVIEW
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Admin Cancel Order Modal */}
        <AdminCancelOrderModal
          isOpen={showAdminCancelModal}
          order={adminCancelModalOrder}
          onClose={() => setShowAdminCancelModal(false)}
          onOrderCancelled={(updatedOrder) => {
            setOrders((prev) => prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o)));
          }}
        />
      </main>
    </div>
  );
};
