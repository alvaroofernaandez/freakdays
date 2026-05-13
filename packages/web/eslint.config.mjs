// @ts-check
import unusedImports from 'eslint-plugin-unused-imports';
import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt(
  // Custom config layered on top of @nuxt/eslint defaults.
  {
    plugins: {
      'unused-imports': unusedImports,
    },
    rules: {
      // ── ESLint / TS rules ──
      // unused-imports owns the auto-fix for dead imports (TS's own
      // no-unused-vars rule does not auto-fix imports).
      'unused-imports/no-unused-imports': 'error',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-vars': [
        'error',
        {
          args: 'after-used',
          argsIgnorePattern: '^_',
          vars: 'all',
          varsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      // no-explicit-any kept as 'warn'. Most uses are in tests (mock
      // flexibility), error handlers (catch shape), and $fetch interop
      // where the alternatives (unknown, branded types) would require a
      // wider type-discipline pass than fits in the cleanup PR.
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/ban-ts-comment': 'error',
      '@typescript-eslint/no-dynamic-delete': 'error',
      // Disabled — requires parserOptions.project (type-aware linting).
      '@typescript-eslint/consistent-type-imports': 'off',

      // ── Vue rules: project-specific exceptions ──
      // Allow single-word names for files Vue/Nuxt treats specially —
      // pages, layouts, default-named modules — plus the shadcn-vue UI
      // components whose names match the upstream library convention and
      // would break ergonomics if renamed.
      'vue/multi-word-component-names': [
        'error',
        {
          ignores: [
            'default',
            'index',
            'error',
            '404',
            '500',
            'login',
            'register',
            'onboarding',
            'profile',
            'workouts',
            'manga',
            'anime',
            'quests',
            'party',
            'calendar',
            // shadcn-vue UI primitives.
            'Alert',
            'Avatar',
            'Badge',
            'Button',
            'Calendar',
            'Card',
            'Checkbox',
            'Dialog',
            'Empty',
            'Input',
            'Label',
            'Popover',
            'Progress',
            'Separator',
            'Sheet',
            'Skeleton',
            'Switch',
            'Tabs',
            'Tooltip',
            // Dynamic route segments — Nuxt convention.
            '[id]',
            '[partyId]',
            '[listId]',
          ],
        },
      ],
      // Prettier owns whitespace around self-closing tags and disagrees
      // with Vue's default. Prettier wins.
      'vue/html-self-closing': [
        'error',
        {
          html: { void: 'any', normal: 'any', component: 'always' },
          svg: 'always',
          math: 'always',
        },
      ],
      // Style preference, not a correctness issue. Many of our props are
      // deliberately optional-with-undefined-fallback. Off rather than warn.
      'vue/require-default-prop': 'off',
      'vue/no-unused-vars': 'error',
      'vue/require-explicit-emits': 'error',

      // ── Nuxt / import rules ──
      'nuxt/prefer-import-meta': 'error',
      'import/first': 'error',
      'import/no-duplicates': 'error',

      // ── Generic JS rules ──
      'no-useless-catch': 'error',
      'no-useless-escape': 'error',
      'prefer-const': 'error',
    },
  },
);
