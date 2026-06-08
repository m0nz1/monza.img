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
      fontFamily: {
        display: ["'Black Han Sans'", "sans-serif"],
        body: ["'DM Sans'", "sans-serif"],
        mono: ["'Space Mono'", "monospace"],
      },
      colors: {
        brand: {
          yellow: "#FFE600",
          orange: "#FF4D00",
          red: "#FF1744",
          blue: "#0047FF",
          black: "#0A0A0A",
          white: "#FAFAFA",
          lime: "#CCFF00",
          pink: "#FF3CAC",
        },
      },
      boxShadow: {
        brutal: "4px 4px 0px 0px #0A0A0A",
        "brutal-lg": "6px 6px 0px 0px #0A0A0A",
        "brutal-xl": "8px 8px 0px 0px #0A0A0A",
        "brutal-hover": "2px 2px 0px 0px #0A0A0A",
        "brutal-white": "4px 4px 0px 0px #FAFAFA",
      },
      borderWidth: {
        "3": "3px",
      },
      animation: {
        "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        wiggle: "wiggle 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "fade-in": "fadeIn 0.2s ease-out",
      },
      keyframes: {
        wiggle: {
          "0%, 100%": { transform: "rotate(-2deg)" },
          "50%": { transform: "rotate(2deg)" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
