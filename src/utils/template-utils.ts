import type { Template, DocDefinition } from "@/types";

/**
 * Parse a date value from various formats
 */
export function parseDate(value: unknown): Date {
  if (value instanceof Date) return value;
  if (typeof value === 'string' || typeof value === 'number') {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return new Date();
}

/**
 * Type guard to check if input looks like a Template object
 */
export function isTemplateLike(input: unknown): input is { 
  id?: unknown; 
  name?: unknown; 
  docDefinition?: unknown; 
  createdAt?: unknown; 
  updatedAt?: unknown 
} {
  return !!(
    input && 
    typeof input === 'object' && 
    'docDefinition' in (input as Record<string, unknown>) && 
    'id' in (input as Record<string, unknown>) && 
    'name' in (input as Record<string, unknown>)
  );
}

/**
 * Normalize any input into a valid Template object
 */
export function normalizeToTemplate(input: unknown): Template {
  if (isTemplateLike(input)) {
    const t = input as { 
      id?: unknown; 
      name?: unknown; 
      docDefinition?: unknown; 
      createdAt?: unknown; 
      updatedAt?: unknown 
    };
    return {
      id: String(t.id ?? `tpl-${Date.now()}`),
      name: String(t.name ?? 'Imported Template'),
      docDefinition: (t.docDefinition as DocDefinition) ?? { content: [], styles: {} },
      createdAt: parseDate(t.createdAt),
      updatedAt: new Date(),
    };
  }
  // Treat as DocDefinition only
  const newId = `tpl-${Date.now()}`;
  return {
    id: newId,
    name: 'Imported Template',
    docDefinition: input as DocDefinition,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Export a template to JSON file
 */
export function exportTemplateToFile(template: Template) {
  const dataStr = JSON.stringify(template, null, 2);
  const url = URL.createObjectURL(new Blob([dataStr], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `${template.name || 'template'}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export multiple templates to JSON file
 */
export function exportTemplatesToFile(templates: Template[], filename = 'templates.json') {
  const dataStr = JSON.stringify(templates, null, 2);
  const url = URL.createObjectURL(new Blob([dataStr], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generate a unique template name from a base name
 */
export function generateUniqueTemplateName(baseName: string, existingNames: string[]): string {
  const nameSet = new Set(existingNames);
  let name = baseName;
  let counter = 1;
  while (nameSet.has(name)) {
    counter += 1;
    name = `${baseName} ${counter}`;
  }
  return name;
}

/**
 * Create a copy of a template with a new ID and name
 */
export function duplicateTemplate(template: Template): Template {
  const newId = `tpl-${Date.now()}`;
  return {
    id: newId,
    name: `Copy of ${template.name}`,
    docDefinition: JSON.parse(JSON.stringify(template.docDefinition)),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

