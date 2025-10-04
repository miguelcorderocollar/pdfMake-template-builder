"use client";

import { ExternalLink, Hash, MapPin } from "lucide-react";
import type { TextSpan } from "@/types";
import { getSpanProps } from "@/hooks/use-span-editor";

interface LinkControlsProps {
  span: TextSpan;
  onSetLink: (link: string | undefined) => void;
  onSetLinkToPage: (page: number | undefined) => void;
  onSetLinkToDestination: (destination: string | undefined) => void;
  onSetId: (id: string | undefined) => void;
}

/**
 * Link controls component for managing hyperlinks and anchors
 */
export function LinkControls({
  span,
  onSetLink,
  onSetLinkToPage,
  onSetLinkToDestination,
  onSetId,
}: LinkControlsProps) {
  const props = getSpanProps(span);

  return (
    <div className="space-y-2 pt-2 border-t animate-in slide-in-from-top-2">
      <div className="text-xs font-medium text-muted-foreground mb-1">Links & Anchors</div>
      
      <div className="grid grid-cols-1 gap-2">
        {/* External link */}
        <div className="flex items-center gap-2">
          <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            value={props.link ?? ""}
            onChange={(e) => {
              e.stopPropagation();
              onSetLink(e.target.value || undefined);
            }}
            className="flex-1 h-8 rounded-md border border-input bg-background px-2 text-xs"
            placeholder="External URL (e.g., https://...)"
          />
        </div>

        {/* Link to page */}
        <div className="flex items-center gap-2">
          <Hash className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <input
            type="number"
            value={props.linkToPage ?? ""}
            onChange={(e) => {
              e.stopPropagation();
              onSetLinkToPage(e.target.value === "" ? undefined : Number(e.target.value));
            }}
            className="flex-1 h-8 rounded-md border border-input bg-background px-2 text-xs"
            placeholder="Link to page number"
            min="1"
          />
        </div>

        {/* Link to destination */}
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            value={props.linkToDestination ?? ""}
            onChange={(e) => {
              e.stopPropagation();
              onSetLinkToDestination(e.target.value || undefined);
            }}
            className="flex-1 h-8 rounded-md border border-input bg-background px-2 text-xs"
            placeholder="Link to destination ID"
          />
        </div>

        {/* Destination ID */}
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            value={props.id ?? ""}
            onChange={(e) => {
              e.stopPropagation();
              onSetId(e.target.value || undefined);
            }}
            className="flex-1 h-8 rounded-md border border-input bg-background px-2 text-xs"
            placeholder="Destination ID (anchor for this span)"
          />
        </div>
      </div>

      {/* Help text */}
      <div className="text-xs text-muted-foreground italic">
        💡 Use only one link type per span. ID makes this span a destination.
      </div>
    </div>
  );
}

