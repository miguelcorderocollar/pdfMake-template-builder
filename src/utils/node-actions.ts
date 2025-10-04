import type { DocContentItem, AppAction } from "@/types";
import {
  isImageNode,
  isTextNode,
  isListNode,
  isTableNode,
} from "@/utils/node-type-guards";

/**
 * Create an action to update a node's name
 */
export function createUpdateNodeNameAction(
  item: DocContentItem,
  index: number,
  name: string | undefined
): AppAction | null {
  // Paragraphs (strings) don't support names
  if (typeof item === 'string') {
    return null;
  }

  if (isTextNode(item)) {
    return {
      type: 'CONTENT_OP',
      payload: {
        type: 'UPDATE_TEXT_NODE',
        payload: { index, _name: name }
      }
    };
  }

  if (isImageNode(item)) {
    return {
      type: 'CONTENT_OP',
      payload: {
        type: 'UPDATE_IMAGE_NODE',
        payload: { index, _name: name }
      }
    };
  }

  if (isListNode(item)) {
    return {
      type: 'CONTENT_OP',
      payload: {
        type: 'UPDATE_LIST_NODE',
        payload: { index, _name: name }
      }
    };
  }

  if (isTableNode(item)) {
    return {
      type: 'CONTENT_OP',
      payload: {
        type: 'UPDATE_TABLE_NODE',
        payload: { index, _name: name }
      }
    };
  }

  return null;
}

