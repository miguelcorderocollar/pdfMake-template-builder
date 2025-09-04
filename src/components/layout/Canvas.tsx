"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { useApp } from "@/lib/app-context";

export function Canvas() {
  const { state, dispatch } = useApp();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  const startEditing = useCallback((elementId: string, currentText: string) => {
    setEditingId(elementId);
    setEditValue(currentText);
  }, []);

  const saveEditing = useCallback(() => {
    setEditingId(null);
    setEditValue("");
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingId(null);
    setEditValue("");
  }, []);

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      saveEditing();
    } else if (event.key === 'Escape') {
      cancelEditing();
    }
  }, [saveEditing, cancelEditing]);

  // Focus input when editing starts
  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  return (
    <Card className="flex-1 m-4 p-4 overflow-auto">
      <div
        className="relative h-full min-h-[60vh] border rounded-lg p-4"
        onDrop={onDrop}
        onDragOver={onDragOver}
      >
        <div className="space-y-3">
          {state.currentTemplate?.docDefinition.content.map((item, index) => (
            <div key={index} className="group border rounded p-3 bg-background">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  {typeof item === 'string' ? (
                    <ParagraphItem
                      value={item}
                      onChange={(value) =>
                        (window.getSelection()?.toString(),
                        (null as any),
                        dispatch({ type: 'CONTENT_OP', payload: { type: 'UPDATE_STRING', payload: { index, value } } }))
                      }
                    />
                  ) : (
                    <TextNodeItem
                      text={item.text}
                      styleName={Array.isArray(item.style) ? item.style.join(', ') : item.style}
                      onChangeText={(text) =>
                        dispatch({ type: 'CONTENT_OP', payload: { type: 'UPDATE_TEXT_NODE', payload: { index, text } } })
                      }
                    />
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    className="h-7 w-7 inline-flex items-center justify-center rounded border"
                    onClick={() => index > 0 && dispatch({ type: 'CONTENT_OP', payload: { type: 'MOVE_ITEM', payload: { from: index, to: index - 1 } } })}
                    title="Move up"
                  >
                    <ArrowUp className="h-3 w-3" />
                  </button>
                  <button
                    className="h-7 w-7 inline-flex items-center justify-center rounded border"
                    onClick={() => index < (state.currentTemplate!.docDefinition.content.length - 1) && dispatch({ type: 'CONTENT_OP', payload: { type: 'MOVE_ITEM', payload: { from: index, to: index + 1 } } })}
                    title="Move down"
                  >
                    <ArrowDown className="h-3 w-3" />
                  </button>
                  <button
                    className="h-7 w-7 inline-flex items-center justify-center rounded border"
                    onClick={() => dispatch({ type: 'CONTENT_OP', payload: { type: 'ADD_STRING', payload: { index, value: 'New paragraph' } } })}
                    title="Insert above"
                  >
                    +
                  </button>
                  <button
                    className="h-7 w-7 inline-flex items-center justify-center rounded border text-destructive"
                    onClick={() => {
                      if (confirm('Delete this item?')) {
                        dispatch({ type: 'CONTENT_OP', payload: { type: 'DELETE_ITEM', payload: { index } } });
                      }
                    }}
                    title="Delete"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function ParagraphItem({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  return (
    <div className="text-sm">
      <div className="text-xs text-muted-foreground mb-1">Paragraph</div>
      {editing ? (
        <textarea
          ref={inputRef}
          className="w-full min-h-[60px] resize-y rounded border bg-background p-2 leading-relaxed"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => { setEditing(false); onChange(draft); }}
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { setEditing(false); onChange(draft); } }}
        />
      ) : (
        <div
          className="whitespace-pre-wrap break-words leading-relaxed cursor-text"
          onClick={() => setEditing(true)}
        >
          {value}
        </div>
      )}
    </div>
  );
}

function TextNodeItem({ text, styleName, onChangeText }: { text: string; styleName?: string; onChangeText: (t: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(text);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setDraft(text); }, [text]);
  useEffect(() => { if (editing && inputRef.current) inputRef.current.focus(); }, [editing]);

  return (
    <div className="text-sm">
      <div className="text-xs text-muted-foreground mb-1">
        Text {styleName ? <span className="ml-2">style: {styleName}</span> : null}
      </div>
      {editing ? (
        <input
          ref={inputRef}
          type="text"
          className="w-full rounded border bg-background p-2"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => { setEditing(false); onChangeText(draft); }}
          onKeyDown={(e) => { if (e.key === 'Enter') { setEditing(false); onChangeText(draft); } if (e.key === 'Escape') { setEditing(false); } }}
        />
      ) : (
        <div className="truncate sm:whitespace-pre-wrap sm:break-words cursor-text" onClick={() => setEditing(true)}>
          {text}
        </div>
      )}
    </div>
  );
}


