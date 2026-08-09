module.exports = {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-tailwindcss',
  ],
  rules: {
    'property-no-vendor-prefix': [
      true,
      {
        ignoreProperties: ['-webkit-box-shadow'],
      },
    ],
  },
};
