/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'braxton-v1': '#3b82f6', // Blue for Volume 1
        'braxton-v2': '#ef4444', // Red for Volume 2  
        'braxton-v3': '#eab308', // Gold for Volume 3
        'braxton-dark': '#1a1a1a',
        'braxton-light': '#f5f5f5',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
}
