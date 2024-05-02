const webpack = require('webpack');

module.exports = {
  style: {
    postcss: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  babel: {
    plugins: [['styled-jsx/babel', { plugins: ['styled-jsx-plugin-postcss'] }]],
  },
  webpack: {
    plugins: {
      add: [
        new webpack.ProvidePlugin({
          _JSXStyle: ['styled-jsx/style', 'default'],
        }),
      ],
    },
  },
};
