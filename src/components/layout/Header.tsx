"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Menu, Save, Download, Eye, Upload, Settings, Info, ChevronDown, Trash } from "lucide-react";
import { SiGithub } from "react-icons/si";
import { Input } from "@/components/ui/input";
import { useApp } from "@/lib/app-context";
import type { Theme } from "@/types";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { useTemplateManagement } from "@/hooks/use-template-management";

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
  const {
    templates,
    currentTemplate: template,
    isDirty,
    saveTemplate,
    deleteTemplate,
    copyCurrentTemplate,
    exportCurrent,
    exportAll,
    selectTemplate,
    createNewTemplate,
    importTemplateFromFile,
    importTemplateFromJSON,
  } = useTemplateManagement();
  
  const [exportOpen, setExportOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const importAllInputRef = useRef<HTMLInputElement | null>(null);

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
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setExportOpen(false);
        setImportOpen(false);
        setTemplatesOpen(false);
      }
    }
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  function handleDelete() {
    if (!template) return;
    setDeleteConfirmOpen(true);
  }

  function handleConfirmDelete() {
    if (!template) return;
    deleteTemplate(template.id);
  }

  function handleSelectTemplate(id: string) {
    selectTemplate(id);
  }

  function handleImportFile(file: File, all: boolean) {
    importTemplateFromFile(file, all);
  }

  function handlePasteImport() {
    const success = importTemplateFromJSON(pasteText);
    if (success) {
      setPasteOpen(false);
      setPasteText('');
    }
  }

  const dirtyDot = isDirty ? (
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
              <Button variant="outline" size="sm" onClick={saveTemplate}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleDelete}
                      aria-label="Delete template"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="z-[70]">
                    Delete template
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
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
              <div className="absolute right-0 mt-1 w-64 rounded-md border border-border bg-popover shadow z-[70]" onClick={(e) => e.stopPropagation()}>
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
              <div className="absolute right-0 mt-1 w-56 rounded-md border border-border bg-popover shadow z-[70]" onClick={(e) => e.stopPropagation()}>
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
              <div className="absolute right-0 mt-1 w-56 rounded-md border border-border bg-popover shadow z-[70]" onClick={(e) => e.stopPropagation()}>
                <button className="w-full px-3 py-2 text-left hover:bg-accent" onClick={() => { setExportOpen(false); copyCurrentTemplate(); }}>Duplicate current template</button>
                <button className="w-full px-3 py-2 text-left hover:bg-accent" onClick={() => { setExportOpen(false); exportCurrent(); }}>Export current template</button>
                <button className="w-full px-3 py-2 text-left hover:bg-accent" onClick={() => { setExportOpen(false); exportAll(); }}>Export all templates</button>
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
          <Button asChild variant="ghost" size="icon" aria-label="Open GitHub repository">
            <a
              href="https://github.com/miguelcorderocollar/pdfMake-template-builder"
              target="_blank"
              rel="noopener noreferrer"
            >
              <SiGithub className="h-4 w-4" />
            </a>
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
            className="min-h-40 w-full rounded-md border border-input bg-background p-2 text-sm"
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
                className="h-8 rounded-md border border-input bg-background px-2 text-sm"
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

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Template"
        description={`Are you sure you want to delete "${template?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        variant="destructive"
      />
    </Card>
  );
}
