/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],

  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        sm: "600px",
        md: "728px",
        lg: "984px",
        xl: "1240px",
      },
    },

    extend: {
      colors: {
        primary: {
          50: "#f0faff",
          100: "#e0f2ff",
          200: "#b9e6ff",
          300: "#7cd4ff",
          400: "#36bffa",
          500: "#0ba5e9", // main brand color
          600: "#0086c9",
          700: "#026aa2",
          800: "#065986",
          900: "#0b4a6f",
        },
        accent: {
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
        },
      },

      fontFamily: {
        heading: ["Poppins", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },

      boxShadow: {
        soft: "0 4px 12px rgba(0,0,0,0.08)",
        card: "0 6px 20px rgba(0,0,0,0.10)",
        glow: "0 0 20px rgba(11,165,233,0.4)", // primary glow
      },

      borderRadius: {
        xl: "1.2rem",
        xxl: "2rem",
      },

      backdropBlur: {
        xs: "2px",
      },

      transitionDuration: {
        350: "350ms",
        450: "450ms",
      },

      animation: {
        "fade-in": "fadeIn 0.4s ease-in-out",
        "slide-up": "slideUp 0.5s ease-out",
        "zoom-in": "zoomIn 0.3s ease-out",
      },

      keyframes: {
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        slideUp: {
          "0%": { opacity: 0, transform: "translateY(20px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        zoomIn: {
          "0%": { opacity: 0, transform: "scale(0.95)" },
          "100%": { opacity: 1, transform: "scale(1)" },
        },
      },
    },
  },

  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
