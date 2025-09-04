"use client";

import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/app-context";

export function ElementsPanel() {
  const { dispatch } = useApp();
  return (
    <div>
      <h3 className="font-medium mb-3">Element Palette</h3>
      <div className="grid gap-2">
        <Button
          variant="outline"
          className="justify-start"
          onClick={() => dispatch({ type: 'CONTENT_OP', payload: { type: 'ADD_STRING', payload: { value: 'New paragraph' } } })}
        >
          Add Paragraph
        </Button>
        <Button
          variant="outline"
          className="justify-start"
          onClick={() => dispatch({ type: 'CONTENT_OP', payload: { type: 'ADD_TEXT_NODE', payload: { text: 'New text', style: undefined } } })}
        >
          Add Text Node
        </Button>
      </div>
    </div>
  );
}


