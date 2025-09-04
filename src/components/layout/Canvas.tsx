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
    <Card className="flex-1 m-4 p-4 overflow-auto">
      <div
        className="relative h-full min-h-[60vh] border rounded-lg p-4"
        onDrop={onDrop}
        onDragOver={onDragOver}
      >
        <ContentList />
      </div>
    </Card>
  );
}
// Node components moved to @/components/nodes


