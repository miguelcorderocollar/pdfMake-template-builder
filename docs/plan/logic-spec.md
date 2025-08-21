# PDFMake Template Builder - Logic Specification

## System Architecture

### High-Level Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   User Interface │───▶│  State Management │───▶│  pdfMake Engine │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
    ┌────▼────┐             ┌────▼────┐             ┌────▼────┐
    │   UI    │             │  Store  │             │Template │
    │Components│             │ Layer  │             │Generator│
    └─────────┘             └────────┘             └─────────┘
```

## Data Flow Architecture

### 1. Template Creation Flow
```
User Action → UI Component → State Update → Template Sync → Preview Update
```

### 2. Element Management Flow
```
Element Creation → State Addition → Position Calculation → Render Update → DocDefinition Sync
```

### 3. Export Flow
```
Template State → DocDefinition Generation → Validation → pdfMake Processing → Output
```

## State Management Design

### Global State Structure
```typescript
interface AppState {
  // Current template being edited
  currentTemplate: Template;

  // UI state
  ui: {
    selectedElement: string | null;
    previewMode: 'canvas' | 'pdf';
    sidebarTab: 'elements' | 'properties' | 'styles';
    isDragging: boolean;
    errors: ValidationError[];
  };

  // Available elements and templates
  library: {
    elementTypes: ElementType[];
    exampleTemplates: ExampleTemplate[];
    userTemplates: Template[];
  };

  // System settings
  settings: {
    autoSave: boolean;
    gridSize: number;
    snapToGrid: boolean;
    theme: 'light' | 'dark';
  };
}
```

### State Actions
```typescript
type AppAction =
  | { type: 'ADD_ELEMENT'; payload: { type: ElementType; position: Position } }
  | { type: 'UPDATE_ELEMENT'; payload: { id: string; properties: Partial<ElementProperties> } }
  | { type: 'DELETE_ELEMENT'; payload: { id: string } }
  | { type: 'REORDER_ELEMENTS'; payload: { sourceId: string; targetId: string } }
  | { type: 'SET_SELECTED_ELEMENT'; payload: { id: string | null } }
  | { type: 'UPDATE_PREVIEW_MODE'; payload: { mode: PreviewMode } }
  | { type: 'SET_ERRORS'; payload: { errors: ValidationError[] } }
  | { type: 'SAVE_TEMPLATE'; payload: { template: Template } }
  | { type: 'LOAD_TEMPLATE'; payload: { templateId: string } };
```

## Component Communication

### Element System Architecture
```
ElementFactory
├── BaseElement (Abstract)
│   ├── TextElement
│   ├── TableElement
│   ├── ImageElement
│   ├── ListElement
│   ├── ColumnElement
│   └── PageBreakElement
└── ElementRenderer
```

### Element Lifecycle
1. **Creation**: ElementFactory creates element instance
2. **Mounting**: ElementRenderer renders to canvas
3. **Interaction**: User interacts → State updates
4. **Sync**: DocDefinition synchronizer updates pdfMake structure
5. **Preview**: Preview system renders updated PDF

## Template Synchronization

### DocDefinition Generation
```typescript
// Element → DocDefinition mapping
interface ElementToDocDefinitionMapper {
  mapElement(element: TemplateElement): any;

  mapTextElement(element: TextElement): TextDefinition;
  mapTableElement(element: TableElement): TableDefinition;
  mapImageElement(element: ImageElement): ImageDefinition;
  mapListElement(element: ListElement): ListDefinition;
  mapColumnElement(element: ColumnElement): ColumnDefinition;
}
```

### Synchronization Strategy
- **Real-time Sync**: Every state change triggers docDefinition update
- **Debounced Updates**: Preview updates are debounced (500ms)
- **Validation**: Pre-sync validation of element properties
- **Error Recovery**: Fallback to last valid state on sync failure

## Element Management System

### Element Types and Properties

#### Text Element
```typescript
interface TextProperties {
  content: string;
  fontSize: number;
  font: string;
  bold: boolean;
  italics: boolean;
  alignment: 'left' | 'center' | 'right' | 'justify';
  color: string;
  background: string;
  margin: number[];
  style: string[];
}
```

#### Table Element
```typescript
interface TableProperties {
  rows: number;
  columns: number;
  widths: (number | 'auto' | '*')[];
  heights: number[];
  headerRows: number;
  layout: TableLayout;
  cells: TableCell[][];
}

interface TableCell {
  content: string;
  properties: CellProperties;
  rowSpan?: number;
  colSpan?: number;
}
```

#### Image Element
```typescript
interface ImageProperties {
  src: string; // Base64 or URL
  width: number;
  height: number;
  fit: [number, number]; // [width, height]
  cover: { width: number; height: number; valign: string; align: string };
  opacity: number;
  margin: number[];
}
```

#### List Element
```typescript
interface ListProperties {
  type: 'ul' | 'ol';
  items: string[];
  markerColor: string;
  separator: string[];
  start: number;
  margin: number[];
}
```

### Element Positioning System
- **Grid-based**: 12-column grid system
- **Free-form**: Absolute positioning with drag-and-drop
- **Responsive**: Percentage-based widths
- **Constraints**: Min/max dimensions, aspect ratios

## Error Handling and Validation

### Validation Layers
1. **Input Validation**: User input sanitization
2. **Property Validation**: Element property constraints
3. **Structure Validation**: Template structure integrity
4. **pdfMake Validation**: DocDefinition compatibility

### Error Types
```typescript
interface ValidationError {
  type: 'input' | 'property' | 'structure' | 'pdfmake';
  elementId?: string;
  property?: string;
  message: string;
  severity: 'warning' | 'error';
  suggestion?: string;
}
```

### Error Recovery
- **Auto-fix**: Automatic correction of common issues
- **Fallback Values**: Default values for missing properties
- **User Guidance**: Helpful error messages with suggestions
- **History**: Undo/redo system for error recovery

## Template Import/Export System

### JSON Schema
```typescript
interface TemplateExport {
  version: string;
  metadata: {
    name: string;
    description?: string;
    author?: string;
    createdAt: Date;
    updatedAt: Date;
  };
  elements: ExportedElement[];
  docDefinition: DocDefinition;
  settings: ExportSettings;
}
```

### Import Process
1. **Schema Validation**: Validate JSON structure
2. **Version Compatibility**: Handle different template versions
3. **Element Migration**: Update deprecated element types
4. **Dependency Resolution**: Ensure all required assets are available

## Performance Optimization

### Rendering Strategy
- **Virtual Scrolling**: Only render visible elements
- **Component Memoization**: Prevent unnecessary re-renders
- **Image Lazy Loading**: Load images on demand
- **Debounced Updates**: Batch state updates

### Memory Management
- **Image Compression**: Automatic image optimization
- **Cleanup**: Remove unused resources
- **Storage Limits**: Monitor localStorage usage
- **Cache Management**: Smart caching of generated PDFs

## Integration Points

### pdfMake Integration
- **Version Compatibility**: Support multiple pdfMake versions
- **Font Management**: Custom font loading and management
- **Error Parsing**: Convert pdfMake errors to user-friendly messages
- **Performance**: Efficient PDF generation and preview

### Browser API Integration
- **File System**: File upload/download
- **Clipboard**: Copy/paste functionality
- **Local Storage**: Template persistence
- **Drag and Drop**: Native HTML5 drag-and-drop

## Security Considerations

### Input Sanitization
- **HTML Injection**: Sanitize all user inputs
- **Script Injection**: Prevent code execution in templates
- **File Upload**: Validate and sanitize uploaded files

### Data Protection
- **Local Only**: No external data transmission
- **User Consent**: Clear data storage policies
- **Privacy**: No tracking or analytics by default
