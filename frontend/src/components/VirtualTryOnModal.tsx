import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, X, Sparkles, Shirt, Check, RotateCcw, ShoppingBag, Layers, Sun } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { AddToCartButton } from './AddToCartButton';

interface VirtualTryOnModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    category?: string;
  };
}

const AVATAR_MODELS = [
  { id: 'm1', name: 'Julian (6\'1" Athletic)', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400' },
  { id: 'm2', name: 'Marcus (6\'0" Lean Slim)', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400' },
  { id: 'm3', name: 'Dominic (6\'2" Broad Build)', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400' }
];

const LIGHTING_MODES = [
  { id: 'studio', label: 'Studio Noir', color: 'from-zinc-950 via-zinc-900 to-black' },
  { id: 'warm', label: 'Sunset Amber', color: 'from-amber-950/40 via-zinc-900 to-black' },
  { id: 'daylight', label: 'Pure Daylight', color: 'from-slate-900 via-zinc-900 to-zinc-950' }
];

export const VirtualTryOnModal: React.FC<VirtualTryOnModalProps> = ({
  isOpen,
  onClose,
  product
}) => {
  const [selectedModel, setSelectedModel] = useState(AVATAR_MODELS[0]);
  const [selectedLighting, setSelectedLighting] = useState(LIGHTING_MODES[0]);
  const [selectedSize, setSelectedSize] = useState('L');
  const [isAdded, setIsAdded] = useState(false);
  
  const { addToCart } = useCart();

  if (!isOpen) return null;

  const handleAddToCart = () => {
    const productObj: any = {
      _id: product.id,
      name: product.name,
      price: product.price,
      images: [product.image],
      category: product.category || 'Oversized',
      stock: 50
    };
    addToCart(productObj, selectedSize, 'Onyx Black', 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-zinc-950 border border-amber-500/30 rounded-3xl max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 overflow-hidden shadow-2xl relative text-zinc-100"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 bg-zinc-900/80 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left Canvas Preview */}
          <div className={`md:col-span-7 bg-gradient-to-b ${selectedLighting.color} p-8 flex flex-col items-center justify-center relative min-h-[420px] border-r border-zinc-800/80`}>
            {/* Badge */}
            <div className="absolute top-4 left-4 bg-zinc-900/80 backdrop-blur-md border border-amber-500/40 text-amber-400 text-[11px] font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
              <Sparkles className="w-3.5 h-3.5" /> 3D Virtual Try-On Render
            </div>

            {/* Mannequin / Avatar Composite View */}
            <div className="relative w-64 h-80 rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 group">
              {/* Model Background Avatar */}
              <img
                src={selectedModel.image}
                alt={selectedModel.name}
                className="w-full h-full object-cover filter brightness-75 contrast-110"
              />

              {/* Garment Layer Overlay */}
              <motion.div
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 0.9, scale: 1 }}
                key={product.id + selectedModel.id}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 flex items-center justify-center p-4 bg-gradient-to-t from-black/60 via-transparent to-transparent"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-48 h-56 object-cover rounded-xl shadow-2xl border border-amber-500/40 mix-blend-luminosity hover:mix-blend-normal transition duration-500"
                />
              </motion.div>
            </div>

            <p className="text-xs text-zinc-400 mt-4 font-mono">
              Model Preview: <span className="text-amber-400 font-semibold">{selectedModel.name}</span>
            </p>
          </div>

          {/* Right Controls Panel */}
          <div className="md:col-span-5 p-6 flex flex-col justify-between space-y-6">
            <div>
              <h3 className="text-xl font-bold text-zinc-100">{product.name}</h3>
              <p className="text-amber-400 font-semibold text-lg mt-1">${product.price}</p>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Test how this garment drapes on various physical builds with customized studio lighting.
              </p>
            </div>

            {/* Select Model Avatar */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-400" /> Select Model Physique
              </label>
              <div className="space-y-2">
                {AVATAR_MODELS.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedModel(m)}
                    className={`w-full p-2.5 rounded-xl text-xs font-medium border flex items-center gap-3 transition ${
                      selectedModel.id === m.id
                        ? 'bg-zinc-900 border-amber-500 text-amber-300'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <img src={m.image} alt={m.name} className="w-8 h-8 rounded-full object-cover" />
                    <span>{m.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Select Lighting */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-400" /> Studio Lighting Environment
              </label>
              <div className="grid grid-cols-3 gap-2">
                {LIGHTING_MODES.map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => setSelectedLighting(mode)}
                    className={`p-2 rounded-xl text-[11px] font-medium border text-center transition ${
                      selectedLighting.id === mode.id
                        ? 'bg-amber-500 text-black border-amber-400 font-bold'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selector & Action */}
            <div className="pt-2 border-t border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400 font-medium">Selected Size:</span>
                <div className="flex gap-1.5">
                  {['S', 'M', 'L', 'XL'].map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-8 h-8 rounded-lg text-xs font-mono font-bold border transition ${
                        selectedSize === size
                          ? 'bg-amber-500 text-black border-amber-400'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <AddToCartButton
                product={{
                  _id: product.id,
                  name: product.name,
                  price: product.price,
                  images: [product.image],
                  category: product.category || 'Silk',
                  stock: 50,
                } as any}
                size={selectedSize}
                variant="full"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
