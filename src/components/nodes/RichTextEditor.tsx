"use client";

import { useState } from "react";
import { Bold, Italic, Type, Palette } from "lucide-react";
import type { TextSpan } from "@/types";

interface RichTextEditorProps {
  spans: TextSpan[];
  onChange: (spans: TextSpan[]) => void;
  styles?: Record<string, { fontSize?: number; bold?: boolean; italics?: boolean; color?: string }>;
}

/**
 * Rich text editor component for editing text with inline styles
 * Supports bold, italic, font size, color, and style references
 */
export function RichTextEditor({ spans, onChange, styles }: RichTextEditorProps) {
  const [selectedSpanIndex, setSelectedSpanIndex] = useState<number | null>(null);

  const addSpan = () => {
    onChange([...spans, ""]);
    setSelectedSpanIndex(spans.length);
  };

  const updateSpan = (index: number, newSpan: TextSpan) => {
    const updated = [...spans];
    updated[index] = newSpan;
    onChange(updated);
  };

  const deleteSpan = (index: number) => {
    const updated = spans.filter((_, i) => i !== index);
    onChange(updated);
    if (selectedSpanIndex === index) {
      setSelectedSpanIndex(null);
    } else if (selectedSpanIndex !== null && selectedSpanIndex > index) {
      setSelectedSpanIndex(selectedSpanIndex - 1);
    }
  };

  const toggleBold = (index: number) => {
    const span = spans[index];
    if (typeof span === "string") {
      updateSpan(index, { text: span, bold: true });
    } else {
      updateSpan(index, { ...span, bold: !span.bold });
    }
  };

  const toggleItalic = (index: number) => {
    const span = spans[index];
    if (typeof span === "string") {
      updateSpan(index, { text: span, italics: true });
    } else {
      updateSpan(index, { ...span, italics: !span.italics });
    }
  };

  const setFontSize = (index: number, size: number | undefined) => {
    const span = spans[index];
    if (typeof span === "string") {
      updateSpan(index, { text: span, fontSize: size });
    } else {
      updateSpan(index, { ...span, fontSize: size });
    }
  };

  const setColor = (index: number, color: string | undefined) => {
    const span = spans[index];
    if (typeof span === "string") {
      updateSpan(index, { text: span, color });
    } else {
      updateSpan(index, { ...span, color });
    }
  };

  const setStyleRef = (index: number, styleRef: string | undefined) => {
    const span = spans[index];
    if (typeof span === "string") {
      updateSpan(index, { text: span, style: styleRef });
    } else {
      updateSpan(index, { ...span, style: styleRef });
    }
  };

  const getSpanText = (span: TextSpan): string => {
    return typeof span === "string" ? span : span.text;
  };

  const getSpanProps = (span: TextSpan) => {
    if (typeof span === "string") {
      return { bold: false, italics: false, fontSize: undefined, color: undefined, style: undefined };
    }
    return {
      bold: span.bold || false,
      italics: span.italics || false,
      fontSize: span.fontSize,
      color: span.color,
      style: span.style,
    };
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-muted-foreground">Rich Text Spans</label>
        <button
          onClick={addSpan}
          className="h-7 px-3 rounded-md border text-xs hover:bg-accent transition-colors"
        >
          + Add Span
        </button>
      </div>

      {spans.length === 0 ? (
        <div className="text-xs text-muted-foreground italic p-3 border rounded-md">
          No spans yet. Click &quot;Add Span&quot; to start.
        </div>
      ) : (
        <div className="space-y-2">
          {spans.map((span, idx) => {
            const text = getSpanText(span);
            const props = getSpanProps(span);
            const isSelected = selectedSpanIndex === idx;

            return (
              <div
                key={idx}
                className={`border rounded-md p-3 space-y-2 transition-colors ${
                  isSelected ? "border-primary bg-accent/50" : "border-input hover:border-accent-foreground/20"
                }`}
                onClick={() => setSelectedSpanIndex(idx)}
              >
                {/* Text input */}
                <input
                  type="text"
                  value={text}
                  onChange={(e) => {
                    if (typeof span === "string") {
                      updateSpan(idx, e.target.value);
                    } else {
                      updateSpan(idx, { ...span, text: e.target.value });
                    }
                  }}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Enter text..."
                />

                {/* Toolbar */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Bold button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBold(idx);
                    }}
                    className={`h-8 w-8 rounded-md border flex items-center justify-center transition-colors ${
                      props.bold ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                    }`}
                    title="Bold"
                  >
                    <Bold className="h-4 w-4" />
                  </button>

                  {/* Italic button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleItalic(idx);
                    }}
                    className={`h-8 w-8 rounded-md border flex items-center justify-center transition-colors ${
                      props.italics ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                    }`}
                    title="Italic"
                  >
                    <Italic className="h-4 w-4" />
                  </button>

                  {/* Font size */}
                  <div className="flex items-center gap-1">
                    <Type className="h-4 w-4 text-muted-foreground" />
                    <input
                      type="number"
                      value={props.fontSize ?? ""}
                      onChange={(e) => {
                        e.stopPropagation();
                        setFontSize(idx, e.target.value === "" ? undefined : Number(e.target.value));
                      }}
                      className="w-16 h-8 rounded-md border border-input bg-background px-2 text-xs"
                      placeholder="Size"
                      min="1"
                    />
                  </div>

                  {/* Color */}
                  <div className="flex items-center gap-1">
                    <Palette className="h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={props.color ?? ""}
                      onChange={(e) => {
                        e.stopPropagation();
                        setColor(idx, e.target.value || undefined);
                      }}
                      className="w-20 h-8 rounded-md border border-input bg-background px-2 text-xs"
                      placeholder="Color"
                    />
                  </div>

                  {/* Style reference */}
                  <select
                    value={typeof props.style === "string" ? props.style : ""}
                    onChange={(e) => {
                      e.stopPropagation();
                      setStyleRef(idx, e.target.value || undefined);
                    }}
                    className="h-8 px-2 rounded-md border border-input bg-background text-xs hover:bg-accent transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="">(no style)</option>
                    {styles && Object.keys(styles).map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>

                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSpan(idx);
                    }}
                    className="h-8 px-3 rounded-md border text-xs hover:bg-destructive hover:text-destructive-foreground transition-colors ml-auto"
                  >
                    Delete
                  </button>
                </div>

                {/* Preview */}
                <div className="text-xs text-muted-foreground">
                  Preview:{" "}
                  <span
                    style={{
                      fontWeight: props.bold ? "bold" : "normal",
                      fontStyle: props.italics ? "italic" : "normal",
                      fontSize: props.fontSize ? `${props.fontSize}px` : undefined,
                      color: props.color || undefined,
                    }}
                  >
                    {text || "(empty)"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

