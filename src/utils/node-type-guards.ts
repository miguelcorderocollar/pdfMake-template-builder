import type { DocContentItem } from "@/types";

/**
 * Type guard to check if item is an image node
 */
export function isImageNode(
  item: DocContentItem
): item is { image: string; width?: number; height?: number; fit?: [number, number]; opacity?: number } {
  return typeof item === 'object' && item !== null && 'image' in (item as Record<string, unknown>);
}

/**
 * Type guard to check if item is a text node
 */
export function isTextNode(
  item: DocContentItem
): item is { text: string; style?: string | string[] } {
  return typeof item === 'object' && item !== null && 'text' in (item as Record<string, unknown>);
}

/**
 * Type guard to check if item is a list node (ul or ol)
 */
export function isListNode(
  item: DocContentItem
): item is (
  | { ul: Array<string>; type?: 'square' | 'circle' | 'none'; color?: string; markerColor?: string }
  | { ol: Array<string>; type?: 'lower-alpha' | 'upper-alpha' | 'upper-roman' | 'lower-roman' | 'none'; start?: number; reversed?: boolean; separator?: string | [string, string]; color?: string; markerColor?: string }
) {
  return (
    typeof item === 'object' &&
    item !== null &&
    ('ul' in (item as Record<string, unknown>) || 'ol' in (item as Record<string, unknown>))
  );
}

/**
 * Type guard to check if item is a table node
 */
export function isTableNode(item: DocContentItem): item is import("@/types").TableNode {
  return typeof item === 'object' && item !== null && 'table' in (item as Record<string, unknown>);
}

/**
 * Check if item has the _custom flag (for custom JSON editing)
 */
export function hasCustomFlag(item: DocContentItem): boolean {
  return typeof item === 'object' && item !== null && '_custom' in (item as Record<string, unknown>);
}

/**
 * Check if a text value is a TextSpan array (for rich text)
 */
export function isTextSpanArray(text: string | import("@/types").TextSpan[]): text is import("@/types").TextSpan[] {
  return Array.isArray(text);
}

