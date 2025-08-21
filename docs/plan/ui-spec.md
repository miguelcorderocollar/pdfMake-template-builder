# PDFMake Template Builder - UI Specification

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
