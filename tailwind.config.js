/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Prompt", "system-ui", "sans-serif"],
      },
      colors: {
        canvas: "#f6f8fb",
        ink: {
          900: "#101828",
          800: "#152435",
          700: "#364153",
          600: "#4a5565",
          500: "#5b7086",
          400: "#6a7282",
          300: "#99a1af",
        },
        line: {
          soft: "#eef2f7",
          DEFAULT: "#dbe3ec",
          strong: "#e5e7eb",
        },
        brand: {
          50: "#e2f1f0",
          100: "#d2f1e4",
          500: "#0e7c7b",
          600: "#0a5f5e",
          700: "#054a3a",
        },
        status: {
          "ready-bg": "#e0f0e6",
          "ready-fg": "#2f7d4f",
          "waiting-bg": "#fbeed4",
          "waiting-fg": "#b26a00",
          "erp-bg": "#eae7f6",
          "erp-fg": "#5a4e9e",
          "sent-bg": "#e2f1f0",
          "sent-fg": "#0a5f5e",
          "neutral-bg": "#eef2f7",
          "neutral-fg": "#5b7086",
          "danger-bg": "#fee2e2",
          "danger-fg": "#b42318",
        },
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(16, 24, 40, 0.04), 0 1px 3px 0 rgba(16, 24, 40, 0.06)",
      },
    },
  },
  plugins: [],
};
