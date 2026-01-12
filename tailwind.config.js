/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'var(--color-border)', /* soft-gray */
        input: 'var(--color-input)', /* soft-gray */
        ring: 'var(--color-ring)', /* taupe */
        background: 'var(--color-background)', /* light-beige */
        foreground: 'var(--color-foreground)', /* near-black */
        primary: {
          DEFAULT: 'var(--color-primary)', /* taupe */
          foreground: 'var(--color-primary-foreground)', /* white */
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)', /* deeper-taupe */
          foreground: 'var(--color-secondary-foreground)', /* white */
        },
        accent: {
          DEFAULT: 'var(--color-accent)', /* warm-gold */
          foreground: 'var(--color-accent-foreground)', /* near-black */
        },
        destructive: {
          DEFAULT: 'var(--color-destructive)', /* soft-terracotta */
          foreground: 'var(--color-destructive-foreground)', /* white */
        },
        success: {
          DEFAULT: 'var(--color-success)', /* muted-sage-green */
          foreground: 'var(--color-success-foreground)', /* white */
        },
        warning: {
          DEFAULT: 'var(--color-warning)', /* warm-amber */
          foreground: 'var(--color-warning-foreground)', /* near-black */
        },
        error: {
          DEFAULT: 'var(--color-error)', /* soft-terracotta */
          foreground: 'var(--color-error-foreground)', /* white */
        },
        muted: {
          DEFAULT: 'var(--color-muted)', /* soft-gray */
          foreground: 'var(--color-muted-foreground)', /* medium-gray */
        },
        card: {
          DEFAULT: 'var(--color-card)', /* white */
          foreground: 'var(--color-card-foreground)', /* near-black */
        },
        popover: {
          DEFAULT: 'var(--color-popover)', /* white */
          foreground: 'var(--color-popover-foreground)', /* near-black */
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'badge-bounce': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.15)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'slide-up': 'slide-up 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'badge-bounce': 'badge-bounce 300ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      maxWidth: {
        'telegram': '448px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('tailwindcss-animate'),
  ],
}