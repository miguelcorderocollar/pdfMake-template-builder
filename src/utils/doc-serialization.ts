import type { DocDefinition } from "@/types";

/**
 * Serialize a DocDefinition for storage (converts functions to strings)
 */
export function serializeDocDefinition(docDefinition: DocDefinition): Record<string, unknown> {
  const result = { ...docDefinition } as Record<string, unknown>;

  // Handle header/footer functions
  if (typeof result.header === 'function') {
    result._headerFunction = result.header.toString();
    delete result.header;
  }
  if (typeof result.footer === 'function') {
    result._footerFunction = result.footer.toString();
    delete result.footer;
  }

  // Handle background function
  if (typeof result.background === 'function') {
    result._backgroundFunction = result.background.toString();
    delete result.background;
  }

  return result;
}

/**
 * Deserialize a DocDefinition from storage (converts strings back to functions)
 */
export function deserializeDocDefinition(serialized: Record<string, unknown>): DocDefinition {
  const result: DocDefinition = { ...serialized } as DocDefinition;

  // Restore header/footer functions
  if (serialized._headerFunction && typeof serialized._headerFunction === 'string') {
    try {
      const funcBody = serialized._headerFunction.replace(/^function\s*\([^)]*\)\s*\{([\s\S]*)\}$/, '$1');
      result.header = new Function('currentPage', 'pageCount', 'pageSize', funcBody) as DocDefinition['header'];
    } catch (error) {
      console.error('Failed to deserialize header function:', error);
    }
    delete (result as Record<string, unknown>)._headerFunction;
  }
  if (serialized._footerFunction && typeof serialized._footerFunction === 'string') {
    try {
      const funcBody = serialized._footerFunction.replace(/^function\s*\([^)]*\)\s*\{([\s\S]*)\}$/, '$1');
      result.footer = new Function('currentPage', 'pageCount', 'pageSize', funcBody) as DocDefinition['footer'];
    } catch (error) {
      console.error('Failed to deserialize footer function:', error);
    }
    delete (result as Record<string, unknown>)._footerFunction;
  }
  if (serialized._backgroundFunction && typeof serialized._backgroundFunction === 'string') {
    try {
      const funcBody = serialized._backgroundFunction.replace(/^function\s*\([^)]*\)\s*\{([\s\S]*)\}$/, '$1');
      result.background = new Function('currentPage', 'pageSize', funcBody) as DocDefinition['background'];
    } catch (error) {
      console.error('Failed to deserialize background function:', error);
    }
    delete (result as Record<string, unknown>)._backgroundFunction;
  }

  return result;
}

