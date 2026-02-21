import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        forest: {
          900: "#0a1a0f",
          800: "#0d1f12",
          700: "#1a3a1f",
          600: "#2D5A27",
          500: "#3a7a33",
          400: "#4ade80",
          300: "#86efac",
        },
        bark: {
          700: "#5c3310",
          600: "#8B4513",
          500: "#a0522d",
          400: "#cd853f",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      animation: {
        "slide-up": "slide-up 0.4s ease-out",
        pulse: "pulse 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
