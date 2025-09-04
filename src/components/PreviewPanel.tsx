"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { getPDFDataUrl } from "@/services/pdf-service";
import { DocDefinition } from "@/types";

interface PreviewPanelProps {
  docDefinition: DocDefinition | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PreviewPanel({ docDefinition, isOpen, onClose }: PreviewPanelProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && docDefinition) {
      setLoading(true);
      setError(null);

      getPDFDataUrl(docDefinition)
        .then((url) => {
          setPdfUrl(url);
        })
        .catch((err) => {
          console.error('Failed to generate PDF preview:', err);
          setError('Failed to generate PDF preview');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, docDefinition]);

  if (!isOpen) return null;

  return (
    <Card className="fixed inset-4 z-50 bg-background border-2">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-semibold">PDF Preview</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 p-4 h-full">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Generating PDF...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-destructive">
              <p className="text-lg font-medium mb-2">Preview Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {pdfUrl && !loading && !error && (
          <iframe
            src={pdfUrl}
            className="w-full h-full border rounded"
            title="PDF Preview"
          />
        )}
      </div>
    </Card>
  );
}
