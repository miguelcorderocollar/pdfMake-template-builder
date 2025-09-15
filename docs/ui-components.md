## Settings Panel

Adds a new tab in the sidebar for configuring global pdfMake document settings.

- Common: filename, pageSize, pageOrientation, pageMargins, background, watermark text, info.title, language
- Advanced (collapsible): compress, version, userPassword, ownerPassword, permissions, subset, tagged, displayTitle

Defaults are applied in `src/services/example-templates.ts` and filename persists via localStorage.

# UI Components Strategy: shadcn/ui and Radix Primitives

This project uses Tailwind CSS v4 and Next.js App Router. Our recommended approach for UI components is:

- Prefer shadcn/ui components for faster development and consistent styling.
- Use Radix UI primitives only when a shadcn/ui component does not exist or when we need very custom behavior. shadcn/ui is built on top of Radix, so accessibility and semantics are preserved.

## Why shadcn/ui over direct Radix usage?
- shadcn/ui provides copy-paste or CLI-generated, Tailwind-styled components based on Radix primitives, which accelerates delivery while staying customizable.
- Radix is headless and unstyled; using it directly requires writing all styles. We still rely on Radix under the hood via shadcn/ui for a11y and behavior.

## Installation and Usage (Tailwind v4)

1) Install CLI

```bash
bunx shadcn@latest init -y
```

If network access blocks the CLI, you can manually add components (we’ve included `button`, `card`, and `tabs` already).

2) Add components as needed

```bash
# examples
bunx shadcn@latest add button card tabs input textarea select dialog dropdown-menu
```

3) Component paths and aliases
- Components live in `src/components/ui/` and `src/components/`.
- Shared utilities live in `src/lib/`.
- Import alias `@/*` is configured in `tsconfig.json`.

## When to import Radix directly
- If shadcn/ui doesn’t offer a wrapper for a specific primitive.
- For advanced/experimental primitives where we want full control.

In those cases:
- Keep Radix imports localized inside the component file.
- Wrap Radix usage with a small adapter component under `src/components/ui/your-component.tsx` to keep call sites consistent.

## Theming and tokens
- Tailwind v4 CSS variables are used via globals and shadcn tokens.
- Prefer `class-variance-authority` variants for component states.

## Linting and a11y
- Maintain a11y semantics provided by Radix (via shadcn/ui).
- Avoid removing required ARIA attributes.

## Dev commands
```bash
bun run dev     # start Next.js (Turbopack)
bun run build   # production build
bun run start   # start production server
bun run lint    # lint
```

## Notes
- If `bunx shadcn@latest add ...` fails due to network, copy components from `ui.shadcn.com` docs or our local `src/components/ui` patterns.
- Keep components minimal and composable; avoid app-specific logic inside UI primitives.

## Image node editor

The Image node supports three source modes selectable from a dropdown:

- file: uploads a local image and stores it as a data URL.
- url: accepts either an `https://` URL (which is fetched and converted to a data URL in-browser, subject to CORS) or a `data:` URL directly.
- base64: paste a full data URL only (e.g., `data:image/jpeg;base64,/9j...`). We intentionally require the full prefix to match pdfMake examples and avoid MIME ambiguity.

Images should be provided as `data:` URLs for reliability. The default example uses a 1x1 PNG with the `data:image/png;base64,...` prefix.
