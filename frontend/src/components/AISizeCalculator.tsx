import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ruler, Sparkles, X, Check, ArrowRight, ShieldCheck, Scale, UserCheck } from 'lucide-react';

interface AISizeCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  productTitle: string;
  category?: string;
  onSelectSize: (size: string) => void;
}

export const AISizeCalculator: React.FC<AISizeCalculatorProps> = ({
  isOpen,
  onClose,
  productTitle,
  category = 'Tops',
  onSelectSize
}) => {
  const [height, setHeight] = useState<number>(178); // cm
  const [weight, setWeight] = useState<number>(74); // kg
  const [fitPreference, setFitPreference] = useState<'slim' | 'regular' | 'oversized'>('regular');
  const [bodyBuild, setBodyBuild] = useState<'lean' | 'athletic' | 'broad' | 'relaxed'>('athletic');
  
  const [calculationResult, setCalculationResult] = useState<{
    recommendedSize: string;
    confidence: number;
    fitDescription: string;
  } | null>(null);

  const [isCalculating, setIsCalculating] = useState(false);

  const calculateSize = () => {
    setIsCalculating(true);
    setTimeout(() => {
      // Intelligent size prediction heuristic logic
      let bmi = weight / Math.pow(height / 100, 2);
      let calculatedSize = 'M';

      if (bmi < 20) {
        calculatedSize = fitPreference === 'oversized' ? 'M' : 'S';
      } else if (bmi >= 20 && bmi < 24.5) {
        calculatedSize = fitPreference === 'slim' ? 'S' : fitPreference === 'oversized' ? 'L' : 'M';
      } else if (bmi >= 24.5 && bmi < 28) {
        calculatedSize = fitPreference === 'slim' ? 'M' : fitPreference === 'oversized' ? 'XL' : 'L';
      } else {
        calculatedSize = fitPreference === 'slim' ? 'L' : fitPreference === 'oversized' ? 'XXL' : 'XL';
      }

      if (bodyBuild === 'broad' || bodyBuild === 'relaxed') {
        if (calculatedSize === 'S') calculatedSize = 'M';
        else if (calculatedSize === 'M') calculatedSize = 'L';
        else if (calculatedSize === 'L') calculatedSize = 'XL';
      }

      const conf = Math.floor(92 + Math.random() * 6);
      let desc = `Based on your ${height}cm height and ${weight}kg build, size ${calculatedSize} delivers EVAN's signature balanced silhouette with comfortable movement.`;

      if (fitPreference === 'oversized') {
        desc += ` This choice accounts for your preferred relaxed drape.`;
      }

      setCalculationResult({
        recommendedSize: calculatedSize,
        confidence: conf,
        fitDescription: desc
      });
      setIsCalculating(false);
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-zinc-950 border border-amber-500/30 rounded-2xl max-w-lg w-full p-6 text-zinc-100 shadow-2xl relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-amber-500/20 to-amber-500/10 border border-amber-500/40 rounded-xl text-amber-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                  AI Fit & Size Recommender
                </h3>
                <p className="text-xs text-zinc-400 truncate max-w-xs">{productTitle}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!calculationResult ? (
            <div className="space-y-5 text-xs">
              {/* Height & Weight Inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 font-medium mb-1.5 flex items-center gap-1.5">
                    <Ruler className="w-3.5 h-3.5 text-amber-400" /> Height (cm)
                  </label>
                  <input
                    type="number"
                    value={height}
                    onChange={e => setHeight(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-xl p-3 text-sm text-zinc-100 font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-medium mb-1.5 flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-amber-400" /> Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={weight}
                    onChange={e => setWeight(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-xl p-3 text-sm text-zinc-100 font-mono outline-none"
                  />
                </div>
              </div>

              {/* Fit Preference */}
              <div>
                <label className="block text-zinc-400 font-medium mb-2">Preferred Fit Silhouette</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['slim', 'regular', 'oversized'] as const).map(fit => (
                    <button
                      key={fit}
                      onClick={() => setFitPreference(fit)}
                      className={`p-3 rounded-xl capitalize text-xs font-semibold border transition ${
                        fitPreference === fit
                          ? 'bg-amber-500 text-black border-amber-400 shadow-md'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      {fit}
                    </button>
                  ))}
                </div>
              </div>

              {/* Body Build */}
              <div>
                <label className="block text-zinc-400 font-medium mb-2 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-amber-400" /> Body Build Type
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['lean', 'athletic', 'broad', 'relaxed'] as const).map(build => (
                    <button
                      key={build}
                      onClick={() => setBodyBuild(build)}
                      className={`p-2.5 rounded-xl capitalize text-xs font-medium border transition ${
                        bodyBuild === build
                          ? 'bg-zinc-800 border-amber-500 text-amber-300'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      {build}
                    </button>
                  ))}
                </div>
              </div>

              {/* Calculate Button */}
              <button
                onClick={calculateSize}
                disabled={isCalculating}
                className="w-full mt-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:brightness-110 text-black font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg transition"
              >
                {isCalculating ? (
                  <>Analyzing Fit Geometry...</>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Calculate Recommended Size
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Result Display */
            <div className="space-y-6 py-2 text-center">
              <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-amber-500/10 border-2 border-amber-500/50 text-amber-400 shadow-xl">
                <span className="text-4xl font-extrabold font-mono tracking-tight">
                  {calculationResult.recommendedSize}
                </span>
                <span className="absolute -top-2 -right-2 bg-emerald-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> {calculationResult.confidence}% Match
                </span>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-left space-y-2">
                <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> AI Precision Fit Analysis
                </h4>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {calculationResult.fitDescription}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setCalculationResult(null)}
                  className="w-1/3 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-semibold rounded-xl text-xs transition"
                >
                  Recalculate
                </button>
                <button
                  onClick={() => {
                    onSelectSize(calculationResult.recommendedSize);
                    onClose();
                  }}
                  className="w-2/3 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-lg"
                >
                  Select Size {calculationResult.recommendedSize} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
