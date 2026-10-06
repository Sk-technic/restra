/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--bg-main)",
        foreground: "var(--text-main)",
        card: {
          DEFAULT: "var(--bg-card)",
          foreground: "var(--text-main)",
        },
        surface: "var(--bg-surface)",
        primary: {
          DEFAULT: "var(--primary-500)",
          foreground: "#ffffff",
          50: "var(--primary-50)",
          100: "var(--primary-100)",
          200: "var(--primary-200)",
          300: "var(--primary-300)",
          400: "var(--primary-400)",
          500: "var(--primary-500)",
          600: "var(--primary-600)",
          700: "var(--primary-700)",
          800: "var(--primary-800)",
          900: "var(--primary-900)",
          950: "var(--primary-950)",
        },
        border: "var(--border-color)",
        ring: "var(--primary-500)",
      },
      borderRadius: {
        'theme-sm': "var(--radius-sm)",
        'theme-md': "var(--radius-md)",
        'theme-lg': "var(--radius-lg)",
        'theme-xl': "var(--radius-xl)",
      },
    },
  },
  plugins: [],
};
