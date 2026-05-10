import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#000000",
        "bg-2": "#070707",
        surface: "#0c0c0c",
        "surface-2": "#141414",
        "surface-3": "#1c1c1c",
        border: "#1a1a1a",
        "border-strong": "#262626",
        text: "#f3f3f3",
        muted: "#7a7a7a",
        "muted-2": "#525252",

        accent: "#bef848",       // lime
        "accent-2": "#a3e635",
        "accent-dim": "rgba(190, 248, 72, 0.08)",
        "accent-border": "rgba(190, 248, 72, 0.25)",
        "accent-glow": "rgba(190, 248, 72, 0.15)",

        success: "#4ade80",
        warning: "#fbbf24",
        danger: "#f87171",
        info: "#60a5fa",

        // Tile accent palette (matches the icon tile colors in the reference)
        "tile-yellow": "#facc15",
        "tile-green": "#4ade80",
        "tile-amber": "#fbbf24",
        "tile-blue": "#60a5fa",
        "tile-violet": "#a78bfa",
        "tile-cyan": "#22d3ee",
      },
      backgroundImage: {
        "hero-grad":
          "radial-gradient(ellipse 1200px 500px at 75% -10%, rgba(190, 248, 72, 0.10), transparent 60%), linear-gradient(180deg, #0a0a0a 0%, #050505 100%)",
        "card-grad":
          "linear-gradient(180deg, #0e0e0e 0%, #080808 100%)",
        "accent-grad":
          "linear-gradient(135deg, #bef848 0%, #a3e635 100%)",
      },
      boxShadow: {
        soft: "0 4px 12px rgba(0, 0, 0, 0.4)",
        glow: "0 0 28px rgba(190, 248, 72, 0.18)",
        panel: "0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
      },
      fontFamily: {
        sans: ['-apple-system', 'system-ui', '"Segoe UI"', 'Inter', 'sans-serif'],
        mono: ['ui-monospace', '"SF Mono"', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
