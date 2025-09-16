"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Menu, Save, Download, Eye, Upload, Settings, Info, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useApp } from "@/lib/app-context";
import type { Template, Theme } from "@/types";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface HeaderProps {
  onToggleSidebar: () => void;
  onPreview?: () => void;
  onExportPDF?: () => void;
}

export function Header({
  onToggleSidebar,
  onPreview,
  onExportPDF,
}: HeaderProps) {
  const { state, dispatch } = useApp();
  const [exportOpen, setExportOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const importAllInputRef = useRef<HTMLInputElement | null>(null);

  const template = state.currentTemplate;
  const templates = state.templates ?? [];
  

  const templateName = template?.name ?? "Untitled";
  const setTemplateName = (name: string) => dispatch({ type: 'SET_TEMPLATE_NAME', payload: name });

  // Close menus on outside click
  const exportMenuRef = useRef<HTMLDivElement | null>(null);
  const importMenuRef = useRef<HTMLDivElement | null>(null);
  const templatesMenuRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) setExportOpen(false);
      if (importMenuRef.current && !importMenuRef.current.contains(e.target as Node)) setImportOpen(false);
      if (templatesMenuRef.current && !templatesMenuRef.current.contains(e.target as Node)) setTemplatesOpen(false);
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  function ensureSavedBefore(action: () => void) {
    if (state.dirty) {
      const save = confirm('You have unsaved changes. Save them now?');
      if (save) dispatch({ type: 'SAVE_TEMPLATE' });
    }
    action();
  }

  function handleSave() {
    if (!template) return;
    if (!template.name || template.name.trim() === '') {
      alert('Please provide a template name before saving.');
      return;
    }
    dispatch({ type: 'SAVE_TEMPLATE' });
  }

  function copyTemplate() {
    if (!template) return;
    const newId = `tpl-${Date.now()}`;
    const copy: Template = {
      id: newId,
      name: `Copy of ${template.name}`,
      docDefinition: JSON.parse(JSON.stringify(template.docDefinition)),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    dispatch({ type: 'IMPORT_TEMPLATES', payload: { templates: [copy] } });
    dispatch({ type: 'SELECT_TEMPLATE_BY_ID', payload: { id: newId } });
  }

  function exportCurrentTemplate() {
    if (!template) return;
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

  function exportAllTemplates() {
    const dataStr = JSON.stringify(templates, null, 2);
    const url = URL.createObjectURL(new Blob([dataStr], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `templates.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleSelectTemplate(id: string) {
    if (id === '__new__') {
      createNewTemplate();
      return;
    }
    ensureSavedBefore(() => {
      dispatch({ type: 'SELECT_TEMPLATE_BY_ID', payload: { id } });
    });
  }

  function createNewTemplate() {
    ensureSavedBefore(() => {
      const newId = `tpl-${Date.now()}`;
      const baseName = 'Untitled Template';
      const existingNames = new Set(templates.map(t => t.name));
      let name = baseName;
      let counter = 1;
      while (existingNames.has(name)) {
        counter += 1;
        name = `${baseName} ${counter}`;
      }
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
  }

  function handleImportFile(file: File, all: boolean) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result ?? '');
        const json = JSON.parse(text);
        if (all) {
          if (Array.isArray(json)) {
            dispatch({ type: 'IMPORT_TEMPLATES', payload: { templates: json as Template[] } });
          } else {
            alert('Expected an array of templates');
          }
        } else {
          let newTemplate: Template | null = null;
          if (Array.isArray(json)) {
            const t = json[0];
            if (!t) throw new Error('No template found in file');
            newTemplate = normalizeToTemplate(t);
          } else {
            newTemplate = normalizeToTemplate(json);
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
  }

  function parseDate(value: unknown): Date {
    if (value instanceof Date) return value;
    if (typeof value === 'string' || typeof value === 'number') {
      const d = new Date(value);
      if (!Number.isNaN(d.getTime())) return d;
    }
    return new Date();
  }

  function isTemplateLike(input: unknown): input is { id?: unknown; name?: unknown; docDefinition?: unknown; createdAt?: unknown; updatedAt?: unknown } {
    return !!(input && typeof input === 'object' && 'docDefinition' in (input as Record<string, unknown>) && 'id' in (input as Record<string, unknown>) && 'name' in (input as Record<string, unknown>));
  }

  function normalizeToTemplate(input: unknown): Template {
    if (isTemplateLike(input)) {
      const t = input as { id?: unknown; name?: unknown; docDefinition?: unknown; createdAt?: unknown; updatedAt?: unknown };
      return {
        id: String(t.id ?? `tpl-${Date.now()}`),
        name: String(t.name ?? 'Imported Template'),
        docDefinition: (t.docDefinition as import("@/types").DocDefinition) ?? { content: [], styles: {} },
        createdAt: parseDate(t.createdAt),
        updatedAt: new Date(),
      };
    }
    // Treat as DocDefinition only
    const newId = `tpl-${Date.now()}`;
    return {
      id: newId,
      name: 'Imported Template',
      docDefinition: input as import("@/types").DocDefinition,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  function handlePasteImport() {
    try {
      const json = JSON.parse(pasteText);
      const t = Array.isArray(json) ? normalizeToTemplate(json[0]) : normalizeToTemplate(json);
      dispatch({ type: 'IMPORT_TEMPLATES', payload: { templates: [t] } });
      dispatch({ type: 'SELECT_TEMPLATE_BY_ID', payload: { id: t.id } });
      setPasteOpen(false);
      setPasteText('');
    } catch (e) {
      console.error(e);
      alert('Invalid JSON');
    }
  }

  const dirtyDot = state.dirty ? (
    <span className="inline-block h-2 w-2 rounded-full bg-amber-500" aria-label="Unsaved changes" />
  ) : null;

  return (
    <Card className="rounded-none border-x-0 border-t-0 border-b">
      <div className="relative z-40 flex items-center justify-between px-4 py-3">
        {/* Left Section - Menu and Template Name */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="h-8 w-8"
          >
            <Menu className="h-4 w-4" data-darkreader-ignore suppressHydrationWarning />
          </Button>

          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold">PDFMake Template Builder</h1>
            <div className="flex items-center gap-2">
              {dirtyDot}
            <Input
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
                className="h-8 w-[240px]"
              placeholder="Template name"
            />
              <Button variant="outline" size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="inline-flex h-8 w-8 items-center justify-center rounded-md border text-muted-foreground hover:bg-accent focus:outline-none">
                      <Info className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="z-[70]">
                    Templates are saved locally in your browser. Nothing leaves your computer.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>

        {/* Right Section - Action Buttons */}
        <div className="flex items-center gap-2">
          <div className="relative" ref={templatesMenuRef}>
            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setTemplatesOpen(v => !v); }}>
              Templates
              <ChevronDown className="h-4 w-4 ml-1 opacity-70" />
          </Button>
            {templatesOpen && (
              <div className="absolute right-0 mt-1 w-64 rounded-md border bg-popover shadow z-[70]" onClick={(e) => e.stopPropagation()}>
                <div className="max-h-64 overflow-auto py-1">
                  {templates.map(t => (
                    <button key={t.id} className="w-full px-3 py-2 text-left hover:bg-accent" onClick={() => { setTemplatesOpen(false); handleSelectTemplate(t.id); }}>
                      {t.name}
                    </button>
                  ))}
                </div>
                <div className="border-t">
                  <button className="w-full px-3 py-2 text-left hover:bg-accent" onClick={() => { setTemplatesOpen(false); createNewTemplate(); }}>New template…</button>
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={importMenuRef}>
            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setImportOpen(v => !v); }}>
            <Upload className="h-4 w-4 mr-2" data-darkreader-ignore suppressHydrationWarning />
            Import
              <ChevronDown className="h-4 w-4 ml-1 opacity-70" />
            </Button>
            {importOpen && (
              <div className="absolute right-0 mt-1 w-56 rounded-md border bg-popover shadow z-[70]" onClick={(e) => e.stopPropagation()}>
                <button className="w-full px-3 py-2 text-left hover:bg-accent" onClick={() => { setImportOpen(false); importInputRef.current?.click(); }}>Import template from file</button>
                <button className="w-full px-3 py-2 text-left hover:bg-accent" onClick={() => { setImportOpen(false); setPasteOpen(true); }}>Paste template (JSON)</button>
                <button className="w-full px-3 py-2 text-left hover:bg-accent" onClick={() => { setImportOpen(false); importAllInputRef.current?.click(); }}>Import all templates</button>
                <input ref={importInputRef} type="file" accept="application/json" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImportFile(f, false); e.currentTarget.value=''; }} />
                <input ref={importAllInputRef} type="file" accept="application/json" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImportFile(f, true); e.currentTarget.value=''; }} />
              </div>
            )}
          </div>

          <div className="relative" ref={exportMenuRef}>
            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setExportOpen(v => !v); }}>
              <Download className="h-4 w-4 mr-2" data-darkreader-ignore suppressHydrationWarning />
              Export
              <ChevronDown className="h-4 w-4 ml-1 opacity-70" />
          </Button>
            {exportOpen && (
              <div className="absolute right-0 mt-1 w-56 rounded-md border bg-popover shadow z-[70]" onClick={(e) => e.stopPropagation()}>
                <button className="w-full px-3 py-2 text-left hover:bg-accent" onClick={() => { setExportOpen(false); copyTemplate(); }}>Duplicate current template</button>
                <button className="w-full px-3 py-2 text-left hover:bg-accent" onClick={() => { setExportOpen(false); exportCurrentTemplate(); }}>Export current template</button>
                <button className="w-full px-3 py-2 text-left hover:bg-accent" onClick={() => { setExportOpen(false); exportAllTemplates(); }}>Export all templates</button>
              </div>
            )}
          </div>

          <Button variant="outline" size="sm" onClick={onExportPDF}>
            <Download className="h-4 w-4 mr-2" data-darkreader-ignore suppressHydrationWarning />
            Export PDF
          </Button>
          <Button variant="outline" size="sm" onClick={onPreview}>
            <Eye className="h-4 w-4 mr-2" data-darkreader-ignore suppressHydrationWarning />
            Preview
          </Button>

          <Button variant="ghost" size="icon" onClick={() => setSettingsOpen(true)} aria-label="Settings">
            <Settings className="h-4 w-4" data-darkreader-ignore suppressHydrationWarning />
          </Button>
        </div>
      </div>

      {/* Paste JSON Dialog */}
      <Dialog open={pasteOpen} onOpenChange={setPasteOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Paste template JSON</DialogTitle>
          </DialogHeader>
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            className="min-h-40 w-full rounded-md border bg-background p-2 text-sm"
            placeholder='{"id":"...","name":"...","docDefinition":{...}} or a docDefinition object'
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasteOpen(false)}>Cancel</Button>
            <Button onClick={handlePasteImport}>Import</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Theme</div>
                <div className="text-sm text-muted-foreground">Choose light or dark mode</div>
              </div>
              <select
                className="h-8 rounded-md border bg-background px-2 text-sm"
                value={state.theme ?? 'light'}
                onChange={(e) => dispatch({ type: 'SET_THEME', payload: e.target.value as Theme })}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setSettingsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
