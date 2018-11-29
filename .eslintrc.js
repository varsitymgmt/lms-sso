// ESLint configuration
// http://eslint.org/docs/user-guide/configuring
module.exports = {
  parser: 'babel-eslint',

  extends: [
    'airbnb',
    'plugin:flowtype/recommended',
    'plugin:css-modules/recommended',
    'prettier',
    'prettier/flowtype',
    'prettier/react',
  ],

  plugins: ['flowtype', 'css-modules', 'prettier'],

  globals: {
    __DEV__: true,
  },

  env: {
    browser: true,
    es6: true,
    jquery: true,
  },

  rules: {
    // `js` and `jsx` are common extensions
    // `mjs` is for `universal-router` only, for now
    'import/extensions': [
      'error',
      'always',
      {
        js: 'never',
        jsx: 'never',
        mjs: 'never',
      },
    ],

    // Not supporting nested package.json yet
    // https://github.com/benmosher/eslint-plugin-import/issues/458
    'import/no-extraneous-dependencies': 'off',

    // Recommend not to leave any console.log in your code
    // Use console.error, console.warn and console.info instead
    'no-console': [
      'error',
      {
        allow: ['warn', 'error', 'info'],
      },
    ],

    // a11y removed rule, ignore them
    'jsx-a11y/href-no-hash': 'off',

    // https://github.com/evcohen/eslint-plugin-jsx-a11y/issues/308#issuecomment-322954274
    'jsx-a11y/label-has-for': 'warn',

    // Allow js files to use jsx syntax, too
    'react/jsx-filename-extension': ['error', { extensions: ['.js', '.jsx'] }],

    // Automatically convert pure class to function by
    // babel-plugin-transform-react-pure-class-to-function
    'react/prefer-stateless-function': 'off',

    'no-param-reassign': 'off',

    // ESLint plugin for prettier formatting
    // https://github.com/prettier/eslint-plugin-prettier
    'prettier/prettier': [
      'error',
      {
        // https://github.com/prettier/prettier#options
        singleQuote: true,
        trailingComma: 'all',
      },
    ],
  },

  settings: {
    // Allow absolute paths in imports, e.g. import Button from 'components/Button'
    // https://github.com/benmosher/eslint-plugin-import/tree/master/resolvers
    'import/resolver': {
      node: {
        moduleDirectory: ['node_modules', 'src'],
      },
    },
  },
};
