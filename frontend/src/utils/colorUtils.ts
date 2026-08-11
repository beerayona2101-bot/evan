/**
 * Color Utilities for EVAN COLLECTIONS
 * Converts HEX color codes into human-readable color names for Saree variants.
 */

interface ColorDictionaryEntry {
  name: string;
  hex: string;
  rgb: [number, number, number];
}

const COLOR_DICTIONARY: ColorDictionaryEntry[] = [
  { name: 'Royal Crimson Red', hex: '#990000', rgb: [153, 0, 0] },
  { name: 'Deep Maroon', hex: '#800000', rgb: [128, 0, 0] },
  { name: 'Deep Burgundy', hex: '#7B1E1E', rgb: [123, 30, 30] },
  { name: 'Ruby Red', hex: '#9B111E', rgb: [155, 17, 30] },
  { name: 'Scarlet Red', hex: '#FF2400', rgb: [255, 36, 0] },
  { name: 'Wine Red', hex: '#722F37', rgb: [114, 47, 55] },
  { name: 'Cherry Red', hex: '#D2042D', rgb: [210, 4, 45] },
  
  { name: 'Mustard Gold', hex: '#D4AF37', rgb: [212, 175, 55] },
  { name: 'Imperial Gold', hex: '#FFD700', rgb: [255, 215, 0] },
  { name: 'Antique Brass Gold', hex: '#C5A059', rgb: [197, 160, 89] },
  { name: 'Metallic Copper Gold', hex: '#B87333', rgb: [184, 115, 51] },
  { name: 'Champagne Gold', hex: '#F7E7CE', rgb: [247, 231, 206] },
  
  { name: 'Emerald Green', hex: '#006633', rgb: [0, 102, 51] },
  { name: 'Dark Forest Green', hex: '#006400', rgb: [0, 100, 0] },
  { name: 'Bottle Green', hex: '#004B23', rgb: [0, 75, 35] },
  { name: 'Mint Green', hex: '#98FF98', rgb: [152, 255, 152] },
  { name: 'Olive Green', hex: '#808000', rgb: [128, 128, 0] },
  { name: 'Parrot Green', hex: '#449E48', rgb: [68, 158, 72] },

  { name: 'Peacock Blue', hex: '#003366', rgb: [0, 51, 102] },
  { name: 'Royal Blue', hex: '#4169E1', rgb: [65, 105, 225] },
  { name: 'Navy Blue', hex: '#000080', rgb: [0, 0, 128] },
  { name: 'Sky Turquoise', hex: '#00A86B', rgb: [0, 168, 107] },
  { name: 'Midnight Teal', hex: '#004040', rgb: [0, 64, 64] },

  { name: 'Royal Magenta', hex: '#800080', rgb: [128, 0, 128] },
  { name: 'Royal Purple', hex: '#6A0D91', rgb: [106, 13, 145] },
  { name: 'Plum Violet', hex: '#4B0082', rgb: [75, 0, 130] },
  { name: 'Lavender Violet', hex: '#967BB6', rgb: [150, 123, 182] },

  { name: 'Pastel Blush Pink', hex: '#FFB6C1', rgb: [255, 182, 193] },
  { name: 'Rani Rose Pink', hex: '#E0115F', rgb: [224, 17, 95] },
  { name: 'Magenta Pink', hex: '#FF007F', rgb: [255, 0, 127] },
  { name: 'Coral Peach', hex: '#FF7F50', rgb: [255, 127, 80] },

  { name: 'Ivory Cream White', hex: '#FFFDD0', rgb: [255, 253, 208] },
  { name: 'Off-White Silk', hex: '#F8F8FF', rgb: [248, 248, 255] },
  { name: 'Linen Beige', hex: '#F5F5DC', rgb: [245, 245, 220] },

  { name: 'Midnight Obsidian Black', hex: '#1A1A1A', rgb: [26, 26, 26] },
  { name: 'Jet Black', hex: '#000000', rgb: [0, 0, 0] },
  { name: 'Charcoal Grey', hex: '#36454F', rgb: [54, 69, 79] },
];

function hexToRgb(hex: string): [number, number, number] {
  let c = hex.replace('#', '').trim();
  if (c.length === 3) {
    c = c.split('').map((char) => char + char).join('');
  }
  const num = parseInt(c, 16);
  if (isNaN(num)) return [128, 0, 0];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

/**
 * Returns the closest human-readable Saree color name for a given HEX color string.
 */
export function getColorNameFromHex(hex: string): string {
  if (!hex) return 'Royal Crimson Red';
  const targetRgb = hexToRgb(hex);

  let closestMatch = COLOR_DICTIONARY[0].name;
  let minDistance = Infinity;

  for (const entry of COLOR_DICTIONARY) {
    const dr = targetRgb[0] - entry.rgb[0];
    const dg = targetRgb[1] - entry.rgb[1];
    const db = targetRgb[2] - entry.rgb[2];
    // Euclidean distance in RGB color space
    const distance = Math.sqrt(dr * dr + dg * dg + db * db);

    if (distance < minDistance) {
      minDistance = distance;
      closestMatch = entry.name;
    }
  }

  return closestMatch;
}
