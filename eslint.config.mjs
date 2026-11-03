import js from '@eslint/js'

export default [
  js.configs.recommended,
  { languageOptions: { globals: { URL: 'readonly' } } },
]
