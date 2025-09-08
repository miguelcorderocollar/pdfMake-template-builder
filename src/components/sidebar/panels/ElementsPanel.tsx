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
        <Button
          variant="outline"
          className="justify-start"
          onClick={() => dispatch({ type: 'CONTENT_OP', payload: { type: 'ADD_IMAGE_NODE', payload: { image: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==', opacity: 1 } } })}
        >
          Add Image
        </Button>
        <Button
          variant="outline"
          className="justify-start"
          onClick={() => dispatch({ type: 'CONTENT_OP', payload: { type: 'ADD_LIST_NODE', payload: { ul: ['item 1', 'item 2', 'item 3'] } } })}
        >
          Add List
        </Button>
        <Button
          variant="outline"
          className="justify-start"
          onClick={() => dispatch({ type: 'CONTENT_OP', payload: { type: 'ADD_TABLE_NODE', payload: { table: { body: [['A1','B1','C1'], ['A2','B2','C2']] } } } })}
        >
          Add Table
        </Button>
      </div>
    </div>
  );
}


