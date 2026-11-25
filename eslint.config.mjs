import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

import { placaProPlugin } from './eslint-rules/placa-pro-plugin.mjs'

// Files that Next.js or a tool requires to use `export default`.
const DEFAULT_EXPORT_ALLOWED_FILES = [
  'src/app/**/page.tsx',
  'src/app/**/layout.tsx',
  'src/app/**/loading.tsx',
  'src/app/**/error.tsx',
  'src/app/**/not-found.tsx',
  '*.config.ts',
  '*.config.mjs',
]

// Generated shadcn/ui primitives are excluded from the project conventions.
const GENERATED_FILES = ['src/components/ui/**', 'src/lib/utils.ts']

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ['**/*.ts', '**/*.tsx'],
    ignores: GENERATED_FILES,
    plugins: { 'placa-pro': placaProPlugin },
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      'id-length': ['error', { min: 2, properties: 'never', exceptions: ['_'] }],
      'import/no-default-export': 'error',
      'placa-pro/author-header': 'error',
      'placa-pro/import-blocks': 'error',
    },
  },
  {
    files: DEFAULT_EXPORT_ALLOWED_FILES,
    rules: {
      'import/no-default-export': 'off',
    },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'coverage/**', 'next-env.d.ts']),
])

export default eslintConfig
