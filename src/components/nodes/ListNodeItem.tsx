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
    <div className="text-sm">
      <div className="text-xs text-muted-foreground mb-2">List</div>

      <div className="grid gap-2">
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2">
            <span className="w-14">kind</span>
            <select
              className="h-7 rounded border bg-background px-2 text-xs"
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
              <option value="ul">unordered</option>
              <option value="ol">ordered</option>
            </select>
          </label>
        </div>

        <div className="grid gap-2">
          {(isOrdered ? (data as OrderedListNode).ol : (data as UnorderedListNode).ul).map((it, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                className="h-7 flex-1 rounded border bg-background px-2 text-xs"
                value={it}
                onChange={(e) => updateItem(idx, e.target.value)}
              />
              <button className="h-7 px-2 rounded border text-xs" onClick={() => removeItem(idx)}>Remove</button>
            </div>
          ))}
          <button className="h-7 px-2 rounded border text-xs" onClick={addItem}>Add Item</button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {isOrdered ? (
            <>
              <label className="flex items-center gap-2">
                <span className="w-14">type</span>
                <select
                  className="h-7 rounded border bg-background px-2 text-xs"
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
              <label className="flex items-center gap-2">
                <span className="w-14">start</span>
                <input
                  type="number"
                  className="h-7 w-24 rounded border bg-background px-2 text-xs"
                  value={(data as OrderedListNode).start ?? ''}
                  onChange={(e) => onChange({ start: e.target.value === '' ? undefined : Number(e.target.value) })}
                />
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={Boolean((data as OrderedListNode).reversed)}
                  onChange={(e) => onChange({ reversed: e.target.checked })}
                />
                <span>reversed</span>
              </label>
              <label className="flex items-center gap-2">
                <span className="w-14">separator</span>
                <input
                  className="h-7 rounded border bg-background px-2 text-xs"
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
            </>
          ) : (
            <>
              <label className="flex items-center gap-2">
                <span className="w-14">type</span>
                <select
                  className="h-7 rounded border bg-background px-2 text-xs"
                  value={(data as UnorderedListNode).type ?? ''}
                  onChange={(e) => onChange({ type: (e.target.value || undefined) as UnorderedListNode['type'] })}
                >
                  <option value="">(default)</option>
                  <option value="square">square</option>
                  <option value="circle">circle</option>
                  <option value="none">none</option>
                </select>
              </label>
            </>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <label className="flex items-center gap-2">
            <span className="w-14">color</span>
            <input
              className="h-7 rounded border bg-background px-2 text-xs"
              value={data.color ?? ''}
              onChange={(e) => onChange({ color: e.target.value || undefined })}
            />
          </label>
          <label className="flex items-center gap-2">
            <span className="w-14">marker</span>
            <input
              className="h-7 rounded border bg-background px-2 text-xs"
              value={data.markerColor ?? ''}
              onChange={(e) => onChange({ markerColor: e.target.value || undefined })}
            />
          </label>
        </div>
      </div>
    </div>
  );
}


