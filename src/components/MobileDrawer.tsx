"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  side?: "left" | "right" | "bottom" | "top";
}

export function MobileDrawer({
  isOpen,
  onClose,
  title,
  children,
  side = "left",
}: MobileDrawerProps) {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side={side}
        className={
          side === "bottom"
            ? "h-[70vh] rounded-t-2xl"
            : "w-80 max-w-[85vw]"
        }
      >
        {title && (
          <SheetHeader className="mb-4">
            <SheetTitle className="font-serif">{title}</SheetTitle>
          </SheetHeader>
        )}
        <div className="flex-1 overflow-auto">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
