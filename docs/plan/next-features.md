# Next Feature Candidates

This document sketches the next wave of capabilities for the pdfMake Template Builder. It extends the existing flow-first editor (Milestones 0–3) toward parity with the richer patterns showcased in `docs/examples/` and `docs/pdfMake-docs.md`. Each section includes:

- **Goal** – A concise statement of scope.
- **Motivation & Current Gaps** – Why we need it, referencing current implementation limits.
- **User Experience Notes** – Proposed UI/UX flows that fit our Header → Sidebar → Canvas layout.
- **Data Model & pdfMake Mapping** – Expected additions or changes to state, reducers, and docDefinition output.
- **Dependencies & Sequencing** – Suggested order plus prerequisites from other tasks.
- **Open Questions** – Items an implementation agent should clarify before shipping.

## 1. Column Layout Builder

**Goal:** Allow users to add and edit pdfMake `columns` arrays (including nested stacks) directly from the UI.

**Motivation & Current Gaps**
- Current palette supports only paragraphs, text nodes, images, lists, and tables; columns are absent despite appearing prominently in `docs/examples/columns.js`.
- Designers want side-by-side layouts; today they must manually craft JSON.

**User Experience Notes**
- Add a new “Columns” element in the Elements panel. Clicking opens a wizard:
  1. Choose number of columns (2–4 to start) with presets for widths (`*`, `auto`, fixed numeric, %).
  2. Optional column gap slider.
  3. For each column, pick contents: inline text placeholder, stack placeholder, or import existing nodes (drag existing items into a column for reuse).
- Once inserted, a `ColumnNodeItem` editor appears in the Content List with nested editors for each column. Use accordion UI to toggle between columns.
- Provide quick actions (“Add Column”, “Remove Column”, “Distribute Widths”).

**Data Model & pdfMake Mapping**
- Extend `DocContentItem` union to include `ColumnsNode` type: `{ columns: Array<ColumnDefinition>; columnGap?: number; width?: ...; }`.
- Update reducer `CONTENT_OP` to handle creation, editing, and removal of columns and nested stacks.
- Consider representing nested column content as arrays of existing `DocContentItem`s; ensure serialization maintains structure.

**Dependencies & Sequencing**
- Requires Milestone 2 property panel improvements (to configure widths/gap cleanly).
- Touches element editor architecture: best sequenced after we have reusable form components for property editing.

**Open Questions**
- How to deduplicate nodes when “reusing” existing content? (Copy vs. reference.)
- Should we constrain the maximum nesting depth for MVP?

## 2. Rich Text & Stack Editor

**Goal:** Support inline spans, `stack` nodes, and style arrays so users can mix typography within a paragraph, matching `docs/examples/styles.js`.

**Motivation & Current Gaps**
- Current Text node editor only edits a single `text` string with optional style reference.
- We cannot author inline overrides (e.g., `{ text: ["prefix", { text: "Bold", bold: true }] }`).

**User Experience Notes**
- Upgrade `TextNodeItem` to a mini block editor:
  - Represent content as a list of spans (plain text, styled text, dynamic value placeholder later).
  - Provide toolbar buttons for bold/italics/color/size overrides and style chips.
- Allow converting a paragraph into a `stack`, enabling multiple paragraphs inside a single column.
- Show preview of combined styles (ordered precedence consistent with pdfMake).

**Data Model & pdfMake Mapping**
- Extend `TextNode` to support either `string` or `Array<TextSpan>` with `TextSpan = string | { text: string; style?: string | string[]; bold?: boolean; italics?: boolean; fontSize?: number; color?: string; }`.
- Introduce `StackNode = { stack: DocContentItem[]; style?: string | string[]; }` and add to union.
- Update reducers and serialization to keep nested arrays consistent.

**Dependencies & Sequencing**
- Relies on style rename/update pathways already in place (Milestone 0 accomplished this).
- Works best after we create shared validation utilities (Milestone 7 tasks). Schedule after Column Builder so both can share nested editing patterns.

**Open Questions**
- Should inline editor support undo/redo locally before global undo exists?
- How to display inline comment/help for precedence of multiple styles?

## 3. Header & Footer Designer

**Goal:** Provide UI for static and dynamic headers/footers, covering both simple strings and functions similar to `docs/pdfMake-docs.md` examples.

**Motivation & Current Gaps**
- Document settings currently expose fields like watermark and metadata, but header/footer require manual JSON editing.
- Most serious pdfMake templates rely on page numbers and company banners.

**User Experience Notes**
- Add a “Headers & Footers” tab (or section within Settings panel) with two modes per area:
  - **Static**: text/columns image, using same editors as normal content.
  - **Dynamic**: guided builder for `function (currentPage, pageCount, pageSize) { ... }` patterns. Provide tokens for `[page]`, `[pageCount]`, etc., that compile into a function.
- Allow previewing header/footer in Preview Panel (overlay sample page numbers).

**Data Model & pdfMake Mapping**
- Extend `DocDefinition` editing functions to set `header` and `footer` either as `string | DocContentItem | DocContentItem[]` or generator functions. For the latter, store DSL representation in state and compile to JS when exporting/downloading.
- Introduce serializer that turns builder selections into proper functions while keeping them editable.

**Dependencies & Sequencing**
- Depends on Rich Text/Stack Editor to render more complex header/footer content.
- Should land before pagination tooling so the header/footer DSL can piggy-back on the same token system.

**Open Questions**
- How to store user-authored function safely (stringified code vs. structured object)?
- Do we need guardrails for accessing `pageSize` fields (width/height) in UI?

## 4. Table Spans & Layout Controls

**Goal:** Add support for `colSpan`, `rowSpan`, advanced layout configs, and predefined styling (zebra striping, dashed borders) to the Table editor.

**Motivation & Current Gaps**
- Table editor currently offers only body editing, headerRows, and a layout dropdown.
- pdfMake examples (see `docs/examples/tables.js`) rely on spans, custom `layout` callbacks, and per-cell borders.

**User Experience Notes**
- Enhance `TableNodeItem`:
  - Cell context menu with “Merge Right/Down”, automatically inserting filler cells per pdfMake rules.
  - Inspector panel for selected cell/row with controls for background color, border toggles, alignment, noWrap, etc.
  - Layout presets: `noBorders`, `lightHorizontalLines`, zebra stripes, dashed, custom. For custom, expose simple builder for `hLineWidth`, `vLineColor`, etc., stored as JSON DSL.
- Possibly split header row configuration into dedicated section with “Repeat on new page” toggles.

**Data Model & pdfMake Mapping**
- Update table data structure to store cell objects (not just strings). Example: `string | { text: string; colSpan?: number; rowSpan?: number; fillColor?: string; border?: [boolean, boolean, boolean, boolean]; }`.
- Maintain compatibility with existing string cells by auto-wrapping during edits.
- For layout DSL, store metadata under `tableLayouts` and reference by name when exporting.

**Dependencies & Sequencing**
- Should follow Column & Rich Text work so nested editors and style pickers are available.
- Interacts with Validation system (Milestone 7) to guarantee spans have filler cells.

**Open Questions**
- What is the best UX to display merged cell boundaries in the list-based editor (table preview vs. modal grid)?
- How to persist user-defined layout functions—shared across tables or per table?

## 5. Pagination & Page Break Tools

**Goal:** Give users control over `pageBreak`, `pageOrientation` per node, `keepWithHeaderRows`, and a friendly builder for `pageBreakBefore` rules.

**Motivation & Current Gaps**
- Designers cannot mark nodes to start on new pages or prevent orphan headers.
- `docs/pdfMake-docs.md` outlines `pageBreakBefore` logic that is impossible to set through the current UI.

**User Experience Notes**
- Extend the upcoming Properties panel with a “Pagination” section for any selected node:
  - Toggles/dropdowns for `pageBreak: before | after | both`.
  - Orientation override (portrait/landscape) with preview icon.
  - Minimum lines on page (conceptual wrapper for `keepWithHeaderRows`, `dontBreakRows`).
- Add Document-level “Flow Rules” editor: allow users to build simple conditions (e.g., “when node style is Header, insert page break if last item on page”). Represent as high-level rules that translate to `pageBreakBefore` function.

**Data Model & pdfMake Mapping**
- Extend `ElementProperties` or per-node structures to include pagination metadata.
- Store document-level rule DSL and compile to JS function when generating pdfMake docDefinition.

**Dependencies & Sequencing**
- Requires selection model (Milestone 2). Should follow header/footer work so tokens/functions share infrastructure.
- Benefit from Validation improvements to warn about conflicting settings.

**Open Questions**
- How granular should the rule builder be initially? (Maybe provide a limited set of predicates: style name, node type, index.)
- Should we preview page breaks in the PDF preview or add guide lines in a revamped canvas?

## 6. Interactive Elements Palette

**Goal:** Introduce `link`, `linkToPage`, `linkToDestination`, `id` anchors, and `qr` nodes for interactive PDFs.

**Motivation & Current Gaps**
- pdfMake supports hyperlinks and QR codes, but builders must edit JSON by hand.
- Many business templates require “View Terms” links or scannable codes.

**User Experience Notes**
- Expand Elements panel with “Link” and “QR Code” items.
- For text nodes, allow highlighting substring → “Add link” to wrap span with link metadata.
- Provide `QR` node editor with fields for text, fit, foreground/background colors (per `docs/pdfMake-docs.md`).
- Add Document Anchors section to manage destination IDs and show warnings if duplicates exist.

**Data Model & pdfMake Mapping**
- Update `TextSpan` structure to include `link`, `linkToPage`, `linkToDestination`, `id`.
- Add `QrNode = { qr: string; fit?: number | string; foreground?: string; background?: string; eccLevel?: 'L' | 'M' | 'Q' | 'H'; version?: number; }` to content union.
- Manage anchor references when duplicating/deleting nodes.

**Dependencies & Sequencing**
- Built atop Rich Text editor (for hyperlink spans) and improved element factory (Milestone 3 follow-up).
- Should land after pagination (to support `linkToPage` gracefully) but before advanced help polish to avoid rework.

**Open Questions**
- Do we need a validator to ensure `linkToDestination` targets exist?
- How to surface warnings when hyperlinks contain invalid URLs (tie into Milestone 7 validation)?

---

## Implementation Roadmap (Suggested Order)

1. **Milestone 2 Enhancements** – Build unified selection state + properties panel. This unlocks a better editing canvas for all subsequent features.
2. **Column Layout Builder** – High-impact layout capability; sets precedent for nested editors.
3. **Rich Text & Stack Editor** – Shared tooling for inline overrides, required by headers/footers and interactive spans.
4. **Header & Footer Designer** – Builds on rich text and column frameworks, delivering a top-requested doc feature.
5. **Table Spans & Layout Controls** – Deepens table functionality leveraging improved editors.
6. **Pagination & Page Break Tools** – Uses selection/property infrastructure, plus function DSL from header/footer work.
7. **Interactive Elements Palette** – Adds hyperlinks and QR codes once text editing is robust.

## General Guidance for Future Agents

- **Leverage Existing Reducer Patterns:** `CONTENT_OP` is the central hub. Prefer extending it with new operation types over ad-hoc state manipulation.
- **Maintain Serializable DSLs:** For any feature that compiles to a function (headers, page rules), store a structured representation (JSON) alongside generated JS to keep edits reversible.
- **Validation First:** Each new editor should surface inline validation errors to reduce reliance on console logs; ties directly into Milestone 7 work.
- **Preview Integration:** Whenever feasible, provide hooks that trigger Preview Panel refresh (either debounced or manual) so users can confirm behavior.
- **Accessibility & Tooltips:** Follow the Tooltip system already introduced in the Header (Info icon) and aim to unify across new controls.

These notes encapsulate the current architecture and highlight the design intent behind each feature, helping future AI or human contributors implement them in alignment with the project’s goals.

