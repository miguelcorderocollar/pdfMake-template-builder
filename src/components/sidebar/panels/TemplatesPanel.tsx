"use client";

import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/app-context";

export function TemplatesPanel() {
  const { dispatch } = useApp();
  return (
    <div className="space-y-3">
      <Button
        variant="destructive"
        className="w-full"
        onClick={() => {
          if (confirm('Clear template? This removes all content and styles.')) {
            dispatch({ type: 'CLEAR_TEMPLATE' });
          }
        }}
      >
        Clear Template
      </Button>
      <Button
        variant="outline"
        className="w-full"
        onClick={() => dispatch({ type: 'RELOAD_DEFAULT_TEMPLATE' })}
      >
        Reload Default (styles-simple)
      </Button>
    </div>
  );
}


