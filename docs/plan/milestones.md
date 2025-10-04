# Project Milestones Checklist

Source of truth: derived from `docs/plan/development-plan.md`, `technical-spec.md`, and `ui-spec.md`.

Status keys: ✅ Completed · ⏳ In Progress · ⭕ Pending

## Milestone 0: Flow-first MVP (styles-simple default)
- ✅ Load default example `styles-simple.js` at startup
- ✅ ContentList: add/edit/insert/move/delete with confirmation
- ✅ StylesPanel: edit fontSize/bold/italics, apply to items
- ✅ Clear Template confirmation action
- ⭕ Debounced pdfMake preview updates

Verification
- ✅ Default example visible on load
- ✅ Content edits reflected in preview
- ✅ Styles edits applied and reflected
- ✅ Clear resets content/styles

## Milestone 1: Project Setup & Foundation
- ✅ Initialize Next.js 15+ project with TypeScript (Bun)
- ✅ Configure Tailwind CSS v4
- ✅ Set up shadcn/ui base (button, card, tabs) and Radix deps
- ✅ Enable strict TypeScript mode and path alias `@/*`
- ✅ Create `src/` structure (App Router, components, ui, lib, types, services)
- ✅ Minimal working UI (Header, Sidebar, Canvas placeholder)
- ⏳ Dev environment scripts & linting polish

Verification
- ✅ `bun run dev` starts
- ✅ Basic UI loads

## Milestone 2: MVP - Working PDF Preview & Export ✅ Completed
- ✅ Install and wire pdfmake for client-side PDF generation
- ✅ Add minimal element state (text) and Canvas add/drop
- ✅ Implement docDefinition generator from elements
- ✅ Add PreviewPanel component with PDF iframe
- ✅ Add export: download PDF and copy JSON template
- ✅ Wire Header buttons to preview/export actions

Verification
- ✅ Can add text elements to canvas
- ✅ PDF preview generates correctly
- ✅ Can download PDF file
- ✅ Can copy JSON template to clipboard

## Milestone 3: Core UI Components
- ✅ Header: actions (Save, Export, Preview, Import), settings menu
- ✅ Sidebar: tabs (Elements, Styles, Templates), element palette (Text/Table/Image/List/Custom)
- ⭕ Canvas: drop zones, selection/hover states
- ⭕ Properties Panel: basic controls, real-time updates, validation, tooltips, help

## Milestone 4: Element System
- ⭕ Text/Table/Image elements with properties and editing
- ⭕ Element factory, validation, serialization

## Milestone 5: Drag & Drop System
- ⭕ HTML5 drag/drop (basic implemented in Canvas drop zone)
- ⭕ Grid positioning, snap-to-grid
- ⭕ Resize handles, multi-select, visual feedback
- ⭕ Undo/redo integration

## Milestone 6: Template Management
- ✅ Local storage persistence, auto-save, versioning
- ⭕ Import/Export JSON; load examples from `docs/examples/`

## Milestone 7: PDF Preview System
- ⭕ pdfMake integration and font loading
- ⭕ Canvas/PDF preview modes, split view, debounced updates

## Milestone 8: Error Handling & Polish
- ⭕ pdfMake error parsing and recovery suggestions
- ⭕ Validation & confirmation dialogs
- ⭕ Performance optimizations

## Milestone 9: Final Testing & Deployment
- ⭕ Cross-browser and mobile testing
- ⭕ Documentation & user guide
- ⭕ Vercel configuration

---

Maintenance
- Update this checklist as part of every feature PR.
- Reflect statuses (✅/⏳/⭕) and add brief notes per milestone if needed.
