import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { HomepageCMS } from '../models/HomepageCMS';
import { AuditLog } from '../models/AuditLog';
import { emitRealtimeEvent } from '../config/socket';
import { uploadImageToCloudinary } from '../utils/cloudinary';

const createAuditLog = async (req: Request, action: string, details: string, targetId?: string) => {
  try {
    await AuditLog.create({
      adminName: (req as any).user?.name || 'Admin',
      module: 'HOMEPAGE_CMS',
      action: action,
      newValue: details,
      ipAddress: req.ip || '127.0.0.1',
    });
  } catch (err) {
    console.error('[AuditLog Error]', err);
  }
};

// Default Seed Configuration for 13 Homepage CMS Sections
const getDefaultCMSData = () => ({
  announcementBar: {
    text: '✨ FESTIVAL SPECIAL: USE CODE ROYAL10 FOR 10% OFF ALL PURE SILK SAREES • FREE EXPRESS SHIPPING ACROSS INDIA ✨',
    scrolling: true,
    bgColor: '#7f1d1d',
    textColor: '#fcd34d',
    enabled: true,
  },
  heroBanner: {
    desktopImage: '/images/saree_banarasi_red.png',
    mobileImage: '/images/saree_banarasi_red.png',
    videoUrl: '',
    title: 'STYLE CLASSIC',
    subtitle: 'HERITAGE HANDLOOM',
    description: "Explore India's most opulent collection of handcrafted Banarasi brocades, heirloom Kanchipuram silk sarees, and delicate floral organza drapes woven by master artisans.",
    primaryButtonText: 'SEE MORE',
    primaryButtonLink: '/shop',
    secondaryButtonText: 'EXPLORE CATALOG',
    secondaryButtonLink: '/shop?category=Kanchipuram Sarees',
    offerBadge: 'ROYAL SAREE COLLECTION 2026',
    ribbonText: 'FESTIVAL SPECIAL',
    enabled: true,
  },
  heroSlides: [
    {
      id: 'hs-1',
      offerBadge: 'ROYAL SAREE COLLECTION 2026',
      subtitle: 'HERITAGE HANDLOOM',
      title: 'STYLE CLASSIC',
      description: "Explore India's most opulent collection of handcrafted Banarasi brocades, heirloom Kanchipuram silk sarees, and delicate floral organza drapes woven by master artisans.",
      primaryButtonText: 'SEE MORE',
      primaryButtonLink: '/shop',
      secondaryButtonText: 'EXPLORE CATALOG',
      secondaryButtonLink: '/shop?category=Kanchipuram Sarees',
      image: '/images/saree_hero_editorial_right_seated.png',
      status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
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
      image: '/images/saree_palace_courtyard_trio.jpg',
      status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
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
      image: '/images/saree_palace_courtyard_trio.jpg',
      status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
      displayOrder: 3,
    },
  ],
  featuredCategories: [
    {
      id: 'cat-1',
      name: 'Modern Lightweight Organza Floral',
      image: '/images/saree_organza_floral.png',
      description: 'Ultra-lightweight sheer silk drapes with hand-painted floral embellishments.',
      buttonText: 'EXPLORE ORGANZA',
      buttonLink: '/shop?category=Organza Sarees',
      status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
      displayOrder: 1,
    },
    {
      id: 'cat-2',
      name: 'Fancy Tissue Zari Shimmer Saree',
      image: '/images/saree_kanchipuram_gold.png',
      description: 'Glistening metallic zari tissue drape designed for modern partywear glamour.',
      buttonText: 'EXPLORE TISSUE SILK',
      buttonLink: '/shop?category=Silk Sarees',
      status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
      displayOrder: 2,
    },
    {
      id: 'cat-3',
      name: 'Royal Crimson Banarasi Partywear',
      image: '/images/saree_banarasi_red.png',
      description: 'Intricate Varanasi gold zari floral motifs and royal pallu heritage.',
      buttonText: 'EXPLORE BANARASI',
      buttonLink: '/shop?category=Banarasi Sarees',
      status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
      displayOrder: 3,
    },
    {
      id: 'cat-4',
      name: 'Glamour Sequenced Purple Georgette',
      image: '/images/saree_banarasi_purple.png',
      description: 'Contemporary cocktail partywear saree with exquisite sequins work.',
      buttonText: 'EXPLORE GEORGETTE',
      buttonLink: '/shop?category=Designer Sarees',
      status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
      displayOrder: 4,
    },
    {
      id: 'cat-5',
      name: 'Handwoven Peacock Paithani Silk',
      image: '/images/saree_paithani_green.png',
      description: 'Maharashtrian pure silk sarees featuring rich peacock motif zari pallus.',
      buttonText: 'EXPLORE PAITHANI',
      buttonLink: '/shop?category=Paithani Sarees',
      status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
      displayOrder: 5,
    },
  ],
  featuredCollections: [
    {
      id: 'col-1',
      name: 'Banarasi Zari Brocade Collection',
      subtitle: 'Editorial Lookbook Tile 1',
      image: '/images/saree_banarasi_red.png',
      description: 'Intricate Varanasi gold zari brocade heritage weave.',
      buttonText: 'Explore',
      buttonLink: '/shop?category=Banarasi Sarees',
      displayOrder: 1,
    },
    {
      id: 'col-2',
      name: 'Kanchipuram Temple Border',
      subtitle: 'Editorial Lookbook Tile 2',
      image: '/images/saree_kanchipuram_gold.png',
      description: 'South Indian mulberry silk with pure temple zari border.',
      buttonText: 'Explore',
      buttonLink: '/shop?category=Kanchipuram Sarees',
      displayOrder: 2,
    },
    {
      id: 'col-3',
      name: 'LUXURY SILK SAREES',
      subtitle: "EDITOR'S CHOICE - Large Featured Tile 3",
      image: '/images/saree_banarasi_purple.png',
      description: 'Discover handcrafted mulberry silk sarees & heirloom zari drapes.',
      buttonText: 'SHOP SILK COLLECTION',
      buttonLink: '/shop?category=Silk Sarees',
      displayOrder: 3,
    },
    {
      id: 'col-4',
      name: 'Paithani Peacock Pallu',
      subtitle: 'Editorial Lookbook Tile 4',
      image: '/images/saree_paithani_green.png',
      description: 'Maharashtrian pure silk with handwoven peacock motif pallu.',
      buttonText: 'Explore',
      buttonLink: '/shop?category=Paithani Sarees',
      displayOrder: 4,
    },
    {
      id: 'col-5',
      name: 'Scalloped Floral Organza',
      subtitle: 'Editorial Lookbook Tile 5',
      image: '/images/saree_organza_floral.png',
      description: 'Ultra-lightweight organza with scalloped embroidered border.',
      buttonText: 'Explore',
      buttonLink: '/shop?category=Organza Sarees',
      displayOrder: 5,
    },
  ],
  trendingSarees: {
    title: 'DIVE INTO A WORLD OF ENDLESS SAREE POSSIBILITIES',
    subtitle: 'FEATURED SAREE COLLECTION • SELECT ANY CARD TO CENTER IT',
    productIds: [],
    layout: 'carousel',
    maxItems: 6,
    enabled: true,
  },
  newArrivals: {
    title: 'NEW SAREE ARRIVALS',
    subtitle: 'Freshly Woven Artisan Sarees Added Today',
    productIds: [],
    maxItems: 8,
    enabled: true,
  },
  bestSellers: {
    title: 'MOST LOVED HERITAGE SAREES',
    bannerImage: '/images/saree_kanchipuram_gold.png',
    productIds: [],
    enabled: true,
  },
  festivalBanner: {
    title: 'ROYAL FESTIVE SAREE CELL',
    offer: 'FLAT 20% OFF BRIDAL TROUSSEAU',
    image: '/images/saree_kanchipuram_gold.png',
    buttonText: 'CLAIM FESTIVE DISCOUNT',
    buttonLink: '/shop?sort=discount',
    enabled: true,
  },
  testimonials: [
    {
      id: 'test-1',
      customerName: 'Priya Rajvanshi',
      customerImage: '/images/saree_banarasi_red.png',
      rating: 5,
      review: 'The Kanchipuram gold saree I ordered for my wedding was breathtaking. Authentic silk weave and stunning zari quality!',
      location: 'Hyderabad, India',
      status: 'ACTIVE',
    },
    {
      id: 'test-2',
      customerName: 'Ananya Sharma',
      customerImage: '/images/saree_kanchipuram_gold.png',
      rating: 5,
      review: 'EVAN COLLECTIONS is the best luxury saree atelier! Fast shipping and 100% authentic handloom craftsmanship.',
      location: 'Mumbai, India',
      status: 'ACTIVE',
    },
  ],
  instagramGallery: [
    { id: 'insta-1', image: '/images/saree_banarasi_red.png', link: 'https://instagram.com', caption: '#EvanBrocade', status: 'ACTIVE' },
    { id: 'insta-2', image: '/images/saree_kanchipuram_gold.png', link: 'https://instagram.com', caption: '#KanchipuramGold', status: 'ACTIVE' },
    { id: 'insta-3', image: '/images/saree_organza_floral.png', link: 'https://instagram.com', caption: '#FloralOrganza', status: 'ACTIVE' },
    { id: 'insta-4', image: '/images/saree_paithani_green.png', link: 'https://instagram.com', caption: '#PaithaniPeacock', status: 'ACTIVE' },
  ],
  brands: [
    { id: 'b-1', name: 'Banarasi Heritage Guild', logo: '/images/saree_banarasi_red.png', website: '#', priority: 1, status: 'ACTIVE' },
    { id: 'b-2', name: 'Kanchipuram Master Weavers', logo: '/images/saree_kanchipuram_gold.png', website: '#', priority: 2, status: 'ACTIVE' },
  ],
  newsletter: {
    title: 'JOIN EVAN ROYAL SAREE CLUB',
    description: 'Subscribe to receive private previews of new artisanal saree releases & exclusive royal discount coupons.',
    buttonText: 'SUBSCRIBE NOW',
    successMessage: 'Welcome to EVAN Collections! Check your email for code ROYAL10.',
    enabled: true,
  },
  footer: {
    logo: 'EVAN COLLECTIONS',
    description: 'Luxury Indian Saree Fashion Atelier celebrating centuries of Indian artisan weaving heritage.',
    contactPhone: '+91 9490644434',
    contactEmail: 'support@evan.com',
    address: 'Varanasi Weavers Quarter, UP & Jubilee Hills, Hyderabad',
    copyrightText: '© 2026 EVAN COLLECTIONS. All Rights Reserved.',
  },
});

let FALLBACK_CMS_DATA: any = getDefaultCMSData();

// GET /api/homepage
export const getHomepageCMS = async (req: Request, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 1) {
      res.json(FALLBACK_CMS_DATA);
      return;
    }
    let cms = await HomepageCMS.findOne();
    if (!cms) {
      cms = await HomepageCMS.create(getDefaultCMSData());
      console.log('[CMS] Initialized default Homepage CMS document in MongoDB Atlas');
    } else {
      const defaultData = getDefaultCMSData();
      let updated = false;
      if (!cms.featuredCategories || cms.featuredCategories.length < 4 || (cms.featuredCategories[0] && cms.featuredCategories[0].name.includes('Kanchipuram Silk Sarees'))) {
        cms.featuredCategories = defaultData.featuredCategories;
        updated = true;
      }
      if (!cms.featuredCollections || cms.featuredCollections.length < 5) {
        cms.featuredCollections = defaultData.featuredCollections;
        updated = true;
      }
      if (updated) {
        await cms.save().catch(() => {});
      }
    }
    FALLBACK_CMS_DATA = cms;
    res.json(cms);
  } catch (error) {
    res.json(FALLBACK_CMS_DATA);
  }
};

// PUT /api/homepage (Full Update)
export const updateHomepageCMS = async (req: Request, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 1) {
      FALLBACK_CMS_DATA = { ...FALLBACK_CMS_DATA, ...req.body, updatedAt: new Date(), _id: 'fallback-cms-id' };
      emitRealtimeEvent('homepageCMSUpdated', FALLBACK_CMS_DATA);
      res.json(FALLBACK_CMS_DATA);
      return;
    }

    let cms = await HomepageCMS.findOne();
    if (!cms) {
      cms = new HomepageCMS(getDefaultCMSData());
    }

    Object.assign(cms, req.body);
    cms.updatedBy = (req as any).user?.name || 'Admin';
    cms.updatedAt = new Date();

    const saved = await cms.save();

    await createAuditLog(req, 'UPDATE_HOMEPAGE_CMS', 'Updated Homepage CMS settings', String(saved._id));
    emitRealtimeEvent('homepageCMSUpdated', saved);

    res.json(saved);
  } catch (error) {
    FALLBACK_CMS_DATA = { ...FALLBACK_CMS_DATA, ...req.body, updatedAt: new Date(), _id: 'fallback-cms-id' };
    res.json(FALLBACK_CMS_DATA);
  }
};

// PATCH /api/homepage/section/:sectionKey
export const updateHomepageSection = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sectionKey } = req.params;

    if (mongoose.connection.readyState !== 1) {
      (FALLBACK_CMS_DATA as any)[sectionKey] = req.body;
      FALLBACK_CMS_DATA.updatedAt = new Date();
      emitRealtimeEvent('homepageCMSUpdated', FALLBACK_CMS_DATA);
      res.json(FALLBACK_CMS_DATA);
      return;
    }

    let cms = await HomepageCMS.findOne();
    if (!cms) {
      cms = new HomepageCMS(getDefaultCMSData());
    }

    (cms as any)[sectionKey] = req.body;
    cms.updatedBy = (req as any).user?.name || 'Admin';
    cms.updatedAt = new Date();

    const saved = await cms.save();

    await createAuditLog(req, 'UPDATE_HOMEPAGE_SECTION', `Updated homepage section '${sectionKey}'`, String(saved._id));
    emitRealtimeEvent('homepageCMSUpdated', saved);

    res.json(saved);
  } catch (error) {
    const { sectionKey } = req.params;
    (FALLBACK_CMS_DATA as any)[sectionKey] = req.body;
    res.json(FALLBACK_CMS_DATA);
  }
};

// POST /api/homepage/upload
export const uploadCMSAsset = async (req: Request, res: Response): Promise<void> => {
  try {
    const { image } = req.body;
    if (!image) {
      res.status(400).json({ message: 'Image payload is required' });
      return;
    }

    if (image.startsWith('data:image/')) {
      const uploaded = await uploadImageToCloudinary(image, 'evan_homepage_cms');
      res.json({ imageUrl: uploaded.url });
      return;
    }

    res.json({ imageUrl: image });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
