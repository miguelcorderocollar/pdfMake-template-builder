"use client";

import { useCallback } from "react";
import { Card } from "@/components/ui/card";
import { ContentList } from "@/components/nodes/ContentList";
import { useApp } from "@/lib/app-context";

export function Canvas() {
  useApp();

  const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  return (
    <Card className="flex-1 m-4 overflow-auto">
      <div className="mx-auto my-6 w-full max-w-4xl">
        <div
          className="relative bg-card text-card-foreground rounded-xl border shadow-sm p-6"
          onDrop={onDrop}
          onDragOver={onDragOver}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-muted-foreground">Document Content</h2>
          </div>
          <ContentList />
        </div>
      </div>
    </Card>
  );
}
// Node components moved to @/components/nodes


