/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Cabinet Grotesk"', '"Inter"', "ui-sans-serif", "system-ui"],
        sans: ['"Inter"', "ui-sans-serif", "system-ui"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        ink: {
          950: "#0a0a09",
          900: "#111110",
          800: "#1a1a17",
          700: "#26261f",
        },
        bone: {
          50: "#f7f5ee",
          100: "#ece9dc",
          200: "#d8d4c1",
          300: "#b8b39c",
          400: "#8b876f",
        },
        lime: {
          accent: "#c8ff4d",
        },
      },
      letterSpacing: {
        "tight-display": "-0.04em",
        "ultra-tight": "-0.05em",
        "wide-meta": "0.18em",
      },
      fontSize: {
        "display-xl": ["clamp(3rem, 7vw, 6.5rem)", { lineHeight: "0.9", letterSpacing: "-0.04em" }],
        "display-lg": ["clamp(2.25rem, 5vw, 4.5rem)", { lineHeight: "0.95", letterSpacing: "-0.035em" }],
        "display-md": ["clamp(1.75rem, 3.2vw, 2.75rem)", { lineHeight: "1.0", letterSpacing: "-0.03em" }],
      },
    },
  },
  plugins: [],
};
