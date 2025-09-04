// Core element types
export type ElementType = 'text' | 'table' | 'image' | 'list' | 'columns' | 'page';

// Position interface for elements
export interface Position {
  x: number;
  y: number;
}

// Common element properties
export interface ElementProperties {
  text?: string;
  width?: number | string;
  height?: number | string;
  margin?: number[];
  style?: string;
  [key: string]: unknown;
}

// Template element interface
export interface TemplateElement {
  id: string;
  type: ElementType;
  position: Position;
  properties: ElementProperties;
  children?: TemplateElement[];
}

// PDFMake document definition (simplified)
export type PdfStyle = {
  font?: string;
  fontSize?: number;
  fontFeatures?: string[];
  lineHeight?: number;
  bold?: boolean;
  italics?: boolean;
  alignment?: 'left' | 'center' | 'right' | 'justify';
  characterSpacing?: number;
  color?: string;
  background?: string;
  markerColor?: string;
  decoration?: 'underline' | 'lineThrough' | 'overline' | Array<'underline' | 'lineThrough' | 'overline'>;
  decorationStyle?: 'dashed' | 'dotted' | 'double' | 'wavy';
  decorationColor?: string;
};

export interface DocDefinition {
  content: Array<string | { text: string; style?: string | string[] }>;
  styles?: Record<string, PdfStyle>;
  pageSize?: string | { width: number; height: number };
  pageOrientation?: 'portrait' | 'landscape';
  pageMargins?: number[];
  [key: string]: unknown;
}

// Template interface
export interface Template {
  id: string;
  name: string;
  description?: string;
  docDefinition: DocDefinition;
  createdAt: Date;
  updatedAt: Date;
}

// Application state interface
export interface AppState {
  currentTemplate: Template | null;
  selectedIndex: number | null;
  isPreviewMode: boolean;
  isLoading: boolean;
}

// Action types for state management
export type AppAction =
  | { type: 'SET_TEMPLATE'; payload: Template }
  | { type: 'SET_DOCDEFINITION'; payload: DocDefinition }
  | { type: 'CONTENT_OP'; payload:
      | { type: 'ADD_STRING'; payload: { index?: number; value: string } }
      | { type: 'ADD_TEXT_NODE'; payload: { index?: number; text: string; style?: string | string[] } }
      | { type: 'UPDATE_STRING'; payload: { index: number; value: string } }
      | { type: 'UPDATE_TEXT_NODE'; payload: { index: number; text?: string; style?: string | string[] } }
      | { type: 'MOVE_ITEM'; payload: { from: number; to: number } }
      | { type: 'DELETE_ITEM'; payload: { index: number } } }
  | { type: 'STYLES_OP'; payload:
      | { type: 'ADD_STYLE'; payload: { name: string; def: PdfStyle } }
      | { type: 'UPDATE_STYLE'; payload: { name: string; def: Partial<PdfStyle> } }
      | { type: 'RENAME_STYLE'; payload: { from: string; to: string } }
      | { type: 'DELETE_STYLE'; payload: { name: string } } }
  | { type: 'SET_SELECTED_INDEX'; payload: number | null }
  | { type: 'CLEAR_TEMPLATE' }
  | { type: 'RELOAD_DEFAULT_TEMPLATE' }
  | { type: 'SET_PREVIEW_MODE'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean };
