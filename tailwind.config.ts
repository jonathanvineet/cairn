import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f0f7f0', 100: '#d9eeda', 200: '#b5ddb7',
          300: '#84c386', 400: '#54a457', 500: '#358337',
          600: '#276929', 700: '#1f5420', 800: '#1a4319', 900: '#163718'
        },
        earth: {
          50: '#f7f4f0', 100: '#ede5d9', 200: '#dac9b3',
          300: '#c4a882', 400: '#b08a5c', 500: '#9a7040',
          600: '#7d5a32', 700: '#63462a', 800: '#4e3622', 900: '#3d2b1b'
        },
        breach: { DEFAULT: '#b83c28', light: '#e05540', dark: '#8b2d1e' },
        anomaly: { DEFAULT: '#c88c28', light: '#e5a832', dark: '#9a6b1e' },
        intact: { DEFAULT: '#478c48', light: '#5aaa5c', dark: '#356836' },
        hedera: { DEFAULT: '#28b4c8', light: '#3dd0e8', dark: '#1e8a99' },
      },
    },
  },
  plugins: [],
};

export default config;
