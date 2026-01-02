"use client";

import { useState } from "react";
import JSON5 from "json5";
import { useApp } from "@/lib/app-context";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Code, Wand2, Check, AlertCircle } from "lucide-react";
import type { DocContentItem } from "@/types";
import { getPDFDataUrl } from "@/services/pdf-service";

interface UnknownNodeEditorProps {
  index: number;
  value: unknown;
}

/**
 * Editor component for custom/unknown node types
 * Allows direct JSON editing with validation
 */
export function UnknownNodeEditor({ index, value }: UnknownNodeEditorProps) {
  const { state, dispatch } = useApp();
  const [raw, setRaw] = useState<string>(() => {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return "";
    }
  });
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const handleSave = async () => {
    if (!state.currentTemplate) return;
    setIsSaving(true);
    setError(null);
    setStatus(null);
    try {
      // Wrap input in array brackets if not already
      const trimmed = raw.trim();
      const wrapped = trimmed.startsWith("[") ? trimmed : `[${trimmed}]`;
      const parsed = JSON5.parse(wrapped);
      
      // Keep everything as one node
      let flagged: unknown;
      if (Array.isArray(parsed) && parsed.length > 1) {
        flagged = parsed;
        (flagged as unknown as Record<string, unknown>)._custom = true;
      } else {
        const singleItem = Array.isArray(parsed) ? parsed[0] : parsed;
        flagged = { ...singleItem, _custom: true };
      }
      
      const sanitized = JSON.parse(JSON.stringify(flagged)) as DocContentItem;
      const dd = state.currentTemplate.docDefinition;
      const nextContent = Array.isArray(dd.content) ? [...dd.content] : [];
      nextContent[index] = sanitized;
      await getPDFDataUrl({ ...dd, content: nextContent });
      dispatch({ type: "SET_DOCDEFINITION", payload: { ...dd, content: nextContent } });
      
      if (Array.isArray(parsed) && parsed.length > 1) {
        setStatus(`Validated (${parsed.length} objects)`);
      } else {
        setStatus("Validated and saved");
      }
      setIsDirty(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTidy = () => {
    try {
      const trimmed = raw.trim();
      const wrapped = trimmed.startsWith("[") ? trimmed : `[${trimmed}]`;
      const parsed = JSON5.parse(wrapped);
      
      const toTidy = Array.isArray(parsed) && parsed.length === 1 ? parsed[0] : parsed;
      const tidied = JSON.stringify(toTidy, null, 2);
      setRaw(tidied);
      setIsDirty(true);
      setError(null);
      setStatus("JSON formatted");
    } catch {
      setError("Cannot format invalid JSON");
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Code className="h-4 w-4 text-muted-foreground" />
        <Label className="font-medium">Custom Node</Label>
        <Badge variant="outline" className="text-xs">
          Raw JSON
        </Badge>
      </div>

      {/* Editor */}
      <Textarea
        className="min-h-[12rem] font-mono text-sm leading-relaxed resize-y"
        value={raw}
        onChange={(e) => {
          setRaw(e.target.value);
          setIsDirty(true);
          setError(null);
          setStatus(null);
        }}
        spellCheck={false}
        placeholder='{"text": "Hello"}, {"text": "World"}'
      />

      {/* Status bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          {error ? (
            <>
              <AlertCircle className="h-4 w-4 text-destructive" />
            <span className="text-destructive">{error}</span>
            </>
          ) : status ? (
            <>
              <Check className="h-4 w-4 text-emerald-600" />
            <span className="text-emerald-600">{status}</span>
            </>
          ) : (
            <span className="text-muted-foreground text-xs">
              Supports JSON5 syntax (unquoted keys, trailing commas)
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTidy}
            disabled={isSaving || !raw.trim()}
            className="gap-1.5"
          >
            <Wand2 className="h-3.5 w-3.5" />
            Format
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving || !isDirty}
            className="gap-1.5"
          >
            {isSaving ? "Validating..." : "Save & Validate"}
          </Button>
        </div>
      </div>
    </div>
  );
}
