"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogOverlay(props: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      {...props}
      className={[
        "fixed inset-0 z-50 bg-black/50",
        props.className ?? "",
      ].join(" ")}
    />
  );
}

export function DialogContent({ className, ...props }: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogOverlay />
      <DialogPrimitive.Content
        {...props}
        className={[
          "fixed z-50 grid w-full max-w-lg gap-4 border border-border bg-background p-6 shadow-lg",
          "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
          "rounded-md",
          className ?? "",
        ].join(" ")}
      />
    </DialogPrimitive.Portal>
  );
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={["flex flex-col space-y-1.5", className ?? ""].join(" ")} />;
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={["flex items-center justify-end gap-2", className ?? ""].join(" ")} />;
}

export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;


