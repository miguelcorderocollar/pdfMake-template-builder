import { useCallback, useMemo } from "react";
import type { Template } from "@/types";
import { useApp } from "@/lib/app-context";
import {
  normalizeToTemplate,
  normalizeToTemplateForImport,
  exportTemplateToFile,
  exportTemplatesToFile,
  generateUniqueTemplateName,
  duplicateTemplate,
} from "@/utils/template-utils";

/**
 * Custom hook for template management operations
 */
export function useTemplateManagement() {
  const { state, dispatch } = useApp();
  const templates = useMemo(() => state.templates ?? [], [state.templates]);
  const currentTemplate = state.currentTemplate;

  /**
   * Ensure unsaved changes are handled before performing an action
   */
  const ensureSavedBefore = useCallback((action: () => void) => {
    if (state.dirty) {
      const save = confirm('You have unsaved changes. Save them now?');
      if (save) dispatch({ type: 'SAVE_TEMPLATE' });
    }
    action();
  }, [state.dirty, dispatch]);

  /**
   * Save the current template
   */
  const saveTemplate = useCallback(() => {
    if (!currentTemplate) return;
    if (!currentTemplate.name || currentTemplate.name.trim() === '') {
      alert('Please provide a template name before saving.');
      return;
    }
    dispatch({ type: 'SAVE_TEMPLATE' });
  }, [currentTemplate, dispatch]);

  /**
   * Delete a template by ID
   */
  const deleteTemplate = useCallback((id: string) => {
    dispatch({ type: 'DELETE_TEMPLATE', payload: { id } });
  }, [dispatch]);

  /**
   * Duplicate the current template
   */
  const copyCurrentTemplate = useCallback(() => {
    if (!currentTemplate) return;
    const copy = duplicateTemplate(currentTemplate);
    dispatch({ type: 'IMPORT_TEMPLATES', payload: { templates: [copy] } });
    dispatch({ type: 'SELECT_TEMPLATE_BY_ID', payload: { id: copy.id } });
  }, [currentTemplate, dispatch]);

  /**
   * Export the current template to a file
   */
  const exportCurrent = useCallback(() => {
    if (!currentTemplate) return;
    exportTemplateToFile(currentTemplate);
  }, [currentTemplate]);

  /**
   * Export all templates to a file
   */
  const exportAll = useCallback(() => {
    exportTemplatesToFile(templates);
  }, [templates]);

  /**
   * Select a template by ID
   */
  const selectTemplate = useCallback((id: string) => {
    ensureSavedBefore(() => {
      dispatch({ type: 'SELECT_TEMPLATE_BY_ID', payload: { id } });
    });
  }, [ensureSavedBefore, dispatch]);

  /**
   * Create a new template
   */
  const createNewTemplate = useCallback(() => {
    ensureSavedBefore(() => {
      const newId = `tpl-${Date.now()}`;
      const baseName = 'Untitled Template';
      const existingNames = templates.map(t => t.name);
      const name = generateUniqueTemplateName(baseName, existingNames);
      
      const t: Template = {
        id: newId,
        name,
        docDefinition: { content: [], styles: {} },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      dispatch({ type: 'IMPORT_TEMPLATES', payload: { templates: [t] } });
      dispatch({ type: 'SELECT_TEMPLATE_BY_ID', payload: { id: newId } });
    });
  }, [ensureSavedBefore, templates, dispatch]);

  /**
   * Import a template from a file
   */
  const importTemplateFromFile = useCallback((file: File, importAll: boolean = false) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result ?? '');
        const json = JSON.parse(text);
        
        const existingIds = templates.map(t => t.id);
        
        if (importAll) {
          if (Array.isArray(json)) {
            // Generate new IDs for all imported templates to avoid conflicts
            // Process sequentially to ensure each template gets a unique ID
            const importedTemplates: Template[] = [];
            let currentIds = [...existingIds];
            for (const t of json) {
              const normalized = normalizeToTemplateForImport(t, currentIds);
              importedTemplates.push(normalized);
              currentIds.push(normalized.id);
            }
            dispatch({ type: 'IMPORT_TEMPLATES', payload: { templates: importedTemplates } });
          } else {
            alert('Expected an array of templates');
          }
        } else {
          let newTemplate: Template | null = null;
          if (Array.isArray(json)) {
            const t = json[0];
            if (!t) throw new Error('No template found in file');
            newTemplate = normalizeToTemplateForImport(t, existingIds);
          } else {
            newTemplate = normalizeToTemplateForImport(json, existingIds);
          }
          if (newTemplate) {
            dispatch({ type: 'IMPORT_TEMPLATES', payload: { templates: [newTemplate] } });
            dispatch({ type: 'SELECT_TEMPLATE_BY_ID', payload: { id: newTemplate.id } });
          }
        }
      } catch (e) {
        console.error(e);
        alert('Failed to import. Ensure JSON is valid.');
      }
    };
    reader.readAsText(file);
  }, [dispatch, templates]);

  /**
   * Import a template from JSON string
   */
  const importTemplateFromJSON = useCallback((jsonString: string) => {
    try {
      const json = JSON.parse(jsonString);
      const existingIds = templates.map(t => t.id);
      const t = Array.isArray(json) 
        ? normalizeToTemplateForImport(json[0], existingIds) 
        : normalizeToTemplateForImport(json, existingIds);
      dispatch({ type: 'IMPORT_TEMPLATES', payload: { templates: [t] } });
      dispatch({ type: 'SELECT_TEMPLATE_BY_ID', payload: { id: t.id } });
      return true;
    } catch (e) {
      console.error(e);
      alert('Invalid JSON');
      return false;
    }
  }, [dispatch, templates]);

  return {
    // State
    templates,
    currentTemplate,
    isDirty: state.dirty,
    
    // Operations
    saveTemplate,
    deleteTemplate,
    copyCurrentTemplate,
    exportCurrent,
    exportAll,
    selectTemplate,
    createNewTemplate,
    importTemplateFromFile,
    importTemplateFromJSON,
    ensureSavedBefore,
  };
}

