"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useApp } from "@/lib/app-context";
import type { PdfStyle } from "@/types";

interface StyleEditorProps {
  initialName?: string;
  initialValue?: PdfStyle;
  onSubmit: (name: string, def: PdfStyle) => void;
  submitLabel: string;
  trigger:
    | React.ReactElement
    | ((open: () => void) => React.ReactElement);
}

function StyleEditor({ initialName = "", initialValue, onSubmit, submitLabel, trigger }: StyleEditorProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(initialName);
  const [def, setDef] = useState<PdfStyle>(initialValue ?? {});

  const TriggerEl = useMemo(() => {
    if (typeof trigger === 'function') return trigger(() => setOpen(true));
    return <DialogTrigger asChild>{trigger}</DialogTrigger>;
  }, [trigger]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {TriggerEl}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{submitLabel}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1">
            <label className="text-sm">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid gap-1">
            <label className="text-sm">Font size</label>
            <Input type="number" value={def.fontSize ?? ''} onChange={(e) => setDef({ ...def, fontSize: e.target.value === '' ? undefined : Number(e.target.value) })} />
          </div>
          <div className="grid gap-1">
            <label className="text-sm">Bold</label>
            <input type="checkbox" className="h-4 w-4" checked={!!def.bold} onChange={(e) => setDef({ ...def, bold: e.target.checked || undefined })} />
          </div>
          <div className="grid gap-1">
            <label className="text-sm">Italics</label>
            <input type="checkbox" className="h-4 w-4" checked={!!def.italics} onChange={(e) => setDef({ ...def, italics: e.target.checked || undefined })} />
          </div>
          <div className="grid gap-1">
            <label className="text-sm">Alignment</label>
            <select
              className="border rounded px-2 py-1"
              value={def.alignment ?? ''}
              onChange={(e) =>
                setDef({
                  ...def,
                  alignment: (e.target.value
                    ? (e.target.value as PdfStyle['alignment'])
                    : undefined),
                })
              }
            >
              <option value="">Default</option>
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
              <option value="justify">Justify</option>
            </select>
          </div>
          <div className="grid gap-1">
            <label className="text-sm">Color</label>
            <Input placeholder="#000000 or red" value={def.color ?? ''} onChange={(e) => setDef({ ...def, color: e.target.value || undefined })} />
          </div>
          <div className="grid gap-1">
            <label className="text-sm">Background</label>
            <Input placeholder="#ffffff" value={def.background ?? ''} onChange={(e) => setDef({ ...def, background: e.target.value || undefined })} />
          </div>
          <div className="grid gap-1">
            <label className="text-sm">Decoration</label>
            <select
              className="border rounded px-2 py-1"
              value={(Array.isArray(def.decoration) ? def.decoration[0] : def.decoration) ?? ''}
              onChange={(e) =>
                setDef({
                  ...def,
                  decoration: (e.target.value
                    ? (e.target.value as Extract<PdfStyle['decoration'], string>)
                    : undefined),
                })
              }
            >
              <option value="">None</option>
              <option value="underline">Underline</option>
              <option value="lineThrough">Line Through</option>
              <option value="overline">Overline</option>
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              if (!name.trim()) return;
              onSubmit(name.trim(), def);
              setOpen(false);
            }}
          >
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function StylesPanel() {
  const { state, dispatch } = useApp();
  const styles = state.currentTemplate?.docDefinition.styles ?? {};

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Styles</h3>
        <StyleEditor
          submitLabel="Create Style"
          onSubmit={(name, def) => dispatch({ type: 'STYLES_OP', payload: { type: 'ADD_STYLE', payload: { name, def } } })}
          trigger={<Button size="sm">New</Button>}
        />
      </div>

      <div className="grid gap-2">
        {Object.entries(styles).map(([name, def]) => (
          <div key={name} className="border rounded p-2 text-sm">
            <div className="flex items-center justify-between">
              <div className="font-medium">{name}</div>
              <div className="flex items-center gap-2">
                <StyleEditor
                  initialName={name}
                  initialValue={def}
                  submitLabel="Save"
                  trigger={<Button size="sm" variant="outline">Edit</Button>}
                  onSubmit={(newName, newDef) => {
                    if (newName !== name) {
                      dispatch({ type: 'STYLES_OP', payload: { type: 'RENAME_STYLE', payload: { from: name, to: newName } } });
                    }
                    dispatch({ type: 'STYLES_OP', payload: { type: 'UPDATE_STYLE', payload: { name: newName, def: newDef } } });
                  }}
                />
                <Button size="sm" variant="destructive" onClick={() => dispatch({ type: 'STYLES_OP', payload: { type: 'DELETE_STYLE', payload: { name } } })}>Delete</Button>
              </div>
            </div>
            <div className="text-xs mt-1">fontSize: {def.fontSize ?? '-'} | bold: {def.bold ? 'true' : 'false'} | italics: {def.italics ? 'true' : 'false'} | align: {def.alignment ?? '-'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}


