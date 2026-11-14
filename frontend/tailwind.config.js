/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          deep: '#0f0f10',
          base: '#141415',
          card: '#19191b',
          raised: '#232325',
          border: '#26262a',
          hover: '#2a2a2e',
        },
        text: {
          primary: '#ededed',
          secondary: '#a1a1a6',
          muted: '#71717a',
        },
        accent: {
          emerald: '#34d399',
          amber: '#fbbf24',
          rose: '#f87171',
          sky: '#38bdf8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      }
    },
  },
  plugins: [],
}
