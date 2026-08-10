import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Save,
  Plus,
  Trash2,
  Image as ImageIcon,
  Eye,
  Check,
  RefreshCw,
  SlidersHorizontal,
  Layers,
  Award,
  Star,
  Mail,
  Shield,
  MessageSquare,
  UploadCloud,
} from 'lucide-react';
import { api } from '../services/api';
import { showToast } from '../components/ToastContainer';
import { useSocket } from '../context/SocketContext';

// Helper Component for Cloudinary Image Uploads & Image URL Management
interface ImageUploaderControlProps {
  label: string;
  currentUrl: string;
  onUrlChange: (url: string) => void;
  folder?: string;
}

const ImageUploaderControl: React.FC<ImageUploaderControlProps> = ({
  label,
  currentUrl,
  onUrlChange,
}) => {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    showToast(`Uploading image "${file.name}"...`, 'info');

    const reader = new FileReader();
    reader.onloadend = async () => {
      if (typeof reader.result === 'string') {
        try {
          const res = await api.post('/upload', { image: reader.result });
          if (res.data?.imageUrl || res.data?.url) {
            const uploadedUrl = res.data.imageUrl || res.data.url;
            onUrlChange(uploadedUrl);
            showToast('Successfully uploaded image!', 'success');
          } else {
            onUrlChange(reader.result);
            showToast('Image preview loaded', 'info');
          }
        } catch {
          onUrlChange(reader.result);
          showToast('Image preview loaded locally', 'info');
        } finally {
          setUploading(false);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <label className="block text-slate-700 font-bold uppercase text-[9px] tracking-wider">{label}</label>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white p-3 rounded-2xl border border-amber-200 shadow-sm">
        {/* Preview Thumbnail */}
        <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-amber-300 bg-slate-900 flex-shrink-0 group">
          {currentUrl ? (
            <img src={currentUrl} alt="Preview" className="w-full h-full object-cover object-top" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-amber-500 text-[10px]">
              <ImageIcon className="w-6 h-6 mb-1 opacity-50" />
              <span>No Image</span>
            </div>
          )}
          {currentUrl && (
            <button
              type="button"
              onClick={() => onUrlChange('')}
              className="absolute inset-0 bg-slate-950/75 text-red-400 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-xs font-bold"
              title="Remove Image"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* URL Input & Upload Button */}
        <div className="flex-1 w-full space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Paste Image URL or Upload File below..."
              value={currentUrl || ''}
              onChange={(e) => onUrlChange(e.target.value)}
              className="flex-1 p-2.5 bg-amber-50/40 border border-amber-300 rounded-xl font-semibold text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-black rounded-xl cursor-pointer flex items-center gap-1.5 border border-amber-300 shadow-sm transition-all disabled:opacity-50">
              {uploading ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" /> : <UploadCloud className="w-3.5 h-3.5 text-amber-400" />}
              <span>{uploading ? 'UPLOADING IMAGE...' : '📸 UPLOAD IMAGE'}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={handleFileChange}
              />
            </label>
            {currentUrl && (
              <button
                type="button"
                onClick={() => onUrlChange('')}
                className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-800 text-xs font-bold rounded-xl border border-red-300 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const HomepageEditorPage: React.FC = () => {
  const [cms, setCms] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('lookbook');
  const [showLivePreview, setShowLivePreview] = useState(false);
  const { socket } = useSocket();

  const fetchCMS = () => {
    setLoading(true);
    api
      .get('/homepage')
      .then((res) => {
        if (res.data) {
          setCms(res.data);
          try {
            localStorage.setItem('evan_homepage_cms', JSON.stringify(res.data));
          } catch {}
        }
      })
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
      if (updatedCms) {
        setCms(updatedCms);
        try {
          localStorage.setItem('evan_homepage_cms', JSON.stringify(updatedCms));
        } catch {}
      }
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
      if (res.data) {
        setCms(res.data);
        try {
          localStorage.setItem('evan_homepage_cms', JSON.stringify(res.data));
        } catch {}
      }
      showToast('Successfully published Homepage CMS updates live to all customers!', 'success');
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Error publishing Homepage CMS', 'error');
    } finally {
      setSaving(false);
    }
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

  // 9 Modules aligned 1-to-1 with Landing Page layout
  const sidebarModules = [
    { key: 'announcement', label: '1. Announcement Bar', icon: Sparkles },
    { key: 'hero', label: '2. Hero Banner', icon: Layers },
    { key: 'lookbook', label: '3. Editorial Lookbook Gallery (5 Tiles)', icon: Award },
    { key: 'categories', label: '4. 3D Saree Carousel (Featured Cards)', icon: SlidersHorizontal },
    { key: 'arrivals', label: '5. New Saree Arrivals', icon: Star },
    { key: 'testimonials', label: '6. Client Testimonials ("WHAT CLIENTS SAY")', icon: MessageSquare },
    { key: 'brands', label: '7. Partner Brands & Trust Badges', icon: Shield },
    { key: 'newsletter', label: '8. Royal Newsletter Club', icon: Mail },
    { key: 'footer', label: '9. Footer Configuration', icon: Layers },
  ];

  return (
    <div className="bg-[#FAF6F0] text-slate-900 font-sans p-1 sm:p-2 rounded-2xl space-y-3">
      <div className="max-w-7xl mx-auto space-y-3">

        {/* Sleek Single-Line Header Bar */}
        <div className="bg-white py-2 px-3 sm:px-4 rounded-2xl border border-amber-300 shadow-md flex flex-row items-center justify-between gap-3 overflow-x-auto whitespace-nowrap">
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-[9px] font-black uppercase tracking-widest text-amber-800 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-red-700" /> LIVE THEME EDITOR
            </span>
            <h1 className="font-street text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
              🏠 HOMEPAGE CMS EDITOR
            </h1>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">


            <button
              onClick={() => setShowLivePreview(!showLivePreview)}
              className="px-3 py-1.5 bg-amber-100 border border-amber-300 hover:bg-amber-200 text-slate-900 text-[11px] font-black uppercase tracking-wider rounded-xl flex items-center gap-1 shadow-sm"
            >
              <Eye className="w-3.5 h-3.5 text-amber-800" /> {showLivePreview ? 'Hide Preview' : 'Live Preview'}
            </button>

            <button
              onClick={handleSaveCMS}
              disabled={saving}
              className="px-4 py-1.5 bg-red-100 hover:bg-red-200 text-red-950 text-[11px] font-black uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow-sm transition-all border border-red-300 disabled:opacity-50"
            >
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-red-700" /> : <Save className="w-3.5 h-3.5 text-red-700" />}
              <span>SAVE & PUBLISH LIVE</span>
            </button>
          </div>
        </div>

        {/* Editor Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">

          {/* Section Navigation Tabs (Left 4 cols) - Sticky position */}
          <aside className="lg:col-span-4 bg-white p-3.5 rounded-3xl border border-amber-300 shadow-md space-y-2 lg:sticky lg:top-4 z-20">
            <h3 className="text-xs font-black uppercase tracking-widest text-amber-900 px-3 py-2 border-b border-amber-100">
              LANDING PAGE MODULES (9 SECTIONS)
            </h3>
            <div className="space-y-1">
              {sidebarModules.map((item) => {
                const IconComp = item.icon;
                const isActive = activeSection === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveSection(item.key)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                      isActive
                        ? 'bg-amber-100 text-amber-950 border border-amber-300 font-black shadow-sm'
                        : 'text-slate-700 hover:bg-amber-50'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <IconComp className="w-4 h-4 text-amber-700" /> {item.label}
                    </span>
                    {isActive && <Check className="w-4 h-4 text-amber-800" />}
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Active Section Form Editor (Right 8 cols) */}
          <main className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-amber-300 shadow-xl space-y-6">

            {/* MODULE 1: ANNOUNCEMENT BAR */}
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

            {/* MODULE 2: HERO BANNER */}
            {activeSection === 'hero' && (() => {
              const defaultSlides = [
                {
                  id: 'hs-1',
                  offerBadge: cms.heroBanner?.offerBadge || 'ROYAL SAREE COLLECTION 2026',
                  subtitle: cms.heroBanner?.subtitle || 'HERITAGE HANDLOOM',
                  title: cms.heroBanner?.title || 'STYLE CLASSIC',
                  description: cms.heroBanner?.description || "Explore India's most opulent collection of handcrafted Banarasi brocades, heirloom Kanchipuram silk sarees, and delicate floral organza drapes woven by master artisans.",
                  primaryButtonText: cms.heroBanner?.primaryButtonText || 'SEE MORE',
                  primaryButtonLink: cms.heroBanner?.primaryButtonLink || '/shop',
                  secondaryButtonText: cms.heroBanner?.secondaryButtonText || 'EXPLORE CATALOG',
                  secondaryButtonLink: cms.heroBanner?.secondaryButtonLink || '/shop?category=Kanchipuram Sarees',
                  image: cms.heroBanner?.desktopImage || '/images/saree_hero_editorial_right_seated.png',
                  status: 'ACTIVE',
                  displayOrder: 1,
                },
                {
                  id: 'hs-2',
                  offerBadge: 'TRENDING FASHION WEAR 2026',
                  subtitle: 'MODERN DESIGNER DRAPES',
                  title: 'FASHION WEAR',
                  description: 'Discover sleek contemporary silhouettes, lightweight organza & tissue sarees, and modern fusion drapes curated for the trendsetting fashionista.',
                  primaryButtonText: 'EXPLORE FASHION',
                  primaryButtonLink: '/shop?category=Designer Sarees',
                  secondaryButtonText: 'EXPLORE CATALOG',
                  secondaryButtonLink: '/shop',
                  image: '/images/saree_fashion_wear_hero_v3.png',
                  status: 'ACTIVE',
                  displayOrder: 2,
                },
                {
                  id: 'hs-3',
                  offerBadge: 'EXCLUSIVE PARTYWEAR 2026',
                  subtitle: 'CELEBRATION GLAMOUR',
                  title: 'PARTY COLLECTIONS',
                  description: 'Elevate your evening look with opulent sequence work, shimmering tissue zari, vibrant georgettes, and grand festive partywear drapes.',
                  primaryButtonText: 'SHOP PARTYWEAR',
                  primaryButtonLink: '/shop?category=Organza Sarees',
                  secondaryButtonText: 'EXPLORE CATALOG',
                  secondaryButtonLink: '/shop',
                  image: '/images/saree_party_wear_hero_v3.png',
                  status: 'ACTIVE',
                  displayOrder: 3,
                },
              ];

              const currentSlides = (cms.heroSlides && cms.heroSlides.length > 0)
                ? [...cms.heroSlides]
                : defaultSlides;

              const updateSlides = (newSlides: any[]) => {
                const reordered = newSlides.map((s: any, idx: number) => ({ ...s, displayOrder: idx + 1 }));
                setCms({ ...cms, heroSlides: reordered });
              };

              return (
                <div className="space-y-6">
                  {/* Header Bar */}
                  <div className="border-b border-amber-100 pb-3 flex flex-wrap justify-between items-center gap-3">
                    <div>
                      <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest">MODULE 2</span>
                      <h3 className="font-street text-2xl font-black text-slate-900 uppercase">HERO CAROUSEL SLIDES MANAGEMENT</h3>
                      <p className="text-xs text-slate-500 font-semibold">Add, Edit, Reorder, & Upload Images for Landing Page Hero Carousel Slides</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          const newSlide = {
                            id: `hs-${Date.now()}`,
                            offerBadge: 'NEW SAREE COLLECTION 2026',
                            subtitle: 'EXQUISITE HANDLOOM',
                            title: 'NEW SAREE DRAPE',
                            description: 'Explore breathtaking handcrafted luxury sarees woven by master Indian artisans.',
                            primaryButtonText: 'SHOP NOW',
                            primaryButtonLink: '/shop',
                            secondaryButtonText: 'EXPLORE CATALOG',
                            secondaryButtonLink: '/shop',
                            image: '/images/saree_hero_editorial_right_seated.png',
                            status: 'ACTIVE',
                            displayOrder: currentSlides.length + 1,
                          };
                          updateSlides([...currentSlides, newSlide]);
                        }}
                        className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 text-xs font-black uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <Plus className="w-4 h-4 text-amber-700" /> ADD HERO SLIDE
                      </button>
                      <label className="flex items-center gap-2 cursor-pointer bg-amber-100/60 px-3 py-1.5 rounded-xl border border-amber-300">
                        <input
                          type="checkbox"
                          checked={cms.heroBanner?.enabled ?? true}
                          onChange={(e) => setCms({ ...cms, heroBanner: { ...cms.heroBanner, enabled: e.target.checked } })}
                          className="w-4 h-4 accent-red-800 rounded"
                        />
                        <span className="text-xs font-bold text-slate-800 uppercase">Enable Hero Carousel</span>
                      </label>
                    </div>
                  </div>

                  {/* List of Carousel Slides */}
                  <div className="space-y-5">
                    {currentSlides.map((slide: any, idx: number) => (
                      <div key={slide.id || idx} className="p-4 sm:p-5 bg-amber-50/60 rounded-2xl border border-amber-300 space-y-4 shadow-sm text-xs">
                        {/* Slide Card Header */}
                        <div className="flex flex-wrap justify-between items-center border-b border-amber-200 pb-3 gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 bg-amber-100 text-amber-950 border border-amber-300 rounded-lg text-[10px] font-black uppercase tracking-wider">
                              SLIDE #{idx + 1}
                            </span>
                            <span className="font-extrabold text-slate-900 uppercase text-xs">
                              {slide.title || `Slide ${idx + 1}`}
                            </span>
                            <span className={`px-2 py-0.5 text-[9px] font-black rounded uppercase ${
                              slide.status === 'INACTIVE' ? 'bg-red-200 text-red-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {slide.status || 'ACTIVE'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Reorder Buttons */}
                            {idx > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...currentSlides];
                                  const temp = updated[idx - 1];
                                  updated[idx - 1] = updated[idx];
                                  updated[idx] = temp;
                                  updateSlides(updated);
                                }}
                                className="p-1.5 bg-white border border-amber-300 rounded-lg text-slate-700 hover:bg-amber-100 text-[10px] font-bold"
                              >
                                ↑ Move Up
                              </button>
                            )}
                            {idx < currentSlides.length - 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...currentSlides];
                                  const temp = updated[idx + 1];
                                  updated[idx + 1] = updated[idx];
                                  updated[idx] = temp;
                                  updateSlides(updated);
                                }}
                                className="p-1.5 bg-white border border-amber-300 rounded-lg text-slate-700 hover:bg-amber-100 text-[10px] font-bold"
                              >
                                ↓ Move Down
                              </button>
                            )}

                            {/* Status Toggle Button */}
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...currentSlides];
                                updated[idx].status = updated[idx].status === 'INACTIVE' ? 'ACTIVE' : 'INACTIVE';
                                updateSlides(updated);
                              }}
                              className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 text-[10px] font-bold"
                            >
                              {slide.status === 'INACTIVE' ? 'Enable Slide' : 'Disable Slide'}
                            </button>

                            {/* Delete Slide Button */}
                            <button
                              type="button"
                              onClick={() => {
                                const updated = currentSlides.filter((_: any, i: number) => i !== idx);
                                updateSlides(updated);
                              }}
                              className="px-2.5 py-1 bg-red-100 text-red-700 border border-red-300 rounded-lg hover:bg-red-200 font-bold text-[10px] flex items-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </div>
                        </div>

                        {/* Image Uploader Control */}
                        <ImageUploaderControl
                          label={`SLIDE #${idx + 1} HERO IMAGE (UPLOAD FILE OR URL)`}
                          currentUrl={slide.image}
                          onUrlChange={(url) => {
                            const updated = [...currentSlides];
                            updated[idx].image = url;
                            updateSlides(updated);
                          }}
                        />

                        {/* Fields Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-slate-700 font-bold uppercase text-[9px] mb-1">Badge Text (Top Pill)</label>
                            <input
                              type="text"
                              value={slide.offerBadge || ''}
                              onChange={(e) => {
                                const updated = [...currentSlides];
                                updated[idx].offerBadge = e.target.value;
                                updateSlides(updated);
                              }}
                              className="w-full p-2.5 bg-white border border-amber-300 rounded-xl font-bold"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-700 font-bold uppercase text-[9px] mb-1">Subtitle Text</label>
                            <input
                              type="text"
                              value={slide.subtitle || ''}
                              onChange={(e) => {
                                const updated = [...currentSlides];
                                updated[idx].subtitle = e.target.value;
                                updateSlides(updated);
                              }}
                              className="w-full p-2.5 bg-white border border-amber-300 rounded-xl font-bold text-amber-800"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-slate-700 font-bold uppercase text-[9px] mb-1">Slide Title / Headline</label>
                            <input
                              type="text"
                              value={slide.title || ''}
                              onChange={(e) => {
                                const updated = [...currentSlides];
                                updated[idx].title = e.target.value;
                                updateSlides(updated);
                              }}
                              className="w-full p-2.5 bg-white border border-amber-300 rounded-xl font-black uppercase text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-700 font-bold uppercase text-[9px] mb-1">Primary Button Text & Link</label>
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="text"
                                placeholder="Button Text"
                                value={slide.primaryButtonText || ''}
                                onChange={(e) => {
                                  const updated = [...currentSlides];
                                  updated[idx].primaryButtonText = e.target.value;
                                  updateSlides(updated);
                                }}
                                className="w-full p-2.5 bg-white border border-amber-300 rounded-xl font-bold text-xs"
                              />
                              <input
                                type="text"
                                placeholder="/shop?category=..."
                                value={slide.primaryButtonLink || ''}
                                onChange={(e) => {
                                  const updated = [...currentSlides];
                                  updated[idx].primaryButtonLink = e.target.value;
                                  updateSlides(updated);
                                }}
                                className="w-full p-2.5 bg-white border border-amber-300 rounded-xl font-mono text-[11px]"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold uppercase text-[9px] mb-1">Description Paragraph</label>
                          <textarea
                            rows={2}
                            value={slide.description || ''}
                            onChange={(e) => {
                              const updated = [...currentSlides];
                              updated[idx].description = e.target.value;
                              updateSlides(updated);
                            }}
                            className="w-full p-2.5 bg-white border border-amber-300 rounded-xl font-medium text-slate-800"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* MODULE 3: EDITORIAL LOOKBOOK GALLERY (5 TILES) */}
            {activeSection === 'lookbook' && (() => {
              const default5LookbookTiles = [
                { id: 'col-1', name: 'Banarasi Zari Brocade Collection', subtitle: 'Editorial Lookbook Tile 1', image: '/images/saree_banarasi_red.png', description: 'Intricate Varanasi gold zari brocade heritage weave.', buttonText: 'Explore', buttonLink: '/shop?category=Banarasi Sarees', displayOrder: 1 },
                { id: 'col-2', name: 'Kanchipuram Temple Border', subtitle: 'Editorial Lookbook Tile 2', image: '/images/saree_kanchipuram_gold.png', description: 'South Indian mulberry silk with pure temple zari border.', buttonText: 'Explore', buttonLink: '/shop?category=Kanchipuram Sarees', displayOrder: 2 },
                { id: 'col-3', name: 'LUXURY SILK SAREES', subtitle: "EDITOR'S CHOICE - Large Featured Tile 3", image: '/images/saree_banarasi_purple.png', description: 'Discover handcrafted mulberry silk sarees & heirloom zari drapes.', buttonText: 'SHOP SILK COLLECTION', buttonLink: '/shop?category=Silk Sarees', displayOrder: 3 },
                { id: 'col-4', name: 'Paithani Peacock Pallu', subtitle: 'Editorial Lookbook Tile 4', image: '/images/saree_paithani_green.png', description: 'Maharashtrian pure silk with handwoven peacock motif pallu.', buttonText: 'Explore', buttonLink: '/shop?category=Paithani Sarees', displayOrder: 4 },
                { id: 'col-5', name: 'Scalloped Floral Organza', subtitle: 'Editorial Lookbook Tile 5', image: '/images/saree_organza_floral.png', description: 'Ultra-lightweight organza with scalloped embroidered border.', buttonText: 'Explore', buttonLink: '/shop?category=Organza Sarees', displayOrder: 5 },
              ];

              let currentCollections = cms.featuredCollections && cms.featuredCollections.length > 0
                ? [...cms.featuredCollections]
                : [];
              while (currentCollections.length < 5) {
                currentCollections.push(default5LookbookTiles[currentCollections.length]);
              }

              return (
                <div className="space-y-4">
                  <div className="border-b border-amber-100 pb-3 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest">MODULE 3</span>
                      <h3 className="font-street text-2xl font-black text-slate-900 uppercase">EDITORIAL LOOKBOOK GALLERY (5 TILES)</h3>
                      <p className="text-xs text-slate-500 font-semibold">Full image upload & CRUD control for all 5 Lookbook Tiles on the Landing Page</p>
                    </div>
                    <button
                      onClick={() => {
                        const newCol = {
                          id: `col-${Date.now()}`,
                          name: 'New Lookbook Tile',
                          subtitle: 'Editorial Lookbook Tile',
                          image: '/images/saree_banarasi_red.png',
                          description: 'Handcrafted luxury saree weave.',
                          buttonText: 'Explore',
                          buttonLink: '/shop',
                          displayOrder: currentCollections.length + 1,
                        };
                        setCms({ ...cms, featuredCollections: [...currentCollections, newCol] });
                      }}
                      className="px-4 py-2 bg-slate-900 text-amber-300 text-xs font-black uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow"
                    >
                      <Plus className="w-4 h-4" /> ADD TILE
                    </button>
                  </div>

                  <div className="space-y-4">
                    {currentCollections.map((colCard: any, idx: number) => (
                      <div key={colCard.id || idx} className="p-4 bg-amber-50/60 rounded-2xl border border-amber-300 space-y-3 text-xs">
                        <div className="flex justify-between items-center border-b border-amber-200 pb-2">
                          <span className="font-extrabold text-amber-900 uppercase text-[10px]">
                            TILE #{idx + 1} - {colCard.name} {idx === 2 ? '(CENTER LARGE FEATURED TILE)' : ''}
                          </span>
                          <button
                            onClick={() => {
                              const updated = currentCollections.filter((_: any, i: number) => i !== idx);
                              setCms({ ...cms, featuredCollections: updated });
                            }}
                            className="text-red-700 hover:text-red-900 p-1 font-bold flex items-center gap-1"
                          >
                            <Trash2 className="w-4 h-4" /> Delete Tile
                          </button>
                        </div>

                        {/* Image Upload Control with Cloudinary & Thumbnail */}
                        <ImageUploaderControl
                          label={`TILE #${idx + 1} IMAGE ASSET`}
                          currentUrl={colCard.image}
                          onUrlChange={(url) => {
                            const updated = [...currentCollections];
                            updated[idx].image = url;
                            setCms({ ...cms, featuredCollections: updated });
                          }}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <div>
                            <label className="block text-slate-700 font-bold uppercase text-[9px] mb-1">Tile Title / Headline</label>
                            <input
                              type="text"
                              value={colCard.name}
                              onChange={(e) => {
                                const updated = [...currentCollections];
                                updated[idx].name = e.target.value;
                                setCms({ ...cms, featuredCollections: updated });
                              }}
                              className="w-full p-2.5 bg-white border border-amber-300 rounded-xl font-bold"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-700 font-bold uppercase text-[9px] mb-1">Target Category Link</label>
                            <input
                              type="text"
                              placeholder={`/shop?category=${encodeURIComponent(colCard.name)}`}
                              value={colCard.buttonLink || `/shop?category=${encodeURIComponent(colCard.name)}`}
                              onChange={(e) => {
                                const updated = [...currentCollections];
                                updated[idx].buttonLink = e.target.value;
                                setCms({ ...cms, featuredCollections: updated });
                              }}
                              className="w-full p-2.5 bg-white border border-amber-300 rounded-xl font-mono text-[11px]"
                            />
                          </div>
                        </div>

                        {idx === 2 && (
                          <div>
                            <label className="block text-slate-700 font-bold uppercase text-[9px] mb-1">Center Tile Description Text</label>
                            <input
                              type="text"
                              value={colCard.description || ''}
                              onChange={(e) => {
                                const updated = [...currentCollections];
                                updated[idx].description = e.target.value;
                                setCms({ ...cms, featuredCollections: updated });
                              }}
                              className="w-full p-2.5 bg-white border border-amber-300 rounded-xl font-medium"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* MODULE 4: 3D SAREE SELECTION CAROUSEL (FEATURED CARDS) */}
            {activeSection === 'categories' && (
              <div className="space-y-4">
                <div className="border-b border-amber-100 pb-3 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest">MODULE 4</span>
                    <h3 className="font-street text-2xl font-black text-slate-900 uppercase">3D SAREE CAROUSEL (FEATURED CARDS)</h3>
                    <p className="text-xs text-slate-500 font-semibold">Complete CRUD & image upload for all 3D Saree Carousel cards</p>
                  </div>
                  <button
                    onClick={() => {
                      const newCard = {
                        id: `sc-${Date.now()}`,
                        name: 'New Modern Saree Drape',
                        tag: 'TRENDING PARTYWEAR',
                        price: '$140.00 USD',
                        rupeePrice: '₹8,999',
                        image: '/images/saree_organza_floral.png',
                        description: 'Artisanal handwoven saree weave.',
                        buttonText: 'SHOP COLLECTION',
                        buttonLink: '/shop?category=Designer Sarees',
                        status: 'ACTIVE',
                        displayOrder: cms.featuredCategories.length + 1,
                      };
                      setCms({ ...cms, featuredCategories: [...cms.featuredCategories, newCard] });
                    }}
                    className="px-4 py-2 bg-slate-900 text-amber-300 text-xs font-black uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow"
                  >
                    <Plus className="w-4 h-4" /> ADD SAREE CARD
                  </button>
                </div>

                <div className="space-y-4">
                  {cms.featuredCategories.map((card: any, idx: number) => (
                    <div key={card.id || idx} className="p-4 bg-amber-50/60 rounded-2xl border border-amber-300 space-y-3 text-xs">
                      <div className="flex justify-between items-center border-b border-amber-200 pb-2">
                        <span className="font-extrabold text-amber-900 uppercase text-[10px]">
                          SAREE CARD #{idx + 1} - {card.name}
                        </span>
                        <button
                          onClick={() => {
                            const updated = cms.featuredCategories.filter((c: any) => c.id !== card.id);
                            setCms({ ...cms, featuredCategories: updated });
                          }}
                          className="text-red-700 hover:text-red-900 p-1 font-bold flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" /> Delete Card
                        </button>
                      </div>

                      {/* Image Upload Control */}
                      <ImageUploaderControl
                        label={`SAREE CARD #${idx + 1} IMAGE (UPLOAD FILE OR URL)`}
                        currentUrl={card.image}
                        onUrlChange={(url) => {
                          const updated = [...cms.featuredCategories];
                          updated[idx].image = url;
                          setCms({ ...cms, featuredCategories: updated });
                        }}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="block text-slate-700 font-bold uppercase text-[9px] mb-1">Saree Name / Title</label>
                          <input
                            type="text"
                            value={card.name}
                            onChange={(e) => {
                              const updated = [...cms.featuredCategories];
                              updated[idx].name = e.target.value;
                              setCms({ ...cms, featuredCategories: updated });
                            }}
                            className="w-full p-2.5 bg-white border border-amber-300 rounded-xl font-bold text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold uppercase text-[9px] mb-1">Tag / Subtitle</label>
                          <input
                            type="text"
                            value={card.tag || card.name.toUpperCase().replace(' SAREES', '')}
                            onChange={(e) => {
                              const updated = [...cms.featuredCategories];
                              updated[idx].tag = e.target.value;
                              setCms({ ...cms, featuredCategories: updated });
                            }}
                            className="w-full p-2.5 bg-white border border-amber-300 rounded-xl font-extrabold text-amber-800 uppercase"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-slate-700 font-bold uppercase text-[9px] mb-1">USD Price</label>
                          <input
                            type="text"
                            value={card.price || '$160.00 USD'}
                            onChange={(e) => {
                              const updated = [...cms.featuredCategories];
                              updated[idx].price = e.target.value;
                              setCms({ ...cms, featuredCategories: updated });
                            }}
                            className="w-full p-2.5 bg-white border border-amber-300 rounded-xl font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold uppercase text-[9px] mb-1">Rupee Price (INR)</label>
                          <input
                            type="text"
                            value={card.rupeePrice || '₹9,999'}
                            onChange={(e) => {
                              const updated = [...cms.featuredCategories];
                              updated[idx].rupeePrice = e.target.value;
                              setCms({ ...cms, featuredCategories: updated });
                            }}
                            className="w-full p-2.5 bg-white border border-amber-300 rounded-xl font-bold text-red-800"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold uppercase text-[9px] mb-1">Target Shop Link</label>
                          <input
                            type="text"
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

            {/* MODULE 5: NEW SAREE ARRIVALS */}
            {activeSection === 'arrivals' && (
              <div className="space-y-4">
                <div className="border-b border-amber-100 pb-3 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest">MODULE 5</span>
                    <h3 className="font-street text-2xl font-black text-slate-900 uppercase">NEW SAREE ARRIVALS SHOWCASE</h3>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cms.newArrivals?.enabled !== false}
                      onChange={(e) => setCms({ ...cms, newArrivals: { ...cms.newArrivals, enabled: e.target.checked } })}
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
                      value={cms.newArrivals?.title || 'NEW SAREE ARRIVALS'}
                      onChange={(e) => setCms({ ...cms, newArrivals: { ...cms.newArrivals, title: e.target.value } })}
                      className="w-full p-3 bg-amber-50/50 border border-amber-300 rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">Section Subtitle</label>
                    <input
                      type="text"
                      value={cms.newArrivals?.subtitle || 'Freshly Woven Artisan Sarees Added Today'}
                      onChange={(e) => setCms({ ...cms, newArrivals: { ...cms.newArrivals, subtitle: e.target.value } })}
                      className="w-full p-3 bg-amber-50/50 border border-amber-300 rounded-xl font-bold text-amber-800"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 6: CLIENT TESTIMONIALS */}
            {activeSection === 'testimonials' && (
              <div className="space-y-4">
                <div className="border-b border-amber-100 pb-3 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest">MODULE 6</span>
                    <h3 className="font-street text-2xl font-black text-slate-900 uppercase">CLIENT TESTIMONIALS EDITOR</h3>
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
                    <Plus className="w-4 h-4" /> ADD REVIEW
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  {cms.testimonials.map((test: any, idx: number) => (
                    <div key={test.id || idx} className="p-4 bg-amber-50/60 rounded-2xl border border-amber-300 space-y-3">
                      <div className="flex justify-between items-center border-b border-amber-200 pb-2">
                        <span className="font-bold text-slate-900">REVIEW #{idx + 1} - {test.customerName}</span>
                        <button
                          onClick={() => {
                            const updated = cms.testimonials.filter((t: any) => t.id !== test.id);
                            setCms({ ...cms, testimonials: updated });
                          }}
                          className="text-red-700 hover:text-red-900 font-bold flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" /> Delete Review
                        </button>
                      </div>

                      {/* Avatar Image Uploader */}
                      <ImageUploaderControl
                        label="CLIENT AVATAR IMAGE"
                        currentUrl={test.customerImage}
                        onUrlChange={(url) => {
                          const updated = [...cms.testimonials];
                          updated[idx].customerImage = url;
                          setCms({ ...cms, testimonials: updated });
                        }}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-700 font-bold uppercase text-[9px] mb-1">Customer Name</label>
                          <input
                            type="text"
                            value={test.customerName}
                            onChange={(e) => {
                              const updated = [...cms.testimonials];
                              updated[idx].customerName = e.target.value;
                              setCms({ ...cms, testimonials: updated });
                            }}
                            className="w-full p-2.5 bg-white border border-amber-300 rounded-xl font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 font-bold uppercase text-[9px] mb-1">Location</label>
                          <input
                            type="text"
                            value={test.location || 'Mumbai, India'}
                            onChange={(e) => {
                              const updated = [...cms.testimonials];
                              updated[idx].location = e.target.value;
                              setCms({ ...cms, testimonials: updated });
                            }}
                            className="w-full p-2.5 bg-white border border-amber-300 rounded-xl font-bold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold uppercase text-[9px] mb-1">Review Message</label>
                        <textarea
                          rows={2}
                          value={test.review}
                          onChange={(e) => {
                            const updated = [...cms.testimonials];
                            updated[idx].review = e.target.value;
                            setCms({ ...cms, testimonials: updated });
                          }}
                          className="w-full p-2.5 bg-white border border-amber-300 rounded-xl font-medium"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MODULE 7: PARTNER BRANDS & TRUST BADGES */}
            {activeSection === 'brands' && (
              <div className="space-y-4">
                <div className="border-b border-amber-100 pb-3 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest">MODULE 7</span>
                    <h3 className="font-street text-2xl font-black text-slate-900 uppercase">PARTNER BRANDS & TRUST BADGES</h3>
                  </div>
                  <button
                    onClick={() => {
                      const newBrand = {
                        id: `b-${Date.now()}`,
                        name: 'Artisan Guild Partner',
                        logo: '/images/saree_banarasi_red.png',
                        website: '#',
                        priority: cms.brands.length + 1,
                        status: 'ACTIVE',
                      };
                      setCms({ ...cms, brands: [...cms.brands, newBrand] });
                    }}
                    className="px-4 py-2 bg-slate-900 text-amber-300 text-xs font-black uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow"
                  >
                    <Plus className="w-4 h-4" /> ADD BRAND
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  {cms.brands.map((brand: any, idx: number) => (
                    <div key={brand.id || idx} className="p-4 bg-amber-50/60 rounded-2xl border border-amber-300 space-y-3">
                      <div className="flex justify-between items-center border-b border-amber-200 pb-2">
                        <span className="font-bold text-slate-900">BRAND #{idx + 1} - {brand.name}</span>
                        <button
                          onClick={() => {
                            const updated = cms.brands.filter((b: any) => b.id !== brand.id);
                            setCms({ ...cms, brands: updated });
                          }}
                          className="text-red-700 hover:text-red-900 font-bold flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" /> Delete Brand
                        </button>
                      </div>

                      <ImageUploaderControl
                        label="BRAND LOGO ASSET"
                        currentUrl={brand.logo}
                        onUrlChange={(url) => {
                          const updated = [...cms.brands];
                          updated[idx].logo = url;
                          setCms({ ...cms, brands: updated });
                        }}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-700 font-bold uppercase text-[9px] mb-1">Brand Name</label>
                          <input
                            type="text"
                            value={brand.name}
                            onChange={(e) => {
                              const updated = [...cms.brands];
                              updated[idx].name = e.target.value;
                              setCms({ ...cms, brands: updated });
                            }}
                            className="w-full p-2.5 bg-white border border-amber-300 rounded-xl font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 font-bold uppercase text-[9px] mb-1">Website URL</label>
                          <input
                            type="text"
                            value={brand.website || '#'}
                            onChange={(e) => {
                              const updated = [...cms.brands];
                              updated[idx].website = e.target.value;
                              setCms({ ...cms, brands: updated });
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

            {/* MODULE 8: ROYAL NEWSLETTER CLUB */}
            {activeSection === 'newsletter' && (
              <div className="space-y-4 text-xs font-semibold">
                <div className="border-b border-amber-100 pb-3 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest">MODULE 8</span>
                    <h3 className="font-street text-2xl font-black text-slate-900 uppercase">ROYAL NEWSLETTER CLUB</h3>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cms.newsletter?.enabled !== false}
                      onChange={(e) => setCms({ ...cms, newsletter: { ...cms.newsletter, enabled: e.target.checked } })}
                      className="w-4 h-4 accent-red-800 rounded"
                    />
                    <span className="text-xs font-bold text-slate-700 uppercase">Enable Module</span>
                  </label>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">Headline</label>
                  <input
                    type="text"
                    value={cms.newsletter?.title || 'JOIN EVAN ROYAL SAREE CLUB'}
                    onChange={(e) => setCms({ ...cms, newsletter: { ...cms.newsletter, title: e.target.value } })}
                    className="w-full p-3 bg-amber-50/50 border border-amber-300 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={cms.newsletter?.description || ''}
                    onChange={(e) => setCms({ ...cms, newsletter: { ...cms.newsletter, description: e.target.value } })}
                    className="w-full p-3 bg-amber-50/50 border border-amber-300 rounded-xl font-medium"
                  />
                </div>
              </div>
            )}

            {/* MODULE 9: FOOTER CONFIGURATION */}
            {activeSection === 'footer' && (
              <div className="space-y-4 text-xs font-semibold">
                <div className="border-b border-amber-100 pb-3">
                  <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest">MODULE 9</span>
                  <h3 className="font-street text-2xl font-black text-slate-900 uppercase">FOOTER CONFIGURATION</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold uppercase text-[9px] mb-1">Brand Logo Text</label>
                    <input
                      type="text"
                      value={cms.footer?.logo || 'EVAN COLLECTIONS'}
                      onChange={(e) => setCms({ ...cms, footer: { ...cms.footer, logo: e.target.value } })}
                      className="w-full p-2.5 bg-amber-50/50 border border-amber-300 rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold uppercase text-[9px] mb-1">Contact Phone</label>
                    <input
                      type="text"
                      value={cms.footer?.contactPhone || '+91 9490644434'}
                      onChange={(e) => setCms({ ...cms, footer: { ...cms.footer, contactPhone: e.target.value } })}
                      className="w-full p-2.5 bg-amber-50/50 border border-amber-300 rounded-xl font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold uppercase text-[9px] mb-1">Footer Description</label>
                  <textarea
                    rows={2}
                    value={cms.footer?.description || ''}
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
