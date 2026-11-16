/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFCF9',
          100: '#FAF6ED',
          200: '#F5ECE0',
          300: '#EBDCCE',
          400: '#DFCAB4',
          500: '#D1B498',
        },
        terracotta: {
          50: '#FDF4F0',
          100: '#FBE8E1',
          200: '#F7D0C2',
          300: '#F0AD98',
          400: '#E47C5E',
          500: '#C85A32', // Primary Terracotta
          600: '#B84A24',
          700: '#9B3C1D',
          800: '#7E321A',
          900: '#672D1A',
        },
        saffron: {
          50: '#FFF8EB',
          100: '#FEEDC7',
          200: '#FEDB8B',
          300: '#FDC44F',
          400: '#FBAD23',
          500: '#E67E22', // Primary Saffron
          600: '#D36915',
          700: '#AF4F13',
          800: '#8C3F16',
          900: '#733516',
        },
        turmeric: {
          50: '#FEFDF0',
          100: '#FDF9D3',
          200: '#FBF0A6',
          300: '#F7E26E',
          400: '#F3D138',
          500: '#E5A93C', // Primary Turmeric
          600: '#CA861D',
          700: '#A16118',
          800: '#834C1A',
          900: '#6E3F1A',
        },
        brass: {
          400: '#D4AF37',
          500: '#C5A059',
          600: '#AA8539',
        },
        sandstone: {
          700: '#544237',
          800: '#3D2F27',
          900: '#2A1F19',
        }
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'warm': '0 4px 20px -2px rgba(184, 74, 36, 0.08), 0 2px 6px -1px rgba(200, 90, 50, 0.04)',
        'warm-lg': '0 10px 30px -4px rgba(184, 74, 36, 0.12), 0 4px 12px -2px rgba(200, 90, 50, 0.06)',
        'warm-xl': '0 20px 40px -6px rgba(184, 74, 36, 0.15)',
        'inset-warm': 'inset 0 2px 4px 0 rgba(184, 74, 36, 0.06)',
      },
      backgroundImage: {
        'jali-subtle': "radial-gradient(#C85A32 0.75px, transparent 0.75px), radial-gradient(#E5A93C 0.75px, #FAF6ED 0.75px)",
      }
    },
  },
  plugins: [],
};
