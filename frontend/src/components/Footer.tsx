import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, RefreshCw, Award, Heart, Mail, Phone, MapPin, Clock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-200 border-t border-amber-500/20 pt-16 pb-12 font-sans">
      {/* Brand Value Pillars */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 mb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 bg-slate-800/80 p-8 rounded-3xl border border-amber-400/20 shadow-2xl">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-white">100% PURE SILK MARK</h4>
              <p className="text-xs text-slate-400">Certified Authentic Indian Handlooms</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-white">FREE EXPRESS SHIPPING</h4>
              <p className="text-xs text-slate-400">Insured Delivery Across India</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-white">7-DAY HASSLE RETURN</h4>
              <p className="text-xs text-slate-400">Easy Returns & Exchanges</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-white">WEAVER DIRECT CRAFT</h4>
              <p className="text-xs text-slate-400">Supporting Traditional Indian Artisans</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
        {/* Company Bio & Contact Info */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center space-x-3">
            <img
              src="/kanchanika_attire_logo.svg"
              alt="Kanchanika Logo"
              className="w-10 h-10 object-contain drop-shadow-md"
            />
            <span className="font-street text-3xl font-black text-white">KANCHANIKA</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed font-medium max-w-sm">
            Kanchanika is India's premier luxury saree destination celebrating royal Banarasi brocades, heirloom Kanchipuram silks, delicate floral organzas, and handcrafted linen sarees.
          </p>

          {/* Luxury Contact Information Block */}
          <div className="space-y-3 pt-2 text-xs font-semibold border-t border-slate-800">
            <div className="flex items-start space-x-3 text-slate-300">
              <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-300 block text-[10px] uppercase tracking-wider">Atelier Address</span>
                <span className="text-slate-300">Heritage Silk House, MG Road, Bengaluru - 560001</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-slate-300">
              <Phone className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <div>
                <span className="font-bold text-amber-300 block text-[10px] uppercase tracking-wider">Phone / Helpline</span>
                <span className="text-slate-300">9490644434</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-slate-300">
              <Mail className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <div>
                <span className="font-bold text-amber-300 block text-[10px] uppercase tracking-wider">Email Concierge</span>
                <span className="text-slate-300">concierge@kanchanika.com</span>
              </div>
            </div>

            <div className="flex items-start space-x-3 text-slate-300">
              <Clock className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-300 block text-[10px] uppercase tracking-wider">Business Hours</span>
                <span className="text-slate-300">Monday – Sunday: 10:00 AM – 8:30 PM IST</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <h4 className="font-bold text-xs uppercase tracking-widest text-amber-400">LUXURY SAREES</h4>
          <ul className="space-y-2 text-xs text-slate-400 font-medium">
            <li><Link to="/shop?category=Kanchipuram Sarees" className="hover:text-amber-400 transition-colors">Kanchipuram Silk Sarees</Link></li>
            <li><Link to="/shop?category=Banarasi Sarees" className="hover:text-amber-400 transition-colors">Royal Banarasi Brocades</Link></li>
            <li><Link to="/shop?category=Organza Sarees" className="hover:text-amber-400 transition-colors">Floral Organza Sarees</Link></li>
            <li><Link to="/shop?category=Linen Sarees" className="hover:text-amber-400 transition-colors">Handloom Pure Linen</Link></li>
            <li><Link to="/shop?category=Bridal Sarees" className="hover:text-amber-400 transition-colors">Bridal Saree Trousseau</Link></li>
          </ul>
        </div>

        {/* Collections */}
        <div className="space-y-3">
          <h4 className="font-bold text-xs uppercase tracking-widest text-amber-400">COLLECTIONS</h4>
          <ul className="space-y-2 text-xs text-slate-400 font-medium">
            <li><Link to="/shop?category=Wedding Sarees" className="hover:text-amber-400 transition-colors">Wedding Collection</Link></li>
            <li><Link to="/shop?category=Festival Collection" className="hover:text-amber-400 transition-colors">Festival Collection</Link></li>
            <li><Link to="/shop?category=Party Wear Sarees" className="hover:text-amber-400 transition-colors">Party Wear Sarees</Link></li>
            <li><Link to="/shop?category=Office Wear" className="hover:text-amber-400 transition-colors">Office & Daily Wear</Link></li>
            <li><Link to="/shop?sort=newest" className="hover:text-amber-400 transition-colors">New Arrivals 2026</Link></li>
          </ul>
        </div>

        {/* Concierge & Contact */}
        <div className="space-y-3">
          <h4 className="font-bold text-xs uppercase tracking-widest text-amber-400">CUSTOMER CONCIERGE</h4>
          <ul className="space-y-2 text-xs text-slate-400 font-medium">
            <li><Link to="/about" className="hover:text-amber-400 transition-colors">About Our Master Weavers</Link></li>
            <li><Link to="/contact" className="hover:text-amber-400 transition-colors">Contact Silk Stylist (9490644434)</Link></li>
            <li><Link to="/contact" className="hover:text-amber-400 transition-colors">Shipping & Blouse Fitting</Link></li>
            <li><Link to="/account" className="hover:text-amber-400 transition-colors">Track Saree Order</Link></li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
        <p>© 2026 EVAN COLLECTIONS. All Rights Reserved. Pure Handloom Craftsmanship.</p>
        <div className="flex items-center space-x-1 mt-4 sm:mt-0">
          <span>Crafted with</span>
          <Heart className="w-3.5 h-3.5 text-red-500 fill-current" />
          <span>for Indian Heritage & Luxury Fashion.</span>
        </div>
      </div>
    </footer>
  );
};
