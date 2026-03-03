/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'srg-black': '#0a0a0a',
        'srg-dark': '#111111',
        'srg-gray': '#1a1a1a',
        'srg-accent': '#ff3d00',
        'srg-white': '#f5f5f5',
        'srg-muted': '#666666',
      },
      fontFamily: {
        'display': ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
        'mono': ['var(--font-jetbrains)', 'monospace'],
      },
      fontSize: {
        'display': ['clamp(4rem, 15vw, 12rem)', { lineHeight: '0.85' }],
        'display-sm': ['clamp(2rem, 8vw, 6rem)', { lineHeight: '0.9' }],
      },
      animation: {
        'glitch': 'glitch 1s linear infinite',
        'scan': 'scan 8s linear infinite',
      },
      keyframes: {
        glitch: {
          '0%, 100%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
      },
    },
  },
  plugins: [],
}
