module.exports = {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-tailwindcss',
  ],
  rules: {
    'selector-class-pattern': null,
    'no-descending-specificity': null,
    'property-no-vendor-prefix': [
      true,
      {
        ignoreProperties: ['-webkit-box-shadow'],
      },
    ],
  },
};
