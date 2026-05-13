// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt(
  // Custom config layered on top of @nuxt/eslint defaults.
  // Rules currently downgraded to 'warn' to allow incremental cleanup of
  // pre-existing debt. Tighten to 'error' in a follow-up cleanup PR after
  // running `eslint --fix` and addressing the remaining ~200 manual issues.
  {
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-dynamic-delete': 'warn',
      '@typescript-eslint/consistent-type-imports': 'off',
      'vue/multi-word-component-names': 'warn',
      'vue/no-unused-vars': 'warn',
      'nuxt/prefer-import-meta': 'warn',
      'import/first': 'warn',
      'import/no-duplicates': 'warn',
      'no-useless-catch': 'warn',
      'no-useless-escape': 'warn',
      'prefer-const': 'warn',
    },
  },
);
