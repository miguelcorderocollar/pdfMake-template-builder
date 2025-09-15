"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Canvas } from "@/components/layout/Canvas";
import { PreviewPanel } from "./PreviewPanel";
import { useApp } from "@/lib/app-context";
import { downloadPDF } from "@/services/pdf-service";

export function TemplateBuilder() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { state, dispatch } = useApp();

  const handlePreview = () => {
    dispatch({ type: 'SET_PREVIEW_MODE', payload: true });
  };

  const handleExportPDF = () => {
    const dd = state.currentTemplate?.docDefinition;
    const filename = state.filename || 'document.pdf';
    if (dd) downloadPDF(dd, filename);
  };

  const handleClosePreview = () => {
    dispatch({ type: 'SET_PREVIEW_MODE', payload: false });
  };

  const docDefinition = state.currentTemplate?.docDefinition ?? null;

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <Header
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onPreview={handlePreview}
        onExportPDF={handleExportPDF}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} />

        {/* Canvas Area (Phase 0 uses Content via Sidebar; keep Canvas for now, can replace) */}
        <div className="flex-1 flex flex-col">
          <Canvas />
        </div>
      </div>

      {/* Preview Panel */}
      <PreviewPanel
        docDefinition={docDefinition}
        isOpen={state.isPreviewMode}
        onClose={handleClosePreview}
      />
    </div>
  );
}
