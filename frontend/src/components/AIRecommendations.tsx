import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowUpRight, ShoppingBag, Heart, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { AddToCartButton } from './AddToCartButton';

interface AIRecommendationsProps {
  currentCategory?: string;
  currentProductId?: string;
}

const AI_RECOMMENDED_ITEMS = [
  {
    id: 'prod-saree-001',
    name: 'Royal Crimson Banarasi Silk Saree by EVAN COLLECTIONS',
    price: 9999,
    matchScore: 98,
    reason: 'Perfect Color & Border Contrast',
    image: '/images/saree_banarasi_red.png',
    category: 'Banarasi Silk'
  },
  {
    id: 'prod-saree-002',
    name: 'Mustard Gold Kanchipuram Silk Saree by EVAN COLLECTIONS',
    price: 14999,
    matchScore: 95,
    reason: 'Recommended Heirloom Weave',
    image: '/images/saree_kanchipuram_gold.png',
    category: 'Kanchipuram Silk'
  },
  {
    id: 'prod-saree-003',
    name: 'Pastel Floral Organza Designer Saree by EVAN COLLECTIONS',
    price: 6999,
    matchScore: 94,
    reason: 'Matching Party Wear Drape',
    image: '/images/saree_organza_floral.png',
    category: 'Organza Silk'
  }
];

export const AIRecommendations: React.FC<AIRecommendationsProps> = ({
  currentCategory,
  currentProductId
}) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const recommendations = AI_RECOMMENDED_ITEMS.filter(item => item.id !== currentProductId);

  return (
    <div className="my-16 border-t border-zinc-800/80 pt-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 uppercase tracking-widest bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" /> AI Curated Pairings
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-100 mt-2">
            Complete The Look
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Handpicked by EVAN’s AI Neural Stylist based on silhouette harmony & color match algorithms.
          </p>
        </div>

        <button
          onClick={() => navigate('/shop')}
          className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition"
        >
          View Full AI Collection <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Grid of Recommended Products */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            className="bg-zinc-950 border border-zinc-800 hover:border-amber-500/50 rounded-2xl p-4 flex flex-col justify-between group transition duration-300 shadow-xl"
          >
            <div>
              {/* Image & Match Badge */}
              <div
                onClick={() => navigate(`/product/${item.id}`)}
                className="relative h-64 w-full rounded-xl overflow-hidden mb-4 bg-zinc-900 cursor-pointer"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute top-3 left-3 bg-zinc-950/80 backdrop-blur-md border border-amber-500/40 text-amber-400 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                  <ShieldCheck className="w-3.5 h-3.5" /> {item.matchScore}% Match
                </div>
              </div>

              <h3
                onClick={() => navigate(`/product/${item.id}`)}
                className="text-sm font-semibold text-zinc-100 truncate group-hover:text-amber-300 transition cursor-pointer"
              >
                {item.name}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">{item.reason}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-900 flex items-center justify-between">
              <span className="text-sm font-bold text-amber-400 font-mono">₹{item.price.toLocaleString('en-IN')}</span>

              <div className="flex gap-2">
                <AddToCartButton
                  product={{
                    _id: item.id,
                    name: item.name,
                    price: item.price,
                    images: [item.image],
                    category: item.category,
                    stock: 50,
                  } as any}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
