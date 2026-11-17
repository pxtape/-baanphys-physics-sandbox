import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import architectureRule from './tooling/architecture-rule.mjs';

export default tseslint.config(
  { ignores: ['node_modules/**', 'dist/**', 'poc/**', 'coverage/**', '.git/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { architecture: { rules: { imports: architectureRule } } },
    rules: {
      'architecture/imports': 'error',
      'no-eval': 'error',
      'no-new-func': 'error',
      'no-implied-eval': 'error',
    },
  },
  {
    files: ['src/{domain,schema}/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-globals': ['error', 'window', 'document', 'localStorage', 'sessionStorage', 'indexedDB'],
    },
  },
);
