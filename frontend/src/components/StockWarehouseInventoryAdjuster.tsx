import React, { useState } from 'react';
import {
  Search,
  ArrowLeft,
  Save,
  Plus,
  Minus,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  RefreshCw,
  Box,
} from 'lucide-react';
import { Product } from '../types';
import { productApi } from '../services/productApi';
import { showToast } from './ToastContainer';
import { formatSareeName } from '../utils/sareeUtils';

interface StockWarehouseInventoryAdjusterProps {
  products: Product[];
  onRefreshProducts: () => void;
}

export const StockWarehouseInventoryAdjuster: React.FC<StockWarehouseInventoryAdjusterProps> = ({
  products,
  onRefreshProducts,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilterMode, setStockFilterMode] = useState<'all' | 'low' | 'out'>('all');
  const [stockEdits, setStockEdits] = useState<Record<string, number>>({});
  const [savingMap, setSavingMap] = useState<Record<string, boolean>>({});

  // Group products by category
  const categoriesMap: Record<string, Product[]> = {};
  products.forEach((p) => {
    const cat = p.category || 'General Sarees';
    if (!categoriesMap[cat]) {
      categoriesMap[cat] = [];
    }
    categoriesMap[cat].push(p);
  });

  const categoryList = Object.keys(categoriesMap);

  // Handle local stock input change
  const handleStockInputChange = (productId: string, val: string) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    setStockEdits((prev) => ({ ...prev, [productId]: num }));
  };

  // Adjust stock delta
  const handleAdjustStockDelta = (productId: string, currentStock: number, delta: number) => {
    const existingVal = stockEdits[productId] !== undefined ? stockEdits[productId] : currentStock;
    const newVal = Math.max(0, existingVal + delta);
    setStockEdits((prev) => ({ ...prev, [productId]: newVal }));
  };

  // Save manual stock to MongoDB via API
  const handleSaveStock = async (prod: Product) => {
    const targetStock = stockEdits[prod._id] !== undefined ? stockEdits[prod._id] : prod.stock;
    setSavingMap((prev) => ({ ...prev, [prod._id]: true }));

    try {
      await productApi.updateProduct(prod._id, { stock: targetStock });
      showToast(`Successfully updated stock for "${prod.name}" to ${targetStock} units!`, 'success');
      onRefreshProducts();
    } catch {
      showToast(`Failed to update stock for "${prod.name}"`, 'error');
    } finally {
      setSavingMap((prev) => ({ ...prev, [prod._id]: false }));
    }
  };

  // Filtered products list for detailed view or global search
  const displayedProducts = products.filter((p) => {
    const stockVal = p.stock || 0;
    if (stockFilterMode === 'low' && stockVal > 5) return false;
    if (stockFilterMode === 'out' && stockVal !== 0) return false;

    const matchesSearch =
      searchQuery.trim() === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()));

    if (selectedCategory) {
      return p.category === selectedCategory && matchesSearch;
    }
    return matchesSearch;
  });

  // Calculate totals
  const totalStockCount = products.reduce((acc, p) => acc + (p.stock || 0), 0);
  const lowStockCount = products.filter((p) => (p.stock || 0) <= 5).length;
  const outOfStockCount = products.filter((p) => (p.stock || 0) === 0).length;

  return (
    <div className="bg-white rounded-3xl border border-amber-200 shadow-md p-6 sm:p-8 space-y-6 text-slate-900 font-sans">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-amber-100 pb-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-800 flex items-center gap-1">
            <Box className="w-3.5 h-3.5 text-red-700" /> WAREHOUSE INVENTORY ENGINE
          </span>
          <h3 className="font-street text-2xl sm:text-3xl font-black text-slate-900 uppercase mt-0.5">
            STOCK & WAREHOUSE INVENTORY ADJUSTER
          </h3>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Category-wise stock management & manual quantity adjuster
          </p>
        </div>
      </div>

      {/* 📊 TOP WAREHOUSE KPI METRIC CARDS (OPTIMIZED UI SIZE) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: TOTAL WAREHOUSE STOCK */}
        <div
          onClick={() => {
            setStockFilterMode('all');
            setSelectedCategory(null);
            setSearchQuery('');
          }}
          className="bg-amber-50/60 p-4 rounded-2xl border border-amber-300 shadow-sm space-y-1 cursor-pointer hover:border-amber-500 transition-all"
        >
          <span className="text-[10px] font-black text-amber-900 uppercase tracking-wider block">TOTAL WAREHOUSE STOCK</span>
          <span className="font-street text-2xl font-black text-slate-900 block">
            {totalStockCount.toLocaleString()} <span className="text-xs font-bold text-amber-800">UNITS</span>
          </span>
          <span className="text-[10px] text-emerald-700 font-bold block">Available Saree Inventory</span>
        </div>

        {/* Card 2: LOW STOCK MODELS */}
        <div
          onClick={() => {
            setStockFilterMode('low');
            setSelectedCategory(null);
            setSearchQuery('');
          }}
          className="bg-white p-4 rounded-2xl border-2 border-amber-400 hover:border-red-800 cursor-pointer shadow-sm hover:shadow-md transition-all space-y-1 group"
        >
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-amber-900 uppercase tracking-wider block">LOW STOCK MODELS</span>
            <ChevronRight className="w-4 h-4 text-amber-600 group-hover:translate-x-1 transition-transform" />
          </div>
          <span className="font-street text-2xl font-black text-amber-900 block">
            {lowStockCount} <span className="text-xs font-bold text-amber-700">MODELS</span>
          </span>
          <span className="text-[10px] text-red-700 font-bold block">Click to Update Stock →</span>
        </div>

        {/* Card 3: OUT OF STOCK SAREES */}
        <div
          onClick={() => {
            setStockFilterMode('out');
            setSelectedCategory(null);
            setSearchQuery('');
          }}
          className="bg-white p-4 rounded-2xl border border-red-300 hover:border-red-800 cursor-pointer shadow-sm hover:shadow-md transition-all space-y-1 group"
        >
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-red-900 uppercase tracking-wider block">OUT OF STOCK SAREES</span>
            <ChevronRight className="w-4 h-4 text-red-600 group-hover:translate-x-1 transition-transform" />
          </div>
          <span className="font-street text-2xl font-black text-red-800 block">
            {outOfStockCount} <span className="text-xs font-bold text-red-700">MODELS</span>
          </span>
          <span className="text-[10px] text-red-600 font-bold block">Click to Update Stock →</span>
        </div>
      </div>

      {/* ⚠️ LOW STOCK IMPACT WARNING CARD (MOVED HERE & CLICKABLE) */}
      {lowStockCount > 0 && (
        <div
          onClick={() => {
            setStockFilterMode('low');
            setSelectedCategory(null);
            setSearchQuery('');
          }}
          className="bg-amber-50/90 p-4 rounded-2xl border-2 border-amber-400 hover:border-red-800 cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md hover:shadow-xl transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-xl border border-amber-300 group-hover:bg-amber-200 transition-colors">
              <AlertTriangle className="w-5 h-5 text-amber-800 flex-shrink-0" />
            </div>
            <div>
              <span className="font-black text-xs uppercase tracking-wider text-amber-950 block flex items-center gap-2">
                LOW STOCK IMPACT <span className="text-[10px] text-red-800 font-bold underline">(Click to Update Stock Now)</span>
              </span>
              <span className="text-xs font-medium text-amber-900">
                {lowStockCount} luxury saree models have 5 or fewer units remaining in warehouse.
              </span>
            </div>
          </div>
          <button className="px-3.5 py-1.5 bg-red-800 hover:bg-red-900 text-amber-300 font-black text-[10px] uppercase tracking-wider rounded-xl border border-amber-300 shadow-sm flex items-center gap-1 flex-shrink-0">
            UPDATE STOCK NOW →
          </button>
        </div>
      )}

      {/* Global Search & Category Breadcrumb Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-amber-50/50 p-4 rounded-2xl border border-amber-200">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-700" />
          <input
            type="text"
            placeholder="Search SKU, saree name, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-semibold focus:outline-none"
          />
        </div>

        {selectedCategory || stockFilterMode !== 'all' ? (
          <button
            onClick={() => {
              setSelectedCategory(null);
              setStockFilterMode('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-black uppercase tracking-wider rounded-xl border border-amber-300 flex items-center gap-1.5 shadow"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" /> BACK TO ALL CATEGORIES ({categoryList.length})
          </button>
        ) : (
          <span className="text-xs font-extrabold text-amber-900 uppercase">
            SELECT A CATEGORY CARD BELOW OR CLICK LOW STOCK ALERT TO ADJUST
          </span>
        )}
      </div>

      {/* VIEW 1: CATEGORY CARDS OVERVIEW (When no category selected, no low-stock filter, and no active search) */}
      {!selectedCategory && stockFilterMode === 'all' && searchQuery.trim() === '' && (
        <div className="space-y-4">
          <h4 className="text-xs font-black text-amber-900 uppercase tracking-widest border-b border-amber-100 pb-2">
            SAREE WAREHOUSE CATEGORIES ({categoryList.length} CATEGORIES)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {categoryList.map((catName) => {
              const catItems = categoriesMap[catName];
              const catStockTotal = catItems.reduce((acc, p) => acc + (p.stock || 0), 0);
              const catLowStock = catItems.filter((p) => (p.stock || 0) <= 5).length;
              const sampleImage = catItems[0]?.images?.[0] || (catItems[0] as any)?.image || '/images/saree_kanchipuram_gold.png';

              return (
                <div
                  key={catName}
                  onClick={() => setSelectedCategory(catName)}
                  className="bg-white rounded-3xl overflow-hidden border border-amber-300 shadow-md hover:shadow-xl hover:border-red-800 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  {/* Full-Bleed Image (0 margin/padding around top image) */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-900 border-b border-amber-200">
                    <img
                      src={sampleImage}
                      alt={catName}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-red-100/90 text-red-950 border border-red-300 font-extrabold text-[9px] uppercase px-2.5 py-0.5 rounded-full shadow-sm backdrop-blur-sm">
                      {catItems.length} SAREE TYPES
                    </div>
                  </div>

                  {/* Card Details Area */}
                  <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 space-y-4">
                    <div className="space-y-1">
                      <h4 className="font-street text-xl font-black text-slate-900 group-hover:text-red-800 transition-colors uppercase">
                        {catName}
                      </h4>
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mt-1">
                        <span>Total Available Units:</span>
                        <strong className="text-red-800 font-black text-sm">{catStockTotal} units</strong>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-amber-100 flex items-center justify-between">
                      {catLowStock > 0 ? (
                        <span className="text-[10px] font-extrabold text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-red-600" /> {catLowStock} Low Stock Alert
                        </span>
                      ) : (
                        <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Stock Healthy
                        </span>
                      )}

                      <span className="text-xs font-black text-red-800 uppercase flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Adjust <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: CATEGORY ITEMS / SEARCH RESULTS / LOW STOCK & OUT OF STOCK FILTER GRID WITH MANUAL STOCK EDITING */}
      {(selectedCategory || stockFilterMode !== 'all' || searchQuery.trim() !== '') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-amber-100 pb-2">
            <h4 className="text-xs font-black text-amber-900 uppercase tracking-widest flex items-center gap-2">
              {stockFilterMode === 'out' ? (
                <span className="text-red-800 font-black flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4 text-red-700" /> ⚠️ OUT OF STOCK SAREES (0 UNITS REMAINING)
                </span>
              ) : stockFilterMode === 'low' ? (
                <span className="text-amber-900 font-black flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4 text-amber-700" /> ⚠️ LOW STOCK SAREES (≤ 5 UNITS REMAINING)
                </span>
              ) : selectedCategory ? (
                `CATEGORY: ${selectedCategory.toUpperCase()}`
              ) : (
                'SEARCH RESULTS'
              )}{' '}
              <span className="text-slate-500 font-bold">({displayedProducts.length} SAREE MODELS FOUND)</span>
            </h4>
          </div>

          {displayedProducts.length === 0 ? (
            <div className="p-8 text-center bg-amber-50/50 rounded-2xl border border-amber-200 text-slate-600 text-xs font-bold">
              No saree products match your selection.
            </div>
          ) : (
            <div className="space-y-3">
              {displayedProducts.map((p) => {
                const currentVal = stockEdits[p._id] !== undefined ? stockEdits[p._id] : p.stock;
                const isSaving = savingMap[p._id] || false;
                const isModified = stockEdits[p._id] !== undefined && stockEdits[p._id] !== p.stock;
                const img = p.images?.[0] || (p as any)?.image || '/images/saree_kanchipuram_gold.png';

                return (
                  <div
                    key={p._id}
                    className="p-4 bg-amber-50/50 hover:bg-amber-100/50 rounded-2xl border border-amber-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs transition-all shadow-sm"
                  >
                    {/* Left Product Image & Details */}
                    <div className="flex items-center gap-3">
                      <img
                        src={img}
                        alt={p.name}
                        className="w-14 h-14 object-cover object-top rounded-xl border border-amber-300 shadow-sm flex-shrink-0"
                      />
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm">{formatSareeName(p.name, p.category, true)}</h4>
                        <div className="flex flex-wrap items-center gap-2 text-slate-500 font-semibold text-[11px] mt-0.5">
                          <span>SKU: <strong className="text-slate-800 font-mono">{p.sku || 'N/A'}</strong></span>
                          <span>• Category: <strong className="text-amber-900">{p.category}</strong></span>
                          <span>• Price: <strong className="text-red-800">₹{p.price.toLocaleString('en-IN')}</strong></span>
                        </div>
                        <div className="mt-1">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                              p.stock === 0
                                ? 'bg-red-100 text-red-800 border-red-300'
                                : p.stock <= 5
                                ? 'bg-amber-100 text-amber-900 border-amber-300'
                                : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            }`}
                          >
                            {p.stock === 0 ? 'OUT OF STOCK' : p.stock <= 5 ? `LOW STOCK (${p.stock} LEFT)` : `IN STOCK (${p.stock} UNITS)`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Manual Stock Controls - All elements unified at exact same height (h-10) */}
                    <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0 bg-white p-2 rounded-2xl border border-amber-300 shadow-inner">
                      {/* Decrement Button */}
                      <button
                        type="button"
                        onClick={() => handleAdjustStockDelta(p._id, p.stock, -1)}
                        className="h-10 w-10 flex items-center justify-center bg-amber-100 hover:bg-amber-200 text-slate-900 font-bold rounded-xl border border-amber-300 transition-all flex-shrink-0"
                        title="Subtract 1"
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      {/* Manual Direct Number Input */}
                      <input
                        type="number"
                        min="0"
                        value={currentVal}
                        onChange={(e) => handleStockInputChange(p._id, e.target.value)}
                        className="h-10 w-16 bg-amber-50 border border-amber-400 rounded-xl font-black text-center text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-800 flex-shrink-0"
                      />

                      {/* Increment Button */}
                      <button
                        type="button"
                        onClick={() => handleAdjustStockDelta(p._id, p.stock, +1)}
                        className="h-10 w-10 flex items-center justify-center bg-amber-100 hover:bg-amber-200 text-slate-900 font-bold rounded-xl border border-amber-300 transition-all flex-shrink-0"
                        title="Add 1"
                      >
                        <Plus className="w-4 h-4" />
                      </button>

                      {/* Save Stock Button */}
                      <button
                        type="button"
                        onClick={() => handleSaveStock(p)}
                        disabled={isSaving}
                        className={`h-10 px-4 font-black text-xs uppercase rounded-xl shadow-md border flex items-center justify-center gap-1.5 transition-all flex-shrink-0 ${
                          isModified
                            ? 'bg-red-800 hover:bg-red-900 text-amber-300 border-amber-300 animate-pulse'
                            : 'bg-emerald-800 hover:bg-emerald-900 text-amber-300 border-emerald-400'
                        }`}
                      >
                        {isSaving ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Save className="w-3.5 h-3.5" />
                        )}
                        <span>{isSaving ? 'SAVING...' : 'SAVE'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
