import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontSize: {
        'tiny': 'var(--size-tiny)',
        'detail': 'var(--size-detail)',
        'label': 'var(--size-label)',
        'xs': 'var(--size-xs)',
        'sm': 'var(--size-sm)',
        'base': 'var(--size-base)',
        'lg': 'var(--size-lg)',
        'xl': 'var(--size-xl)',
        '2xl': 'var(--size-2xl)',
      },
    },
  },
  plugins: [],
};

export default config;