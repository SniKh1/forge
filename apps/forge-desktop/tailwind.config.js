/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0f172a',
        mist: '#f8fafc',
        line: 'rgba(148,163,184,0.24)',
        primary: '#2563eb',
        success: '#10b981',
        warning: '#f59e0b',
      },
      boxShadow: {
        soft: '0 18px 60px rgba(15, 23, 42, 0.08)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      backgroundImage: {
        'hero-wash': 'radial-gradient(circle at top left, rgba(37,99,235,0.16), transparent 35%), radial-gradient(circle at top right, rgba(16,185,129,0.12), transparent 26%), linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
      },
      fontFamily: {
        display: ['"Avenir Next"', '"SF Pro Display"', 'ui-sans-serif', 'system-ui'],
        body: ['"SF Pro Text"', '"PingFang SC"', 'ui-sans-serif', 'system-ui'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular'],
      },
    },
  },
  plugins: [],
};
