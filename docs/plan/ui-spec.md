# PDFMake Template Builder - UI Specification

## Phase 0: Flow-first editor aligned with pdfMake (styles-simple default)

### Rationale
To better match how pdfMake actually works, the MVP will avoid freeform, absolute positioning. Instead, we will model and edit the `docDefinition` directly, focusing on the `content` array (flow layout) and the `styles` object. This reduces errors and confusion versus draggable blocks that don’t map to pdfMake semantics.

### Default Template on Load
- **Initial state**: Load `docs/examples/styles-simple.js` as the default template.
- **Scope**: Parse and store `content` and `styles` from the example. The rest of the pdfMake keys are optional for Phase 0.

### Core Editing Model (Phase 0)
- **Content List (Flow)**: Display the `docDefinition.content` as an ordered list.
  - Supported items (Phase 0):
    - String paragraphs
    - Text nodes `{ text: string; style?: string | string[] }`
  - Inline `\n\n` is rendered as paragraph breaks; kept in the node.
- **Operations**:
  - Add paragraph (string)
  - Add text node (with optional style)
  - Edit content text inline
  - Apply/clear style (single or multiple)
  - Insert above/below
  - Move up/down
  - Delete item (with confirmation)
- **Validation**: Only allow properties supported by pdfMake for Phase 0 items.

### Styles Panel (Phase 0)
- List styles from `docDefinition.styles` (e.g., `header`, `subheader`, `quote`, `small`).
- Edit style properties relevant to Phase 0: `fontSize`, `bold`, `italics`.
- Apply selected style(s) to the currently selected content item.

### Destructive Actions
- **Clear Template**: Destructive confirmation dialog to clear the current template (empties `content` and `styles`).
  - Title: “Clear template?”
  - Message: “This will remove all content and styles. This action cannot be undone.”
  - Buttons: [Cancel] [Clear]
- Future (optional): “Reload Default Example” to restore `styles-simple` verbatim.

### Preview (Phase 0)
- Single Preview panel renders pdfMake output (data URL) from current `docDefinition`.
- Debounced updates on content/style changes.

### Navigation and Layout (Phase 0)
- Sidebar tabs simplified to: **Content**, **Styles**, **Templates** (Templates shows only the default for now).
- Canvas is replaced by the **Content List** for Phase 0. No drag-resize handles.
- Properties panel shows context-aware editor for selected content item (text + styles).

### Keyboard Shortcuts (Phase 0 additions)
- Enter: Finish inline edit
- Esc: Cancel inline edit
- Delete/Backspace: Delete selected item (asks for confirmation)

### Success Criteria (Phase 0)
- App loads with `styles-simple` default.
- User can add/edit/reorder/delete content items in flow.
- User can view and edit `styles` and apply them to items.
- PDF preview updates correctly and matches pdfMake rules for supported items.


## Layout Architecture

### Main Application Layout
```
┌─────────────────────────────────────────────────────────┐
│ Header Bar                                              │
│ ┌─────────┐ ┌─────────────┐ ┌─────────┐ ┌────────────┐ │
│ │ Logo    │ │ Template Name│ │ Actions │ │ User Menu  │ │
│ └─────────┘ └─────────────┘ └─────────┘ └────────────┘ │
└─────────────────────────────────────────────────────────┘

┌─────────────┬───────────────────────┬──────────────────┐
│             │                       │                  │
│             │                       │                  │
│  Sidebar    │     Main Canvas       │  Properties      │
│  Panel      │     Area              │  Panel           │
│             │                       │                  │
│             │                       │                  │
└─────────────┴───────────────────────┴──────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Status Bar                                             │
│ ┌─────────────┐ ┌────────────────┐ ┌─────────────────┐ │
│ │ Template    │ │ Last Saved     │ │ Errors/Warnings │ │
│ │ Status      │ │ 2 mins ago     │ │ 0 errors        │ │
│ └─────────────┘ └────────────────┘ └─────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Component Hierarchy

### 1. Header Components
```
Header/
├── Logo.tsx              // App branding
├── TemplateName.tsx      // Editable template title
├── ActionBar.tsx         // Save, Export, Preview, Import
│   ├── SaveButton.tsx
│   ├── ExportDropdown.tsx
│   ├── PreviewButton.tsx
│   └── ImportButton.tsx
└── UserMenu.tsx          // Settings, Help, About
```

### 2. Sidebar Components
```
Sidebar/
├── TabNavigation.tsx     // Elements, Styles, Templates
├── ElementsTab/
│   ├── ElementPalette.tsx
│   ├── SearchBar.tsx
│   └── ElementGroup.tsx
├── StylesTab/
│   ├── StyleList.tsx
│   ├── StyleEditor.tsx
│   └── StylePreview.tsx
└── TemplatesTab/
    ├── TemplateList.tsx
    ├── ExampleTemplates.tsx
    └── TemplateActions.tsx
```

### 3. Canvas Components
```
Canvas/
├── CanvasContainer.tsx
├── GridOverlay.tsx       // Optional grid for alignment
├── ElementRenderer.tsx   // Renders template elements
├── DropZone.tsx         // Drag and drop targets
├── SelectionBox.tsx     // Element selection indicators
└── ResizeHandles.tsx    // Element resize controls
```

### 4. Properties Panel
```
Properties/
├── PropertiesHeader.tsx
├── PropertyGroups/
│   ├── BasicProperties.tsx     // Width, height, position
│   ├── TextProperties.tsx      // Font, size, color, alignment
│   ├── LayoutProperties.tsx    // Margins, padding
│   ├── StyleProperties.tsx     // Background, borders
│   └── ElementSpecific.tsx     // Type-specific properties
└── PropertyControls/
    ├── TextInput.tsx
    ├── NumberInput.tsx
    ├── ColorPicker.tsx
    ├── SelectDropdown.tsx
    └── ToggleSwitch.tsx
```

## Visual Design System

### Color Palette
```css
/* Primary Colors */
--primary-50: #eff6ff;
--primary-100: #dbeafe;
--primary-500: #3b82f6;
--primary-600: #2563eb;
--primary-700: #1d4ed8;

/* Neutral Colors */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-500: #6b7280;
--gray-700: #374151;
--gray-900: #111827;

/* Status Colors */
--success-500: #10b981;
--warning-500: #f59e0b;
--error-500: #ef4444;

/* Canvas Colors */
--canvas-bg: #ffffff;
--canvas-grid: #f1f5f9;
--element-outline: #3b82f6;
--element-hover: #dbeafe;
```

### Typography
```css
/* Font Scale */
--font-xs: 0.75rem;    /* 12px */
--font-sm: 0.875rem;   /* 14px */
--font-base: 1rem;     /* 16px */
--font-lg: 1.125rem;   /* 18px */
--font-xl: 1.25rem;    /* 20px */
--font-2xl: 1.5rem;    /* 24px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Spacing System
```css
/* Spacing Scale */
--space-1: 0.25rem;    /* 4px */
--space-2: 0.5rem;     /* 8px */
--space-3: 0.75rem;    /* 12px */
--space-4: 1rem;       /* 16px */
--space-5: 1.25rem;    /* 20px */
--space-6: 1.5rem;     /* 24px */
--space-8: 2rem;       /* 32px */
--space-10: 2.5rem;    /* 40px */
--space-12: 3rem;      /* 48px */
```

## Interactive Elements

### Drag and Drop States
```
Element States:
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Default   │───▶│   Hover     │───▶│  Dragging   │
│             │    │             │    │             │
│             │    │  Highlight  │    │  Semi-      │
│             │    │  border     │    │  transparent│
└─────────────┘    └─────────────┘    └─────────────┘
                     │
                     ▼
               ┌─────────────┐
               │  Selected   │
               │             │
               │  Blue       │
               │  outline    │
               └─────────────┘
```

### Element Customization Interface
```
Property Panel Layout:
┌─────────────────────────────────┐
│ Basic Properties                 │
├─────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ │
│ │ Width       │ │ Height      │ │
│ │ [____] px   │ │ [____] px   │ │
│ └─────────────┘ └─────────────┘ │
├─────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ │
│ │ X Position  │ │ Y Position  │ │
│ │ [____] px   │ │ [____] px   │ │
│ └─────────────┘ └─────────────┘ │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ Text Properties                  │
├─────────────────────────────────┤
│ ┌─────────────┐                 │
│ │ Font Family ▼ │               │
│ └─────────────┘                 │
├─────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ │
│ │ Font Size   │ │ Color       │ │
│ │ [____] pt   │ │ [██████]    │ │
│ └─────────────┘ └─────────────┘ │
└─────────────────────────────────┘
```

## Responsive Design

### Breakpoint System
```css
/* Mobile First Breakpoints */
--breakpoint-sm: 640px;   /* Small tablets */
--breakpoint-md: 768px;   /* Tablets */
--breakpoint-lg: 1024px;  /* Laptops */
--breakpoint-xl: 1280px;  /* Desktops */
--breakpoint-2xl: 1536px; /* Large screens */
```

### Responsive Layout
```
Mobile (≤ 768px):
┌─────────────────┐
│     Header      │
├─────────────────┤
│                 │
│   Canvas Area   │ ← Swipe to navigate
│                 │
├─────────────────┤
│ Floating Action │
│ Button (FAB)    │
└─────────────────┘

Tablet (768px - 1024px):
┌─────────────┬─────────────────┐
│             │                 │
│  Sidebar    │   Canvas        │
│  (Collaps-  │   Area          │
│   ible)     │                 │
└─────────────┴─────────────────┘

Desktop (≥ 1024px):
┌─────────────┬───────────────────────┬──────────────────┐
│  Sidebar    │     Canvas Area       │  Properties     │
│  Panel      │                       │  Panel          │
└─────────────┴───────────────────────┴──────────────────┘
```

## Animation and Transitions

### Micro-interactions
- **Element Hover**: Subtle shadow and border highlight
- **Drag Start**: Scale animation (0.95) with shadow
- **Drop Success**: Bounce animation with success color
- **Error States**: Shake animation with error color
- **Loading States**: Skeleton screens and spinners

### Transition Durations
```css
--transition-fast: 150ms;
--transition-normal: 300ms;
--transition-slow: 500ms;
```

## Accessibility Features

### Keyboard Navigation
- **Tab Order**: Logical navigation through all interactive elements
- **Shortcuts**:
  - `Ctrl/Cmd + S`: Save template
  - `Ctrl/Cmd + P`: Preview PDF
  - `Ctrl/Cmd + E`: Export template
  - `Delete/Backspace`: Remove selected element
  - `Escape`: Deselect element

### Screen Reader Support
- **ARIA Labels**: Descriptive labels for all interactive elements
- **Live Regions**: Announce status changes and errors
- **Focus Management**: Proper focus indicators and management
- **Color Contrast**: WCAG AA compliance

## Error and Feedback System

### Error Display
```
Error Toast:
┌─────────────────────────────────────────────────────────┐
│ ⚠️  Warning: Text element exceeds page margins          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Suggestion: Reduce font size or adjust margins     │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘

Inline Error:
┌─────────────────────────────────┐
│ Width                            │
│ ┌─────────────────────────────┐ │
│ │ [999999] px                 │ │
│ └─────────────────────────────┘ │
│ ❌ Value must be between 1-1000 │
└─────────────────────────────────┘
```

### Success Feedback
```
Success Toast:
┌─────────────────────────────────────────────────────────┐
│ ✅ Template saved successfully                          │
└─────────────────────────────────────────────────────────┘

Progress Indicator:
┌─────────────────────────────────────────────────────────┐
│ Exporting PDF... [████████████████████] 100%           │
└─────────────────────────────────────────────────────────┘
```

## Preview System

### Preview Modes
```
Canvas Preview (Default):
┌─────────────────────────────────────────────────────────┐
│ Visual representation with drag handles and outlines  │
└─────────────────────────────────────────────────────────┘

PDF Preview:
┌─────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────┐ │
│ │ PDF rendered in iframe                             │ │
│ │ Shows actual output as it would appear in PDF      │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘

Split View:
┌─────────────────┬─────────────────────────────────────┐
│ Canvas          │ PDF Preview                         │
│ Preview         │ (Real-time sync)                    │
└─────────────────┴─────────────────────────────────────┘
```

### Preview Controls
```
Preview Toolbar:
┌─────────────┬─────────────┬─────────────┬─────────────┐
│ Full Screen │ Zoom In     │ Zoom Out    │ Actual Size │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

## Dark Mode Support

### Theme System
```typescript
interface Theme {
  colors: {
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    primary: string;
    error: string;
    warning: string;
    success: string;
  };
  spacing: SpacingScale;
  typography: TypographyScale;
  shadows: ShadowScale;
}
```

### Theme Toggle
- **System Preference**: Auto-detect OS theme
- **Manual Toggle**: User can override system preference
- **Smooth Transitions**: Animated theme switching
- **Theme Persistence**: Save user preference in localStorage

## 💡 Tooltips & Help System

### Tooltip Architecture

#### Tooltip Types
```
ContextualTooltips     // Element-specific guidance
ActionTooltips        // Button/function explanations
ValidationTooltips    // Error/warning messages
HelpTooltips         // General assistance
```

#### Tooltip Components
```typescript
interface TooltipSystem {
  TooltipProvider: React.Context;
  useTooltip: () => TooltipHook;
  TooltipContainer: React.Component;
  TooltipTrigger: React.Component;
  TooltipContent: React.Component;
}

interface TooltipConfig {
  content: string | ReactNode;
  position: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  delay: number;
  duration: number;
  interactive: boolean;
  theme: 'light' | 'dark';
  maxWidth: number;
}
```

### Contextual Tooltips

#### Element-Specific Tooltips
```
Text Element:
┌─────────────────────────────────────┐
│ 📝 Text Element                     │
│                                    │
│ • Click to edit content           │
│ • Drag to reposition              │
│ • Use properties panel for styling│
│                                    │
│ [Learn More]                      │
└─────────────────────────────────────┘

Table Element:
┌─────────────────────────────────────┐
│ 📊 Table Element                    │
│                                    │
│ • Double-click cells to edit      │
│ • Drag column borders to resize   │
│ • Right-click for context menu    │
│                                    │
│ [Learn More]                      │
└─────────────────────────────────────┘
```

#### Action Button Tooltips
```
Save Button:
┌─────────────────────────────────────┐
│ 💾 Save Template                    │
│                                    │
│ Saves current template to          │
│ local storage. Use Ctrl+S         │
│                                    │
│ Keyboard: Ctrl/Cmd + S            │
└─────────────────────────────────────┘

Preview Button:
┌─────────────────────────────────────┐
│ 👁️ Preview PDF                      │
│                                    │
│ Generate and preview PDF output   │
│ in new tab or embedded view       │
│                                    │
│ Keyboard: Ctrl/Cmd + P            │
└─────────────────────────────────────┘
```

### Interactive Help System

#### Help Components Hierarchy
```
HelpSystem/
├── HelpProvider
├── HelpButton
├── HelpPanel
├── TutorialOverlay
├── ContextualHelp
└── QuickStartGuide
```

#### Help Panel Interface
```
Help Panel Layout:
┌─────────────────────────────────────┐
│ 🔍 Search Help                     │
├─────────────────────────────────────┤
│ [Search topics...]                 │
├─────────────────────────────────────┤
│ 📚 Getting Started                 │
│ ├── Creating your first template   │
│ ├── Adding elements                │
│ └── Customizing elements           │
├─────────────────────────────────────┤
│ 🎨 Elements                        │
│ ├── Text elements                  │
│ ├── Tables                         │
│ ├── Images                         │
│ └── Advanced elements              │
├─────────────────────────────────────┤
│ ⚙️ Settings & Preferences          │
│ ├── Keyboard shortcuts             │
│ ├── Theme settings                 │
│ └── Export options                 │
└─────────────────────────────────────┘
```

### Tutorial System

#### Interactive Tutorials
```typescript
interface TutorialStep {
  id: string;
  title: string;
  content: string;
  target: string;        // CSS selector for highlight
  position: 'top' | 'bottom' | 'left' | 'right';
  action: 'click' | 'drag' | 'type' | 'next';
  nextStep?: string;
}

interface Tutorial {
  id: string;
  title: string;
  description: string;
  steps: TutorialStep[];
  prerequisites?: string[];
  estimatedTime: number;
}
```

#### Tutorial Flow Example
```
Step 1: Welcome
┌─────────────────────────────────────┐
│ 🎉 Welcome to PDFMake Builder!      │
│                                    │
│ Let's create your first template   │
│ together.                         │
│                                    │
│ [Start Tutorial] [Skip]           │
└─────────────────────────────────────┘

Step 2: Add Text Element
┌─────────────────────────────────────┐
│ 📝 Adding Your First Element        │
│                                    │
│ Drag a "Text" element from the     │
│ sidebar to the canvas area.       │
│                                    │
│ [Previous] [Next]                 │
└─────────────────────────────────────┘
```

### Contextual Help Triggers

#### Smart Help Detection
- **New User Detection**: Show welcome tutorial
- **Element Hover**: Show element-specific tips
- **Error States**: Display relevant help topics
- **Idle Time**: Suggest next steps or tutorials
- **Feature Discovery**: Highlight unused features

#### Help Shortcuts
```
F1 Key          // Open main help panel
Shift + ?       // Quick help overlay
Ctrl + H        // Contextual help
Escape          // Close help overlays
```

## 🔒 Confirmation Dialogs

### Dialog System Architecture

#### Confirmation Dialog Types
```
DestructiveActions    // Delete, clear, reset
UnsavedChanges       // Navigation with unsaved work
OverwriteActions     // Save with existing name
LargeOperations      // Heavy processing tasks
SecurityActions      // File operations, imports
```

#### Dialog Component Structure
```typescript
interface ConfirmationDialog {
  type: DialogType;
  title: string;
  message: string;
  details?: string;
  confirmLabel: string;
  cancelLabel: string;
  variant: 'danger' | 'warning' | 'info' | 'success';
  showDontAskAgain: boolean;
}

interface DialogActions {
  onConfirm: () => void;
  onCancel: () => void;
  onDontAskAgain?: (checked: boolean) => void;
}
```

### Dialog Design Patterns

#### Destructive Action Dialog
```
Delete Element Dialog:
┌─────────────────────────────────────┐
│ ⚠️ Delete Element?                  │
├─────────────────────────────────────┤
│ Are you sure you want to delete    │
│ "Header Text"? This action cannot │
│ be undone.                        │
├─────────────────────────────────────┤
│ □ Don't ask me again for element   │
│   deletions                        │
├─────────────────────────────────────┤
│ [Cancel]                  [Delete] │
└─────────────────────────────────────┘
```

#### Unsaved Changes Dialog
```
Unsaved Changes Dialog:
┌─────────────────────────────────────┐
│ 💾 Unsaved Changes                  │
├─────────────────────────────────────┤
│ Your template has unsaved changes. │
│ What would you like to do?        │
├─────────────────────────────────────┤
│ [Discard Changes] [Save & Continue]│
├─────────────────────────────────────┤
│                                    │
│ □ Don't ask me again for this     │
│   session                          │
└─────────────────────────────────────┘
```

#### Large Operation Dialog
```
Export PDF Dialog:
┌─────────────────────────────────────┐
│ 📄 Exporting PDF                    │
├─────────────────────────────────────┤
│ This may take a few seconds for    │
│ large templates. Please wait...   │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │███████████████████████░ 90%    │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ [Cancel Export]                     │
└─────────────────────────────────────┘
```

### Advanced Dialog Features

#### Progress Dialogs
```typescript
interface ProgressDialog {
  title: string;
  message: string;
  progress: number;      // 0-100
  showProgressBar: boolean;
  canCancel: boolean;
  estimatedTime?: number;
  currentStep?: string;
  totalSteps?: number;
}
```

#### Multi-Step Confirmations
```
Import Template Dialog:
Step 1: File Selection
┌─────────────────────────────────────┐
│ 📁 Select Template File             │
├─────────────────────────────────────┤
│ Choose a JSON template file to     │
│ import:                           │
├─────────────────────────────────────┤
│ [Select File...]                   │
├─────────────────────────────────────┤
│ [Cancel]                  [Next]   │
└─────────────────────────────────────┘

Step 2: Preview & Confirm
┌─────────────────────────────────────┐
│ 👁️ Preview Import                   │
├─────────────────────────────────────┤
│ Template: "Invoice Template"       │
│ Elements: 12                       │
│ Last Modified: 2 days ago          │
├─────────────────────────────────────┤
│ [Back]                    [Import] │
└─────────────────────────────────────┘
```

### Dialog Management

#### Dialog Queue System
- **Priority Levels**: Critical, High, Normal, Low
- **Modal vs Non-Modal**: Blocking vs non-blocking dialogs
- **Queue Management**: Handle multiple pending dialogs
- **State Persistence**: Remember user preferences

#### Accessibility Features
- **Keyboard Navigation**: Tab order, Enter/Escape handling
- **Screen Reader Support**: ARIA labels and live regions
- **Focus Management**: Proper focus restoration
- **High Contrast**: Support for accessibility themes

## Performance Optimizations

### Rendering Optimizations
- **Virtual Scrolling**: Only render visible elements
- **Component Memoization**: Prevent unnecessary re-renders
- **Lazy Loading**: Load heavy components on demand
- **Image Optimization**: Progressive loading and caching

### User Experience Enhancements
- **Skeleton Screens**: Loading states for better perceived performance
- **Progressive Enhancement**: Core functionality works without JavaScript
- **Optimistic Updates**: UI updates immediately, syncs in background
- **Error Boundaries**: Graceful error handling and recovery
