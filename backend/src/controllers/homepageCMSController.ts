import { Request, Response } from 'express';
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
  featuredCategories: [
    {
      id: 'cat-1',
      name: 'Kanchipuram Silk Sarees',
      image: '/images/saree_kanchipuram_gold.png',
      description: 'Royal South Indian temple zari brocades woven in pure mulberry silk.',
      buttonText: 'EXPLORE KANCHIPURAM',
      buttonLink: '/shop?category=Kanchipuram Sarees',
      status: 'ACTIVE',
      displayOrder: 1,
    },
    {
      id: 'cat-2',
      name: 'Banarasi Brocade Sarees',
      image: '/images/saree_banarasi_red.png',
      description: 'Intricate Varanasi gold zari floral motifs and royal pallu heritage.',
      buttonText: 'EXPLORE BANARASI',
      buttonLink: '/shop?category=Banarasi Sarees',
      status: 'ACTIVE',
      displayOrder: 2,
    },
    {
      id: 'cat-3',
      name: 'Organza Floral Sarees',
      image: '/images/saree_organza_floral.png',
      description: 'Ultra-lightweight sheer silk drapes with hand-painted floral embellishments.',
      buttonText: 'EXPLORE ORGANZA',
      buttonLink: '/shop?category=Organza Sarees',
      status: 'ACTIVE',
      displayOrder: 3,
    },
    {
      id: 'cat-4',
      name: 'Linen Handloom Sarees',
      image: '/images/saree_linen_beige.png',
      description: 'Breathable organic linen sarees designed for minimalist luxury.',
      buttonText: 'EXPLORE LINEN',
      buttonLink: '/shop?category=Linen Sarees',
      status: 'ACTIVE',
      displayOrder: 4,
    },
    {
      id: 'cat-5',
      name: 'Paithani Peacock Sarees',
      image: '/images/saree_paithani_green.png',
      description: 'Maharashtrian pure silk sarees featuring rich peacock motif zari pallus.',
      buttonText: 'EXPLORE PAITHANI',
      buttonLink: '/shop?category=Paithani Sarees',
      status: 'ACTIVE',
      displayOrder: 5,
    },
  ],
  featuredCollections: [
    {
      id: 'col-1',
      name: 'BRIDAL TROUSSEAU HEIRLOOMS',
      subtitle: 'Royal Wedding Collection',
      image: '/images/saree_kanchipuram_gold.png',
      description: 'Heavy gold zari woven bridal sarees designed for modern royalty.',
      buttonText: 'SHOP BRIDAL TROUSSEAU',
      buttonLink: '/shop?category=Bridal Sarees',
      displayOrder: 1,
    },
    {
      id: 'col-2',
      name: 'FESTIVE PAITHANI & ZARI WEAVES',
      subtitle: 'Celebration Collection 2026',
      image: '/images/saree_paithani_green.png',
      description: 'Vibrant handcrafted silk sarees made for grand celebrations.',
      buttonText: 'SHOP FESTIVE WEAVES',
      buttonLink: '/shop?category=Festival Collection',
      displayOrder: 2,
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

// GET /api/homepage
export const getHomepageCMS = async (req: Request, res: Response): Promise<void> => {
  try {
    let cms = await HomepageCMS.findOne();
    if (!cms) {
      cms = await HomepageCMS.create(getDefaultCMSData());
      console.log('[CMS] Initialized default Homepage CMS document in MongoDB Atlas');
    }
    res.json(cms);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// PUT /api/homepage (Full Update)
export const updateHomepageCMS = async (req: Request, res: Response): Promise<void> => {
  try {
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
    res.status(500).json({ message: (error as Error).message });
  }
};

// PATCH /api/homepage/section/:sectionKey
export const updateHomepageSection = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sectionKey } = req.params;
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
    res.status(500).json({ message: (error as Error).message });
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
