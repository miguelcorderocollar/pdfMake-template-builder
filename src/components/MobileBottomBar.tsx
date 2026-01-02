"use client";

import { Plus, Palette, ListTree, FileOutput } from "lucide-react";

interface MobileBottomBarProps {
  onAddElement: () => void;
  onStyles: () => void;
  onNav: () => void;
  onOutput: () => void;
}

export function MobileBottomBar({
  onAddElement,
  onStyles,
  onNav,
  onOutput,
}: MobileBottomBarProps) {
  return (
    <nav className="fixed bottom-0 inset-x-0 h-16 bg-card border-t border-border z-30 md:hidden safe-area-pb">
      <div className="flex items-stretch h-full">
        <button
          onClick={onAddElement}
          className="flex-1 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors active:bg-accent"
        >
          <Plus className="h-5 w-5" />
          <span className="text-[10px] font-medium">Add</span>
        </button>

        <button
          onClick={onStyles}
          className="flex-1 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors active:bg-accent"
        >
          <Palette className="h-5 w-5" />
          <span className="text-[10px] font-medium">Styles</span>
        </button>

        <button
          onClick={onNav}
          className="flex-1 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors active:bg-accent"
        >
          <ListTree className="h-5 w-5" />
          <span className="text-[10px] font-medium">Nav</span>
        </button>

        <button
          onClick={onOutput}
          className="flex-1 flex flex-col items-center justify-center gap-1 text-primary hover:bg-primary/10 transition-colors active:bg-primary/20"
        >
          <FileOutput className="h-5 w-5" />
          <span className="text-[10px] font-medium">Output</span>
        </button>
      </div>
    </nav>
  );
}

