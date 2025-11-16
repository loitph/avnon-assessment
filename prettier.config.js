// prettier.config.js
/** @type {import("prettier").Config} */
module.exports = {
  // === Core Formatting ===
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  arrowParens: 'avoid',
  endOfLine: 'lf',

  // === HTML & Angular Templates ===
  htmlWhitespaceSensitivity: 'css',
  bracketSameLine: false,

  // === SCSS ===
  scss: {
    // SCSS-specific rules
    files: '*.scss',
    options: {
      parser: 'scss',
    },
  },

  // === File-Specific Overrides ===
  overrides: [
    {
      files: '*.html',
      options: {
        parser: 'angular',
      },
    },
    {
      files: '*.component.html',
      options: {
        parser: 'angular',
      },
    },
    {
      files: '*.scss',
      options: {
        parser: 'scss',
      },
    },
    {
      files: '*.ts',
      options: {
        parser: 'typescript',
      }
    }
  ],
};