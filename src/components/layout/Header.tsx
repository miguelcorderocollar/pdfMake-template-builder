"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, Settings, FileOutput, Upload, Download, Trash, Copy, Info } from "lucide-react";
import { useApp } from "@/lib/app-context";
import type { Theme } from "@/types";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { useTemplateManagement } from "@/hooks/use-template-management";
import { AboutDialog } from "@/components/AboutDialog";
import { TemplateDropdown } from "@/components/TemplateDropdown";
import { StatusIndicator } from "@/components/StatusIndicator";

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenOutput?: () => void;
}

export function Header({
  onToggleSidebar,
  onOpenOutput,
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

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const importAllInputRef = useRef<HTMLInputElement | null>(null);
  const moreMenuRef = useRef<HTMLDivElement | null>(null);

  const setTemplateName = (name: string) => dispatch({ type: "SET_TEMPLATE_NAME", payload: name });

  function handleDelete() {
    if (!template) return;
    setDeleteConfirmOpen(true);
  }

  function handleConfirmDelete() {
    if (!template) return;
    deleteTemplate(template.id);
  }

  function handleImportFile(file: File, all: boolean) {
    importTemplateFromFile(file, all);
  }

  function handlePasteImport() {
    const success = importTemplateFromJSON(pasteText);
    if (success) {
      setPasteOpen(false);
      setPasteText("");
    }
  }

  // Close more menu on outside click
  const handleMoreMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMoreMenuOpen((v) => !v);
  };

  return (
    <header className="border-b border-border bg-card">
      <div className="flex h-14 items-center justify-between px-3 md:px-4">
        {/* Left Section - Menu and Logo */}
        <div className="flex items-center gap-2 md:gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="h-9 w-9"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="hidden md:flex items-center gap-2">
            <h1 className="text-base font-semibold tracking-tight">PDFMake Builder</h1>
          </div>

          <div className="h-6 w-px bg-border hidden md:block" />

          {/* Template Dropdown */}
          <TemplateDropdown
            templates={templates}
            currentTemplate={template}
            onSelect={selectTemplate}
            onRename={setTemplateName}
            onCreateNew={createNewTemplate}
          />

          {/* Status Indicator */}
          <StatusIndicator isDirty={isDirty ?? false} />

          {/* Save button - visible on larger screens */}
          <Button
            variant="ghost"
            size="sm"
            onClick={saveTemplate}
            className="hidden md:inline-flex h-8 text-xs"
          >
            Save
          </Button>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-1 md:gap-2">
          {/* Output button - main action */}
          <Button
            variant="default"
            size="sm"
            onClick={onOpenOutput}
            className="h-8 gap-2"
          >
            <FileOutput className="h-4 w-4" />
            <span className="hidden sm:inline">Output</span>
          </Button>

          {/* More menu for secondary actions */}
          <div className="relative" ref={moreMenuRef}>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleMoreMenuClick}
              className="h-9 w-9"
              aria-label="More options"
            >
              <Settings className="h-4 w-4" />
            </Button>

            {moreMenuOpen && (
              <div
                className="absolute right-0 top-full mt-1 w-56 rounded-md border border-border bg-popover shadow-lg z-[70] animate-fade-in"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Import section */}
                <div className="py-1">
                  <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground">
                    Import
                  </div>
                  <button
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
                    onClick={() => {
                      setMoreMenuOpen(false);
                      importInputRef.current?.click();
                    }}
                  >
                    <Upload className="h-4 w-4" />
                    Import template
                  </button>
                  <button
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
                    onClick={() => {
                      setMoreMenuOpen(false);
                      setPasteOpen(true);
                    }}
                  >
                    <Upload className="h-4 w-4" />
                    Paste JSON
                  </button>
                  <button
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
                    onClick={() => {
                      setMoreMenuOpen(false);
                      importAllInputRef.current?.click();
                    }}
                  >
                    <Upload className="h-4 w-4" />
                    Import all templates
                  </button>
                </div>

                <div className="border-t border-border" />

                {/* Export section */}
                <div className="py-1">
                  <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground">
                    Export
                  </div>
                  <button
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
                    onClick={() => {
                      setMoreMenuOpen(false);
                      copyCurrentTemplate();
                    }}
                  >
                    <Copy className="h-4 w-4" />
                    Duplicate template
                  </button>
                  <button
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
                    onClick={() => {
                      setMoreMenuOpen(false);
                      exportCurrent();
                    }}
                  >
                    <Download className="h-4 w-4" />
                    Export current
                  </button>
                  <button
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
                    onClick={() => {
                      setMoreMenuOpen(false);
                      exportAll();
                    }}
                  >
                    <Download className="h-4 w-4" />
                    Export all templates
                  </button>
                </div>

                <div className="border-t border-border" />

                {/* Settings section */}
                <div className="py-1">
                  <button
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
                    onClick={() => {
                      setMoreMenuOpen(false);
                      setSettingsOpen(true);
                    }}
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </button>
                  <button
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
                    onClick={() => {
                      setMoreMenuOpen(false);
                      setAboutOpen(true);
                    }}
                  >
                    <Info className="h-4 w-4" />
                    About
                  </button>
                </div>

                <div className="border-t border-border" />

                {/* Danger zone */}
                <div className="py-1">
                  <button
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                    onClick={() => {
                      setMoreMenuOpen(false);
                      handleDelete();
                    }}
                  >
                    <Trash className="h-4 w-4" />
                    Delete template
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Hidden file inputs */}
          <input
            ref={importInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleImportFile(f, false);
              e.currentTarget.value = "";
            }}
          />
          <input
            ref={importAllInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleImportFile(f, true);
              e.currentTarget.value = "";
            }}
          />
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
            className="min-h-40 w-full rounded-md border border-input bg-background p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder='{"id":"...","name":"...","docDefinition":{...}} or a docDefinition object'
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasteOpen(false)}>
              Cancel
            </Button>
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
                <div className="text-sm text-muted-foreground">
                  Choose light or dark mode
                </div>
              </div>
              <select
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                value={state.theme ?? "light"}
                onChange={(e) =>
                  dispatch({ type: "SET_THEME", payload: e.target.value as Theme })
                }
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

      {/* About Dialog */}
      <AboutDialog open={aboutOpen} onOpenChange={setAboutOpen} />

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
    </header>
  );
}
