"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ColorInput } from "@/components/ui/color-input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ListNode, OrderedListNode, UnorderedListNode } from "@/types";

export function ListNodeItem({
  data,
  onChange,
}: {
  data: ListNode;
  onChange: (next: Partial<ListNode>) => void;
}) {
  const isOrdered = useMemo(() => "ol" in data, [data]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const items = isOrdered
    ? (data as OrderedListNode).ol
    : (data as UnorderedListNode).ul;

  const updateItem = (index: number, value: string) => {
    const next = [...items];
    next[index] = value;
    if (isOrdered) {
      onChange({ ol: next } as Partial<ListNode>);
    } else {
      onChange({ ul: next } as Partial<ListNode>);
    }
  };

  const addItem = () => {
    if (isOrdered) {
      onChange({ ol: [...(data as OrderedListNode).ol, "New item"] } as Partial<ListNode>);
    } else {
      onChange({ ul: [...(data as UnorderedListNode).ul, "New item"] } as Partial<ListNode>);
    }
  };

  const removeItem = (index: number) => {
    const next = [...items];
    next.splice(index, 1);
    if (isOrdered) {
      onChange({ ol: next } as Partial<ListNode>);
    } else {
      onChange({ ul: next } as Partial<ListNode>);
    }
  };

  const toggleType = () => {
    if (isOrdered) {
      const ol = (data as OrderedListNode).ol ?? [];
      onChange({ ul: ol.length ? ol : ["item"] } as Partial<ListNode>);
    } else {
      const ul = (data as UnorderedListNode).ul ?? [];
      onChange({ ol: ul.length ? ul : ["item"] } as Partial<ListNode>);
    }
  };

  return (
    <div className="space-y-4">
      {/* Type toggle */}
      <div className="flex items-center gap-2">
        <Label className="text-xs text-muted-foreground">Type:</Label>
        <div className="inline-flex rounded-md border border-border">
          <button
            onClick={() => isOrdered && toggleType()}
            className={`px-3 py-1.5 text-xs transition-colors ${
              !isOrdered ? "bg-primary text-primary-foreground" : "hover:bg-accent"
            }`}
          >
            • Unordered
          </button>
          <button
            onClick={() => !isOrdered && toggleType()}
            className={`px-3 py-1.5 text-xs transition-colors border-l border-border ${
              isOrdered ? "bg-primary text-primary-foreground" : "hover:bg-accent"
            }`}
          >
            1. Ordered
          </button>
        </div>
      </div>

      {/* List items */}
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 group">
            <div className="flex-shrink-0 text-muted-foreground/40 cursor-grab">
              <GripVertical className="h-4 w-4" />
            </div>
            <span className="flex-shrink-0 w-6 text-xs text-muted-foreground text-right">
              {isOrdered ? `${idx + 1}.` : "•"}
            </span>
            <Input
              value={item}
              onChange={(e) => updateItem(idx, e.target.value)}
              placeholder="List item..."
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => removeItem(idx)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Add item button */}
      <Button variant="outline" size="sm" onClick={addItem} className="gap-1.5">
        <Plus className="h-3.5 w-3.5" />
        Add Item
      </Button>

      <Separator />

      {/* Advanced options toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        {showAdvanced ? (
          <ChevronUp className="h-3.5 w-3.5" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" />
        )}
        List Options
      </button>

      {/* Advanced options */}
      {showAdvanced && (
        <div className="p-4 rounded-lg bg-muted/30 border border-border space-y-4">
          {isOrdered ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="numbering-type" className="text-xs">
                  Numbering Type
                </Label>
                <Select
                  value={(data as OrderedListNode).type ?? "__default__"}
                  onValueChange={(value) =>
                    onChange({
                      type: (value === "__default__" ? undefined : value) as OrderedListNode["type"],
                    })
                  }
                >
                  <SelectTrigger id="numbering-type">
                    <SelectValue placeholder="(default)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__default__">(default)</SelectItem>
                    <SelectItem value="lower-alpha">a, b, c...</SelectItem>
                    <SelectItem value="upper-alpha">A, B, C...</SelectItem>
                    <SelectItem value="lower-roman">i, ii, iii...</SelectItem>
                    <SelectItem value="upper-roman">I, II, III...</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="start-number" className="text-xs">
                  Start Number
                </Label>
                <Input
                  id="start-number"
                  type="number"
                  value={(data as OrderedListNode).start ?? ""}
                  onChange={(e) =>
                    onChange({
                      start: e.target.value === "" ? undefined : Number(e.target.value),
                    })
                  }
                  placeholder="1"
                />
              </div>
              <div className="flex items-center gap-2 col-span-2">
                <Switch
                  id="reversed"
                  checked={Boolean((data as OrderedListNode).reversed)}
                  onCheckedChange={(checked) => onChange({ reversed: checked })}
                />
                <Label htmlFor="reversed" className="text-sm">
                  Reversed order
                </Label>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="bullet-type" className="text-xs">
                Bullet Type
              </Label>
              <Select
                value={(data as UnorderedListNode).type ?? "__default__"}
                onValueChange={(value) =>
                  onChange({
                    type: (value === "__default__" ? undefined : value) as UnorderedListNode["type"],
                  })
                }
              >
                <SelectTrigger id="bullet-type">
                  <SelectValue placeholder="(default)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__default__">(default)</SelectItem>
                  <SelectItem value="square">Square</SelectItem>
                  <SelectItem value="circle">Circle</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="text-color" className="text-xs">
                Text Color
              </Label>
              <ColorInput
                id="text-color"
                placeholder="#000000"
                value={data.color ?? ""}
                onChange={(e) => onChange({ color: e.target.value || undefined })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="marker-color" className="text-xs">
                Marker Color
              </Label>
              <ColorInput
                id="marker-color"
                placeholder="#000000"
                value={data.markerColor ?? ""}
                onChange={(e) => onChange({ markerColor: e.target.value || undefined })}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
