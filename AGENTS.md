# FreakDays - Agent Guidelines & Project Conventions

## Project Overview

**FreakDays** es una aplicación de gestión de vida cotidiana para personas "frikis". Permite gestionar entrenamientos, colecciones de manga, animes, misiones diarias (quests), grupos (party system) y calendario de lanzamientos.

## Architecture Principles

### Separation of Concerns

```
freak-days/
├── app/                    # Nuxt application layer
│   ├── components/         # Vue components (UI only)
│   ├── pages/              # Route pages
│   ├── layouts/            # Page layouts
│   └── composables/        # Vue composables
├── domain/                 # Business logic (framework-agnostic)
│   ├── types/              # TypeScript interfaces
│   └── modules/            # Domain logic per module
├── stores/                 # Pinia state management
├── services/               # Data layer abstraction
│   └── repositories/       # Supabase-ready repositories
└── tests/                  # Test files mirror source structure
```

### Key Principles

1. **Domain-Driven**: Business logic lives in `domain/`, independent of Vue/Nuxt.
2. **Composition API**: Always use Vue 3 Composition API with `<script setup>`.
3. **Type Safety**: Strict TypeScript everywhere. No `any` types.
4. **Mobile-First**: Design for mobile, enhance for desktop.

---

## Code Conventions

### Naming

| Element          | Convention                     | Example             |
| ---------------- | ------------------------------ | ------------------- |
| Files/Folders    | kebab-case                     | `quest-card.vue`    |
| Components       | PascalCase                     | `QuestCard`         |
| Composables      | camelCase with `use` prefix    | `useQuests()`       |
| Stores           | camelCase with `use` + `Store` | `useModulesStore()` |
| Types/Interfaces | PascalCase                     | `Quest`, `ModuleId` |
| Constants        | SCREAMING_SNAKE_CASE           | `DIFFICULTY_EXP`    |

### File Structure

```vue
<script setup lang="ts">
// imports
// props/emits
// composables/stores
// refs/reactive
// computed
// functions
// lifecycle hooks
</script>

<template>
  <!-- single root element preferred -->
</template>
```

### No Comments Rule

Code should be self-documenting. Avoid inline comments except for:

- Complex regex explanations
- Non-obvious business rules
- TODO markers (temporary)

---

## TDD Guidelines

### Test-First Workflow

1. Write failing test
2. Write minimal code to pass
3. Refactor while keeping tests green

### What to Test

| Layer          | Test Type   | Coverage Target |
| -------------- | ----------- | --------------- |
| `domain/`      | Unit tests  | 90%+            |
| `stores/`      | Unit tests  | 80%+            |
| `composables/` | Unit tests  | 80%+            |
| Components     | Integration | Critical paths  |

### Test Naming

```typescript
describe("ComponentName or FunctionName", () => {
  describe("methodName or scenario", () => {
    it("should [expected behavior] when [condition]", () => {});
  });
});
```

### Running Tests

```bash
pnpm test           # Run all tests once
pnpm test:watch     # Watch mode
pnpm test:coverage  # With coverage report
```

---

## Tailwind & shadcn-vue

### Theme Colors

| Token        | Purpose                   |
| ------------ | ------------------------- |
| `primary`    | Main brand color (purple) |
| `secondary`  | Accent pink               |
| `accent`     | Highlight cyan            |
| `background` | Dark background           |
| `foreground` | Text color                |
| `muted`      | Subdued elements          |
| `exp-*`      | Quest difficulty colors   |

### Component Usage

```vue
<template>
  <Card>
    <CardHeader>
      <CardTitle>Title</CardTitle>
      <CardDescription>Description</CardDescription>
    </CardHeader>
    <CardContent>Content</CardContent>
  </Card>
</template>
```

### Adding New Components

```bash
pnpm dlx shadcn-vue@latest add [component-name]
```

---

## Adding New Features

### Checklist

1. [ ] Create types in `domain/types/`
2. [ ] Write tests first in `tests/unit/`
3. [ ] Implement domain logic in `domain/modules/`
4. [ ] Create/update Pinia store in `stores/`
5. [ ] Build UI components in `app/components/`
6. [ ] Create page in `app/pages/`
7. [ ] Update database schema if needed
8. [ ] Verify all tests pass

### New Module Template

```typescript
// domain/types/new-module.ts
export interface NewEntity {
  id: string;
  // ...
}

// stores/new-module.ts
export const useNewModuleStore = defineStore("new-module", () => {
  // state, getters, actions
});
```

---

## Supabase Integration

### Repository Pattern

```typescript
// services/repositories/base.ts
export interface Repository<T> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}
```

### Environment Variables

```env
SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-anon-key
```

---

## Performance Guidelines

1. **Lazy Loading**: Use `defineAsyncComponent` for heavy components
2. **Image Optimization**: Use Nuxt Image when available
3. **State Hydration**: Minimize initial payload
4. **Bundle Size**: Check with `pnpm build --analyze`
5. **Image Upload**: Crop images before upload to reduce file size
6. **Canvas Operations**: Use `toBlob()` for image processing

---

## Accessibility

- All interactive elements must be keyboard accessible
- Use semantic HTML (`<button>`, `<nav>`, `<main>`)
- Include ARIA labels where needed
- Maintain 4.5:1 contrast ratio minimum
- Touch targets minimum 44x44px on mobile
- Support screen readers with proper ARIA attributes

## Mobile/Tablet Patterns

### Responsive Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1023px
- Desktop: ≥ 1024px

### Component Patterns

- **Sheets**: Use `Sheet` component for side panels on mobile/tablet
- **Modals**: Use `Modal` for desktop, `Sheet` for mobile/tablet
- **Drag and Drop**: Disable on mobile/tablet, use touch alternatives
- **Navigation**: Bottom navigation on mobile, sidebar on desktop

### Image Handling

- **Banners**: 16:9 aspect ratio, crop before upload
- **Avatares**: Square format, direct upload
- **Storage**: Separate buckets for `avatars` and `banners`
- **Processing**: Use Canvas API for image cropping

## Reactivity Best Practices

When destructuring refs from composables, use `toRef()` to maintain reactivity:

```typescript
import { toRef } from 'vue'

const profilePage = useProfilePage()
const uploadingBanner = toRef(profilePage, 'uploadingBanner')
const bannerPreview = toRef(profilePage, 'bannerPreview')
```

**Why**: Direct destructuring loses reactivity, `toRef()` creates a reactive reference.
