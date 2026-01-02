"use client";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface StatusIndicatorProps {
  isDirty: boolean;
  isSaving?: boolean;
  hasError?: boolean;
}

export function StatusIndicator({ isDirty, isSaving, hasError }: StatusIndicatorProps) {
  let colorClass = "bg-emerald-500"; // saved
  let label = "All changes saved";

  if (hasError) {
    colorClass = "bg-destructive";
    label = "Error saving";
  } else if (isSaving) {
    colorClass = "bg-amber-500 animate-pulse";
    label = "Saving...";
  } else if (isDirty) {
    colorClass = "bg-amber-500";
    label = "Unsaved changes";
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 px-2">
            <span 
              className={`inline-block h-2 w-2 rounded-full ${colorClass} transition-colors`} 
              aria-label={label} 
            />
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {isDirty ? "Unsaved" : "Saved"}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

