import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // System stack: no web font to load, so no font-swap layout shift.
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "system-ui",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      colors: {
        line: "#cacacb",
        low: "#e08a00",
        outbg: "#f5f5f5",
        outink: "#767676",
      },
    },
  },
  plugins: [],
};

export default config;
