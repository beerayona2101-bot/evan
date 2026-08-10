const CATEGORY_REALTIME_TITLES: Record<string, string[]> = {
  'Banarasi Sarees': [
    'Kadwa Zari Brocade', 'Tanchoi Silk Brocade', 'Katan Silk Jangla', 'Shikargah Brocade',
    'Pashdhara Floral Zari', 'Minakar Gold Katan', 'Sattir Zari Weave', 'Neelambari Brocade',
    'Rangkat Multicolor Zari', 'Tissue Gold Zari Brocade', 'Gulab Boti Katan', 'Jallam Brocade Silk',
    'Chowkandi Pattern Zari', 'Sona Rupa Zari', 'Real Silver Brocade', 'Kimkhab Royal Brocade',
    'Varanasi Imperial Katan', 'Aab-i-Rawan Chiffon', 'Latifa Floral Jaal', 'Meenakari Mughal Brocade'
  ],
  'Kanchipuram Sarees': [
    'Korvai Temple Zari Border', 'Mubagam Three-Tone Silk', 'Mayilkan Peacock Motif', 'Rudrakshem Heavy Border',
    'Yali Mythical Creature', 'Gopuram Temple Heritage', 'Thazhamboo Rekku Border', 'Veldhari Diagonal Zari',
    'Rettai Pettu Double Border', 'Kuyilkan Cuckoo Eye', 'Muppagam Tri-Color Silk', 'Pavitra Lattice Zari',
    'Kanakkambaram Floral', 'Checkered Kattattam Silk', 'Anna Pakshi Swan Motif', 'Bavani Pattu Kanjivaram'
  ],
  'Organza Sarees': [
    'Floral Hand-Painted Tissue', 'Pastel Sheer Zari Border', 'Digital Print Chanderi', 'Embroidered Pearl Tissue',
    'Glass Tissue Shimmer', 'Gota Patti Accent Sheer', 'Botanical Bloom Tissue', 'Celestial Gold Thread',
    'Rosette Embroidered Silk', 'French Lace Trimmed Sheer', 'Aura Crystal Tissue', 'Monochrome Floral Sheer'
  ],
  'Cotton Sarees': [
    'Mulmul Hand-Block Indigo', 'Chettinad Traditional Checkered', 'Chanderi Suti Zari Border', 'Dhakai Jamdani Fine Weave',
    'Sambalpuri Ikat Handloom', 'Bagh Print Malmal', 'Mangalagiri Nishtula Weave', 'Kotpad Tribal Handloom',
    'Kota Doria Zari Grid', 'Tantra Handwoven Bengal', 'Ajrakh Natural Dye', 'Maheshwari Zari Pattern'
  ],
  'Silk Sarees': [
    'Garad Korial Red Border', 'Swarnachari Mythical Panel', 'Baluchari Epic Story Weave', 'Paithani Peacock Pallu',
    'Patola Double Ikat', 'Mysore Pure Mulberry', 'Tussar Ghicha Raw Weave', 'Muga Golden Assam Weave',
    'Bhagalpuri Handwoven Silk', 'Dharmavaram Heavy Brocade', 'Gadwal Pure Zari', 'Uppada Jamdani Light Weave'
  ]
};

const DEFAULT_TITLES = [
  'Royal Heirloom', 'Ethereal Crimson', 'Vedic Gold', 'Majestic Emerald', 'Opulent Zari',
  'Maharani Nizam', 'Peacock Brocade', 'Palanquin Bridal', 'Chandani Moon', 'Swarna Kanjivaram',
  'Varanasi Heritage', 'Aura Imperial', 'Rajkumari Elegance', 'Kaveri Weave', 'Rudra Empire'
];

export const formatSareeName = (
  name: string,
  category?: string,
  isAdmin: boolean = false,
  productId?: string
): string => {
  let raw = (name || '').trim();

  // 1. Extract Vol number if present (e.g. Vol.9 or Vol.14)
  const volMatch = raw.match(/Vol\.?\s*(\d+)/i);
  let volNum = volMatch ? parseInt(volMatch[1], 10) : 0;
  if (!volNum && productId) {
    const idNumMatch = productId.match(/(\d+)/);
    if (idNumMatch) volNum = parseInt(idNumMatch[1], 10);
  }
  const volStr = volNum ? `Vol.${volNum}` : '';

  // 2. Clean out ALL branding occurrences
  let clean = raw
    .replace(/Kanchanika/gi, '')
    .replace(/EVAN\s+COLLECTIONS/gi, '')
    .replace(/by\s+/gi, '')
    .replace(/Vol\.?\s*\d+/gi, '')
    .trim();

  // 3. Normalize legacy generic prefixes like "Silk Sarees Royal Heirloom" or "Banarasi Sarees Royal Heirloom"
  clean = clean.replace(/^(Banarasi|Kanchipuram|Organza|Cotton|Silk|Linen|Georgette|Chiffon)\s+Sarees\s*/gi, '');
  clean = clean.replace(/^(Banarasi|Kanchipuram|Organza|Cotton|Silk|Linen|Georgette|Chiffon)\s*/gi, '');

  // 4. If clean title is generic (e.g., "Royal Heirloom", "Saree", or empty), supply category-specific distinct name!
  const catKey = category || 'Silk Sarees';
  if (!clean || clean.toLowerCase() === 'royal heirloom' || clean.toLowerCase() === 'saree' || clean.toLowerCase() === 'royal heirloom saree') {
    const titleList = CATEGORY_REALTIME_TITLES[catKey] || DEFAULT_TITLES;
    const idx = (volNum > 0 ? volNum - 1 : 0) % titleList.length;
    clean = titleList[idx];
  }

  // 5. Deduplicate repeated words
  clean = clean.replace(/\bSilk\s+Silk\b/gi, 'Silk');
  clean = clean.replace(/\bSaree\s+Saree\b/gi, 'Saree');
  clean = clean.replace(/\b(\w+)\s+\1\b/gi, '$1').trim();

  // 6. Attach Saree type/fabric if not already in clean title
  const catWord = category ? category.replace(/Sarees/gi, '').trim() : 'Silk';
  if (!clean.toLowerCase().includes(catWord.toLowerCase())) {
    clean = `${clean} ${catWord}`;
  }

  // 7. Ensure "Saree" is at the end
  if (!/Saree/i.test(clean)) {
    clean = `${clean} Saree`;
  }

  clean = clean.replace(/\s+/g, ' ').trim();

  // 8. Append Vol.X ONLY for admin users
  if (isAdmin && volStr) {
    clean = `${clean} ${volStr}`;
  }

  return `${clean} by Kanchanika`;
};
