"use client";

import type { TextSpan } from "@/types";
import { getSpanProps, hasAnyLink } from "@/hooks/use-span-editor";

interface SpanPreviewProps {
  span: TextSpan;
  text: string;
}

/**
 * Preview component showing how the span will appear
 */
export function SpanPreview({ span, text }: SpanPreviewProps) {
  const props = getSpanProps(span);

  return (
    <div className="text-xs text-muted-foreground">
      Preview:{" "}
      <span
        style={{
          fontWeight: props.bold ? "bold" : "normal",
          fontStyle: props.italics ? "italic" : "normal",
          fontSize: props.fontSize ? `${props.fontSize}px` : undefined,
          color: props.color || undefined,
          textDecoration: hasAnyLink(span) ? "underline" : undefined,
          cursor: hasAnyLink(span) ? "pointer" : undefined,
        }}
      >
        {text || "(empty)"}
      </span>
      {hasAnyLink(span) && (
        <span className="ml-2 text-blue-600">
          {props.link && `→ ${props.link}`}
          {props.linkToPage && `→ Page ${props.linkToPage}`}
          {props.linkToDestination && `→ #${props.linkToDestination}`}
        </span>
      )}
      {props.id && (
        <span className="ml-2 text-purple-600">
          🎯 #{props.id}
        </span>
      )}
    </div>
  );
}

