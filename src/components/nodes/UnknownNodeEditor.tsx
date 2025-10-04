"use client";

import { useState } from "react";
import JSON5 from "json5";
import { useApp } from "@/lib/app-context";
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
      return '';
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
      // Wrap input in array brackets if not already, to support comma-separated objects
      const trimmed = raw.trim();
      const wrapped = trimmed.startsWith('[') ? trimmed : `[${trimmed}]`;
      const parsed = JSON5.parse(wrapped);
      
      // Keep everything as one node - if user inputs array, save as array
      let flagged: unknown;
      if (Array.isArray(parsed) && parsed.length > 1) {
        // Multiple items: keep as array and flag it
        flagged = parsed;
        // Add _custom flag to the array itself (arrays are objects in JS)
        (flagged as unknown as Record<string, unknown>)._custom = true;
      } else {
        // Single item: unwrap if needed and flag
        const singleItem = Array.isArray(parsed) ? parsed[0] : parsed;
        flagged = { ...singleItem, _custom: true };
      }
      
      const sanitized = JSON.parse(JSON.stringify(flagged)) as DocContentItem;
      const dd = state.currentTemplate.docDefinition;
      const nextContent = Array.isArray(dd.content) ? [...dd.content] : [];
      nextContent[index] = sanitized;
      await getPDFDataUrl({ ...dd, content: nextContent });
      dispatch({ type: 'SET_DOCDEFINITION', payload: { ...dd, content: nextContent } });
      
      if (Array.isArray(parsed) && parsed.length > 1) {
        setStatus(`Validated and saved (${parsed.length} objects in one node)`);
      } else {
        setStatus('Validated and saved');
      }
      setIsDirty(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTidy = () => {
    try {
      // Wrap input in array brackets if not already, to support comma-separated objects
      const trimmed = raw.trim();
      const wrapped = trimmed.startsWith('[') ? trimmed : `[${trimmed}]`;
      const parsed = JSON5.parse(wrapped);
      
      // If it's a single-item array, unwrap it for tidying
      const toTidy = Array.isArray(parsed) && parsed.length === 1 ? parsed[0] : parsed;
      const tidied = JSON.stringify(toTidy, null, 2);
      setRaw(tidied);
      setIsDirty(true);
      setError(null);
      setStatus('JSON tidied');
    } catch (e) {
      setError('Cannot tidy invalid JSON');
    }
  };

  return (
    <div className="space-y-2">
      <div className="text-xs text-muted-foreground">
        Custom Node (raw JSON)
        <span className="ml-2 text-muted-foreground/60">— Supports single or multiple objects in one node</span>
      </div>
      <textarea
        className="w-full h-40 rounded border bg-background p-2 font-mono text-xs"
        value={raw}
        onChange={(e) => {
          setRaw(e.target.value);
          setIsDirty(true);
          setError(null);
          setStatus(null);
        }}
        spellCheck={false}
        placeholder="{text: 'Hello'}, {text: 'World'}"
      />
      <div className="flex items-center justify-between">
        <div className="text-xs">
          {error ? (
            <span className="text-destructive">{error}</span>
          ) : status ? (
            <span className="text-emerald-600">{status}</span>
          ) : (
            <span className="text-muted-foreground">&nbsp;</span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            className="h-7 px-3 inline-flex items-center justify-center rounded border bg-background text-xs"
            onClick={handleTidy}
            disabled={isSaving || !raw.trim()}
          >
            Tidy JSON
          </button>
          <button
            className="h-7 px-3 inline-flex items-center justify-center rounded border bg-background text-xs"
            onClick={handleSave}
            disabled={isSaving || !isDirty}
          >
            {isSaving ? 'Validating…' : 'Save JSON'}
          </button>
        </div>
      </div>
    </div>
  );
}

