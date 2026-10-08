/** @type {import('tailwindcss').Config} */
export default {
  // Tell Tailwind which files to scan so it purges unused classes in production
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
}

