// tailwind.config.cjs
module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      borderColor: ({ theme }) => ({
        DEFAULT: theme('colors.gray.500', 'currentColor'),
      }),
      outlineColor: {
        DEFAULT: 'rgb(75 85 99 / var(--tw-border-opacity))',
      },
    },
    screens: {
      'sm': '900px',
      // => @media (min-width: 640px) { ... }

      'md': '900px',
      // => @media (min-width: 768px) { ... }

      'lg': '1024px',
      // => @media (min-width: 1024px) { ... }

      'xl': '1280px',
      // => @media (min-width: 1280px) { ... }

      '2xl': '1536px',
      // => @media (min-width: 1536px) { ... }
    },
    fontFamily: {
      inter: 'var(--font-family-inter)',
    },
  },
  plugins: [],
}