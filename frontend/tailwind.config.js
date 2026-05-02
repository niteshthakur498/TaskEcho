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
        // Surfaces — light, airy, white-forward
        'surface-bg': '#f0f2f7',   // page canvas — soft blue-gray, not stark white
        'surface-1':  '#ffffff',   // cards — pure white, pops against bg
        'surface-2':  '#f4f6fb',   // inputs, secondary surfaces
        'surface-3':  '#e8ecf5',   // hover states

        // Borders — crisp but not harsh
        'border-default': '#dce1ef',
        'border-subtle':  '#eaecf5',

        // Text — high contrast on white cards
        'text-primary':   '#0f1120',   // near-black with slight blue — sharp on white
        'text-secondary': '#4a5270',   // mid-tone slate — readable secondary
        'text-muted':     '#9199b8',   // soft muted for placeholders / chrome

        // Accent — indigo
        'accent':       '#5254e7',
        'accent-hover': '#4345d4',
        'accent-muted': '#eef0ff',
        'accent-text':  '#3c3eb8',

        // Success (completed tasks)
        'success-muted': '#f0fdf4',

        // Danger
        'danger':       '#e03c3c',
        'danger-muted': '#fff1f1',
        'danger-text':  '#b91c1c',
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
