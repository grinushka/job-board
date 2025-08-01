import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

import { includeIgnoreFile } from '@eslint/compat';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import stylistic from '@stylistic/eslint-plugin';

const filename = fileURLToPath(import.meta.url);
const directoryName = dirname(filename);

export default tseslint.config(

  // We have to use explicit global ignore. Otherwise, ESLint will check all *.js files.
  // Those files are always matched unless you explicitly exclude them using global ignores.
  includeIgnoreFile(resolve(directoryName, '.gitignore')),
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    ignores: ['**/*.test.ts'],
    languageOptions: {
      globals: {
        ...globals.browser,
        "google": "readonly",
      },
      parser: tseslint.parser,
      parserOptions: {
        projectService: {
          allowDefaultProject: ['eslint.config.mjs'],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'react-hooks': pluginReactHooks,
      'jsx-a11y': jsxA11y,
      '@stylistic/js': stylistic,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    extends: [
      pluginJs.configs.recommended,
      pluginReact.configs.flat.recommended,
      ...tseslint.configs.recommended,
    ],
    rules: {
      semi: ['error', 'always'],
      
      'no-unused-vars': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',

      '@stylistic/js/arrow-parens': ['error', 'as-needed', { 'requireForBlockBody': false }],
      '@stylistic/js/jsx-quotes': ['error', 'prefer-double'],
      '@stylistic/js/indent': ['error', 2],

      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/anchor-has-content': 'error',
      'jsx-a11y/aria-activedescendant-has-tabindex': 'error',
      'jsx-a11y/aria-props': 'error',
      'jsx-a11y/aria-proptypes': 'error',
      'jsx-a11y/aria-role': ['error', { ignoreNonDOM: true }],
      'jsx-a11y/aria-unsupported-elements': 'error',
      'jsx-a11y/heading-has-content': 'error',
      'jsx-a11y/iframe-has-title': 'error',
      'jsx-a11y/img-redundant-alt': 'error',
      'jsx-a11y/no-access-key': 'error',
      'jsx-a11y/no-distracting-elements': 'error',
      'jsx-a11y/no-redundant-roles': 'error',
      'jsx-a11y/role-has-required-aria-props': 'error',
      'jsx-a11y/role-supports-aria-props': 'error',
      'jsx-a11y/scope': 'error',
      'jsx-quotes': ['error', 'prefer-double'],
      'jsx-a11y/anchor-is-valid': [
        'error',
        {
          aspects: ['noHref', 'invalidHref'],
        },
      ],

      'react/react-in-jsx-scope': 'off',
      'react/forbid-foreign-prop-types': ['error', { 'allowInPropTypes': true }],
      'react/jsx-first-prop-new-line': ['error', 'multiline'],
      'react/no-typos': 'error',
      'react/style-prop-object': 'error',
      'react/jsx-max-props-per-line': ['error', { 'maximum': { 'single': 4, 'multi': 1 } }],
      'react/jsx-closing-bracket-location': ['error', 'tag-aligned'],
      'react/jsx-closing-tag-location': 'error',
      'react/jsx-one-expression-per-line': ['error', {'allow': 'literal'}],
      'react/jsx-indent': ['error', 2],
      'react/self-closing-comp': [
        'error',
        {
          'component': true,
          'html': true
        }
      ],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/naming-convention': [
        'warn',
        {
          selector: 'function',
          format: ['camelCase', 'PascalCase'],
        },
      ],
      
      'max-lines-per-function': 'off',
      "@typescript-eslint/explicit-function-return-type": "off",

      'max-classes-per-file': 'off',
      'max-len': ['error', {
        'code': 140,
        'ignoreComments': true,
        'ignoreStrings': true
      }],
    },
  },
);
