"use client";

import { Bold, Italic, Type, Palette, Link as LinkIcon } from "lucide-react";
import type { TextSpan } from "@/types";
import { getSpanProps, hasAnyLink } from "@/hooks/use-span-editor";

interface SpanToolbarProps {
  span: TextSpan;
  spanIndex: number;
  styles?: Record<string, { fontSize?: number; bold?: boolean; italics?: boolean; color?: string }>;
  showLinksSection: boolean;
  onToggleBold: () => void;
  onToggleItalic: () => void;
  onSetFontSize: (size: number | undefined) => void;
  onSetColor: (color: string | undefined) => void;
  onSetStyle: (style: string | undefined) => void;
  onToggleLinks: () => void;
  onDelete: () => void;
}

/**
 * Toolbar component for span formatting controls
 */
export function SpanToolbar({
  span,
  styles,
  showLinksSection,
  onToggleBold,
  onToggleItalic,
  onSetFontSize,
  onSetColor,
  onSetStyle,
  onToggleLinks,
  onDelete,
}: SpanToolbarProps) {
  const props = getSpanProps(span);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Bold button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleBold();
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
          onToggleItalic();
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
            onSetFontSize(e.target.value === "" ? undefined : Number(e.target.value));
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
            onSetColor(e.target.value || undefined);
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
          onSetStyle(e.target.value || undefined);
        }}
        className="h-8 px-2 rounded-md border border-input bg-background text-xs hover:bg-accent transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        <option value="">(no style)</option>
        {styles && Object.keys(styles).map((name) => (
          <option key={name} value={name}>{name}</option>
        ))}
      </select>

      {/* Link toggle button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleLinks();
        }}
        className={`h-8 px-3 rounded-md border flex items-center gap-1 text-xs transition-colors ${
          hasAnyLink(span) || props.id 
            ? "bg-blue-500/10 border-blue-500/50 text-blue-600 hover:bg-blue-500/20" 
            : "hover:bg-accent"
        }`}
        title="Toggle links & anchors"
      >
        <LinkIcon className="h-4 w-4" />
        <span>{showLinksSection ? "Hide Links" : "Add Links"}</span>
        {(hasAnyLink(span) || props.id) && <span className="ml-1">✓</span>}
      </button>

      {/* Delete button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="h-8 px-3 rounded-md border text-xs hover:bg-destructive hover:text-destructive-foreground transition-colors ml-auto"
      >
        Delete
      </button>
    </div>
  );
}

