import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypeScript from 'eslint-config-next/typescript';

const eslintConfig = [
  {
    // Vendored browser simulation and its reproducible generated adaptation.
    ignores: ['.next/**', 'coverage/**', 'node_modules/**', 'public/fluid-*-study.js'],
  },
  ...nextCoreWebVitals,
  ...nextTypeScript,
];

export default eslintConfig;
