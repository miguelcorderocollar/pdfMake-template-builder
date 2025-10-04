"use client";

import { useMemo } from "react";
import type { ListNode, OrderedListNode, UnorderedListNode } from "@/types";

export function ListNodeItem({
  data,
  onChange,
}: {
  data: ListNode;
  onChange: (next: Partial<ListNode>) => void;
}) {
  const isOrdered = useMemo(() => 'ol' in data, [data]);

  const updateItem = (index: number, value: string) => {
    if (isOrdered) {
      const next = [...(data as OrderedListNode).ol];
      next[index] = value;
      onChange({ ol: next } as Partial<ListNode>);
    } else {
      const next = [...(data as UnorderedListNode).ul];
      next[index] = value;
      onChange({ ul: next } as Partial<ListNode>);
    }
  };

  const addItem = () => {
    if (isOrdered) {
      onChange({ ol: [ ...(data as OrderedListNode).ol, 'item' ] } as Partial<ListNode>);
    } else {
      onChange({ ul: [ ...(data as UnorderedListNode).ul, 'item' ] } as Partial<ListNode>);
    }
  };

  const removeItem = (index: number) => {
    if (isOrdered) {
      const next = [...(data as OrderedListNode).ol];
      next.splice(index, 1);
      onChange({ ol: next } as Partial<ListNode>);
    } else {
      const next = [...(data as UnorderedListNode).ul];
      next.splice(index, 1);
      onChange({ ul: next } as Partial<ListNode>);
    }
  };

  return (
    <div className="text-sm space-y-3">
      <div className="flex items-center gap-2">
        <label className="text-xs text-muted-foreground min-w-[60px]">Type:</label>
        <select
          className="h-8 rounded-md border border-input bg-background px-2 text-xs hover:bg-accent transition-colors"
          value={isOrdered ? 'ol' : 'ul'}
          onChange={(e) => {
            const kind = e.target.value;
            if (kind === 'ol') {
              const ul = (data as UnorderedListNode).ul ?? [];
              onChange({ ol: ul.length ? ul : ['item'] } as Partial<ListNode>);
            } else {
              const ol = (data as OrderedListNode).ol ?? [];
              onChange({ ul: ol.length ? ol : ['item'] } as Partial<ListNode>);
            }
          }}
        >
          <option value="ul">Unordered</option>
          <option value="ol">Ordered</option>
        </select>
      </div>

      <div className="space-y-2">
        <div className="text-xs font-medium text-muted-foreground">List Items</div>
        {(isOrdered ? (data as OrderedListNode).ol : (data as UnorderedListNode).ul).map((it, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-6">{idx + 1}.</span>
            <input
              className="h-8 flex-1 rounded-md border border-input bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
              value={it}
              onChange={(e) => updateItem(idx, e.target.value)}
            />
            <button 
              className="h-8 px-2 rounded-md border text-xs hover:bg-destructive hover:text-destructive-foreground transition-colors" 
              onClick={() => removeItem(idx)}
            >
              Remove
            </button>
          </div>
        ))}
        <button className="h-8 px-3 rounded-md border text-xs hover:bg-accent transition-colors w-full" onClick={addItem}>
          Add Item
        </button>
      </div>

      <div className="p-3 rounded-md bg-muted/50 border space-y-3">
        <div className="text-xs font-medium text-muted-foreground">List Properties</div>
        
        {isOrdered ? (
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Numbering Type</span>
              <select
                className="h-8 rounded-md border border-input bg-background px-2 text-xs hover:bg-accent transition-colors"
                value={(data as OrderedListNode).type ?? ''}
                onChange={(e) => onChange({ type: (e.target.value || undefined) as OrderedListNode['type'] })}
              >
                <option value="">(default)</option>
                <option value="lower-alpha">lower-alpha</option>
                <option value="upper-alpha">upper-alpha</option>
                <option value="upper-roman">upper-roman</option>
                <option value="lower-roman">lower-roman</option>
                <option value="none">none</option>
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Start Number</span>
              <input
                type="number"
                className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
                value={(data as OrderedListNode).start ?? ''}
                onChange={(e) => onChange({ start: e.target.value === '' ? undefined : Number(e.target.value) })}
              />
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 rounded"
                checked={Boolean((data as OrderedListNode).reversed)}
                onChange={(e) => onChange({ reversed: e.target.checked })}
              />
              <span className="text-xs">Reversed</span>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Separator</span>
              <input
                className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                placeholder=", or (,)"
                value={Array.isArray((data as OrderedListNode).separator) ? ((data as OrderedListNode).separator as [string, string]).join('') : ((data as OrderedListNode).separator ?? '')}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v.startsWith('(') && v.endsWith(')') && v.includes(',')) {
                    const inner = v.slice(1, -1);
                    const parts = inner.split(',');
                    onChange({ separator: [parts[0] ?? '', parts[1] ?? ''] as [string, string] });
                  } else {
                    onChange({ separator: v || undefined });
                  }
                }}
              />
            </label>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Bullet Type</span>
              <select
                className="h-8 rounded-md border border-input bg-background px-2 text-xs hover:bg-accent transition-colors"
                value={(data as UnorderedListNode).type ?? ''}
                onChange={(e) => onChange({ type: (e.target.value || undefined) as UnorderedListNode['type'] })}
              >
                <option value="">(default)</option>
                <option value="square">square</option>
                <option value="circle">circle</option>
                <option value="none">none</option>
              </select>
            </label>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Text Color</span>
            <input
              className="h-8 rounded-md border border-input bg-background px-2 text-xs"
              placeholder="#000000"
              value={data.color ?? ''}
              onChange={(e) => onChange({ color: e.target.value || undefined })}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Marker Color</span>
            <input
              className="h-8 rounded-md border border-input bg-background px-2 text-xs"
              placeholder="#000000"
              value={data.markerColor ?? ''}
              onChange={(e) => onChange({ markerColor: e.target.value || undefined })}
            />
          </label>
        </div>
      </div>
    </div>
  );
}


