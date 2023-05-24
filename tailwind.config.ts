import { type Config } from "tailwindcss";
const colors = require('tailwindcss/colors');

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    colors: {
      "brand-primary": "#FABB00",
      "brand-primary-dark": "#ddad35",
      "brand-primary-light": "#FFFCF2",
      "brand-secondary": "#041f27",
      "brand-secondary-light": "#0b3947",
      "brand-secondary-dark": "#021419",

      "brand-error": "#CB0606",
      "brand-error-dark": "#9a0404",
      "brand-error-light": "#FFF3F3",
      "brand-success": "#008826",

      "placeholder": "#9E9E9E",
      "link": "#5a95de",

      "border-color": "#d1d8da",
      "border-color-dark": "#c0c8ca",
      "border-color-light": "#e2e6e8",
      "body-bg": "#F6F7F9",
      "body-bg-dark": "#ebeef0",
      "body-bg-light": "#fafbfc",

      "text-dark": "#2E3037",
      "text-mid": "#8E929C",
      "text-light": "#D1D7DA",
      "text-lighter": "#E1E6E8",
      ...colors,
    }
  },
  corePlugins: {
    aspectRatio: false,
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
  ],
} satisfies Config;
