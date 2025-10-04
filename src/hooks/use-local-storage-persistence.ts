import { useEffect } from "react";
import type { AppState, AppAction, Template, Theme, DocDefinition } from "@/types";
import { serializeDocDefinition, deserializeDocDefinition } from "@/utils/doc-serialization";

/**
 * Custom hook to handle localStorage persistence for app state
 */
export function useLocalStoragePersistence(
  state: AppState,
  dispatch: React.Dispatch<AppAction>
) {
  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const savedTemplates = window.localStorage.getItem('templates_v1');
      const savedCurrentId = window.localStorage.getItem('currentTemplateId_v1');
      const savedTheme = window.localStorage.getItem('theme_v1') as Theme | null;
      const savedFilename = window.localStorage.getItem('filename');

      if (savedTemplates) {
        const serializedTemplates: any[] = JSON.parse(savedTemplates);
        if (Array.isArray(serializedTemplates) && serializedTemplates.length > 0) {
          // Deserialize templates with function restoration
          const templates: Template[] = serializedTemplates.map(st => ({
            ...st,
            docDefinition: deserializeDocDefinition(st.docDefinition)
          }));
          const byId = new Map(templates.map(t => [t.id, t] as const));
          const current = savedCurrentId ? byId.get(savedCurrentId) ?? templates[0] : templates[0];
          dispatch({ type: 'SET_TEMPLATE', payload: current });
          // Replace the entire list
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
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
    }
  }, [dispatch]);

  // Persist templates, current id, filename, and theme
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (state.templates) {
        // Custom serialization to handle functions
        const serializedTemplates = state.templates.map(template => ({
          ...template,
          docDefinition: serializeDocDefinition(template.docDefinition)
        }));
        window.localStorage.setItem('templates_v1', JSON.stringify(serializedTemplates));
      }
      if (state.currentTemplateId) window.localStorage.setItem('currentTemplateId_v1', state.currentTemplateId);
      if (state.filename) window.localStorage.setItem('filename', state.filename);
      if (state.theme) window.localStorage.setItem('theme_v1', state.theme);
    } catch (error) {
      console.error('Failed to persist to localStorage:', error);
    }
  }, [state.templates, state.currentTemplateId, state.filename, state.theme]);
}

