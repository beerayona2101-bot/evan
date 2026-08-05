import mongoose, { Schema, Document } from 'mongoose';

export interface ICategoryCard {
  id: string;
  name: string;
  image: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  status: 'ACTIVE' | 'INACTIVE';
  displayOrder: number;
}

export interface ICollectionCard {
  id: string;
  name: string;
  subtitle: string;
  image: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  displayOrder: number;
}

export interface ITestimonial {
  id: string;
  customerName: string;
  customerImage: string;
  rating: number;
  review: string;
  location: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface IInstagramItem {
  id: string;
  image: string;
  link: string;
  caption: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface IBrandItem {
  id: string;
  name: string;
  logo: string;
  website: string;
  priority: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface IHeroSlide {
  id: string;
  offerBadge: string;
  subtitle: string;
  title: string;
  description: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;
  image: string;
  status: 'ACTIVE' | 'INACTIVE';
  displayOrder: number;
}

export interface IHomepageCMS extends Document {
  announcementBar: {
    text: string;
    scrolling: boolean;
    bgColor: string;
    textColor: string;
    enabled: boolean;
  };
  heroBanner: {
    desktopImage: string;
    mobileImage: string;
    videoUrl: string;
    title: string;
    subtitle: string;
    description: string;
    primaryButtonText: string;
    primaryButtonLink: string;
    secondaryButtonText: string;
    secondaryButtonLink: string;
    offerBadge: string;
    ribbonText: string;
    enabled: boolean;
  };
  heroSlides: IHeroSlide[];
  featuredCategories: ICategoryCard[];
  featuredCollections: ICollectionCard[];
  trendingSarees: {
    title: string;
    subtitle: string;
    productIds: string[];
    layout: 'carousel' | 'grid';
    maxItems: number;
    enabled: boolean;
  };
  newArrivals: {
    title: string;
    subtitle: string;
    productIds: string[];
    maxItems: number;
    enabled: boolean;
  };
  bestSellers: {
    title: string;
    bannerImage: string;
    productIds: string[];
    enabled: boolean;
  };
  festivalBanner: {
    title: string;
    offer: string;
    image: string;
    buttonText: string;
    buttonLink: string;
    enabled: boolean;
  };
  testimonials: ITestimonial[];
  instagramGallery: IInstagramItem[];
  brands: IBrandItem[];
  newsletter: {
    title: string;
    description: string;
    buttonText: string;
    successMessage: string;
    enabled: boolean;
  };
  footer: {
    logo: string;
    description: string;
    contactPhone: string;
    contactEmail: string;
    address: string;
    copyrightText: string;
  };
  updatedBy?: string;
  updatedAt?: Date;
}

const CategoryCardSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  description: { type: String, default: '' },
  buttonText: { type: String, default: 'EXPLORE WEAVES' },
  buttonLink: { type: String, default: '/shop' },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  displayOrder: { type: Number, default: 0 },
});

const CollectionCardSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  subtitle: { type: String, default: '' },
  image: { type: String, required: true },
  description: { type: String, default: '' },
  buttonText: { type: String, default: 'VIEW COLLECTION' },
  buttonLink: { type: String, default: '/shop' },
  displayOrder: { type: Number, default: 0 },
});

const TestimonialSchema = new Schema({
  id: { type: String, required: true },
  customerName: { type: String, required: true },
  customerImage: { type: String, default: '/images/saree_banarasi_red.png' },
  rating: { type: Number, default: 5 },
  review: { type: String, required: true },
  location: { type: String, default: 'Mumbai, India' },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
});

const InstagramItemSchema = new Schema({
  id: { type: String, required: true },
  image: { type: String, required: true },
  link: { type: String, default: 'https://instagram.com' },
  caption: { type: String, default: '' },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
});

const BrandItemSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  logo: { type: String, required: true },
  website: { type: String, default: '#' },
  priority: { type: Number, default: 0 },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
});

const HeroSlideSchema = new Schema({
  id: { type: String, required: true },
  offerBadge: { type: String, default: 'ROYAL SAREE COLLECTION 2026' },
  subtitle: { type: String, default: 'HERITAGE HANDLOOM' },
  title: { type: String, default: 'STYLE CLASSIC' },
  description: { type: String, default: "Explore India's most opulent collection of handcrafted Banarasi brocades, heirloom Kanchipuram silk sarees, and delicate floral organza drapes woven by master artisans." },
  primaryButtonText: { type: String, default: 'SEE MORE' },
  primaryButtonLink: { type: String, default: '/shop' },
  secondaryButtonText: { type: String, default: 'EXPLORE CATALOG' },
  secondaryButtonLink: { type: String, default: '/shop?category=Kanchipuram Sarees' },
  image: { type: String, required: true },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  displayOrder: { type: Number, default: 0 },
});

const HomepageCMSSchema = new Schema<IHomepageCMS>(
  {
    announcementBar: {
      text: { type: String, default: '✨ FESTIVAL SPECIAL: USE CODE ROYAL10 FOR 10% OFF ALL PURE SILK SAREES • FREE EXPRESS SHIPPING ACROSS INDIA ✨' },
      scrolling: { type: Boolean, default: true },
      bgColor: { type: String, default: '#7f1d1d' },
      textColor: { type: String, default: '#fcd34d' },
      enabled: { type: Boolean, default: false },
    },
    heroBanner: {
      desktopImage: { type: String, default: '/images/saree_banarasi_red.png' },
      mobileImage: { type: String, default: '/images/saree_banarasi_red.png' },
      videoUrl: { type: String, default: '' },
      title: { type: String, default: 'STYLE CLASSIC' },
      subtitle: { type: String, default: 'HERITAGE HANDLOOM' },
      description: { type: String, default: "Explore India's most opulent collection of handcrafted Banarasi brocades, heirloom Kanchipuram silk sarees, and delicate floral organza drapes woven by master artisans." },
      primaryButtonText: { type: String, default: 'SEE MORE' },
      primaryButtonLink: { type: String, default: '/shop' },
      secondaryButtonText: { type: String, default: 'EXPLORE CATALOG' },
      secondaryButtonLink: { type: String, default: '/shop?category=Kanchipuram Sarees' },
      offerBadge: { type: String, default: 'ROYAL SAREE COLLECTION 2026' },
      ribbonText: { type: String, default: 'FESTIVAL SPECIAL' },
      enabled: { type: Boolean, default: true },
    },
    heroSlides: [HeroSlideSchema],
    featuredCategories: [CategoryCardSchema],
    featuredCollections: [CollectionCardSchema],
    trendingSarees: {
      title: { type: String, default: 'DIVE INTO A WORLD OF ENDLESS SAREE POSSIBILITIES' },
      subtitle: { type: String, default: 'FEATURED SAREE COLLECTION • SELECT ANY CARD TO CENTER IT' },
      productIds: [{ type: String }],
      layout: { type: String, enum: ['carousel', 'grid'], default: 'carousel' },
      maxItems: { type: Number, default: 6 },
      enabled: { type: Boolean, default: true },
    },
    newArrivals: {
      title: { type: String, default: 'NEW SAREE ARRIVALS' },
      subtitle: { type: String, default: 'Freshly Woven Artisan Sarees Added Today' },
      productIds: [{ type: String }],
      maxItems: { type: Number, default: 8 },
      enabled: { type: Boolean, default: true },
    },
    bestSellers: {
      title: { type: String, default: 'MOST LOVED HERITAGE SAREES' },
      bannerImage: { type: String, default: '/images/saree_kanchipuram_gold.png' },
      productIds: [{ type: String }],
      enabled: { type: Boolean, default: true },
    },
    festivalBanner: {
      title: { type: String, default: 'ROYAL FESTIVE SAREE CELL' },
      offer: { type: String, default: 'FLAT 20% OFF BRIDAL TROUSSEAU' },
      image: { type: String, default: '/images/saree_kanchipuram_gold.png' },
      buttonText: { type: String, default: 'CLAIM FESTIVE DISCOUNT' },
      buttonLink: { type: String, default: '/shop?sort=discount' },
      enabled: { type: Boolean, default: true },
    },
    testimonials: [TestimonialSchema],
    instagramGallery: [InstagramItemSchema],
    brands: [BrandItemSchema],
    newsletter: {
      title: { type: String, default: 'JOIN EVAN ROYAL SAREE CLUB' },
      description: { type: String, default: 'Subscribe to receive private previews of new artisanal saree releases & exclusive royal discount coupons.' },
      buttonText: { type: String, default: 'SUBSCRIBE NOW' },
      successMessage: { type: String, default: 'Welcome to EVAN Collections! Check your email for code ROYAL10.' },
      enabled: { type: Boolean, default: true },
    },
    footer: {
      logo: { type: String, default: 'EVAN COLLECTIONS' },
      description: { type: String, default: 'Luxury Indian Saree Fashion Atelier celebrating centuries of Indian artisan weaving heritage.' },
      contactPhone: { type: String, default: '+91 9490644434' },
      contactEmail: { type: String, default: 'support@evan.com' },
      address: { type: String, default: 'Varanasi Weavers Quarter, UP & Jubilee Hills, Hyderabad' },
      copyrightText: { type: String, default: '© 2026 EVAN COLLECTIONS. All Rights Reserved.' },
    },
    updatedBy: { type: String, default: 'Admin' },
  },
  { timestamps: true }
);

export const HomepageCMS = mongoose.model<IHomepageCMS>('HomepageCMS', HomepageCMSSchema);
