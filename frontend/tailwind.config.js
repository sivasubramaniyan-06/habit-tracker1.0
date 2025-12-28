/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sheet: {
          bg: '#FFFFFF',   // Updated to Pure White
          header: '#E3F2FD', // Light Excel Blue
          active: '#90CAF9', // Filled cell
          border: '#CBD5E0', // Crisp Grey-Blue
          text: '#1E293B',   // Slate 800
          secondary: '#64748B' // Slate 500
        }
      },
      gridTemplateColumns: {
        'sheet': '250px repeat(31, minmax(32px, 1fr)) 300px',
      }
    },
  },
  plugins: [],
}
