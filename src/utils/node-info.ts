import { FileText, Type, Image as ImageIcon, Table as TableIcon, List, HelpCircle, LucideIcon } from "lucide-react";
import type { DocContentItem } from "@/types";
import {
  isImageNode,
  isTextNode,
  isListNode,
  isTableNode,
  hasCustomFlag,
} from "@/utils/node-type-guards";

export interface NodeTypeInfo {
  icon: LucideIcon;
  label: string;
  /** Icon color class (e.g., 'text-blue-600 dark:text-blue-400') */
  iconColor: string;
  /** Left border accent color class (e.g., 'border-l-blue-600 dark:border-l-blue-400') */
  borderColor?: string;
}

/**
 * Get node type info by type name - SINGLE SOURCE OF TRUTH for node type styling
 */
export function getNodeTypeInfoByName(typeName: 'paragraph' | 'text' | 'image' | 'list' | 'table' | 'unknown'): NodeTypeInfo {
  let info: NodeTypeInfo;
  
  switch (typeName) {
    case 'paragraph':
      info = {
        icon: FileText,
        label: 'Paragraph',
        iconColor: 'text-blue-600 dark:text-blue-400',
        borderColor: 'border-l-blue-600 dark:border-l-blue-400',
      };
      break;
    case 'text':
      info = {
        icon: Type,
        label: 'Text',
        iconColor: 'text-slate-600 dark:text-slate-400',
        borderColor: 'border-l-slate-600 dark:border-l-slate-400',
      };
      break;
    case 'image':
      info = {
        icon: ImageIcon,
        label: 'Image',
        iconColor: 'text-purple-600 dark:text-purple-400',
        borderColor: 'border-l-purple-600 dark:border-l-purple-400',
      };
      break;
    case 'list':
      info = {
        icon: List,
        label: 'List',
        iconColor: 'text-green-600 dark:text-green-400',
        borderColor: 'border-l-green-600 dark:border-l-green-400',
      };
      break;
    case 'table':
      info = {
        icon: TableIcon,
        label: 'Table',
        iconColor: 'text-orange-600 dark:text-orange-400',
        borderColor: 'border-l-orange-600 dark:border-l-orange-400',
      };
      break;
    case 'unknown':
      info = {
        icon: HelpCircle,
        label: 'Unknown',
        iconColor: 'text-rose-600 dark:text-rose-400',
        borderColor: 'border-l-rose-600 dark:border-l-rose-400',
      };
      break;
  }

  // includeBorder retained for API compatibility (borderColor is always present now)
  return info;
}

/**
 * Get visual information about a node type from an actual content item
 */
export function getNodeTypeInfo(item: DocContentItem): NodeTypeInfo {
  let typeName: 'paragraph' | 'text' | 'image' | 'list' | 'table' | 'unknown';

  if (typeof item === 'string') {
    typeName = 'paragraph';
  } else if (hasCustomFlag(item)) {
    typeName = 'unknown';
  } else if (isImageNode(item)) {
    typeName = 'image';
  } else if (isListNode(item)) {
    typeName = 'list';
  } else if (isTableNode(item)) {
    typeName = 'table';
  } else if (isTextNode(item)) {
    typeName = 'text';
  } else {
    typeName = 'unknown';
  }

  return getNodeTypeInfoByName(typeName);
}

/**
 * Get the custom name from a node, if it exists
 */
export function getNodeCustomName(item: DocContentItem): string | undefined {
  if (typeof item === 'object' && item !== null) {
    const obj = item as Record<string, unknown>;
    if (obj._name && typeof obj._name === 'string') {
      return obj._name;
    }
  }
  return undefined;
}

/**
 * Get the display name for a node (custom name or generated default)
 */
export function getNodeDisplayName(item: DocContentItem, index: number): string {
  const customName = getNodeCustomName(item);
  if (customName) {
    return customName;
  }
  
  const typeInfo = getNodeTypeInfo(item);
  return `${typeInfo.label} ${index + 1}`;
}

/**
 * Check if a node supports custom naming
 */
export function supportsCustomName(item: DocContentItem): boolean {
  // Only string items (paragraphs) don't support custom names
  return typeof item !== 'string';
}
