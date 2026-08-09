import type { Config } from "tailwindcss"

const config = {
  darkMode: "class",
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1280px", // Ancho máximo de contenedor
      },
    },
    extend: {
      fontFamily: {
        /* Tipografía técnica principal[cite: 5] */
        sans: ['var(--font-geist-sans)', 'sans-serif'], 
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "0.5rem",   /* 8px para Tarjetas/Contenedores[cite: 5] */
        md: "calc(var(--radius) + 2px)",
        sm: "calc(var(--radius) - 2px)",
        base: "var(--radius)", /* 4px para Botones/Inputs[cite: 5] */
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config