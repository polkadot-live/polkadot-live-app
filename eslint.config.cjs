/* eslint-disable @typescript-eslint/no-require-imports */
const { defineConfig, globalIgnores } = require('eslint/config');

const globals = require('globals');

const { fixupConfigRules, fixupPluginRules } = require('@eslint/compat');

const typescriptEslint = require('@typescript-eslint/eslint-plugin');
const _import = require('eslint-plugin-import');
const prettier = require('eslint-plugin-prettier');
const unusedImports = require('eslint-plugin-unused-imports');
const tsParser = require('@typescript-eslint/parser');
const js = require('@eslint/js');

const configPrettier = require('eslint-config-prettier/flat');
const { FlatCompat } = require('@eslint/eslintrc');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
  configPrettier,
});

module.exports = defineConfig([
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.js', '**/*.cjs'],
    languageOptions: {
      globals: {
        ...globals.node,
      },

      parser: tsParser,
      sourceType: 'module',
      ecmaVersion: 'latest',

      parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['tsconfig.json', 'packages/*/tsconfig.json'],
        ignorePatterns: ['node_modules/', 'dist/', 'packages/*/dist'],

        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    extends: fixupConfigRules(
      compat.extends(
        'eslint:recommended',
        'plugin:import/recommended',
        'plugin:react/recommended',
        'plugin:import/electron',
        'plugin:import/typescript',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/stylistic',
        'plugin:react-hooks/recommended',
        'plugin:prettier/recommended'
      )
    ),

    plugins: {
      '@typescript-eslint': fixupPluginRules(typescriptEslint),
      import: fixupPluginRules(_import),
      prettier: fixupPluginRules(prettier),
      'unused-imports': unusedImports,
    },

    settings: {
      react: {
        version: 'detect',
      },

      'import/extensions': ['.ts', '.tsx'],

      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },

      'import/internal-regex': '^@',

      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          extensions: ['.ts', '.tsx'],
          project: ['tsconfig.json', 'packages/*/tsconfig.json'],
        },
      },
    },

    rules: {
      /** Prettier */
      'prettier/prettier': ['error'],

      /** Stylistic */
      curly: 'error',
      'arrow-body-style': ['error', 'as-needed'],

      'comma-dangle': [
        'error',
        {
          arrays: 'always-multiline',
          objects: 'always-multiline',
          imports: 'always-multiline',
          exports: 'always-multiline',
          functions: 'never',
        },
      ],

      'object-shorthand': 'error',
      'unused-imports/no-unused-imports': 'error',
      semi: [2, 'always'],

      'import/extensions': [
        'error',
        'ignorePackages',
        {
          ts: 'never',
          tsx: 'never',
        },
      ],

      'react-hooks/exhaustive-deps': 'off',
      'import/no-named-as-default': 'off',
      'import/no-unresolved': 'error',

      /** React */
      'react/react-in-jsx-scope': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react/jsx-no-useless-fragment': 'error',

      'react/jsx-filename-extension': [
        'warn',
        {
          extensions: ['.tsx', '.jsx'],
        },
      ],

      /** TypeScript */
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'separate-type-imports',
          disallowTypeAnnotations: true,
        },
      ],

      '@typescript-eslint/no-unused-expressions': [
        'error',
        {
          allowShortCircuit: true,
          allowTernary: true,
        },
      ],

      '@typescript-eslint/no-shadow': 'error',
    },
  },
  globalIgnores([
    '**/*.css',
    '**/*.svg',
    '**/*.png',
    '**/*.json',
    '**/*.log',
    '**/*.lock',
    '**/*.md',
    '**/*.ico',
    '**/*.ttf',
    '**/*.xml',
    '**/*.txt',
    '**/*.html',
    '**/*.webmanifest',
    '**/LICENSE',
    '**/.vite',
    '**/dist',
    '**/build',
    '**/out',
    '**/vite.main.config.ts',
    '**/vite.preload.config.ts',
    '**/vite.renderer.config.ts',
    '**/CHANGELOG.md',
    '**/CODEOWNERS',
    '**/.yarn',
    '**/.licenserc.json',
    '**/.env.yarn',
  ]),
]);
