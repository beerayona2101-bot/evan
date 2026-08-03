import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Save,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  Check,
  RefreshCw,
  SlidersHorizontal,
  Layers,
  Award,
  Star,
  Instagram,
  Mail,
  Shield,
  MessageSquare,
} from 'lucide-react';
import { api } from '../services/api';
import { showToast } from '../components/ToastContainer';
import { useSocket } from '../context/SocketContext';

export const HomepageEditorPage: React.FC = () => {
  const [cms, setCms] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [devicePreview, setDevicePreview] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showLivePreview, setShowLivePreview] = useState(false);
  const { socket } = useSocket();

  const fetchCMS = () => {
    setLoading(true);
    api
      .get('/homepage')
      .then((res) => setCms(res.data))
      .catch((err) => showToast(err?.response?.data?.message || 'Error loading Homepage CMS', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCMS();
  }, []);

  // Listen to live Socket broadcasts
  useEffect(() => {
    if (!socket) return;
    const handleUpdate = (updatedCms: any) => {
      setCms(updatedCms);
      showToast('Live Update: Homepage CMS synchronized with database', 'info');
    };
    socket.on('homepageCMSUpdated', handleUpdate);
    return () => {
      socket.off('homepageCMSUpdated', handleUpdate);
    };
  }, [socket]);

  const handleSaveCMS = async () => {
    setSaving(true);
    try {
      const res = await api.put('/homepage', cms);
      setCms(res.data);
      showToast('Successfully published Homepage CMS updates live to all customers!', 'success');
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Error publishing Homepage CMS', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCloudinaryUpload = async (file: File, callback: (url: string) => void) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      if (typeof reader.result === 'string') {
        showToast(`Uploading image "${file.name}" to Cloudinary CDN...`, 'info');
        try {
          const res = await api.post('/homepage/upload', { image: reader.result });
          if (res.data?.imageUrl) {
            callback(res.data.imageUrl);
            showToast('Uploaded asset to Cloudinary CDN!', 'success');
          }
        } catch {
          callback(reader.result);
          showToast('Image preview loaded locally', 'info');
        }
      }
    };
    reader.readAsDataURL(file);
  };

  if (loading || !cms) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-amber-400 border-t-red-800 animate-spin mx-auto"></div>
          <p className="text-xs font-black text-amber-900 uppercase tracking-widest font-street">
            LOADING HOMEPAGE CMS ATELIER...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-slate-900 font-sans p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Top Header Bar */}
        <div className="bg-white p-5 rounded-3xl border border-amber-300 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-red-700" /> SHOPIFY/ELEMENTOR STYLE THEME CUSTOMIZER
            </span>
            <h1 className="font-street text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tight">
              🏠 HOMEPAGE CMS EDITOR
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Device Switcher */}
            <div className="bg-amber-50 p-1 rounded-xl border border-amber-300 flex items-center gap-1">
              <button
                onClick={() => setDevicePreview('desktop')}
                className={`p-2 rounded-lg text-xs font-extrabold flex items-center gap-1 transition-all ${
                  devicePreview === 'desktop' ? 'bg-slate-900 text-amber-300 shadow' : 'text-slate-600 hover:bg-amber-100'
                }`}
                title="Desktop View"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDevicePreview('tablet')}
                className={`p-2 rounded-lg text-xs font-extrabold flex items-center gap-1 transition-all ${
                  devicePreview === 'tablet' ? 'bg-slate-900 text-amber-300 shadow' : 'text-slate-600 hover:bg-amber-100'
                }`}
                title="Tablet View"
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDevicePreview('mobile')}
                className={`p-2 rounded-lg text-xs font-extrabold flex items-center gap-1 transition-all ${
                  devicePreview === 'mobile' ? 'bg-slate-900 text-amber-300 shadow' : 'text-slate-600 hover:bg-amber-100'
                }`}
                title="Mobile View"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setShowLivePreview(!showLivePreview)}
              className="px-4 py-2.5 bg-amber-100 border border-amber-300 hover:bg-amber-200 text-slate-900 text-xs font-black uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow"
            >
              <Eye className="w-4 h-4 text-amber-800" /> {showLivePreview ? 'Hide Preview' : 'Live Preview'}
            </button>

            <button
              onClick={handleSaveCMS}
              disabled={saving}
              className="px-6 py-2.5 bg-red-800 hover:bg-red-900 text-amber-300 text-xs font-black uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-lg transition-all border border-amber-300 disabled:opacity-50"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>SAVE & PUBLISH LIVE</span>
            </button>
          </div>
        </div>

        {/* Editor Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Section Navigation Tabs (Left 4 cols) */}
          <aside className="lg:col-span-4 bg-white p-4 rounded-3xl border border-amber-300 shadow-md space-y-2">
            <h3 className="text-xs font-black uppercase tracking-widest text-amber-900 px-3 py-2 border-b border-amber-100">
              HOMEPAGE SECTIONS (13 MODULES)
            </h3>
            <div className="space-y-1">
              {[
                { key: 'announcement', label: '1. Announcement Bar', icon: Sparkles },
                { key: 'hero', label: '2. Hero Banner', icon: Layers },
                { key: 'categories', label: '3. Featured Categories (Cards)', icon: SlidersHorizontal },
                { key: 'collections', label: '4. Featured Collections', icon: Award },
                { key: 'trending', label: '5. Trending Sarees Carousel', icon: Star },
                { key: 'arrivals', label: '6. New Arrivals Showcase', icon: Sparkles },
                { key: 'bestsellers', label: '7. Best Sellers Banner', icon: Award },
                { key: 'festival', label: '8. Festival Promo Banner', icon: Layers },
                { key: 'testimonials', label: '9. Customer Testimonials', icon: MessageSquare },
                { key: 'instagram', label: '10. Instagram Gallery', icon: Instagram },
                { key: 'brands', label: '11. Partner Brands Guild', icon: Shield },
                { key: 'newsletter', label: '12. Newsletter Club', icon: Mail },
                { key: 'footer', label: '13. Footer Configuration', icon: Layers },
              ].map((item) => {
                const IconComp = item.icon;
                const isActive = activeSection === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveSection(item.key)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                      isActive
                        ? 'bg-red-800 text-amber-300 font-extrabold shadow-md'
                        : 'text-slate-700 hover:bg-amber-50'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <IconComp className="w-4 h-4" /> {item.label}
                    </span>
                    {isActive && <Check className="w-4 h-4 text-amber-300" />}
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Active Section Form Editor (Right 8 cols) */}
          <main className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-amber-300 shadow-xl space-y-6">

            {/* SECTION 1: ANNOUNCEMENT BAR */}
            {activeSection === 'announcement' && (
              <div className="space-y-4">
                <div className="border-b border-amber-100 pb-3 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest">MODULE 1</span>
                    <h3 className="font-street text-2xl font-black text-slate-900 uppercase">ANNOUNCEMENT BAR EDITOR</h3>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cms.announcementBar.enabled}
                      onChange={(e) => setCms({ ...cms, announcementBar: { ...cms.announcementBar, enabled: e.target.checked } })}
                      className="w-4 h-4 accent-red-800 rounded"
                    />
                    <span className="text-xs font-bold text-slate-700 uppercase">Enable Module</span>
                  </label>
                </div>

                <div className="space-y-3 text-xs font-semibold">
                  <div>
                    <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">Announcement Text</label>
                    <textarea
                      rows={2}
                      value={cms.announcementBar.text}
                      onChange={(e) => setCms({ ...cms, announcementBar: { ...cms.announcementBar, text: e.target.value } })}
                      className="w-full p-3 bg-amber-50/50 border border-amber-300 rounded-xl font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">Background Color</label>
                      <input
                        type="color"
                        value={cms.announcementBar.bgColor}
                        onChange={(e) => setCms({ ...cms, announcementBar: { ...cms.announcementBar, bgColor: e.target.value } })}
                        className="w-full h-10 p-1 bg-amber-50 border border-amber-300 rounded-xl cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">Text Color</label>
                      <input
                        type="color"
                        value={cms.announcementBar.textColor}
                        onChange={(e) => setCms({ ...cms, announcementBar: { ...cms.announcementBar, textColor: e.target.value } })}
                        className="w-full h-10 p-1 bg-amber-50 border border-amber-300 rounded-xl cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center pt-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={cms.announcementBar.scrolling}
                          onChange={(e) => setCms({ ...cms, announcementBar: { ...cms.announcementBar, scrolling: e.target.checked } })}
                          className="w-4 h-4 accent-red-800 rounded"
                        />
                        <span className="text-xs font-bold text-slate-700 uppercase">Marquee Auto-Scroll</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 2: HERO BANNER */}
            {activeSection === 'hero' && (
              <div className="space-y-4">
                <div className="border-b border-amber-100 pb-3 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest">MODULE 2</span>
                    <h3 className="font-street text-2xl font-black text-slate-900 uppercase">HERO BANNER EDITOR</h3>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cms.heroBanner.enabled}
                      onChange={(e) => setCms({ ...cms, heroBanner: { ...cms.heroBanner, enabled: e.target.checked } })}
                      className="w-4 h-4 accent-red-800 rounded"
                    />
                    <span className="text-xs font-bold text-slate-700 uppercase">Enable Module</span>
                  </label>
                </div>

                <div className="space-y-4 text-xs font-semibold">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">Title</label>
                      <input
                        type="text"
                        value={cms.heroBanner.title}
                        onChange={(e) => setCms({ ...cms, heroBanner: { ...cms.heroBanner, title: e.target.value } })}
                        className="w-full p-3 bg-amber-50/50 border border-amber-300 rounded-xl font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">Subtitle</label>
                      <input
                        type="text"
                        value={cms.heroBanner.subtitle}
                        onChange={(e) => setCms({ ...cms, heroBanner: { ...cms.heroBanner, subtitle: e.target.value } })}
                        className="w-full p-3 bg-amber-50/50 border border-amber-300 rounded-xl font-bold text-amber-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">Hero Description</label>
                    <textarea
                      rows={3}
                      value={cms.heroBanner.description}
                      onChange={(e) => setCms({ ...cms, heroBanner: { ...cms.heroBanner, description: e.target.value } })}
                      className="w-full p-3 bg-amber-50/50 border border-amber-300 rounded-xl font-medium"
                    />
                  </div>

                  {/* Image Upload Box */}
                  <div>
                    <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">Desktop Saree Image (URL or Local File)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={cms.heroBanner.desktopImage}
                        onChange={(e) => setCms({ ...cms, heroBanner: { ...cms.heroBanner, desktopImage: e.target.value } })}
                        className="flex-1 p-3 bg-amber-50/50 border border-amber-300 rounded-xl font-medium text-xs"
                      />
                      <label className="px-4 py-3 bg-slate-900 hover:bg-slate-800 text-amber-300 font-black text-xs rounded-xl cursor-pointer flex items-center gap-1.5 border border-amber-300 whitespace-nowrap">
                        <ImageIcon className="w-4 h-4 text-amber-400" />
                        <span>BROWSE FILE</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleCloudinaryUpload(file, (url) => {
                                setCms({ ...cms, heroBanner: { ...cms.heroBanner, desktopImage: url } });
                              });
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">Primary CTA Button Text</label>
                      <input
                        type="text"
                        value={cms.heroBanner.primaryButtonText}
                        onChange={(e) => setCms({ ...cms, heroBanner: { ...cms.heroBanner, primaryButtonText: e.target.value } })}
                        className="w-full p-3 bg-amber-50/50 border border-amber-300 rounded-xl font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">Primary CTA Button Link</label>
                      <input
                        type="text"
                        value={cms.heroBanner.primaryButtonLink}
                        onChange={(e) => setCms({ ...cms, heroBanner: { ...cms.heroBanner, primaryButtonLink: e.target.value } })}
                        className="w-full p-3 bg-amber-50/50 border border-amber-300 rounded-xl font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">Offer Badge Label</label>
                      <input
                        type="text"
                        value={cms.heroBanner.offerBadge}
                        onChange={(e) => setCms({ ...cms, heroBanner: { ...cms.heroBanner, offerBadge: e.target.value } })}
                        className="w-full p-3 bg-amber-50/50 border border-amber-300 rounded-xl font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">Ribbon Label</label>
                      <input
                        type="text"
                        value={cms.heroBanner.ribbonText}
                        onChange={(e) => setCms({ ...cms, heroBanner: { ...cms.heroBanner, ribbonText: e.target.value } })}
                        className="w-full p-3 bg-amber-50/50 border border-amber-300 rounded-xl font-bold text-red-800"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 3: FEATURED CATEGORIES CARDS */}
            {activeSection === 'categories' && (
              <div className="space-y-4">
                <div className="border-b border-amber-100 pb-3 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest">MODULE 3</span>
                    <h3 className="font-street text-2xl font-black text-slate-900 uppercase">FEATURED CATEGORY CARDS EDITOR</h3>
                  </div>
                  <button
                    onClick={() => {
                      const newCat = {
                        id: `cat-${Date.now()}`,
                        name: 'New Saree Category',
                        image: '/images/saree_kanchipuram_gold.png',
                        description: 'Artisanal handloom saree weave.',
                        buttonText: 'EXPLORE WEAVES',
                        buttonLink: '/shop',
                        status: 'ACTIVE',
                        displayOrder: cms.featuredCategories.length + 1,
                      };
                      setCms({ ...cms, featuredCategories: [...cms.featuredCategories, newCat] });
                    }}
                    className="px-4 py-2 bg-slate-900 text-amber-300 text-xs font-black uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow"
                  >
                    <Plus className="w-4 h-4" /> ADD CARD
                  </button>
                </div>

                <div className="space-y-4">
                  {cms.featuredCategories.map((card: any, idx: number) => (
                    <div key={card.id} className="p-4 bg-amber-50/60 rounded-2xl border border-amber-300 space-y-3 text-xs">
                      <div className="flex justify-between items-center border-b border-amber-200 pb-2">
                        <span className="font-extrabold text-amber-900 uppercase text-[10px]">CARD #{idx + 1} - {card.name}</span>
                        <button
                          onClick={() => {
                            const updated = cms.featuredCategories.filter((c: any) => c.id !== card.id);
                            setCms({ ...cms, featuredCategories: updated });
                          }}
                          className="text-red-700 hover:text-red-900 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-700 font-bold uppercase text-[9px] mb-1">Category Name</label>
                          <input
                            type="text"
                            value={card.name}
                            onChange={(e) => {
                              const updated = [...cms.featuredCategories];
                              updated[idx].name = e.target.value;
                              setCms({ ...cms, featuredCategories: updated });
                            }}
                            className="w-full p-2.5 bg-white border border-amber-300 rounded-xl font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold uppercase text-[9px] mb-1">Card Cover Image (URL or Browse)</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={card.image}
                              onChange={(e) => {
                                const updated = [...cms.featuredCategories];
                                updated[idx].image = e.target.value;
                                setCms({ ...cms, featuredCategories: updated });
                              }}
                              className="flex-1 p-2.5 bg-white border border-amber-300 rounded-xl font-semibold text-xs"
                            />
                            <label className="px-3 py-2.5 bg-slate-900 text-amber-300 text-xs font-black rounded-xl cursor-pointer flex items-center gap-1 border border-amber-300">
                              <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleCloudinaryUpload(file, (url) => {
                                      const updated = [...cms.featuredCategories];
                                      updated[idx].image = url;
                                      setCms({ ...cms, featuredCategories: updated });
                                    });
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-700 font-bold uppercase text-[9px] mb-1">Description</label>
                          <input
                            type="text"
                            value={card.description}
                            onChange={(e) => {
                              const updated = [...cms.featuredCategories];
                              updated[idx].description = e.target.value;
                              setCms({ ...cms, featuredCategories: updated });
                            }}
                            className="w-full p-2.5 bg-white border border-amber-300 rounded-xl font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold uppercase text-[9px] mb-1">Target Collection URL</label>
                          <input
                            type="text"
                            placeholder={`/shop?category=${encodeURIComponent(card.name)}`}
                            value={card.buttonLink || `/shop?category=${encodeURIComponent(card.name)}`}
                            onChange={(e) => {
                              const updated = [...cms.featuredCategories];
                              updated[idx].buttonLink = e.target.value;
                              setCms({ ...cms, featuredCategories: updated });
                            }}
                            className="w-full p-2.5 bg-white border border-amber-300 rounded-xl font-mono text-[11px]"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 5: TRENDING SAREES CAROUSEL */}
            {activeSection === 'trending' && (
              <div className="space-y-4">
                <div className="border-b border-amber-100 pb-3 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest">MODULE 5</span>
                    <h3 className="font-street text-2xl font-black text-slate-900 uppercase">TRENDING SAREES CAROUSEL</h3>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cms.trendingSarees.enabled}
                      onChange={(e) => setCms({ ...cms, trendingSarees: { ...cms.trendingSarees, enabled: e.target.checked } })}
                      className="w-4 h-4 accent-red-800 rounded"
                    />
                    <span className="text-xs font-bold text-slate-700 uppercase">Enable Module</span>
                  </label>
                </div>

                <div className="space-y-3 text-xs font-semibold">
                  <div>
                    <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">Section Title</label>
                    <input
                      type="text"
                      value={cms.trendingSarees.title}
                      onChange={(e) => setCms({ ...cms, trendingSarees: { ...cms.trendingSarees, title: e.target.value } })}
                      className="w-full p-3 bg-amber-50/50 border border-amber-300 rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">Section Subtitle</label>
                    <input
                      type="text"
                      value={cms.trendingSarees.subtitle}
                      onChange={(e) => setCms({ ...cms, trendingSarees: { ...cms.trendingSarees, subtitle: e.target.value } })}
                      className="w-full p-3 bg-amber-50/50 border border-amber-300 rounded-xl font-bold text-amber-800"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 9: TESTIMONIALS */}
            {activeSection === 'testimonials' && (
              <div className="space-y-4">
                <div className="border-b border-amber-100 pb-3 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest">MODULE 9</span>
                    <h3 className="font-street text-2xl font-black text-slate-900 uppercase">CUSTOMER TESTIMONIALS EDITOR</h3>
                  </div>
                  <button
                    onClick={() => {
                      const newTest = {
                        id: `test-${Date.now()}`,
                        customerName: 'Valued Saree Collector',
                        customerImage: '/images/saree_banarasi_red.png',
                        rating: 5,
                        review: 'Sensational silk quality and incredible artisan weaving details!',
                        location: 'Bangalore, India',
                        status: 'ACTIVE',
                      };
                      setCms({ ...cms, testimonials: [...cms.testimonials, newTest] });
                    }}
                    className="px-4 py-2 bg-slate-900 text-amber-300 text-xs font-black uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow"
                  >
                    <Plus className="w-4 h-4" /> ADD REVIEWS
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  {cms.testimonials.map((test: any, idx: number) => (
                    <div key={test.id} className="p-4 bg-amber-50/60 rounded-2xl border border-amber-300 space-y-2">
                      <div className="flex justify-between items-center border-b border-amber-200 pb-2">
                        <span className="font-bold text-slate-900">{test.customerName} - {test.location}</span>
                        <button
                          onClick={() => {
                            const updated = cms.testimonials.filter((t: any) => t.id !== test.id);
                            setCms({ ...cms, testimonials: updated });
                          }}
                          className="text-red-700 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={test.review}
                        onChange={(e) => {
                          const updated = [...cms.testimonials];
                          updated[idx].review = e.target.value;
                          setCms({ ...cms, testimonials: updated });
                        }}
                        className="w-full p-2 bg-white border border-amber-300 rounded-xl font-medium"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 13: FOOTER */}
            {activeSection === 'footer' && (
              <div className="space-y-4 text-xs font-semibold">
                <div className="border-b border-amber-100 pb-3">
                  <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest">MODULE 13</span>
                  <h3 className="font-street text-2xl font-black text-slate-900 uppercase">FOOTER CONFIGURATION</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold uppercase text-[9px] mb-1">Brand Logo Text</label>
                    <input
                      type="text"
                      value={cms.footer.logo}
                      onChange={(e) => setCms({ ...cms, footer: { ...cms.footer, logo: e.target.value } })}
                      className="w-full p-2.5 bg-amber-50/50 border border-amber-300 rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold uppercase text-[9px] mb-1">Contact Phone</label>
                    <input
                      type="text"
                      value={cms.footer.contactPhone}
                      onChange={(e) => setCms({ ...cms, footer: { ...cms.footer, contactPhone: e.target.value } })}
                      className="w-full p-2.5 bg-amber-50/50 border border-amber-300 rounded-xl font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold uppercase text-[9px] mb-1">Footer Description</label>
                  <textarea
                    rows={2}
                    value={cms.footer.description}
                    onChange={(e) => setCms({ ...cms, footer: { ...cms.footer, description: e.target.value } })}
                    className="w-full p-2.5 bg-amber-50/50 border border-amber-300 rounded-xl font-medium"
                  />
                </div>
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
};
