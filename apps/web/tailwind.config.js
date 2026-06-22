/** @type {import('tailwindcss').Config} */
// Token diturunkan dari ui_design.md (warna hijau #2D6A4F, Inter/Poppins, 8-pt grid)
// lalu dielevasi: ramp warna penuh, shadow berlapis lembut, motion halus.
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Hijau utama (primer) — #2D6A4F = primary-600, turunan #40916C / #1B4332
        primary: {
          50: '#F0F7F3',
          100: '#DCECE3',
          200: '#B9D9C7',
          300: '#8FC1A8',
          400: '#52A37A',
          500: '#40916C',
          600: '#2D6A4F',
          700: '#235340',
          800: '#1B4332',
          900: '#13301F',
          950: '#0A1C12',
        },
        // Sekunder emas/coklat (#B07D3C) — lencana, sorotan premium
        gold: {
          50: '#FBF6EE',
          100: '#F3E6CF',
          200: '#E6CC9F',
          300: '#D6AE6B',
          400: '#C49447',
          500: '#B07D3C',
          600: '#946531',
          700: '#744E28',
          800: '#553A20',
          900: '#3C2916',
        },
        // Netral hangat (off-white ber-tint hijau tipis untuk kesan premium)
        ink: '#1A2420',
        muted: '#5B6B63',
        surface: '#FFFFFF',
        canvas: '#F6FAF7',
        line: '#E4ECE7',
        // Semantik (selaras ui_design.md)
        success: '#198754',
        warning: '#E0A100',
        danger: '#DC3545',
        info: '#0D6EFD',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Inter', 'ui-sans-serif', 'sans-serif'],
      },
      fontSize: {
        // skala 1.2-ish, heading tegas (carries quality)
        'display': ['3.25rem', { lineHeight: '1.05', letterSpacing: '-0.02em', fontWeight: '700' }],
        'h1': ['2rem', { lineHeight: '1.15', letterSpacing: '-0.015em', fontWeight: '700' }],
        'h2': ['1.5rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }],
        'h3': ['1.25rem', { lineHeight: '1.3', fontWeight: '600' }],
      },
      borderRadius: {
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        // shadow berlapis lembut (bukan satu box-shadow keras)
        xs: '0 1px 2px rgba(16, 40, 28, 0.06)',
        card: '0 1px 2px rgba(16, 40, 28, 0.05), 0 2px 8px rgba(16, 40, 28, 0.05)',
        'card-hover': '0 4px 12px rgba(16, 40, 28, 0.08), 0 8px 24px rgba(16, 40, 28, 0.08)',
        dropdown: '0 6px 16px rgba(16, 40, 28, 0.10), 0 2px 6px rgba(16, 40, 28, 0.06)',
        modal: '0 16px 48px rgba(16, 40, 28, 0.18)',
        'focus-primary': '0 0 0 3px rgba(45, 106, 79, 0.22)',
      },
      keyframes: {
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pop: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.18)' },
          '100%': { transform: 'scale(1)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.25s ease-out',
        'slide-up': 'slide-up 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scale-in 0.18s ease-out',
        pop: 'pop 0.3s ease-out',
      },
      maxWidth: {
        container: '1200px',
      },
    },
  },
  plugins: [],
}
