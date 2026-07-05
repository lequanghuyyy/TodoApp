import js from '@eslint/js'
import reactPlugin from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import prettierConfig from 'eslint-config-prettier'
import prettierPlugin from 'eslint-plugin-prettier'
import globals from 'globals'

export default [
  // Ignore build output
  { ignores: ['dist', 'node_modules'] },

  // Base JS rules
  js.configs.recommended,

  // React files config
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      prettier: prettierPlugin,
    },
    settings: {
      react: {
        // Tự detect version React — không cần khai báo thủ công
        version: 'detect',
      },
    },
    rules: {
      // React recommended rules
      ...reactPlugin.configs.recommended.rules,
      // React Hooks rules (enforce rules of hooks)
      ...reactHooks.configs.recommended.rules,
      // Fast Refresh: warn khi component export không đúng pattern
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // Prettier: format errors hiển thị như ESLint errors
      'prettier/prettier': 'warn',
      // Tắt rule yêu cầu import React (không cần với React 17+ new JSX transform)
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'warn',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },

  // Prettier config PHẢI để cuối cùng để override các format rules conflicting
  prettierConfig,
]
