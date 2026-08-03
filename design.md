# EVAN COLLECTIONS – Luxury Saree Store UI/UX Design System

**Project Name:** EVAN COLLECTIONS  
**Version:** 2.5 (Production Release)  
**Document Type:** UI/UX & Frontend Architecture Specification  
**Application Type:** Premium Luxury Indian Saree & Ethnic Atelier Web Application  
**Target Audience:** Connoisseurs of authentic Indian silk handlooms, brides, saree collectors, and heritage ethnic fashion shoppers.

---

# 1. Design Vision & Philosophy

EVAN COLLECTIONS is an ultra-premium luxury saree e-commerce brand designed to provide an opulent Indian heritage shopping experience through royal typography, silk texture imagery, golden glassmorphic elements, 3D stacked product presentation, and fluid micro-animations.

The design feels like browsing a high-end luxury saree atelier (drawing aesthetic inspiration from premier Indian fashion houses like Taneira, Nalli, and Kankatala).

### Core Design Principles
- **Heritage Luxury First**: Royal Indian aesthetic with heavy gold accents, zari weave textures, and crimson maroon tones.
- **Editorial Saree Atelier Style**: High-density craftsmanship details, fabric purity badges (Silk Mark), and structured saree specifications.
- **Opulent Canvas & Glassmorphic Elevation**: Layering ivory background canvas (`#FFFDF9`) with translucent frosted pill navigation, subtle gold borders, and soft shadows.
- **Responsive & Mobile-First**: Flawless experience across mobile drawers, desktop floating navigation, interactive modals, and touch carousels.
- **AI-Enhanced Shopping Suite**: Embedded AI Stylist Assistant, Voice Search, AI Saree Drape & Blouse Size Calculator, and Virtual Try-On simulation.

---

# 2. Brand Identity

## Brand Name & Logo Emblem
- **Name**: **EVAN COLLECTIONS**
- **Tagline**: **Heritage Silk. Royal Elegance.**
- **Emblem**: Circular emblem with a Crimson-to-Maroon gradient (`from-red-700 to-red-900`), bordered in Temple Gold with a sharp bold capital **"E"** mark.

## Brand Personality & Palette Summary
- **Royal Crimson & Maroon** (`#6B1D2F` / `bg-red-800`): Primary CTA buttons, logo badge, offer highlights.
- **Luxury Temple Gold** (`#D4AF37` / `#FACC15`): Ratings, borders, offer pills, shimmers, and decorative badges.
- **Emerald Heritage Green** (`#064E3B`): Silk Mark authenticity badges and craftsmanship tags.
- **Royal Silk Purple** (`#4C1D95`): Festive and bridal collection highlights.
- **Royal Ivory Base** (`#FFFDF9` / `#FAF6F0`): Clean luxury canvas and background surfaces.

---

# 3. Color Palette & Design Tokens

## Primary Canvas Colors

| Token / Name | Hex Code / Utility Class | Application / Purpose |
|--------------|-------------------------|-----------------------|
| Royal Ivory Base | `#FFFDF9` | Main application backdrop (`bg-[#fffdf9]`) |
| Atelier Pure White | `#FFFFFF` | Product cards, surface elevated containers, modals |
| Soft Linen Beige | `#FAF6F0` | Secondary surface cards, hover backgrounds, scrollbar track |
| Subtle Gold Border | `#F0E6D6` / `rgba(212,175,55,0.3)` | Card borders, dividers, subtle card outline |

---

## Accent & Heritage Colors

| Token / Name | Hex Code / Utility Class | Application / Purpose |
|--------------|-------------------------|-----------------------|
| Temple Gold Accent | `#D4AF37` / `text-amber-400` / `#FACC15` | Badges, offer highlights, rating stars, hover borders |
| Royal Crimson Maroon | `#6B1D2F` / `bg-red-800` / `from-red-700 to-red-900` | Primary action CTAs, logo emblem, badge backgrounds |
| Emerald Heritage Green | `#064E3B` | Pure Silk & Craftsmanship pills, Silk Mark guarantee badges |
| Royal Silk Purple | `#4C1D95` | Festive collection highlights, special curation tags |
| Slate Obsidian Charcoal | `#1E1B18` / `#0F172A` | Primary typography, high-contrast titles and headings |

---

## Elevation, Glassmorphism & Shadow Tokens

- **Pill Floating Navbar (`.pill-navbar`)**:
  - `background`: `rgba(255, 253, 249, 0.94)`
  - `backdrop-filter`: `blur(18px)`
  - `box-shadow`: `0 10px 30px rgba(107, 29, 47, 0.08)`
  - `border`: `1px solid rgba(212, 175, 55, 0.3)`
- **Saree Card Hover Elevation (`.saree-card:hover`)**:
  - `transform`: `translateY(-6px)`
  - `box-shadow`: `0 20px 40px rgba(107, 29, 47, 0.12)`
  - `border-color`: `#d4af37`
- **Gold Shimmer Gradient (`.gold-shimmer-bg`)**:
  - `background`: `linear-gradient(135deg, #fffdf9 0%, #fcf6ea 50%, #f5ebe0 100%)`
- **Gold Border Glow (`.gold-border-glow`)**:
  - `border`: `1.5px solid #d4af37`
  - `box-shadow`: `0 0 15px rgba(212, 175, 55, 0.2)`
- **Custom Scrollbar Theme**:
  - Track: `#FAF6F0`
  - Thumb: `#D4AF37` (hover: `#6B1D2F`)

---

# 4. Typography Hierarchy

## Font Families
- **Display & Heritage Headings**: `Cinzel`, `Playfair Display`, `Bebas Neue`
  - `.font-serif-luxury`: `font-family: 'Cinzel', 'Playfair Display', serif; letter-spacing: 0.04em;`
  - `.font-street`: `font-family: 'Bebas Neue', 'Cinzel', serif; letter-spacing: 0.06em;`
- **Body & Technical Saree Specs**: `Inter`, `Plus Jakarta Sans`, `Barlow Condensed`
  - `.font-condensed-bold`: `font-family: 'Barlow Condensed', sans-serif; font-weight: 800; text-transform: uppercase;`

## Typographic Scale & Application
- **Hero / Main Title**: `36px - 48px` (`text-4xl / text-5xl`), bold Cinzel serif.
- **Section Titles**: `24px - 32px` (`text-2xl / text-3xl`), font-serif-luxury with gold line accents.
- **Product Names**: `12px - 14px` (`text-xs / text-sm`), line-clamp-1, font-serif-luxury.
- **Technical Specs & Pricing**: `12px - 14px`, `font-extrabold` in Crimson Maroon for INR (`₹`) display.
- **Badges & Micro Pills**: `8px - 10px`, uppercase, bold black font, 0.25em tracking.

---

# 5. Component Architecture & Micro-Interactions

## 1. Pill Navigation Bar (`Navbar.tsx`)
- **Layout**: Floating rounded-full glassmorphic container (`sticky top-0 z-50`).
- **Brand Mark**: `E` monogram in gold inside a crimson circular gradient.
- **Navigation Links**: HOME, COLLECTIONS, ABOUT US, CONTACT US, FAQS, OFFERS (with sparkle icon).
- **Interactive Controls**:
  - **Voice Search Modal Trigger**: Microphone icon activating Speech API.
  - **Dropdown Search Bar**: Slide-down search input with real-time product query navigation.
  - **Wishlist Counter**: Badge showing count of saved sarees.
  - **Cart Counter**: Red badge with gold border displaying total cart count.
  - **Profile Menu**: User avatar dropdown leading to Account, Orders, or Admin Dashboard.

## 2. Saree Product Card Component (`ProductCard.tsx`)
- **Image Aspect Ratio**: `aspect-[4/5]` frame with smooth zoom (`scale-105`) on hover.
- **Hover Image Swap**: Dual image preview switching from main saree shot to detail pallu/blouse shot.
- **Badges Overlay**:
  - `PURE SILK` / `HANDLOOM` badge in Crimson Maroon with gold border.
  - Discount tag displaying `% OFF` in gold.
- **Quick Wishlist Action**: Floating glassmorphic heart icon with active fill state.
- **Saree Info & Pricing**: Fabric category, product title in luxury serif, gold star rating, MRP strike-through, and final price in ₹ (INR).
- **Primary CTA**: Full-width button "ADD TO BAG" (`bg-slate-900 hover:bg-red-800 text-amber-300`).

## 3. 3D Cylindrical Saree Carousel (`HomePage.tsx`)
- Interactive 3D stacked rotational carousel built using CSS `perspective: 1000px` and `transform-style: preserve-3d`.
- Rotates cards representing signature saree lines (Royal Crimson Banarasi, Mustard Gold Kanchipuram, Pastel Floral Organza, Handloom Linen) with depth offset and active highlight styling.

## 4. AI Fashion & Stylist Assistant (`AIFashionAssistant.tsx`)
- Floating widget button with animated sparkle effects.
- Slide-over chat interface offering personalized styling advice.
- Quick prompt buttons ("What should I wear to a luxury rooftop event?", "Suggest an oversized saree look").
- Renders product recommendation cards directly in chat messages with instant "Add to Bag" action.

## 5. AI Size & Drape Calculator (`AISizeCalculator.tsx`)
- Interactive modal calculating drape specifications based on height, waist, and bust dimensions.
- Returns customized guidance on pleat count, petticoat fit, saree drape style, and blouse sizing.

## 6. Voice Search Modal (`VoiceSearchModal.tsx`)
- Web Speech API integration allowing hands-free search queries (e.g., "Find crimson Banarasi silk saree for wedding").

## 7. Virtual Try-On Modal (`VirtualTryOnModal.tsx`)
- Enables customers to upload personal photos to simulate saree drape and color compatibility.

## 8. Footer & Trust Guarantee Bar (`Footer.tsx`)
- **Trust Pillars**:
  - `100% PURE SILK MARK` (Certified Authentic Handlooms)
  - `FREE EXPRESS SHIPPING` (Insured Delivery Across India)
  - `7-DAY HASSLE RETURN` (Easy Returns & Exchanges)
  - `WEAVER DIRECT CRAFT` (Supporting Traditional Artisans)
- Includes newsletter subscription box, brand bio, quick links, customer support details, and payment icons.

---

# 6. Page Layouts & Customer Journeys

### 1. Home Page (`HomePage.tsx`)
- Hero Announcement Bar with ticker message.
- Full-width hero banner with luxury typography and primary CTA buttons.
- 3D Stacked Saree Cylinder Showcase.
- Heritage Craft Curation Grid (Banarasi, Kanchipuram, Organza, Linen, Chanderi).
- Live Featured Products slider integrated with backend API.
- Craftsmanship Storytelling section highlighting traditional weaver heritage.
- Customer Testimonials & Reviews.

### 2. Shop & Collections Page (`ShopPage.tsx`)
- Multi-filter sidebar: Fabric (Banarasi, Kanchipuram, Organza, Linen), Price Slider, Occasion, Border Zari Type.
- Active filter pill badges with single-click removal.
- Grid / List view toggle and sorting menu (Newest, Price Low-to-High, Price High-to-Low, Best Sellers).

### 3. Product Detail Page (`ProductDetailPage.tsx`)
- High-resolution thumbnail image gallery with zoom viewer.
- Detailed Saree Technical Specifications Table:
  - Fabric Composition
  - Saree Length (5.5m + 0.8m Blouse)
  - Border Type & Zari Work
  - Pallu Style & Weave Type
  - Wash Care Instructions
- Custom Blouse Stitching options (Unstitched Blouse Piece vs. Custom Tailored Blouse).
- Direct triggers for AI Drape Calculator & Virtual Try-On.
- Ratings & Customer Reviews section.

### 4. Cart & Checkout Flow (`CartPage.tsx`, `CheckoutPage.tsx`, `OrderSuccessPage.tsx`)
- Cart drawer/page with quantity adjustment, custom stitching selections, and gift wrapping option.
- Coupon code application section.
- Multi-step checkout with shipping address manager and payment gateway selection (Razorpay, UPI, COD, Credit/Debit).
- Order Success celebration screen featuring festive confetti and downloadable invoice summary.

### 5. Customer Dashboard (`CustomerDashboardPage.tsx`)
- Personal Profile details and saved delivery addresses.
- Order History with live status timeline tracking (Pending -> Processing -> Shipped -> Delivered).
- Saved Wishlist collection.

### 6. Admin Atelier Panel (`AdminDashboardPage.tsx`)
- Standalone sidebar layout (hides standard consumer navbar for clean management).
- Analytics overview cards: Total Revenue, Total Orders, Active Saree Catalog, Customer Count.
- Full Saree Catalog CRUD: Manage name, fabric, zari border, blouse specs, stock level, price, MRP, images.
- Order status fulfillment pipeline.
- AI Product Description Generator for generating royal promotional copy.

---

# 7. Technical Implementation Details & SEO Best Practices

- **Styling Architecture**: Tailwind CSS with extended theme tokens, custom CSS keyframes (`index.css`), glassmorphism utilities, and HSL/Hex color palette.
- **Typography Integration**: Google Fonts (`Cinzel`, `Playfair Display`, `Bebas Neue`, `Barlow Condensed`, `Inter`).
- **Semantic HTML5**: Native semantic markup (`header`, `nav`, `main`, `section`, `article`, `footer`).
- **Accessibility & ARIA**: Descriptive `aria-label` attributes on icon triggers, screen-reader accessible form inputs, keyboard navigation support.
- **Responsive Layout Breakpoints**:
  - Mobile: `<640px` (Drawer navigation, compact grid)
  - Tablet: `768px - 1024px` (2-column product grid)
  - Desktop: `1024px+` (4-column grid, floating pill header, 3D cylindrical rotators)