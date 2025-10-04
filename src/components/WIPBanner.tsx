"use client";

import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export function WIPBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if banner has been dismissed before
    const dismissed = localStorage.getItem("wip-banner-dismissed");
    if (!dismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("wip-banner-dismissed", "true");
  };

  if (!isVisible) return null;

  return (
    <Alert className="mb-4 shadow-sm border-amber-600/50 bg-amber-100 dark:border-amber-500/40 dark:bg-amber-950">
      <AlertTitle className="flex items-center justify-between">
        <span className="text-amber-900 dark:text-amber-50 font-semibold">
          🚧 Work in Progress
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="h-6 w-6 p-0 text-white hover:bg-amber-300/30 dark:hover:bg-amber-800"
        >
          <X className="h-4 w-4 text-white" />
          <span className="sr-only">Dismiss banner</span>
        </Button>
      </AlertTitle>
      <AlertDescription className="text-slate-800 dark:text-slate-100">
        Welcome to the PDFMake Template Builder! This tool is currently in active development.
        We're continuously adding new features and improvements. Feel free to explore and provide feedback!
      </AlertDescription>
    </Alert>
  );
}
