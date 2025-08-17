import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      // Ensure comments are in English only
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Comment',
          message: 'Comments must be in English only',
        },
      ],
    },
  },
];

export default eslintConfig;
