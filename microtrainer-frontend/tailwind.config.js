/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class", // manual dark mode control (important for dashboards)

  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        text: "var(--text)",
        "text-h": "var(--text-h)",
        border: "var(--border)",
        accent: "var(--accent)",
        "accent-bg": "var(--accent-bg)",
        "accent-border": "var(--accent-border)",
        "code-bg": "var(--code-bg)",
      },

      fontFamily: {
        sans: ["var(--sans)"],
        heading: ["var(--heading)"],
        mono: ["var(--mono)"],
      },

      boxShadow: {
        base: "var(--shadow)",
      },

      borderRadius: {
        xl: "12px",
        "2xl": "16px",
      },

      spacing: {
        18: "4.5rem",
        22: "5.5rem",
      },

      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      },

      backdropBlur: {
        xs: "2px",
      },
    },
  },

  plugins: [],
};