"use client";

import React, { createContext, useContext, useReducer, ReactNode, useEffect, useRef } from "react";
import { AppState, AppAction, DocDefinition, Template, Theme } from "@/types";
import { stylesSimpleDoc } from "@/services/example-templates";

const defaultTemplate: Template = {
  id: 'default',
  name: 'Styles Simple',
  docDefinition: stylesSimpleDoc,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const initialState: AppState = {
  currentTemplate: defaultTemplate,
  templates: [defaultTemplate],
  currentTemplateId: 'default',
  selectedIndex: null,
  isPreviewMode: false,
  isLoading: false,
  filename: 'document.pdf',
  theme: 'light',
  dirty: false,
};

function appReducer(state: AppState, action: AppAction): AppState {
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
        case 'UPDATE_STRING': {
          if (typeof content[op.payload.index] === 'string') {
            content[op.payload.index] = op.payload.value;
          }
          break;
        }
        case 'UPDATE_TEXT_NODE': {
          const item = content[op.payload.index];
          if (item && typeof item === 'object' && 'text' in (item as { text: string })) {
            const next = { ...(item as { text: string; style?: string | string[] }) };
            if (op.payload.text !== undefined) next.text = op.payload.text;
            if (op.payload.style !== undefined) next.style = op.payload.style;
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
        currentTemplate: { ...state.currentTemplate, docDefinition: stylesSimpleDoc, updatedAt: new Date() },
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
      const map = new Map<string, Template>();
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

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const lastContentRef = useRef<string | null>(null);

  // Load from localStorage if present, else keep default
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const savedTemplates = window.localStorage.getItem('templates_v1');
      const savedCurrentId = window.localStorage.getItem('currentTemplateId_v1');
      const savedTheme = window.localStorage.getItem('theme_v1') as Theme | null;
      const savedFilename = window.localStorage.getItem('filename');

      if (savedTemplates) {
        const templates: Template[] = JSON.parse(savedTemplates);
        if (Array.isArray(templates) && templates.length > 0) {
          const byId = new Map(templates.map(t => [t.id, t] as const));
          const current = savedCurrentId ? byId.get(savedCurrentId) ?? templates[0] : templates[0];
          dispatch({ type: 'SET_TEMPLATE', payload: current });
          // Replace the entire list
          // We cannot dispatch a bulk set, so set via IMPORT_TEMPLATES
          dispatch({ type: 'IMPORT_TEMPLATES', payload: { templates } });
        }
      } else {
        // Back-compat: load a single docDefinition if present
        const saved = window.localStorage.getItem('docDefinition');
        if (saved) {
          const dd = JSON.parse(saved) as DocDefinition;
          dispatch({ type: 'SET_DOCDEFINITION', payload: dd });
        }
      }
      if (savedFilename) dispatch({ type: 'SET_FILENAME', payload: savedFilename });
      if (savedTheme === 'dark' || savedTheme === 'light') dispatch({ type: 'SET_THEME', payload: savedTheme });
    } catch {}
  }, []);

  // Persist templates, current id, filename, and theme
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (state.templates) window.localStorage.setItem('templates_v1', JSON.stringify(state.templates));
      if (state.currentTemplateId) window.localStorage.setItem('currentTemplateId_v1', state.currentTemplateId);
      if (state.filename) window.localStorage.setItem('filename', state.filename);
      if (state.theme) window.localStorage.setItem('theme_v1', state.theme);
    } catch {}
  }, [state.templates, state.currentTemplateId, state.filename, state.theme]);

  // Debug: Log docDefinition whenever content changes
  useEffect(() => {
    try {
      if (!state.currentTemplate) return;
      const content = state.currentTemplate.docDefinition?.content ?? [];
      const serialized = JSON.stringify(content);
      if (lastContentRef.current !== serialized) {
        lastContentRef.current = serialized;
        // eslint-disable-next-line no-console
        console.log('[pdfMake] docDefinition (content updated):', state.currentTemplate.docDefinition);
      }
    } catch {}
  }, [state.currentTemplate]);

  // Apply theme to document
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (state.theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [state.theme]);

  // Warn on unload if there are unsaved changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = (e: BeforeUnloadEvent) => {
      if (state.dirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [state.dirty]);

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
