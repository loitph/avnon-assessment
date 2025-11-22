/** @type {import("prettier").Config} */
module.exports = {
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  arrowParens: 'avoid',
  endOfLine: 'lf',
  htmlWhitespaceSensitivity: 'css',
  bracketSameLine: false,
  scss: {
    files: '*.scss',
    options: {
      parser: 'scss',
    },
  },
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