import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Search, SlidersHorizontal, Sparkles, X, ChevronDown, Check } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { Product } from '../types';
import { api } from '../services/api';

const SAREE_CATEGORIES = [
  'All',
  'Silk Sarees',
  'Kanchipuram Sarees',
  'Banarasi Sarees',
  'Cotton Sarees',
  'Linen Sarees',
  'Organza Sarees',
  'Georgette Sarees',
  'Chiffon Sarees',
  'Tussar Silk',
  'Handloom Sarees',
  'Designer Sarees',
  'Wedding Sarees',
  'Bridal Sarees',
  'Party Wear Sarees',
  'Printed Sarees',
  'Bandhani Sarees',
  'Paithani Sarees',
  'Mysore Silk Sarees',
  'Festival Collection',
  'Office Wear',
];

const SAREE_FABRICS = ['All', 'Pure Kanchipuram Silk', 'Royal Banarasi Silk', 'Pure Handloom Linen', 'Delicate Floral Organza', 'Pure Tussar Silk', 'Paithani Silk Zari'];
const SAREE_OCCASIONS = ['All', 'Bridal & Wedding', 'Festival & Festive', 'Party & Evening', 'Office & Professional'];

import { useSocket } from '../context/SocketContext';
import { showToast } from '../components/ToastContainer';

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const { socket } = useSocket();

  const selectedCategory = searchParams.get('category') || 'All';
  const selectedFabric = searchParams.get('fabric') || 'All';
  const selectedOccasion = searchParams.get('occasion') || 'All';
  const searchQuery = searchParams.get('search') || searchParams.get('q') || '';
  const sortOption = searchParams.get('sort') || 'newest';

  const fetchProducts = () => {
    setLoading(true);
    const params: any = {};
    if (selectedCategory !== 'All') params.category = selectedCategory;
    if (selectedFabric !== 'All') params.fabric = selectedFabric;
    if (selectedOccasion !== 'All') params.occasion = selectedOccasion;
    if (searchQuery) params.search = searchQuery;
    if (sortOption) params.sort = sortOption;

    api
      .get('/products', { params })
      .then((res) => setProducts(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedFabric, selectedOccasion, searchQuery, sortOption]);

  // Real-Time Socket.IO Synchronization
  useEffect(() => {
    if (!socket) return;

    const handleCreated = (newProd: Product) => {
      showToast(`Live Update: New product '${newProd.name.slice(0, 25)}...' published!`, 'success');
      fetchProducts();
    };

    const handleUpdated = (updatedProd: Product) => {
      setProducts((prev) => prev.map((p) => (p._id === updatedProd._id ? { ...p, ...updatedProd } : p)));
      showToast(`Live Update: Product '${updatedProd.name.slice(0, 25)}...' updated by Admin`, 'info');
    };

    const handleDeleted = (data: { id: string }) => {
      setProducts((prev) => prev.filter((p) => p._id !== data.id));
      showToast('Live Update: Product removed from catalog', 'info');
    };

    socket.on('productCreated', handleCreated);
    socket.on('productUpdated', handleUpdated);
    socket.on('productDeleted', handleDeleted);

    return () => {
      socket.off('productCreated', handleCreated);
      socket.off('productUpdated', handleUpdated);
      socket.off('productDeleted', handleDeleted);
    };
  }, [socket]);

  const handleFilterChange = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === 'All' || !value) {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="w-full h-[calc(100vh-55px)] bg-[#FFFDF9] text-slate-900 p-2 sm:p-3 font-sans flex flex-col overflow-hidden">
      <div className="max-w-[1600px] w-full mx-auto flex flex-col h-full space-y-3 overflow-hidden">
        
        {/* Sleek Low-Profile Top Header & Search Banner with Integrated Sort */}
        <div className="bg-white p-2.5 px-4 sm:px-5 rounded-xl border border-amber-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-amber-800 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-red-700" /> EVAN SAREE CATALOG
              </span>
              <h1 className="font-street text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none uppercase mt-0.5">
                {selectedCategory !== 'All' ? selectedCategory : 'LUXURY INDIAN SAREES'}
              </h1>
            </div>
            <span className="bg-amber-100 text-slate-900 px-2.5 py-1 rounded-full text-[10px] font-black uppercase border border-amber-300 shadow-sm whitespace-nowrap hidden sm:inline-block">
              {products.length} Weaves Available
            </span>
          </div>

          {/* Integrated Search & Sort By Controls */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full sm:w-auto">
            <div className="flex-1 sm:w-56 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-amber-700" />
              <input
                type="text"
                placeholder="Search Banarasi, Kanchipuram..."
                value={searchQuery}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-amber-50/60 border border-amber-300 rounded-full text-xs font-semibold focus:outline-none focus:border-red-800 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => handleFilterChange('search', '')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden px-3 py-1.5 bg-amber-50 border border-amber-300 rounded-full text-xs font-extrabold uppercase flex items-center gap-1.5 text-slate-900"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-red-700" /> Filters
            </button>

            {/* Integrated Sort By Control */}
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase">Sort By:</span>
              <select
                value={sortOption}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="bg-amber-50/60 border border-amber-300 text-slate-900 text-xs font-bold rounded-full px-3 py-1 focus:outline-none cursor-pointer hover:border-amber-400 transition-all"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* 100% Window Height Locked Split Layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch overflow-hidden min-h-0">

          {/* Left Desktop Filter Sidebar - Independent Scroll */}
          <aside className="hidden lg:flex flex-col lg:col-span-3 bg-white p-4 rounded-2xl border border-amber-200 shadow-sm space-y-4 h-full overflow-y-auto overscroll-contain pr-2 custom-scrollbar">
            <div className="flex items-center justify-between border-b border-amber-100 pb-2.5 flex-shrink-0">
              <h3 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-red-700" /> SAREE FILTERS
              </h3>
              {(selectedCategory !== 'All' || selectedFabric !== 'All' || selectedOccasion !== 'All' || searchQuery) && (
                <button
                  onClick={clearAllFilters}
                  className="text-[10px] font-black text-red-700 hover:underline"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Saree Categories */}
            <div className="space-y-1.5">
              <h4 className="font-bold text-[10px] uppercase tracking-wider text-amber-800">CATEGORIES</h4>
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1 custom-scrollbar overscroll-contain">
                {SAREE_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleFilterChange('category', cat)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all flex items-center justify-between ${
                      selectedCategory === cat
                        ? 'bg-red-800 text-amber-300 font-bold shadow-sm'
                        : 'text-slate-700 hover:bg-amber-50'
                    }`}
                  >
                    <span>{cat}</span>
                    {selectedCategory === cat && <Check className="w-3 h-3 text-amber-300" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Saree Fabric Filter */}
            <div className="space-y-1.5 pt-2 border-t border-amber-100">
              <h4 className="font-bold text-[10px] uppercase tracking-wider text-amber-800">PURE FABRICS</h4>
              <div className="space-y-1 max-h-40 overflow-y-auto pr-1 custom-scrollbar overscroll-contain">
                {SAREE_FABRICS.map((fab) => (
                  <button
                    key={fab}
                    onClick={() => handleFilterChange('fabric', fab)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all flex items-center justify-between ${
                      selectedFabric === fab
                        ? 'bg-slate-900 text-amber-300 font-bold shadow-sm'
                        : 'text-slate-700 hover:bg-amber-50'
                    }`}
                  >
                    <span>{fab}</span>
                    {selectedFabric === fab && <Check className="w-3 h-3 text-amber-400" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Occasions */}
            <div className="space-y-1.5 pt-2 border-t border-amber-100">
              <h4 className="font-bold text-[10px] uppercase tracking-wider text-amber-800">OCCASION</h4>
              <div className="space-y-1">
                {SAREE_OCCASIONS.map((occ) => (
                  <button
                    key={occ}
                    onClick={() => handleFilterChange('occasion', occ)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all flex items-center justify-between ${
                      selectedOccasion === occ
                        ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                        : 'text-slate-700 hover:bg-amber-50'
                    }`}
                  >
                    <span>{occ}</span>
                    {selectedOccasion === occ && <Check className="w-3 h-3 text-slate-950" />}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Right Product Grid Area - Independent Scroll Container */}
          <main className="lg:col-span-9 h-full flex flex-col overflow-hidden min-h-0">

            {/* Products Scroll Container */}
            <div className="flex-1 overflow-y-auto custom-scrollbar overscroll-contain pr-1">
              {products.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 pb-4">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="bg-white p-12 rounded-2xl border border-amber-200 text-center space-y-3 shadow-sm my-auto">
                  <Sparkles className="w-10 h-10 text-amber-500 mx-auto" />
                  <h3 className="font-street text-2xl font-black text-slate-900">NO SAREES MATCHED YOUR FILTERS</h3>
                  <p className="text-xs text-slate-500 font-semibold max-w-sm mx-auto">
                    Try clearing your fabric or category filters to explore our complete collection of handcrafted silk sarees.
                  </p>
                  <button
                    onClick={clearAllFilters}
                    className="px-5 py-2.5 bg-red-800 text-amber-300 text-xs font-black uppercase tracking-wider rounded-xl shadow hover:bg-red-900 transition-all"
                  >
                    View All Sarees
                  </button>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
