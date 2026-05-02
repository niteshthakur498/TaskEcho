/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ── Dark matte design tokens ─────────────────────────────────────────
      colors: {
        // Surfaces (darkest → lightest)
        'surface-bg': '#0c0c0e',
        'surface-1':  '#131315',
        'surface-2':  '#1b1b1e',
        'surface-3':  '#242428',

        // Borders
        'border-default': '#2a2a2f',
        'border-subtle':  '#1f1f23',

        // Text hierarchy
        'text-primary':   '#e4e4e8',
        'text-secondary': '#8a8a9a',
        'text-muted':     '#4a4a58',

        // Accent (muted indigo/violet — readable on dark)
        'accent':       '#7c72f0',
        'accent-hover': '#6c62e8',
        'accent-muted': '#1d1a38',
        'accent-text':  '#b0aaf8',

        // Success (for completed tasks)
        'success-muted': '#0e2018',

        // Danger (delete / error)
        'danger':       '#e06060',
        'danger-muted': '#261414',
        'danger-text':  '#f09090',
      },

      // ── Animations ────────────────────────────────────────────────────────
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in':  'fadeIn 0.2s ease-out',
      },
      keyframes: {
        slideUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
