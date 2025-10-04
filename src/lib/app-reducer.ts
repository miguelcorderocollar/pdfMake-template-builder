import type { AppState, AppAction, DocDefinition, Theme } from "@/types";
import { demoTemplate } from "@/services/example-templates";

/**
 * Main application state reducer
 * Handles all state transformations based on dispatched actions
 */
export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_TEMPLATE':
      return { ...state, currentTemplate: action.payload, currentTemplateId: action.payload.id, selectedIndex: null, dirty: false };
    
    case 'SET_DOCDEFINITION':
      return state.currentTemplate
        ? { ...state, dirty: true, currentTemplate: { ...state.currentTemplate, docDefinition: action.payload, updatedAt: new Date() } }
        : state;
    
    case 'UPDATE_DOC_SETTINGS': {
      if (!state.currentTemplate) return state;
      const dd = state.currentTemplate.docDefinition;
      return {
        ...state,
        dirty: true,
        currentTemplate: {
          ...state.currentTemplate,
          docDefinition: { ...dd, ...action.payload },
          updatedAt: new Date(),
        },
      };
    }
    
    case 'SET_FILENAME': {
      return { ...state, filename: action.payload };
    }
    
    case 'SET_TEMPLATE_NAME': {
      if (!state.currentTemplate) return state;
      return { ...state, dirty: true, currentTemplate: { ...state.currentTemplate, name: action.payload, updatedAt: new Date() } };
    }
    
    case 'CONTENT_OP': {
      if (!state.currentTemplate) return state;
      const dd = state.currentTemplate.docDefinition;
      const content = Array.isArray(dd.content) ? [...dd.content] : [];
      const op = action.payload;
      
      switch (op.type) {
        case 'ADD_STRING': {
          const idx = op.payload.index ?? content.length;
          content.splice(idx, 0, op.payload.value);
          break;
        }
        case 'ADD_TEXT_NODE': {
          const idx = op.payload.index ?? content.length;
          content.splice(idx, 0, { text: op.payload.text, style: op.payload.style });
          break;
        }
        case 'ADD_IMAGE_NODE': {
          const idx = op.payload.index ?? content.length;
          const node = { ...(op.payload as Record<string, unknown>) } as { index?: number } & Record<string, unknown>;
          delete node.index;
          content.splice(idx, 0, node as unknown as import("@/types").DocContentItem);
          break;
        }
        case 'ADD_LIST_NODE': {
          const idx = op.payload.index ?? content.length;
          const node = { ...(op.payload as Record<string, unknown>) } as { index?: number } & Record<string, unknown>;
          delete node.index;
          content.splice(idx, 0, node as unknown as import("@/types").DocContentItem);
          break;
        }
        case 'ADD_TABLE_NODE': {
          const idx = op.payload.index ?? content.length;
          const node = { ...(op.payload as Record<string, unknown>) } as { index?: number } & Record<string, unknown>;
          delete node.index;
          content.splice(idx, 0, node as unknown as import("@/types").DocContentItem);
          break;
        }
        case 'ADD_CUSTOM_NODE': {
          const idx = op.payload.index ?? content.length;
          content.splice(idx, 0, op.payload.content as unknown as import("@/types").DocContentItem);
          break;
        }
        case 'UPDATE_STRING': {
          if (typeof content[op.payload.index] === 'string') {
            content[op.payload.index] = op.payload.value;
          }
          break;
        }
        case 'UPDATE_TEXT_NODE': {
          const item = content[op.payload.index];
          if (item && typeof item === 'object' && 'text' in (item as { text: string | import("@/types").TextSpan[] })) {
            const next = { ...(item as { text: string | import("@/types").TextSpan[]; style?: string | string[]; _name?: string }) };
            if (op.payload.text !== undefined) next.text = op.payload.text;
            if (op.payload.style !== undefined) next.style = op.payload.style;
            if (op.payload._name !== undefined) next._name = op.payload._name;
            content[op.payload.index] = next;
          }
          break;
        }
        case 'UPDATE_IMAGE_NODE': {
          const item = content[op.payload.index];
          if (item && typeof item === 'object' && 'image' in (item as { image: string })) {
            const next = { ...(item as Record<string, unknown>) };
            const rest = { ...(op.payload as Record<string, unknown>) } as { index?: number } & Record<string, unknown>;
            delete rest.index;
            for (const key of Object.keys(rest)) {
              (next as Record<string, unknown>)[key] = (rest as Record<string, unknown>)[key];
            }
            content[op.payload.index] = next as unknown as import("@/types").DocContentItem;
          }
          break;
        }
        case 'UPDATE_LIST_NODE': {
          const item = content[op.payload.index];
          if (item && typeof item === 'object' && ('ul' in (item as Record<string, unknown>) || 'ol' in (item as Record<string, unknown>))) {
            const next = { ...(item as Record<string, unknown>) };
            const rest = { ...(op.payload as Record<string, unknown>) } as { index?: number } & Record<string, unknown>;
            delete rest.index;
            for (const key of Object.keys(rest)) {
              (next as Record<string, unknown>)[key] = (rest as Record<string, unknown>)[key];
            }
            // If switching kinds, prune the opposite key to prevent ambiguity in pdfmake
            if (Object.prototype.hasOwnProperty.call(rest, 'ol')) {
              delete (next as Record<string, unknown>)['ul'];
              if (Array.isArray((next as Record<string, unknown>)['ol'])) {
                (next as Record<string, unknown>)['ol'] = ((next as Record<string, unknown>)['ol'] as unknown[]).map(String);
              }
            }
            if (Object.prototype.hasOwnProperty.call(rest, 'ul')) {
              delete (next as Record<string, unknown>)['ol'];
              if (Array.isArray((next as Record<string, unknown>)['ul'])) {
                (next as Record<string, unknown>)['ul'] = ((next as Record<string, unknown>)['ul'] as unknown[]).map(String);
              }
            }
            content[op.payload.index] = next as unknown as import("@/types").DocContentItem;
          }
          break;
        }
        case 'UPDATE_TABLE_NODE': {
          const item = content[op.payload.index];
          if (item && typeof item === 'object' && 'table' in (item as Record<string, unknown>)) {
            const next = { ...(item as Record<string, unknown>) };
            const rest = { ...(op.payload as Record<string, unknown>) } as { index?: number } & Record<string, unknown>;
            delete rest.index;
            // Merge table sub-object carefully
            if ('table' in rest && typeof (rest as Record<string, unknown>).table === 'object') {
              const prevTable = (next.table as Record<string, unknown>) || {};
              const incoming = ((rest as Record<string, unknown>).table as Record<string, unknown>) || {};
              const merged = { ...prevTable, ...incoming } as { body?: unknown[][] } & Record<string, unknown>;
              if (Array.isArray(merged.body)) {
                merged.body = merged.body.map((row) => Array.isArray(row) ? row.map((cell) => typeof cell === 'string' ? cell : String(cell ?? '')) : []);
              }
              (next as Record<string, unknown>).table = merged as unknown;
              delete (rest as Record<string, unknown>).table;
            }
            // Apply remaining root-level props (layout, style, etc.)
            for (const key of Object.keys(rest)) {
              (next as Record<string, unknown>)[key] = (rest as Record<string, unknown>)[key];
            }
            content[op.payload.index] = next as unknown as import("@/types").DocContentItem;
          }
          break;
        }
        case 'MOVE_ITEM': {
          const { from, to } = op.payload;
          const [moved] = content.splice(from, 1);
          content.splice(to, 0, moved);
          break;
        }
        case 'DELETE_ITEM': {
          content.splice(op.payload.index, 1);
          break;
        }
      }
      return {
        ...state,
        dirty: true,
        currentTemplate: { ...state.currentTemplate, docDefinition: { ...dd, content }, updatedAt: new Date() },
      };
    }
    
    case 'STYLES_OP': {
      if (!state.currentTemplate) return state;
      const dd = state.currentTemplate.docDefinition;
      const styles = { ...(dd.styles ?? {}) } as DocDefinition['styles'];
      const op = action.payload;
      
      switch (op.type) {
        case 'ADD_STYLE':
          styles![op.payload.name] = op.payload.def;
          break;
        case 'UPDATE_STYLE':
          styles![op.payload.name] = { ...(styles?.[op.payload.name] ?? {}), ...op.payload.def };
          break;
        case 'RENAME_STYLE': {
          const current = styles?.[op.payload.from];
          if (current) {
            delete styles![op.payload.from];
            styles![op.payload.to] = current;
          }
          break;
        }
        case 'DELETE_STYLE':
          if (styles && styles[op.payload.name]) delete styles[op.payload.name];
          break;
      }
      return {
        ...state,
        dirty: true,
        currentTemplate: { ...state.currentTemplate, docDefinition: { ...dd, styles }, updatedAt: new Date() },
      };
    }
    
    case 'SET_SELECTED_INDEX':
      return { ...state, selectedIndex: action.payload };
    
    case 'CLEAR_TEMPLATE': {
      if (!state.currentTemplate) return state;
      const empty: DocDefinition = { ...state.currentTemplate.docDefinition, content: [], styles: {} };
      return { ...state, dirty: true, currentTemplate: { ...state.currentTemplate, docDefinition: empty, updatedAt: new Date() }, selectedIndex: null };
    }
    
    case 'RELOAD_DEFAULT_TEMPLATE': {
      if (!state.currentTemplate) return state;
      return {
        ...state,
        dirty: true,
        currentTemplate: { ...state.currentTemplate, docDefinition: demoTemplate, updatedAt: new Date() },
        selectedIndex: null,
        filename: 'document.pdf',
      };
    }
    
    case 'SET_PREVIEW_MODE':
      return { ...state, isPreviewMode: action.payload };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SAVE_TEMPLATE': {
      if (!state.currentTemplate) return state;
      const existing = (state.templates ?? []).find(t => t.id === state.currentTemplate!.id);
      const nextTemplates = existing
        ? (state.templates ?? []).map(t => t.id === state.currentTemplate!.id ? { ...state.currentTemplate!, updatedAt: new Date() } : t)
        : [ ...(state.templates ?? []), { ...state.currentTemplate!, updatedAt: new Date() } ];
      return { ...state, templates: nextTemplates, dirty: false };
    }
    
    case 'DELETE_TEMPLATE': {
      const id = action.payload.id;
      const nextTemplates = (state.templates ?? []).filter(t => t.id !== id);
      let nextCurrent = state.currentTemplate;
      let nextCurrentId = state.currentTemplateId;
      if (state.currentTemplateId === id) {
        nextCurrent = nextTemplates[0] ?? null;
        nextCurrentId = nextCurrent?.id;
      }
      return { ...state, templates: nextTemplates, currentTemplate: nextCurrent ?? null, currentTemplateId: nextCurrentId, dirty: false };
    }
    
    case 'IMPORT_TEMPLATES': {
      const incoming = action.payload.templates;
      const map = new Map<string, import("@/types").Template>();
      for (const t of state.templates ?? []) map.set(t.id, t);
      for (const t of incoming) map.set(t.id, t);
      return { ...state, templates: Array.from(map.values()) };
    }
    
    case 'SELECT_TEMPLATE_BY_ID': {
      const next = (state.templates ?? []).find(t => t.id === action.payload.id);
      if (!next) return state;
      return { ...state, currentTemplate: next, currentTemplateId: next.id, selectedIndex: null, dirty: false };
    }
    
    case 'SET_THEME': {
      return { ...state, theme: action.payload as Theme };
    }
    
    case 'SET_DIRTY': {
      return { ...state, dirty: action.payload };
    }
    
    default:
      return state;
  }
}

