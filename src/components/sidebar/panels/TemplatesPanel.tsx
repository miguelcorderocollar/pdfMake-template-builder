"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/app-context";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

export function TemplatesPanel() {
  const { state, dispatch } = useApp();
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

  const handleClearTemplate = () => {
    if (state.dirty) {
      const save = confirm('You have unsaved changes. Save before clearing?');
      if (save) dispatch({ type: 'SAVE_TEMPLATE' });
    }
    setClearConfirmOpen(true);
  };

  const handleConfirmClear = () => {
    dispatch({ type: 'CLEAR_TEMPLATE' });
  };

  const handleReloadDefault = () => {
    if (state.dirty) {
      const save = confirm('You have unsaved changes. Save before reloading default?');
      if (save) dispatch({ type: 'SAVE_TEMPLATE' });
    }
    dispatch({ type: 'RELOAD_DEFAULT_TEMPLATE' });
  };

  return (
    <div className="space-y-3">
      <Button
        variant="destructive"
        className="w-full"
        onClick={handleClearTemplate}
      >
        Clear Template
      </Button>
      <Button
        variant="outline"
        className="w-full"
        onClick={handleReloadDefault}
      >
        Reload Default (demo-template)
      </Button>

      {/* Clear Template Confirmation Modal */}
      <ConfirmationModal
        open={clearConfirmOpen}
        onOpenChange={setClearConfirmOpen}
        title="Clear Template"
        description="This will remove all content and styles. This action cannot be undone."
        confirmText="Clear"
        cancelText="Cancel"
        onConfirm={handleConfirmClear}
        variant="destructive"
      />
    </div>
  );
}


