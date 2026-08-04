import React from 'react';
import { Award, ShieldCheck, Heart, Sparkles, MapPin, Users } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FFFDF9] text-slate-900 py-12 px-4 sm:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-16">

        {/* Header Hero with Clean Brand Logo */}
        <div className="text-center space-y-5 max-w-4xl mx-auto">
          {/* Clean Logo Image without borders or circular clipping */}
          <div className="flex justify-center pb-2">
            <img
              src="/images/evan_logo_clean.png"
              alt="EVAN COLLECTIONS Logo"
              className="w-80 sm:w-[480px] md:w-[620px] h-auto object-contain max-h-[420px] drop-shadow-md hover:scale-[1.01] transition-transform duration-300"
            />
          </div>

          <span className="text-[11px] sm:text-xs font-black uppercase tracking-[0.3em] text-amber-800 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-red-800" /> OUR HERITAGE STORY & ATELIER <Sparkles className="w-4 h-4 text-red-800" />
          </span>

          <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-3xl mx-auto">
            Preserving India's 2,000-year-old weaving legacy through pure Silk Mark certified Banarasi brocades, heirloom Kanchipuram silk sarees, and handcrafted organza weaves.
          </p>
        </div>

        {/* Story Section */}
        <div className="bg-white rounded-3xl p-8 sm:p-14 border border-amber-200 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-black uppercase tracking-widest text-red-800">MASTER WEAVERS & ARTISANS</span>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
              CRAFTED BY GENERATIONS OF WEAVING FAMILIES
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              Every saree in the EVAN COLLECTIONS atelier represents weeks of dedicated handloom craftsmanship by master weavers in Varanasi, Kanchipuram, Paithan, and Chanderi. We partner directly with artisan clusters to preserve authentic zari weaving.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
                <span className="font-street text-3xl font-black text-red-800 block">200+</span>
                <span className="text-[11px] font-bold text-slate-700 uppercase">Master Artisan Families</span>
              </div>
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
                <span className="font-street text-3xl font-black text-amber-700 block">100%</span>
                <span className="text-[11px] font-bold text-slate-700 uppercase">Pure Silk Mark Certified</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-amber-300">
            <img
              src="/images/saree_kanchipuram_gold.png"
              alt="EVAN COLLECTIONS Master Weaver Heritage"
              className="w-full h-full object-cover object-top"
            />
          </div>
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-amber-200 shadow-md space-y-3">
            <Award className="w-8 h-8 text-amber-700" />
            <h3 className="font-serif-luxury font-bold text-lg text-slate-900">AUTHENTIC SILK MARK</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Guaranteed pure mulberry silk tested and hallmarked under Silk Mark Organisation standards.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-amber-200 shadow-md space-y-3">
            <ShieldCheck className="w-8 h-8 text-red-800" />
            <h3 className="font-serif-luxury font-bold text-lg text-slate-900">DIRECT WEAVER FAIR TRADE</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              100% fair wages and direct cluster support for artisan families preserving Indian heritage.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-amber-200 shadow-md space-y-3">
            <Heart className="w-8 h-8 text-amber-700" />
            <h3 className="font-serif-luxury font-bold text-lg text-slate-900">CUSTOM BLOUSE TAILORING</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Bespoke unstitched blouse pieces included with custom embroidery fitting options.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
