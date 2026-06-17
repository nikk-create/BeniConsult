/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: { DEFAULT: '#008751', light: '#e6f5ee', dark: '#006640' },
        secondary: { DEFAULT: '#FCD116', light: '#fffbe6', dark: '#c9940a' },
        accent: { DEFAULT: '#E8112D', light: '#fff0f1', dark: '#b00d23' },
        card: '#ffffff',
        background: '#f4f8f5',
        border: '#e2ece7',
        muted: '#f0f0ec',
        'muted-foreground': '#6b7280',
      },
      borderRadius: { xl: '0.75rem', '2xl': '1rem', '3xl': '1.5rem' },
    },
  },
  plugins: [],
}
