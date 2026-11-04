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
        picslive: {
          dark: "#0B192C",
          surface: "#132F4C",
          surfaceLight: "#1E3E62",
          surfaceHover: "#18385C",
          gold: "#C08A3E",
          goldLight: "#D4AF37",
          goldMuted: "#8F6428",
          chalk: "#FDFBF7",
          muted: "#94A3B8",
          border: "rgba(192, 138, 62, 0.2)",
          borderHover: "rgba(192, 138, 62, 0.45)",
        },
      },
      fontFamily: {
        sans: ["var(--font-jost)", "Jost", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 25px -5px rgba(192, 138, 62, 0.3)",
        glowLg: "0 0 45px -5px rgba(192, 138, 62, 0.4)",
      },
      animation: {
        pulseSlow: "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        scanLine: "scan 2.5s ease-in-out infinite",
      },
      keyframes: {
        scan: {
          "0%, 100%": { top: "5%" },
          "50%": { top: "90%" },
        },
      },
    },
  },
  plugins: [],
};
export default config;

