import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        night: "#070D18",
        abyss: "#0C1427",
        surface: "#111C35",
        surfaceLight: "#182747",
        gold: "#D4AF37",
        goldMuted: "#C08A3E",
        goldAmber: "#F59E0B",
        chalk: "#F8FAFC",
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "sans-serif"],
        serif: ['"Playfair Display"', "serif"],
      },
      boxShadow: {
        goldGlow: "0 12px 28px -6px rgba(212, 175, 55, 0.38)",
        luxuryCard: "0 20px 50px -15px rgba(0, 0, 0, 0.65)",
      },
    },
  },
  plugins: [],
};
export default config;
