/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontSize: {
        'body': ['var(--type--body-regular)', '1.5'],
        'h1': ['var(--type--h1)', '1.2'],
        'h2': ['var(--type--h2)', '1.2'],
        'h3': ['var(--type--h3)', '1.2'],
        'subtitle': ['var(--type--subtitle)', '1.5'],
      },
      colors: {
        'accent': 'var(--color--accent)',
        'lighter-green': 'var(--color--lighter-green)',
        'dark': 'var(--color--dark)',
        'dark-85': 'var(--color--dark-0-85)',
        'elevation': 'var(--color--elevation)',
        'border': 'var(--color--border)',
        'background': 'var(--color--background)',
        'white': 'var(--color--white)',
        'surface': 'var(--color--surface)',
        'success': 'var(--color--success)',
        'success-bg': 'var(--color--success-bg)',
        'warning': 'var(--color--warning)',
        'warning-bg': 'var(--color--warning-bg)',
        'danger': 'var(--color--danger)',
        'danger-bg': 'var(--color--danger-bg)',
      },
      backgroundColor: {
        'lighter-green-10': 'rgba(133, 187, 148, 0.1)',
        'lighter-green-20': 'rgba(133, 187, 148, 0.2)',
        'lighter-green-30': 'rgba(133, 187, 148, 0.3)',
        'accent-10': 'rgba(13, 56, 51, 0.1)',
        'accent-20': 'rgba(13, 56, 51, 0.2)',
        'accent-30': 'rgba(13, 56, 51, 0.3)',
      },
      borderWidth: {
        'dashed': '2px',
      },
      borderStyle: {
        'dashed': 'dashed',
      },
      spacing: {
        'dash': '16px', // The spacing between dashes
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
