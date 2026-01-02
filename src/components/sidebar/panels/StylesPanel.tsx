"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ColorInput } from "@/components/ui/color-input";
import { ColorSwatch } from "@/components/ui/color-swatch";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApp } from "@/lib/app-context";
import { Plus, Pencil, Trash2, Palette } from "lucide-react";
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
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="style-name">Name</Label>
            <Input id="style-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="font-size">Font Size</Label>
              <Input
                id="font-size"
                type="number"
                value={def.fontSize ?? ''}
                onChange={(e) => setDef({ ...def, fontSize: e.target.value === '' ? undefined : Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="alignment">Alignment</Label>
              <Select
                value={def.alignment ?? '__default__'}
                onValueChange={(value) =>
                  setDef({
                    ...def,
                    alignment: (value === '__default__' ? undefined : (value as PdfStyle['alignment'])),
                  })
                }
              >
                <SelectTrigger id="alignment">
                  <SelectValue placeholder="Default" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__default__">Default</SelectItem>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                  <SelectItem value="justify">Justify</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch
                id="bold"
                checked={!!def.bold}
                onCheckedChange={(checked) => setDef({ ...def, bold: checked || undefined })}
              />
              <Label htmlFor="bold">Bold</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="italics"
                checked={!!def.italics}
                onCheckedChange={(checked) => setDef({ ...def, italics: checked || undefined })}
              />
              <Label htmlFor="italics">Italics</Label>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <ColorInput
                id="color"
                placeholder="#000000 or red"
                value={def.color ?? ''}
                onChange={(e) => setDef({ ...def, color: e.target.value || undefined })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="background">Background</Label>
              <ColorInput
                id="background"
                placeholder="#ffffff"
                value={def.background ?? ''}
                onChange={(e) => setDef({ ...def, background: e.target.value || undefined })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="decoration">Decoration</Label>
            <Select
              value={(Array.isArray(def.decoration) ? def.decoration[0] : def.decoration) ?? '__none__'}
              onValueChange={(value) =>
                setDef({
                  ...def,
                  decoration: (value === '__none__' ? undefined : (value as Extract<PdfStyle['decoration'], string>)),
                })
              }
            >
              <SelectTrigger id="decoration">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">None</SelectItem>
                <SelectItem value="underline">Underline</SelectItem>
                <SelectItem value="lineThrough">Line Through</SelectItem>
                <SelectItem value="overline">Overline</SelectItem>
              </SelectContent>
            </Select>
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
  const styleEntries = Object.entries(styles);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-serif text-base mb-1">Styles</h3>
        <p className="text-xs text-muted-foreground">
          Define reusable text styles for your document
        </p>
      </div>

      <div className="flex justify-end mb-2">
        <StyleEditor
          submitLabel="Create Style"
          onSubmit={(name, def) => dispatch({ type: 'STYLES_OP', payload: { type: 'ADD_STYLE', payload: { name, def } } })}
          trigger={
            <Button size="sm" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              New
            </Button>
          }
        />
      </div>

      <ScrollArea className={styleEntries.length > 6 ? "h-[400px]" : ""}>
        <div className="grid gap-2 pr-4">
          {styleEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No styles defined yet
            </p>
          ) : (
            styleEntries.map(([name, def]) => {
              const styleProps = [
                def.fontSize && `size: ${def.fontSize}`,
                def.bold && 'bold',
                def.italics && 'italic',
                def.alignment && def.alignment,
              ].filter(Boolean);
              const hasColors = def.color || def.background;
              const description = styleProps.length > 0 
                ? styleProps.join(', ') 
                : hasColors 
                  ? 'Color styles' 
                  : 'Style definition';

              return (
                <div
                  key={name}
                  className="node-accent-style flex items-start gap-3 p-3 rounded-lg border border-border bg-card hover:bg-accent/30 transition-colors group"
                >
                  {/* Left accent */}
                  <div className="w-1 h-8 rounded-full node-border opacity-60 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />

                  {/* Icon */}
                  <div className="node-icon flex-shrink-0">
                    <Palette className="h-5 w-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {description}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <StyleEditor
                          initialName={name}
                          initialValue={def}
                          submitLabel="Save"
                          trigger={
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          }
                          onSubmit={(newName, newDef) => {
                            if (newName !== name) {
                              dispatch({ type: 'STYLES_OP', payload: { type: 'RENAME_STYLE', payload: { from: name, to: newName } } });
                            }
                            dispatch({ type: 'STYLES_OP', payload: { type: 'UPDATE_STYLE', payload: { name: newName, def: newDef } } });
                          }}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch({ type: 'STYLES_OP', payload: { type: 'DELETE_STYLE', payload: { name } } });
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    {(def.color || def.background) && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {def.color && (
                          <Badge variant="outline" className="flex items-center gap-1.5 text-xs h-5">
                            <ColorSwatch color={def.color} size="sm" />
                            {def.color}
                          </Badge>
                        )}
                        {def.background && (
                          <Badge variant="outline" className="flex items-center gap-1.5 text-xs h-5">
                            <ColorSwatch color={def.background} size="sm" />
                            bg: {def.background}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
