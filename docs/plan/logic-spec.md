# PDFMake Template Builder - Logic Specification

## 📚 Unified Glossary & Terminology

### Core Concepts
- **Template**: A complete PDF document structure with elements, styling, and metadata
- **Element**: Individual components that make up a template (text, table, image, etc.)
- **DocDefinition**: pdfMake's JSON structure that defines the PDF output
- **Canvas**: The visual editing area where users arrange elements
- **Palette**: The sidebar containing available element types for drag-and-drop

### Data Types
- **TemplateElement**: The primary interface for template elements (consistent across all docs)
- **ElementType**: Enumeration of available element types (text, table, image, etc.)
- **ElementProperties**: Configuration object containing all element-specific settings
- **Position**: Coordinate system for element placement (x, y coordinates)

### State Management
- **AppState**: Global application state containing current template, UI state, and settings
- **AppAction**: Flux-style action objects for state updates
- **ValidationError**: Structured error information with severity and suggestions

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
## Phase 0: Flow Content Model and Operations

### DocDefinition Focus
- Operate directly on `docDefinition.content` (ordered array) and `docDefinition.styles` (record of style definitions).

### Supported Content Node Types (Phase 0)
```typescript
type FlowContentItem =
  | string
  | { text: string; style?: string | string[] };
```

### Operations on Content
```typescript
type ContentOperation =
  | { type: 'ADD_STRING'; payload: { index?: number; value: string } }
  | { type: 'ADD_TEXT_NODE'; payload: { index?: number; text: string; style?: string | string[] } }
  | { type: 'UPDATE_STRING'; payload: { index: number; value: string } }
  | { type: 'UPDATE_TEXT_NODE'; payload: { index: number; text?: string; style?: string | string[] } }
  | { type: 'MOVE_ITEM'; payload: { from: number; to: number } }
  | { type: 'DELETE_ITEM'; payload: { index: number } };
```

### Styles Model (Phase 0)
```typescript
interface SimpleStyleDef {
  fontSize?: number;
  bold?: boolean;
  italics?: boolean;
}

type StylesMap = Record<string, SimpleStyleDef>;
```

### Operations on Styles
```typescript
type StylesOperation =
  | { type: 'ADD_STYLE'; payload: { name: string; def: SimpleStyleDef } }
  | { type: 'UPDATE_STYLE'; payload: { name: string; def: Partial<SimpleStyleDef> } }
  | { type: 'RENAME_STYLE'; payload: { from: string; to: string } }
  | { type: 'DELETE_STYLE'; payload: { name: string } };
```

### Reducer Extensions (Phase 0)
```typescript
type AppActionPhase0 =
  | { type: 'CONTENT_OP'; payload: ContentOperation }
  | { type: 'STYLES_OP'; payload: StylesOperation }
  | { type: 'CLEAR_TEMPLATE' }
  | { type: 'RELOAD_DEFAULT_TEMPLATE' };
```

### Clear Template Behavior
- `CLEAR_TEMPLATE` resets `content` to `[]` and `styles` to `{}` after destructive confirmation.
- `RELOAD_DEFAULT_TEMPLATE` replaces state with parsed `styles-simple` example.

### Validation Rules (Phase 0)
- Content array must contain only supported node types.
- `style` on text node must be a string or string[] and point to defined style keys.
- Style definitions may only include: `fontSize`, `bold`, `italics`.

### Preview Synchronization
- Debounce updates (e.g., 300–500ms) when content or styles change.
- On error from pdfMake, surface message and retain last valid preview.

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
  | { type: 'LOAD_TEMPLATE'; payload: { templateId: string } }
  | { type: 'DRAG_START'; payload: { elementId: string; dragData: DragData } }
  | { type: 'DRAG_END'; payload: { elementId: string; finalPosition: Position } }
  | { type: 'UNDO_ACTION'; payload: {} }
  | { type: 'REDO_ACTION'; payload: {} };
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
- **Flow-based**: Elements positioned in document flow (top-to-bottom)
- **Column-based**: Side-by-side layout using pdfMake columns
- **Table-based**: Grid positioning within table structures
- **Absolute positioning**: Limited support for overlays/watermarks
- **Constraints**: Width/height limits based on pdfMake capabilities

## 🎯 **Visual Editor to pdfMake Mapping Challenge**

### Core Architectural Challenge
**Problem**: Visual editors assume absolute positioning (like CSS), but pdfMake uses document flow (like Word/LaTeX).

### Solution: Hybrid Approach

#### 1. **Canvas as "Visual Proxy"**
- Canvas shows visual representation with drag handles
- Elements appear positioned but actually map to pdfMake structures
- Real-time translation between visual and pdfMake representations

#### 2. **Smart Element Classification**
```typescript
enum ElementLayout {
  FLOW = 'flow',           // Standard document flow
  COLUMN = 'column',       // Side-by-side layout
  TABLE = 'table',         // Grid-based layout
  OVERLAY = 'overlay'      // Absolute positioning (limited)
}
```

#### 3. **Layout Translation Strategy**
- **Flow Elements**: Simple text, images → direct pdfMake elements
- **Column Elements**: Convert side-by-side drag to pdfMake columns
- **Table Elements**: Convert grid drag to table structures
- **Complex Layouts**: Use nested tables/columns for complex positioning

#### 4. **Visual Feedback Mapping**
- **Drag Feedback**: Show immediate visual response
- **Drop Validation**: Check if layout is pdfMake-compatible
- **Preview Sync**: Translate canvas state to docDefinition in real-time

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

## 🖱️ Comprehensive Drag & Drop System

### Drag and Drop Architecture

#### Core Components
```
DragDropSystem
├── DragController          # Main coordination
├── DragSource             # Element palette items
├── DropTarget             # Canvas drop zones
├── DragPreview           # Visual feedback during drag
├── PositionCalculator    # Grid/snap calculations
└── CollisionDetector     # Element overlap detection
```

#### Drag Data Structure
```typescript
interface DragData {
  elementId: string;
  elementType: ElementType;
  initialPosition: Position;
  dragOffset: { x: number; y: number };
  isNewElement: boolean;  // True for palette items, false for existing elements
}

interface Position {
  x: number;
  y: number;
  page?: number;  // For multi-page templates
}

interface DropResult {
  position: Position;
  valid: boolean;
  snapPosition?: Position;
  collision?: TemplateElement;
}
```

### Drag States & Lifecycle

#### State Machine
```
Idle ───▶ Dragging ───▶ Dropping ───▶ Complete
  ▲           │            │            │
  └───────────┴────────────┴────────────┘
          Error/Cancel
```

#### Drag Lifecycle Events
1. **DRAG_START**: User initiates drag on element or palette item
2. **DRAG_OVER**: Mouse moves over potential drop targets
3. **DRAG_ENTER/LEAVE**: Entering/leaving specific drop zones
4. **DROP**: User releases drag over valid drop target
5. **DRAG_END**: Drag operation completes (success or cancel)

### Positioning System

#### Flow-Aware Positioning
```typescript
interface FlowPositioning {
  flowOrder: number;              // Position in document flow
  columnPosition?: number;        // Position within columns (0, 1, 2...)
  tableCell?: { row: number; col: number }; // Position in table
  relativeTo?: string;            // Element ID this is positioned relative to
}

interface PositionCalculator {
  calculateFlowPosition(dragPosition: Position): FlowPositioning;
  validateLayoutIntent(element: TemplateElement, targetPosition: Position): LayoutValidation;
  suggestLayoutConversion(currentLayout: ElementLayout, desiredPosition: Position): LayoutSuggestion;
  constrainToPdfMake(position: Position): Position;
}
```

#### Layout Intent Detection
```typescript
interface LayoutIntent {
  type: 'flow_append' | 'column_create' | 'table_cell' | 'flow_insert';
  confidence: number;  // 0-1, how well this intent matches user action
  suggestedLayout: ElementLayout;
  conversionCost: number; // Complexity of converting to this layout
}

#### Layout Compatibility Detection
```typescript
interface LayoutValidation {
  isValid: boolean;
  compatibility: 'perfect' | 'convertible' | 'problematic';
  issues: LayoutIssue[];
  suggestions: LayoutSuggestion[];
  conversionRequired: boolean;
}

interface LayoutIssue {
  type: 'flow_violation' | 'column_limit' | 'table_complexity' | 'nested_limit';
  severity: 'warning' | 'error';
  message: string;
  elementId?: string;
}

interface LayoutSuggestion {
  description: string;
  conversionType: 'auto' | 'manual' | 'alternative';
  complexity: number; // 1-10 scale
  preservesIntent: boolean; // Does this maintain user's design intent?
}
```

### Visual Feedback System

#### Drag States
- **Default**: Normal element appearance
- **Hover**: Highlight border, cursor change
- **Dragging**: Semi-transparent, shadow effect
- **Valid Drop**: Green highlight on drop zone
- **Invalid Drop**: Red highlight, no-drop cursor
- **Snap Active**: Blue guidelines show snap points

#### Drag Preview
```typescript
interface DragPreview {
  showOriginal: boolean;       // Keep original element visible
  previewElement: HTMLElement; // Cloned element for dragging
  ghostImage: boolean;         // Use browser ghost image
  customCursor: string;        // Custom drag cursor
}
```

### Element-Specific Drag Behavior

#### New Elements (From Palette)
- **Source**: Element palette items
- **Drag Data**: Element type, default properties
- **Drop Result**: Insert element into document flow at calculated position
- **Validation**: Check layout compatibility, suggest conversions if needed
- **Smart Defaults**: Apply context-aware default properties

#### Existing Elements (Canvas)
- **Source**: Canvas elements (visual representation)
- **Drag Data**: Element ID, current layout context
- **Drop Result**: Reposition in flow, potentially triggering layout conversions
- **Validation**: Validate new position against pdfMake constraints
- **Layout Conversion**: May convert flow→columns, columns→table, etc.

#### pdfMake-Aware Behaviors

##### Text Elements
- **Best Fit**: Document flow (simple insertion)
- **Column Conversion**: Can be dragged to create side-by-side columns
- **Table Conversion**: Can be inserted into table cells

##### Image Elements
- **Flow Positioning**: Natural document flow
- **Column Layout**: Side-by-side with other elements
- **Size Constraints**: Respect pdfMake width/height/fit properties

##### Table Elements
- **Complex Behavior**: Tables have internal grid structure
- **Cell Targeting**: Drag should target specific table cells
- **Span Handling**: Consider rowSpan/colSpan when repositioning
- **Layout Conversion**: Can convert to/from column layouts

### Advanced Features

#### Multi-Element Selection
```typescript
interface MultiSelectDrag {
  selectedElements: string[];    // Array of element IDs
  groupBounds: Rectangle;        // Bounding box of selection
  dragAnchor: Position;          // Reference point for relative movement
  maintainSpacing: boolean;      // Keep relative positions
}
```

#### Touch Device Support
- **Touch Events**: touchstart, touchmove, touchend
- **Gesture Recognition**: Pinch-to-zoom, multi-touch drag
- **Responsive Feedback**: Larger touch targets, haptic feedback
- **Accessibility**: Screen reader announcements

#### Undo/Redo Integration
- **Drag Operations**: Recorded as compound actions
- **State Snapshots**: Before/after positions saved
- **Redo Stack**: Maintain history during drag operations

### Performance Optimizations

#### Rendering Optimization
- **Virtual Scrolling**: Only render visible canvas area
- **Debounced Updates**: Limit position calculation frequency
- **Element Culling**: Hide off-screen elements during drag
- **GPU Acceleration**: Use CSS transforms for smooth movement

#### Memory Management
- **Drag Preview Cleanup**: Remove unused preview elements
- **Event Listener Management**: Proper cleanup on drag end
- **Canvas Redraw Throttling**: Limit canvas updates during drag

### Error Handling

#### Drag Operation Errors
- **Invalid Drop Zone**: Visual feedback, prevent drop
- **Layout Incompatibility**: pdfMake constraint violations
- **Network Issues**: Handle async operations during drag
- **Memory Limits**: Prevent excessive drag operations
- **Browser Compatibility**: Fallback for unsupported features

#### Layout-Specific Errors
- **Flow Violations**: Attempting impossible positioning
- **Column Limits**: Too many columns for page width
- **Table Complexity**: Nested tables beyond pdfMake limits
- **Conversion Failures**: Unable to convert between layout types

#### Recovery Mechanisms
- **Drag Cancellation**: ESC key or click outside
- **Layout Reset**: Return to original layout structure on error
- **State Restoration**: Undo failed drag operations
- **Conversion Suggestions**: Offer alternative layout approaches

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
- **Drag and Drop**: Native HTML5 drag-and-drop with enhanced features

## 📋 **Key Architectural Recommendations**

### 1. **Canvas as Visual Abstraction Layer**
**Challenge**: Users expect absolute positioning, pdfMake uses document flow.

**Solution**:
- Canvas shows WYSIWYG representation with drag handles
- Real-time translation to pdfMake docDefinition
- Visual feedback masks underlying complexity
- Preview system shows actual PDF output

### 2. **Layout Intent Detection**
**Problem**: User drag gestures need interpretation for pdfMake compatibility.

**Implementation**:
- Analyze drag patterns (horizontal vs vertical placement)
- Detect intent: flow_append, column_create, table_cell, flow_insert
- Provide conversion suggestions with complexity ratings
- Smart defaults based on context

### 3. **Progressive Layout Complexity**
**Approach**: Start simple, add complexity as needed.

**Phases**:
1. **Flow Layout**: Simple top-to-bottom elements
2. **Column Layout**: Side-by-side elements using pdfMake columns
3. **Table Layout**: Grid-based layouts using table structures
4. **Hybrid Layout**: Mixed approaches for complex designs

### 4. **Template Examples Integration**
**Strategy**: Use existing examples as starting templates.

**Benefits**:
- Immediate working examples for users
- Educational value (users can see pdfMake code)
- Validation of layout conversion algorithms
- Quick wins for initial release

### 5. **Error Handling Philosophy**
**Principle**: Fail gracefully with helpful suggestions.

**Implementation**:
- Never lose user work due to layout errors
- Provide conversion alternatives when layout impossible
- Clear feedback about pdfMake limitations
- Progressive disclosure of complexity

## Security Considerations

### Input Sanitization
- **HTML Injection**: Sanitize all user inputs
- **Script Injection**: Prevent code execution in templates
- **File Upload**: Validate and sanitize uploaded files

### Data Protection
- **Local Only**: No external data transmission
- **User Consent**: Clear data storage policies
- **Privacy**: No tracking or analytics by default
