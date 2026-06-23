import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0D0D0D",
        graphite: "#1A1A1A",
        amber: "#F5A623",
        offwhite: "#FFFDF7",
        midgray: "#555555",
      },
      fontFamily: {
        sans: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        tag: "6px",
        card: "12px",
      },
      letterSpacing: {
        tightish: "-0.3px",
        tighter2: "-0.5px",
      },
    },
  },
  plugins: [],
};

export default config;
