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
        'braxton-v1': '#5b8abf',
        'braxton-v2': '#bf5b5b',
        'braxton-v3': '#bfa05b',
        'bx': {
          'black': '#080c12',
          'surface': '#0d1117',
          'surface-alt': '#131a24',
          'trace': '#2e3640',
          'trace-light': '#414d5a',
          'white': '#c8cdd5',
          'amber': '#a09080',
          'gray': {
            300: '#b0b8c4',
            400: '#8090a0',
            500: '#506070',
            600: '#607080',
          },
        },
      },
      fontFamily: {
        mono: ['"IBM Plex Mono"', '"Courier New"', 'Courier', 'monospace'],
      },
    },
  },
  plugins: [],
}
