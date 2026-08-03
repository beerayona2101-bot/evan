import React, { useState } from 'react';
import { Search, ChevronDown, Sparkles, HelpCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'General' | 'Orders' | 'Payments' | 'Shipping' | 'Returns' | 'Refunds' | 'Account';
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'f1',
    category: 'General',
    question: 'Are all sarees at EVAN COLLECTIONS 100% Pure Silk Mark Certified?',
    answer: 'Yes! Every silk saree in our collection comes with an official Silk Mark Organisation of India authentication certificate guarantees 100% pure mulberry silk and authentic handloom zari weaving.',
  },
  {
    id: 'f2',
    category: 'General',
    question: 'Do EVAN sarees include unstitched blouse pieces?',
    answer: 'Yes, all our drapes include an unstitched contrast or matching blouse fabric piece (0.8m - 1.0m) attached to the saree drape.',
  },
  {
    id: 'f3',
    category: 'Orders',
    question: 'How can I track my saree shipment in real time?',
    answer: 'Once your order is placed, you can visit your "My Account > Orders" tab or click the "Track Order" link in your confirmation email to view live courier tracking updates.',
  },
  {
    id: 'f4',
    category: 'Orders',
    question: 'Can I modify or cancel my order after placing it?',
    answer: 'Orders can be cancelled or updated directly from your "My Account" page prior to dispatch. If the order has already shipped, our customer concierge will assist with a return or exchange.',
  },
  {
    id: 'f5',
    category: 'Payments',
    question: 'What payment options do you support?',
    answer: 'We support all major payment modes including UPI (Google Pay, PhonePe, Paytm), Credit & Debit Cards (Visa, Mastercard, RuPay, Amex), NetBanking across 50+ Indian banks, Razorpay, and Cash on Delivery (COD).',
  },
  {
    id: 'f6',
    category: 'Payments',
    question: 'Is online payment safe and encrypted on EVAN COLLECTIONS?',
    answer: 'Absolutely. All transactions pass through 256-bit SSL encrypted payment gateways integrated via Razorpay with instant 3D Secure OTP authentication.',
  },
  {
    id: 'f7',
    category: 'Shipping',
    question: 'Do you offer free shipping across India?',
    answer: 'Yes! We provide 100% free express insured shipping across all pin codes in India with no minimum cart value required.',
  },
  {
    id: 'f8',
    category: 'Shipping',
    question: 'What is the estimated delivery time for my location?',
    answer: 'Metro cities receive delivery in 2-3 business days. All other Indian cities and towns receive delivery within 3-5 business days via insured express couriers like BlueDart and Delhivery.',
  },
  {
    id: 'f9',
    category: 'Returns',
    question: 'What is EVAN’s return and exchange policy?',
    answer: 'We offer a 7-day hassle-free return and exchange policy from the date of package delivery. The saree must remain unstitched with original Silk Mark tags intact.',
  },
  {
    id: 'f10',
    category: 'Refunds',
    question: 'How long does it take to process a refund?',
    answer: 'Once our quality team inspects the returned item, refunds are credited back to your original payment source or bank account within 3-5 business days.',
  },
  {
    id: 'f11',
    category: 'Account',
    question: 'How do I create an account or reset my password?',
    answer: 'Click the Profile icon in the top right header to Register or Login. If you forget your password, click "Forgot Password" to receive a reset link.',
  },
];

const CATEGORIES = ['All', 'General', 'Orders', 'Payments', 'Shipping', 'Returns', 'Refunds', 'Account'] as const;

export const FAQPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [openIds, setOpenIds] = useState<string[]>(['f1']);

  const toggleAccordion = (id: string) => {
    setOpenIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const filteredFaqs = FAQ_ITEMS.filter((item) => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-slate-900 py-12 px-4 sm:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Header Banner */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-black uppercase tracking-[0.25em] text-amber-800 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-red-700" /> HELP & SUPPORT CENTER
          </span>
          <h1 className="font-street text-5xl sm:text-6xl font-black text-slate-900 tracking-tight leading-none uppercase">
            FREQUENTLY ASKED QUESTIONS
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Find answers to common questions regarding pure silk certification, orders, shipping, returns & custom fitting.
          </p>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="bg-white p-6 rounded-3xl border border-amber-200 shadow-md space-y-5">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-700" />
            <input
              type="text"
              placeholder="Search FAQs (e.g. Silk Mark, Shipping time, Returns)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-amber-50/50 border border-amber-300 rounded-2xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-red-800 transition-all"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-amber-300 shadow-md'
                    : 'bg-amber-50 text-slate-700 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => {
              const isOpen = openIds.includes(faq.id);
              return (
                <div
                  key={faq.id}
                  className="bg-white rounded-2xl border border-amber-200/90 shadow-sm overflow-hidden transition-all"
                >
                  <button
                    onClick={() => toggleAccordion(faq.id)}
                    className="w-full p-5 text-left flex justify-between items-center gap-4 hover:bg-amber-50/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <HelpCircle className="w-5 h-5 text-red-800 flex-shrink-0" />
                      <span className="font-serif-luxury font-bold text-sm sm:text-base text-slate-900">
                        {faq.question}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-amber-800 transition-transform duration-300 flex-shrink-0 ${
                        isOpen ? 'rotate-180 text-red-800' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="p-5 pt-0 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed border-t border-amber-100 bg-amber-50/30">
                      <p>{faq.answer}</p>
                      <span className="inline-block mt-3 text-[10px] font-black uppercase text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded border border-amber-300">
                        Category: {faq.category}
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="bg-white p-12 rounded-3xl border border-amber-200 text-center space-y-3 shadow-sm">
              <HelpCircle className="w-10 h-10 text-amber-600 mx-auto" />
              <h3 className="font-street text-2xl font-black text-slate-900">NO FAQS FOUND</h3>
              <p className="text-xs text-slate-500 font-semibold max-w-sm mx-auto">
                No questions matched your search query "{searchQuery}". Try selecting another category or contact our concierge directly.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-red-800 text-amber-300 text-xs font-black uppercase tracking-widest rounded-xl shadow hover:bg-red-900 transition-all border border-amber-300"
              >
                <span>Contact Saree Concierge</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Contact CTA Box */}
        <div className="bg-slate-900 text-white p-8 rounded-3xl border border-amber-400/30 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">STILL HAVE QUESTIONS?</span>
            <h3 className="font-street text-2xl font-black text-amber-300">SPEAK WITH OUR SILK CONCIERGE</h3>
            <p className="text-xs text-slate-400">Our personal drape stylists are available Monday – Sunday (10 AM – 8:30 PM IST).</p>
          </div>
          <Link
            to="/contact"
            className="px-8 py-3.5 bg-red-800 hover:bg-red-700 text-amber-300 font-black text-xs uppercase tracking-widest rounded-xl shadow-lg transition-all border border-amber-300 whitespace-nowrap flex items-center gap-2"
          >
            <span>GET IN TOUCH</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
};
