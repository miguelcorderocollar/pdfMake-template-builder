"use client";

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from "react";
import { AppState, AppAction, DocDefinition } from "@/types";
import { stylesSimpleDoc } from "@/services/example-templates";

const initialState: AppState = {
  currentTemplate: {
    id: 'default',
    name: 'Styles Simple',
    docDefinition: stylesSimpleDoc,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  selectedIndex: null,
  isPreviewMode: false,
  isLoading: false,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_TEMPLATE':
      return { ...state, currentTemplate: action.payload };
    case 'SET_DOCDEFINITION':
      return state.currentTemplate
        ? { ...state, currentTemplate: { ...state.currentTemplate, docDefinition: action.payload } }
        : state;
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
          const { index, ...node } = op.payload as { index?: number } & { [key: string]: unknown };
          content.splice(idx, 0, node);
          break;
        }
        case 'ADD_LIST_NODE': {
          const idx = op.payload.index ?? content.length;
          const { index, ...node } = op.payload as { index?: number } & { [key: string]: unknown };
          content.splice(idx, 0, node);
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
            const { index, ...rest } = op.payload as { index: number } & Record<string, unknown>;
            for (const key of Object.keys(rest)) {
              (next as Record<string, unknown>)[key] = (rest as Record<string, unknown>)[key];
            }
            content[op.payload.index] = next;
          }
          break;
        }
        case 'UPDATE_LIST_NODE': {
          const item = content[op.payload.index];
          if (item && typeof item === 'object' && ('ul' in (item as Record<string, unknown>) || 'ol' in (item as Record<string, unknown>))) {
            const next = { ...(item as Record<string, unknown>) };
            const { index, ...rest } = op.payload as { index: number } & Record<string, unknown>;
            for (const key of Object.keys(rest)) {
              (next as Record<string, unknown>)[key] = (rest as Record<string, unknown>)[key];
            }
1            // If switching kinds, prune the opposite key to prevent ambiguity in pdfmake
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
            content[op.payload.index] = next;
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
        currentTemplate: { ...state.currentTemplate, docDefinition: { ...dd, content } },
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
        currentTemplate: { ...state.currentTemplate, docDefinition: { ...dd, styles } },
      };
    }
    case 'SET_SELECTED_INDEX':
      return { ...state, selectedIndex: action.payload };
    case 'CLEAR_TEMPLATE': {
      if (!state.currentTemplate) return state;
      const empty: DocDefinition = { ...state.currentTemplate.docDefinition, content: [], styles: {} };
      return { ...state, currentTemplate: { ...state.currentTemplate, docDefinition: empty }, selectedIndex: null };
    }
    case 'RELOAD_DEFAULT_TEMPLATE': {
      if (!state.currentTemplate) return state;
      return { ...state, currentTemplate: { ...state.currentTemplate, docDefinition: stylesSimpleDoc }, selectedIndex: null };
    }
    case 'SET_PREVIEW_MODE':
      return { ...state, isPreviewMode: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
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

  // Load from localStorage if present, else keep default
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = window.localStorage.getItem('docDefinition');
      if (saved) {
        const dd = JSON.parse(saved) as DocDefinition;
        dispatch({ type: 'SET_DOCDEFINITION', payload: dd });
      }
    } catch {}
  }, []);

  // Persist docDefinition
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (state.currentTemplate) {
      try {
        window.localStorage.setItem('docDefinition', JSON.stringify(state.currentTemplate.docDefinition));
      } catch {}
    }
  }, [state.currentTemplate]);

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
