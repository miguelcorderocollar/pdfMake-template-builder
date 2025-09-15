"use client";

import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/app-context";

export function TemplatesPanel() {
  const { state, dispatch } = useApp();
  return (
    <div className="space-y-3">
      <Button
        variant="destructive"
        className="w-full"
        onClick={() => {
          if (state.dirty) {
            const save = confirm('You have unsaved changes. Save before clearing?');
            if (save) dispatch({ type: 'SAVE_TEMPLATE' });
          }
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
        onClick={() => {
          if (state.dirty) {
            const save = confirm('You have unsaved changes. Save before reloading default?');
            if (save) dispatch({ type: 'SAVE_TEMPLATE' });
          }
          dispatch({ type: 'RELOAD_DEFAULT_TEMPLATE' })
        }}
      >
        Reload Default (styles-simple)
      </Button>
    </div>
  );
}


