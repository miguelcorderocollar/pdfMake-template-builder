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
    if (dd) downloadPDF(dd);
  };

  const handleExportJSON = () => {
    const template = {
      id: 'export-' + Date.now(),
      name: 'Exported Template',
      docDefinition: state.currentTemplate?.docDefinition,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const dataStr = JSON.stringify(template, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'template.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleClosePreview = () => {
    dispatch({ type: 'SET_PREVIEW_MODE', payload: false });
  };

  const docDefinition = state.currentTemplate?.docDefinition as any;

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <Header
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onPreview={handlePreview}
        onExportPDF={handleExportPDF}
        onExportJSON={handleExportJSON}
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
