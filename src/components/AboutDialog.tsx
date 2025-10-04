"use client";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart, BookOpen, ExternalLink, Code2, User } from "lucide-react";

interface AboutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AboutDialog({ open, onOpenChange }: AboutDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>About this app</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <p className="leading-relaxed">
            <span className="font-medium">pdfmake</span> is a JavaScript library for generating
            PDF documents in the browser and Node.js using a declarative document definition.
          </p>
          <p className="leading-relaxed">
            This app is a visual builder for pdfmake document definitions to help you design,
            iterate and export templates faster.
          </p>

          <div className="grid grid-cols-1 gap-2">
            <a
              className="inline-flex items-center gap-2 underline underline-offset-4 hover:opacity-90"
              href="https://github.com/miguelcorderocollar/pdfMake-template-builder"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Code2 className="h-4 w-4" /> Project repository <ExternalLink className="h-3.5 w-3.5 opacity-70" />
            </a>

            <a
              className="inline-flex items-center gap-2 underline underline-offset-4 hover:opacity-90"
              href="https://pdfmake.github.io/docs/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <BookOpen className="h-4 w-4" /> Official pdfmake Docs <ExternalLink className="h-3.5 w-3.5 opacity-70" />
            </a>
            <a
              className="inline-flex items-center gap-2 underline underline-offset-4 hover:opacity-90"
              href="http://pdfmake.org/playground.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              <BookOpen className="h-4 w-4" /> pdfmake Playground <ExternalLink className="h-3.5 w-3.5 opacity-70" />
            </a>
          </div>

          <p className="text-muted-foreground text-xs pt-2">
            <Heart className="inline h-3.5 w-3.5 text-rose-500 mr-1" aria-hidden />
            Made with love by
            {" "}
            <a
              className="underline underline-offset-4"
              href="https://github.com/miguelcorderocollar"
              target="_blank"
              rel="noopener noreferrer"
            >
              Miguel Cordero
            </a>
          </p>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


