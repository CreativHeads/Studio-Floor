/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        studio: {
          bg: '#F3F3F5',
          card: '#FFFFFF',
          dark: '#111111',
          muted: '#666666',
          border: '#E5E5E7',
          pill: '#EAEAEA',
          pillHover: '#DCDCDC'
        }
      },
      borderRadius: {
        '2.5xl': '1.25rem',
        '3xl': '1.75rem',
        '4xl': '2.25rem',
        '5xl': '2.75rem',
      },
      boxShadow: {
        'neo-sm': '0 2px 10px rgba(0, 0, 0, 0.03)',
        'neo-md': '0 10px 30px rgba(0, 0, 0, 0.05)',
        'neo-lg': '0 20px 40px rgba(0, 0, 0, 0.08)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('tailwindcss-animate'),
  ],
}
