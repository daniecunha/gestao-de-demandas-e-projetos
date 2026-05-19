/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Space Grotesk: headings, numbers, brand — geometric, technical, confident
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        // DM Sans: body, labels, UI text — optically balanced, legible at small sizes
        sans:    ['DM Sans', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        // Layered shadows create physical depth instead of the flat shadow-sm default
        'card':       '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.10), 0 16px 40px rgba(0,0,0,0.07)',
        'sidebar':    '2px 0 16px rgba(0,0,0,0.18)',
      },
      colors: {
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fadeIn 0.25s ease both',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
