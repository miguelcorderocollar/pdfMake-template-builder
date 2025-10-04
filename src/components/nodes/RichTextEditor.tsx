"use client";

import type { TextSpan } from "@/types";
import { useSpanEditor, getSpanText } from "@/hooks/use-span-editor";
import { SpanToolbar } from "./rich-text/SpanToolbar";
import { LinkControls } from "./rich-text/LinkControls";
import { SpanPreview } from "./rich-text/SpanPreview";

interface RichTextEditorProps {
  spans: TextSpan[];
  onChange: (spans: TextSpan[]) => void;
  styles?: Record<string, { fontSize?: number; bold?: boolean; italics?: boolean; color?: string }>;
}

/**
 * Rich text editor component for editing text with inline styles
 * Supports bold, italic, font size, color, style references, and links
 */
export function RichTextEditor({ spans, onChange, styles }: RichTextEditorProps) {
  const {
    selectedSpanIndex,
    setSelectedSpanIndex,
    showLinksSection,
    addSpan,
    deleteSpan,
    setSpanText,
    setSpanProperty,
    toggleSpanProperty,
    toggleLinksSection,
  } = useSpanEditor(spans, onChange);

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
                  onChange={(e) => setSpanText(idx, e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Enter text..."
                />

                {/* Toolbar */}
                <SpanToolbar
                  span={span}
                  spanIndex={idx}
                  styles={styles}
                  showLinksSection={showLinksSection[idx] || false}
                  onToggleBold={() => toggleSpanProperty(idx, 'bold')}
                  onToggleItalic={() => toggleSpanProperty(idx, 'italics')}
                  onSetFontSize={(size) => setSpanProperty(idx, 'fontSize', size)}
                  onSetColor={(color) => setSpanProperty(idx, 'color', color)}
                  onSetStyle={(style) => setSpanProperty(idx, 'style', style)}
                  onToggleLinks={() => toggleLinksSection(idx)}
                  onDelete={() => deleteSpan(idx)}
                />

                {/* Link controls - collapsible */}
                {showLinksSection[idx] && (
                  <LinkControls
                    span={span}
                    onSetLink={(link) => setSpanProperty(idx, 'link', link)}
                    onSetLinkToPage={(page) => setSpanProperty(idx, 'linkToPage', page)}
                    onSetLinkToDestination={(dest) => setSpanProperty(idx, 'linkToDestination', dest)}
                    onSetId={(id) => setSpanProperty(idx, 'id', id)}
                  />
                )}

                {/* Preview */}
                <SpanPreview span={span} text={text} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
