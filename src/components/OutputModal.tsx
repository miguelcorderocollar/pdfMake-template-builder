"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, FileText, Code, Eye, Copy, Check, X } from "lucide-react";
import { getPDFDataUrl, downloadPDF } from "@/services/pdf-service";
import { useTemplateManagement } from "@/hooks/use-template-management";
import { useApp } from "@/lib/app-context";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import json from "react-syntax-highlighter/dist/esm/languages/hljs/json";
import { vs2015 } from "react-syntax-highlighter/dist/esm/styles/hljs";
import type { DocDefinition } from "@/types";

// Register JSON language
SyntaxHighlighter.registerLanguage("json", json);

interface OutputModalProps {
  docDefinition: DocDefinition | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OutputModal({ docDefinition, isOpen, onClose }: OutputModalProps) {
  const { state } = useApp();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("preview");

  // Get filename from state (set in Settings panel), strip .pdf extension for input
  const stateFilename = state.filename ?? "document.pdf";
  const baseFilename = stateFilename.replace(/\.pdf$/i, "");
  const [filename, setFilename] = useState(baseFilename);

  const { currentTemplate, exportCurrent, exportAll, copyCurrentTemplate } =
    useTemplateManagement();

  // Update filename when state.filename changes
  useEffect(() => {
    if (isOpen) {
      const newBase = (state.filename ?? "document.pdf").replace(/\.pdf$/i, "");
      setFilename(newBase);
    }
  }, [isOpen, state.filename]);

  // Generate PDF preview when modal opens
  useEffect(() => {
    if (isOpen && docDefinition && activeTab === "preview") {
      setLoading(true);
      setError(null);

      getPDFDataUrl(docDefinition)
        .then((url) => {
          setPdfUrl(url);
        })
        .catch((err) => {
          console.error("Failed to generate PDF preview:", err);
          setError("Failed to generate PDF preview");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, docDefinition, activeTab]);

  const handleExportPDF = () => {
    if (docDefinition) {
      downloadPDF(docDefinition, `${filename}.pdf`);
    }
  };

  const handleCopyJSON = async () => {
    if (currentTemplate) {
      try {
        await navigator.clipboard.writeText(
          JSON.stringify(currentTemplate.docDefinition, null, 2)
        );
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    }
  };

  if (!isOpen) return null;

  const jsonString = currentTemplate
    ? JSON.stringify(currentTemplate.docDefinition, null, 2)
    : "{}";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-[96vw] md:!max-w-[60vw] !w-[96vw] md:!w-[60vw] !h-[94vh] !p-0 !gap-0 flex flex-col overflow-hidden">
        {/* Visually hidden title for accessibility */}
        <DialogTitle className="sr-only">Output Options</DialogTitle>

        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute right-2 top-2 z-10 h-7 w-7 rounded-full"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col min-h-0"
        >
          <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent px-3 h-10 flex-shrink-0">
            <TabsTrigger
              value="preview"
              className="gap-1.5 text-sm data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-3"
            >
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger
              value="export-pdf"
              className="gap-1.5 text-sm data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-3"
            >
              <FileText className="h-4 w-4" />
              Export PDF
            </TabsTrigger>
            <TabsTrigger
              value="export-json"
              className="gap-1.5 text-sm data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-3"
            >
              <Code className="h-4 w-4" />
              Export JSON
            </TabsTrigger>
          </TabsList>

          {/* Preview Tab - Maximum space for PDF */}
          <TabsContent value="preview" className="flex-1 m-0 min-h-0">
            {loading && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-xs text-muted-foreground">Generating preview...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-destructive">
                  <p className="font-medium mb-1">Preview Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}

            {pdfUrl && !loading && !error && (
              <iframe
                src={pdfUrl}
                className="w-full h-full border-0"
                title="PDF Preview"
              />
            )}
          </TabsContent>

          {/* Export PDF Tab */}
          <TabsContent value="export-pdf" className="flex-1 m-0 p-6">
            <div className="max-w-md space-y-4">
              <div>
                <h3 className="text-base font-medium">Download PDF</h3>
                <p className="text-sm text-muted-foreground">
                  Filename is set in Settings → Common Settings
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pdf-filename" className="text-sm">Filename</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="pdf-filename"
                    value={filename}
                    onChange={(e) => setFilename(e.target.value)}
                    className="max-w-[200px] h-8 text-sm"
                  />
                  <span className="text-sm text-muted-foreground">.pdf</span>
                </div>
              </div>

              <Button onClick={handleExportPDF} size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </TabsContent>

          {/* Export JSON Tab - Simple action bar + syntax highlighted JSON */}
          <TabsContent value="export-json" className="flex-1 m-0 flex flex-col min-h-0">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-border flex-shrink-0 bg-muted/30">
              <Button variant="outline" size="sm" onClick={exportCurrent} className="gap-1.5 h-7 text-xs">
                <Download className="h-3.5 w-3.5" />
                Download
              </Button>
              <Button variant="outline" size="sm" onClick={handleCopyJSON} className="gap-1.5 h-7 text-xs">
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied!" : "Copy"}
              </Button>
              <Button variant="ghost" size="sm" onClick={exportAll} className="gap-1.5 h-7 text-xs">
                <Download className="h-3.5 w-3.5" />
                All Templates
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { copyCurrentTemplate(); onClose(); }}
                className="gap-1.5 h-7 text-xs"
              >
                <Copy className="h-3.5 w-3.5" />
                Duplicate
              </Button>
            </div>
            
            {/* Syntax highlighted JSON */}
            <div className="flex-1 min-h-0 overflow-auto">
              <SyntaxHighlighter
                language="json"
                style={vs2015}
                showLineNumbers
                wrapLongLines={true}
                lineNumberStyle={{ 
                  minWidth: "3em", 
                  paddingRight: "1em",
                  color: "#6e7681",
                  textAlign: "right"
                }}
                customStyle={{
                  margin: 0,
                  padding: "1rem",
                  fontSize: "12px",
                  lineHeight: "1.5",
                  height: "100%",
                  background: "#1e1e1e",
                }}
                codeTagProps={{
                  style: {
                    fontFamily: "ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace",
                  }
                }}
                preTagProps={{
                  style: {
                    margin: 0,
                  }
                }}
              >
                {jsonString}
              </SyntaxHighlighter>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
