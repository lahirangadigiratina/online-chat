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
        brand: {
          orange: "#E8651A",
          black: "#0A0A0A",
        },
        "ppg-orange": "#e85c00",
        "ppg-orange-hover": "#cf5200",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      keyframes: {
        heroBob: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        heroWaveArm: {
          "0%, 100%": { transform: "rotate(6deg)" },
          "25%": { transform: "rotate(-22deg)" },
          "50%": { transform: "rotate(18deg)" },
          "75%": { transform: "rotate(-16deg)" },
        },
        heroAura: {
          "0%, 100%": { opacity: "0.35", transform: "scale(0.92)" },
          "50%": { opacity: "0.55", transform: "scale(1)" },
        },
        helloBubble: {
          "0%, 100%": { transform: "translateY(0) scale(1)" },
          "15%, 45%": { transform: "translateY(-3px) scale(1.04)" },
          "30%": { transform: "translateY(-1px) scale(1.02)" },
        },
        heroSwirl: {
          "0%, 100%": {
            transform: "translateY(0) rotate(-5deg) scale(1)",
          },
          "50%": {
            transform: "translateY(-16px) rotate(5deg) scale(1.04)",
          },
        },
      },
      animation: {
        "hero-swirl": "heroSwirl 4.5s ease-in-out infinite",
        "hero-bob": "heroBob 3s ease-in-out infinite",
        "hero-wave-arm": "heroWaveArm 1.1s ease-in-out infinite",
        "hero-aura": "heroAura 2.8s ease-in-out infinite",
        "hello-bubble": "helloBubble 2.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
