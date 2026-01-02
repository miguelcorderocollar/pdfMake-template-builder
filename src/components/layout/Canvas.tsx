"use client";

import { useCallback } from "react";
import { ContentList } from "@/components/nodes/ContentList";
import { useApp } from "@/lib/app-context";

export function Canvas() {
  const { state } = useApp();
  const contentCount = state.currentTemplate?.docDefinition.content.length ?? 0;

  const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  return (
    <div className="flex-1 overflow-auto bg-background">
      <div className="mx-auto py-6 px-4 md:px-8 w-full max-w-4xl">
        <div
          className="relative"
          onDrop={onDrop}
          onDragOver={onDragOver}
        >
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-serif font-normal text-foreground">
                Document Content
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {contentCount} {contentCount === 1 ? "element" : "elements"}
              </p>
            </div>
          </div>

          {/* Content */}
          <ContentList />
        </div>
      </div>
    </div>
  );
}
