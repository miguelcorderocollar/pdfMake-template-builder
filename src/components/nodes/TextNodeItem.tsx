"use client";

import { useEffect, useRef, useState } from "react";
import { RichTextEditor } from "./RichTextEditor";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Settings2 } from "lucide-react";
import type { TextSpan } from "@/types";
import { isTextSpanArray } from "@/utils/node-type-guards";

export function TextNodeItem({
  text,
  styleName,
  onChangeText,
  styles,
  onChangeStyle,
  onUpdateStyleDef,
}: {
  text: string | TextSpan[];
  styleName?: string;
  onChangeText: (t: string | TextSpan[]) => void;
  styles?: Record<string, { fontSize?: number; bold?: boolean; italics?: boolean }>;
  onChangeStyle: (name: string | undefined) => void;
  onUpdateStyleDef: (
    name: string,
    def: Partial<{ fontSize?: number; bold?: boolean; italics?: boolean }>
  ) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(typeof text === "string" ? text : "");
  const [showStyleEditor, setShowStyleEditor] = useState(false);
  const [mode, setMode] = useState<"simple" | "rich">(
    isTextSpanArray(text) ? "rich" : "simple"
  );
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (typeof text === "string") {
      setDraft(text);
      setMode("simple");
    } else {
      setMode("rich");
    }
  }, [text]);

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  const currentDef = styleName && styles ? styles[styleName] : undefined;

  const convertToRich = () => {
    const currentText = typeof text === "string" ? text : "";
    onChangeText([currentText]);
    setMode("rich");
  };

  const convertToSimple = () => {
    if (isTextSpanArray(text)) {
      const combined = text
        .map((span) => (typeof span === "string" ? span : span.text))
        .join("");
      onChangeText(combined);
      setMode("simple");
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls row */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Mode toggle */}
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">Mode:</Label>
          <div className="inline-flex rounded-md border border-border">
            <button
              onClick={() => mode === "rich" && convertToSimple()}
              className={`px-3 py-1.5 text-xs transition-colors ${
                mode === "simple"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              }`}
            >
              Simple
            </button>
            <button
              onClick={() => mode === "simple" && convertToRich()}
              className={`px-3 py-1.5 text-xs transition-colors border-l border-border ${
                mode === "rich"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              }`}
            >
              Rich Text
            </button>
          </div>
        </div>

        {/* Style selector */}
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">Style:</Label>
          <Select
            value={styleName ?? "__none__"}
            onValueChange={(value) => onChangeStyle(value === "__none__" ? undefined : value)}
          >
            <SelectTrigger className="h-8 w-[140px] text-xs">
              <SelectValue placeholder="(no style)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">(no style)</SelectItem>
              {styles &&
                Object.keys(styles).map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          {styleName && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowStyleEditor((v) => !v)}
              className="h-8 w-8"
              title={`Edit style "${styleName}"`}
            >
              <Settings2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Style editor */}
      {showStyleEditor && styleName && (
        <div className="p-4 rounded-lg bg-muted/30 border border-border space-y-4">
          <div className="text-sm font-medium">
            Style: <span className="text-primary">{styleName}</span>
          </div>
          <Separator />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fontSize" className="text-xs">
                Font Size
              </Label>
              <Input
                id="fontSize"
                type="number"
                className="h-9"
                value={currentDef?.fontSize ?? ""}
                onChange={(e) =>
                  onUpdateStyleDef(styleName, {
                    fontSize: e.target.value === "" ? undefined : Number(e.target.value),
                  })
                }
                placeholder="14"
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Switch
                id="bold"
                checked={Boolean(currentDef?.bold)}
                onCheckedChange={(checked) => onUpdateStyleDef(styleName, { bold: checked })}
              />
              <Label htmlFor="bold" className="text-sm">
                Bold
              </Label>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Switch
                id="italics"
                checked={Boolean(currentDef?.italics)}
                onCheckedChange={(checked) =>
                  onUpdateStyleDef(styleName, { italics: checked })
                }
              />
              <Label htmlFor="italics" className="text-sm">
                Italics
              </Label>
            </div>
          </div>
        </div>
      )}

      {/* Text editor */}
      {mode === "rich" && isTextSpanArray(text) ? (
        <RichTextEditor spans={text} onChange={onChangeText} styles={styles} />
      ) : (
        <>
          {editing ? (
            <Textarea
              ref={inputRef}
              className="min-h-[100px] resize-y"
              rows={4}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={() => {
                setEditing(false);
                onChangeText(draft);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                  setEditing(false);
                  onChangeText(draft);
                }
                if (e.key === "Escape") {
                  setEditing(false);
                }
              }}
              placeholder="Enter your text here..."
            />
          ) : (
            <div
              className="whitespace-pre-wrap break-words cursor-text p-4 rounded-md border border-dashed border-border hover:border-primary/50 hover:bg-accent/20 transition-colors min-h-[4rem]"
              onClick={() => setEditing(true)}
            >
              {(typeof text === "string" ? text : "") || (
                <span className="text-muted-foreground italic">
                  Click to edit text...
                </span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
