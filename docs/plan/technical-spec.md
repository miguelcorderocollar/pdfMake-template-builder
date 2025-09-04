# PDFMake Template Builder - Technical Specification

## 📚 Unified Terminology Reference

See `logic-spec.md` for complete glossary and terminology definitions. Key terms used consistently across documents:

- **TemplateElement**: Primary interface for template elements
- **ElementType**: Enumeration of available element types
- **ElementProperties**: Configuration object for element settings
- **DocDefinition**: pdfMake's JSON structure for PDF output
- **AppState**: Global application state structure
- **AppAction**: Flux-style action objects for state updates

## Overview
A client-side web application for building and customizing PDFMake templates through an intuitive visual interface.

## Phase 0: Flow-first, example-driven MVP

### Scope
- Load `docs/examples/styles-simple.js` as the initial `docDefinition`.
- Support a limited, pdfMake-aligned editing surface:
  - `content` items: string paragraphs and `{ text, style? }` nodes
  - `styles` properties: `fontSize`, `bold`, `italics`
- Provide a destructive "Clear Template" action with confirmation dialog.

### Non-Goals (Phase 0)
- Arbitrary absolute positioning
- Complex elements (tables, images, columns, lists) beyond viewing the example
- Drag/resize handles on a freeform canvas

### Data Flow (Phase 0)
```
User edits content/styles → AppState.docDefinition updates → Debounced pdfMake render → Preview iframe updates
```

### Persistence
- Auto-load default example on first run
- Save current working `docDefinition` to localStorage
- Optional action to reload the default example

## Architecture

### Technology Stack
- **Framework**: Next.js 15+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: @shadcn/ui
- **State Management**: React Context + useReducer
- **Build Tool**: Bun (as requested)
- **Deployment**: Vercel

### Client-Side Only Design
- No backend/database required
- All data stored in browser localStorage/sessionStorage
- Templates exported as JSON for sharing

## Core Components

### 1. Template Builder Interface (Phase 0 focus)
```
src/components/
├── TemplateBuilder/
│   ├── ContentList.tsx     # Ordered flow list of content items
│   ├── StylesPanel.tsx     # Styles editor/applicator
│   ├── PropertiesPanel.tsx # Inline editor for selected item
│   └── Toolbar.tsx         # Save/export/preview, Clear Template
```

### 2. Element System (Phase 0 subset)
```
src/components/elements/
├── FlowStringItem.tsx      # Plain string paragraph
└── FlowTextNodeItem.tsx    # { text, style? }
```

### 3. Template Management
```
src/services/
├── templateService.ts    # Save/load templates
├── exportService.ts      # JSON export
└── exampleService.ts     # Load example templates
```

## Data Structure

### Template Definition (Phase 0 relevant subset)
```typescript
interface Template {
  id: string;
  name: string;
  description?: string;
  docDefinition: DocDefinition;
  createdAt: Date;
  updatedAt: Date;
}

interface TemplateElement {
  id: string;
  type: ElementType;
  position: { x: number; y: number };
  properties: ElementProperties;
  children?: TemplateElement[];
}

interface ElementProperties {
  // Common properties
  width?: number | string;
  height?: number | string;
  margin?: number[];
  style?: string;

  // Type-specific properties
  [key: string]: any;
}
```

### DocDefinition Mapping (Phase 0)
- UI edits directly mutate `docDefinition.content` and `docDefinition.styles`
- Real-time synchronization and validation are limited to supported properties

## Key Features Implementation

### 1. Flow Editing System (Phase 0)
- Ordered list operations: add/insert/move/delete
- Inline text editor for strings and text nodes
- Style application via style names

### 2. Styles Customization (Phase 0)
- Edit `fontSize`, `bold`, `italics` per style key
- Apply single or multiple styles to selected item

### 3. Image Management
- File upload with drag-and-drop
- Base64 conversion for pdfMake compatibility
- Image resizing and compression
- Support for URLs and local files

### 4. Preview System (Phase 0)
- PDF preview (iframe via data URL)
- Debounced updates
- Basic error surfacing

### 5. Template Import/Export (Phase 0)
- JSON export and copy to clipboard
- Load default example; import of other examples is out of scope initially

### 6. Error Handling (Phase 0)
- Parse and display pdfMake errors for supported nodes
- Guard invalid properties; minimal recovery suggestions

## Performance Considerations

### Optimization Strategies
- Debounced preview updates
- Virtual scrolling for large templates
- Image lazy loading
- Component memoization
- Bundle splitting

### Memory Management
- Efficient image storage
- Cleanup unused resources
- LocalStorage size limits handling

## Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Progressive Web App features
- Offline capability for template work

## Development Setup

### Project Structure
```
pdfmake-builder/
├── src/
│   ├── app/                 # Next.js app router
│   ├── components/          # React components
│   ├── services/           # Business logic
│   ├── types/              # TypeScript definitions
│   ├── utils/              # Utility functions
│   └── lib/                # External libraries
├── public/                 # Static assets
├── docs/                   # Documentation
└── package.json
```

### Build Configuration
- TypeScript strict mode
- ESLint + Prettier
- Tailwind CSS
- PostCSS
- Bundle analyzer

## Deployment Strategy

### Vercel Configuration
- Static site generation
- Environment variables
- Build optimization
- CDN integration

### CI/CD Pipeline
- GitHub Actions
- Automated testing
- Build verification
- Deployment automation

## Security Considerations

### Client-Side Security
- Input sanitization
- XSS prevention
- Content Security Policy
- Safe image handling

### Data Privacy
- Local storage only
- No external data transmission
- User data control

## Testing Strategy

### Testing Types
- Unit tests (Jest)
- Integration tests
- E2E tests (Playwright)
- Component testing (React Testing Library)

### Test Coverage
- Core business logic
- Component interactions
- Template generation
- Error scenarios

## Future Extensibility

### Plugin System
- Custom element types
- Theme system
- Export formats
- Third-party integrations

### Advanced Features
- Template marketplace
- Collaboration features
- Version history
- Advanced styling options
