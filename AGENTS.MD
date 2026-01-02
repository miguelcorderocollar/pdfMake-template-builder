# AGENTS.MD

Guidelines for AI coding assistants working on this project.

## ⚠️ Important

**Human controls the development environment.** Do not run terminal commands unless explicitly requested.

## Project Overview

PDFMake Template Builder - Visual drag-and-drop interface for creating PDFMake templates. Built with Next.js, TypeScript, Tailwind CSS.

**Key Features:** Template builder, real-time PDF preview, element customization, import/export, localStorage persistence, dark mode.

## Quick Start

```bash
bun install          # Install dependencies
bun dev              # Start dev server
bun test             # Run tests
bun test:coverage    # Check coverage
bun lint             # Lint code
bun build            # Production build
```

## Project Structure

```
src/
├── app/              # Next.js App Router
├── components/       # React components
│   ├── ui/          # shadcn/ui components
│   └── nodes/       # Content node editors
├── hooks/            # Custom React hooks
├── lib/              # App context, reducer
├── services/         # Business logic
├── types/            # TypeScript definitions
└── utils/            # Pure utility functions
```

## Code Style

### TypeScript
- Strict mode enabled
- No `any` - extend `src/types/index.ts` instead
- Use `import type` for type-only imports
- Prefer interfaces over types for object shapes

### React
- Functional components only
- Extract logic to custom hooks
- Stable hook dependencies (memoize objects/arrays)
- Remove unused imports/variables

### Styling
- Tailwind CSS utility-first
- Single quotes, no semicolons
- Dark mode via CSS custom properties

## Testing

**Stack:** Vitest (unit/component), React Testing Library, Playwright (E2E)

**Structure:**
```
tests/
├── unit/        # Pure functions (reducer, utils)
├── hooks/       # Custom hooks
├── components/  # React components
└── e2e/         # Playwright browser tests
```

**Commands:**
```bash
bun test              # All tests
bun test:watch        # Watch mode
bun test:coverage     # Coverage report
bun test:e2e          # E2E tests
```

**Coverage Target:** 80%+ for `src/lib/` and `src/utils/`

**Test Examples:**
```typescript
// Unit test
import { describe, it, expect } from 'vitest'
import { myFunction } from '@/utils/my-utils'

describe('myFunction', () => {
  it('does something', () => {
    expect(myFunction('input')).toBe('output')
  })
})

// Component test
import { render, screen } from '@testing-library/react'
import { TestAppProvider } from 'tests/test-utils'

render(
  <TestAppProvider initialState={{ ... }}>
    <MyComponent />
  </TestAppProvider>
)
```

## Git Workflow

### Creating Pull Requests

1. **Create feature branch:**
   ```bash
   git checkout -b feat/feature-name
   ```

2. **Make changes and commit:**
   ```bash
   git add .
   git commit -m "feat: description"
   ```

3. **Push branch:**
   ```bash
   git push origin feat/feature-name
   ```

4. **Create PR with GitHub CLI:**
   ```bash
   gh pr create --title "Title" --body "Description"
   ```

   **PR Template:**
   ```bash
   gh pr create \
     --title "feat: add feature name" \
     --body "## Summary
   Brief description of changes.

   ## Changes
   - Item 1
   - Item 2

   ## Testing
   - [ ] Tests pass
   - [ ] Coverage maintained"
   ```

### Commit Messages
- Format: `type: description` (e.g., `feat:`, `fix:`, `docs:`, `test:`)
- Be concise and descriptive

## Pre-Push Checklist

Before pushing code, ensure:
- ✅ `bun lint -- --cache --max-warnings=0` passes
- ✅ `bun test` passes
- ✅ `bun build` succeeds
- ✅ All tests have 80%+ coverage for critical paths

## UI Components

**shadcn/ui + Radix:** Wrappers live in `src/components/ui/`

**Adding new UI component:**
```bash
bun add @radix-ui/react-[component]
# Create wrapper in src/components/ui/[component].tsx
```

## Best Practices

- **Single responsibility** - One purpose per file
- **DRY** - Don't repeat code
- **Types first** - Update `src/types/index.ts` instead of casting
- **Memoization** - Use `useMemo` for expensive computations
- **Error handling** - Graceful degradation, clear user feedback
- **Accessibility** - WCAG compliant, keyboard navigation

## Critical Rules

1. **No `any` types** - Always use proper types
2. **No unused code** - Remove dead code
3. **Stable dependencies** - Memoize objects/arrays in hook deps
4. **Test coverage** - Maintain 80%+ for utils/lib
5. **Zero warnings** - Fix all lint warnings before pushing
6. **Run tests after changes** - Always run tests after modifying code, especially after updating test files. Use `bun test` for unit tests and `bun test:e2e` for E2E tests to verify everything passes before committing.

## Success Criteria

- ✅ No TypeScript errors
- ✅ No ESLint warnings  
- ✅ All tests passing
- ✅ 80%+ coverage on critical paths
- ✅ Production build succeeds
