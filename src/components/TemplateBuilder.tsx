"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Canvas } from "@/components/layout/Canvas";
import { OutputModal } from "./OutputModal";
import { NodeOverviewPanel } from "./NodeOverviewPanel";
import { MobileDrawer } from "./MobileDrawer";
import { MobileBottomBar } from "./MobileBottomBar";
import { useApp } from "@/lib/app-context";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ElementsPanel } from "./sidebar/panels/ElementsPanel";
import { StylesPanel } from "./sidebar/panels/StylesPanel";
import { formatKeyboardShortcut } from "@/lib/utils";

const OVERVIEW_STORAGE_KEY = "pdfmake-overview-open";

export function TemplateBuilder() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [overviewOpen, setOverviewOpen] = useState(true);
  const [mobileAddOpen, setMobileAddOpen] = useState(false);
  const [mobileStylesOpen, setMobileStylesOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { state, dispatch } = useApp();

  // Load overview state from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(OVERVIEW_STORAGE_KEY);
    if (stored !== null) {
      setOverviewOpen(stored === "true");
    }
  }, []);

  // Save overview state to localStorage
  const toggleOverview = () => {
    const newState = !overviewOpen;
    setOverviewOpen(newState);
    localStorage.setItem(OVERVIEW_STORAGE_KEY, String(newState));
  };

  const handleOpenOutput = () => {
    dispatch({ type: "SET_PREVIEW_MODE", payload: true });
  };

  const handleClosePreview = () => {
    dispatch({ type: "SET_PREVIEW_MODE", payload: false });
  };

  const docDefinition = state.currentTemplate?.docDefinition ?? null;

  // Keyboard shortcut for overview toggle (Cmd/Ctrl + \)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "\\") {
        e.preventDefault();
        toggleOverview();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <Header
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onOpenOutput={handleOpenOutput}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Desktop only */}
        <div className="hidden md:block">
          <Sidebar isOpen={sidebarOpen} />
        </div>

        {/* Canvas Area */}
        <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
          <Canvas />
        </div>

        {/* Node Overview Panel - Desktop only, Toggleable */}
        <div
          className={`hidden lg:flex border-l border-border bg-card transition-all duration-300 ${
            overviewOpen ? "w-72" : "w-12"
          }`}
        >
          {overviewOpen ? (
            <div className="flex flex-col h-full w-full">
              {/* Header with collapse button */}
              <div className="p-3 border-b border-border flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm">Document Overview</h3>
                  {state.currentTemplate?.docDefinition?.content && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {state.currentTemplate.docDefinition.content.length} node
                      {state.currentTemplate.docDefinition.content.length !== 1 ? "s" : ""} • Drag to reorder
                    </p>
                  )}
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleOverview}
                        className="h-7 w-7 flex-shrink-0"
                        aria-label="Collapse overview panel"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">Collapse overview ({formatKeyboardShortcut("\\")})</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex-1 min-w-0 overflow-hidden">
                <NodeOverviewPanel />
              </div>
            </div>
          ) : (
            /* Collapsed state - show expand button */
            <div className="flex flex-col items-center h-full py-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleOverview}
                      className="h-8 w-8"
                      aria-label="Expand overview panel"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">Expand overview ({formatKeyboardShortcut("\\")})</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <div className="mt-auto mb-4 writing-vertical-rl text-[10px] font-medium text-muted-foreground tracking-wider">
                OVERVIEW
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <MobileBottomBar
        onAddElement={() => setMobileAddOpen(true)}
        onStyles={() => setMobileStylesOpen(true)}
        onNav={() => setMobileNavOpen(true)}
        onOutput={handleOpenOutput}
      />

      {/* Mobile Drawers */}
      <MobileDrawer
        isOpen={mobileAddOpen}
        onClose={() => setMobileAddOpen(false)}
        title="Add Element"
        side="bottom"
      >
        <div className="p-4">
          <ElementsPanel />
        </div>
      </MobileDrawer>

      <MobileDrawer
        isOpen={mobileStylesOpen}
        onClose={() => setMobileStylesOpen(false)}
        title="Styles"
        side="bottom"
      >
        <div className="p-4">
          <StylesPanel />
        </div>
      </MobileDrawer>

      <MobileDrawer
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        title="Document Overview"
        side="bottom"
      >
        <NodeOverviewPanel />
      </MobileDrawer>

      {/* Output Modal */}
      <OutputModal
        docDefinition={docDefinition}
        isOpen={state.isPreviewMode}
        onClose={handleClosePreview}
      />
    </div>
  );
}
