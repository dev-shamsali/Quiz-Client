/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#FFFDF2',
          dark: '#F5F3E4',
          border: '#E0DDD0',
        },
        ink: {
          DEFAULT: '#000000',
          soft: '#1A1A1A',
          muted: '#3D3D3D',
          light: '#6B6B6B',
          faint: '#9E9E9E',
        },
      },
      fontFamily: {
        serif: ['"Times New Roman"', 'Times', 'Georgia', 'serif'],
        sans: ['"Times New Roman"', 'Times', 'Georgia', 'serif'],
        mono: ['"Courier New"', 'Courier', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp: { '0%': { transform: 'translateY(24px)', opacity: 0 }, '100%': { transform: 'translateY(0)', opacity: 1 } },
      },
      boxShadow: {
        'ink': '4px 4px 0px #000000',
        'ink-sm': '2px 2px 0px #000000',
        'ink-lg': '6px 6px 0px #000000',
      },
    },
  },
  plugins: [],
};
