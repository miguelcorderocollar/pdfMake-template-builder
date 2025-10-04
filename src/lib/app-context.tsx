"use client";

import React, { createContext, useContext, useReducer, ReactNode, useEffect, useRef } from "react";
import type { AppState, AppAction, Template } from "@/types";
import { demoTemplate } from "@/services/example-templates";
import { appReducer } from "@/lib/app-reducer";
import { useLocalStoragePersistence } from "@/hooks/use-local-storage-persistence";

const defaultTemplate: Template = {
  id: 'default',
  name: 'Demo Template',
  docDefinition: demoTemplate,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const initialState: AppState = {
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

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const lastContentRef = useRef<string | null>(null);

  // Use custom hook for localStorage persistence
  useLocalStoragePersistence(state, dispatch);

  // Debug: Log docDefinition whenever content changes
  useEffect(() => {
    try {
      if (!state.currentTemplate) return;
      const content = state.currentTemplate.docDefinition?.content ?? [];
      const serialized = JSON.stringify(content);
      if (lastContentRef.current !== serialized) {
        lastContentRef.current = serialized;
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

