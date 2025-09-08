"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Menu, Save, Download, Eye, Upload, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";

interface HeaderProps {
  onToggleSidebar: () => void;
  onPreview?: () => void;
  onExportPDF?: () => void;
  onExportJSON?: () => void;
}

export function Header({
  onToggleSidebar,
  onPreview,
  onExportPDF,
  onExportJSON
}: HeaderProps) {
  const [templateName, setTemplateName] = useState("Untitled Template");

  return (
    <Card className="rounded-none border-x-0 border-t-0 border-b">
      <div className="flex items-center justify-between px-4 py-3">
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

          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">PDFMake Template Builder</h1>
            <Input
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="h-8 w-[220px]"
              placeholder="Template name"
            />
          </div>
        </div>

        {/* Right Section - Action Buttons */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            <Save className="h-4 w-4 mr-2" data-darkreader-ignore suppressHydrationWarning />
            Save
          </Button>
          <Button variant="outline" size="sm" disabled>
            <Upload className="h-4 w-4 mr-2" data-darkreader-ignore suppressHydrationWarning />
            Import
          </Button>
          <Button variant="outline" size="sm" onClick={onExportPDF}>
            <Download className="h-4 w-4 mr-2" data-darkreader-ignore suppressHydrationWarning />
            Export PDF
          </Button>
          <Button variant="outline" size="sm" onClick={onExportJSON}>
            <Download className="h-4 w-4 mr-2" data-darkreader-ignore suppressHydrationWarning />
            Export JSON
          </Button>
          <Button variant="outline" size="sm" onClick={onPreview}>
            <Eye className="h-4 w-4 mr-2" data-darkreader-ignore suppressHydrationWarning />
            Preview
          </Button>
          <Button variant="ghost" size="icon" disabled>
            <Settings className="h-4 w-4" data-darkreader-ignore suppressHydrationWarning />
          </Button>
        </div>
      </div>
    </Card>
  );
}
