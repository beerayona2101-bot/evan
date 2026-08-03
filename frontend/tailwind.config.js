/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        amberAccent: '#FACC15', // Vibrant streetwear yellow
        redBadge: '#EF4444',
        brandRed: '#E52E2E',
        obsidian: {
          950: '#F8FAFC', // Base background (Light Slate)
          900: '#FFFFFF', // Card / Modal background (Pure White)
          800: '#F1F5F9', // Secondary surface
          700: '#E2E8F0', // Border subtle
          600: '#CBD5E1', // Border muted
        },
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        condensed: ['"Barlow Condensed"', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
