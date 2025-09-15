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

export type TextNode = { text: string; style?: string | string[] };

export type ImageNode = {
  image: string; // data URL or URL
  width?: number;
  height?: number;
  fit?: [number, number];
  opacity?: number; // 0..1
  [key: string]: unknown;
};

export type UnorderedListNode = {
  ul: Array<string>;
  type?: 'square' | 'circle' | 'none';
  color?: string;
  markerColor?: string;
};

export type OrderedListNode = {
  ol: Array<string>;
  type?: 'lower-alpha' | 'upper-alpha' | 'upper-roman' | 'lower-roman' | 'none';
  start?: number;
  reversed?: boolean;
  separator?: string | [string, string];
  color?: string;
  markerColor?: string;
};

export type ListNode = UnorderedListNode | OrderedListNode;

export type TableNode = {
  table: {
    body: Array<Array<string>>;
    headerRows?: number;
    widths?: Array<number | '*' | 'auto'>;
    heights?: number | Array<number>;
  };
  layout?: 'noBorders' | 'headerLineOnly' | 'lightHorizontalLines';
  style?: string | string[];
};

export type DocContentItem = string | TextNode | ImageNode | ListNode | TableNode;

export interface DocDefinition {
  content: Array<DocContentItem>;
  styles?: Record<string, PdfStyle>;
  pageSize?: string | { width: number; height: number };
  pageOrientation?: 'portrait' | 'landscape';
  pageMargins?: number[];
  background?: string | { text?: string; [key: string]: unknown } | ((currentPage: number, pageSize: { width: number; height: number }) => unknown);
  watermark?: {
    text?: string;
    color?: string;
    opacity?: number;
    bold?: boolean;
    italics?: boolean;
    fontSize?: number;
    angle?: number;
  };
  info?: {
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string;
    creator?: string;
    producer?: string;
    creationDate?: string | Date;
    modDate?: string | Date;
    trapped?: boolean;
  };
  language?: string;
  compress?: boolean;
  version?: '1.3' | '1.4' | '1.5' | '1.6' | '1.7' | '1.7ext3';
  userPassword?: string;
  ownerPassword?: string;
  permissions?: {
    printing?: 'lowResolution' | 'highResolution' | false;
    modifying?: boolean;
    copying?: boolean;
    annotating?: boolean;
    fillingForms?: boolean;
    contentAccessibility?: boolean;
    documentAssembly?: boolean;
  };
  subset?:
    | 'PDF/A-1' | 'PDF/A-1a' | 'PDF/A-1b'
    | 'PDF/A-2' | 'PDF/A-2a' | 'PDF/A-2b'
    | 'PDF/A-3' | 'PDF/A-3a' | 'PDF/A-3b';
  tagged?: boolean;
  displayTitle?: boolean;
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
  filename?: string;
}

// Action types for state management
export type AppAction =
  | { type: 'SET_TEMPLATE'; payload: Template }
  | { type: 'SET_DOCDEFINITION'; payload: DocDefinition }
  | { type: 'UPDATE_DOC_SETTINGS'; payload: Partial<DocDefinition> }
  | { type: 'SET_FILENAME'; payload: string }
  | { type: 'CONTENT_OP'; payload:
      | { type: 'ADD_STRING'; payload: { index?: number; value: string } }
      | { type: 'ADD_TEXT_NODE'; payload: { index?: number; text: string; style?: string | string[] } }
      | { type: 'ADD_IMAGE_NODE'; payload: { index?: number } & ImageNode }
      | { type: 'ADD_LIST_NODE'; payload: { index?: number } & ListNode }
      | { type: 'ADD_TABLE_NODE'; payload: { index?: number } & TableNode }
      | { type: 'UPDATE_STRING'; payload: { index: number; value: string } }
      | { type: 'UPDATE_TEXT_NODE'; payload: { index: number; text?: string; style?: string | string[] } }
      | { type: 'UPDATE_IMAGE_NODE'; payload: { index: number } & Partial<ImageNode> }
      | { type: 'UPDATE_LIST_NODE'; payload: { index: number } & (Partial<UnorderedListNode> | Partial<OrderedListNode>) }
      | { type: 'UPDATE_TABLE_NODE'; payload: { index: number } & Partial<TableNode> }
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
