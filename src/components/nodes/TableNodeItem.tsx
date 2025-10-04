"use client";

import { useMemo } from "react";
import type { TableNode } from "@/types";

export function TableNodeItem({
  data,
  onChange,
}: {
  data: TableNode;
  onChange: (next: Partial<TableNode>) => void;
}) {
  const cols = useMemo(() => (data.table.body[0]?.length ?? 0), [data.table.body]);

  const setCell = (r: number, c: number, value: string) => {
    const body = data.table.body.map((row, ri) => row.map((cell, ci) => (ri === r && ci === c ? value : cell)));
    onChange({ table: { ...data.table, body } });
  };

  const addRow = () => {
    const newRow = new Array(Math.max(1, cols)).fill("");
    onChange({ table: { ...data.table, body: [...data.table.body, newRow] } });
  };

  const addCol = () => {
    const body = data.table.body.map((row) => [...row, ""]);
    onChange({ table: { ...data.table, body } });
  };

  const removeRow = (index: number) => {
    const body = data.table.body.slice();
    body.splice(index, 1);
    onChange({ table: { ...data.table, body } });
  };

  const removeCol = (index: number) => {
    const body = data.table.body.map((row) => {
      const next = row.slice();
      next.splice(index, 1);
      return next;
    });
    onChange({ table: { ...data.table, body } });
  };

  return (
    <div className="text-sm space-y-3">
      <div className="flex items-center gap-2">
        <button className="h-8 px-3 rounded-md border text-xs hover:bg-accent transition-colors" onClick={addRow}>Add Row</button>
        <button className="h-8 px-3 rounded-md border text-xs hover:bg-accent transition-colors" onClick={addCol}>Add Column</button>
      </div>

      <div className="overflow-auto rounded-md border">
        <table className="border-collapse w-full">
          <tbody>
            {data.table.body.map((row, r) => (
              <tr key={r} className="border-b last:border-b-0">
                {row.map((cell, c) => (
                  <td key={c} className="border-r last:border-r-0 p-1">
                    <input
                      className="h-8 w-40 rounded border border-input bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                      value={cell}
                      onChange={(e) => setCell(r, c, e.target.value)}
                    />
                  </td>
                ))}
                <td className="p-1 bg-muted/30">
                  <button 
                    className="h-8 px-2 rounded border text-xs hover:bg-destructive hover:text-destructive-foreground transition-colors" 
                    onClick={() => removeRow(r)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            {cols > 0 ? (
              <tr className="bg-muted/30">
                {new Array(cols).fill(0).map((_, c) => (
                  <td key={c} className="p-1 text-center border-r last:border-r-0">
                    <button 
                      className="h-8 px-2 rounded border text-xs hover:bg-destructive hover:text-destructive-foreground transition-colors" 
                      onClick={() => removeCol(c)}
                    >
                      Remove
                    </button>
                  </td>
                ))}
                <td />
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="p-3 rounded-md bg-muted/50 border space-y-3">
        <div className="text-xs font-medium text-muted-foreground">Table Properties</div>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Header Rows</span>
            <input
              type="number"
              className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
              value={data.table.headerRows ?? 0}
              onChange={(e) => onChange({ table: { ...data.table, headerRows: e.target.value === "" ? undefined : Number(e.target.value) } })}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Layout Style</span>
            <select
              className="h-8 rounded-md border border-input bg-background px-2 text-xs hover:bg-accent transition-colors"
              value={data.layout ?? ""}
              onChange={(e) => onChange({ layout: (e.target.value || undefined) as TableNode["layout"] })}
            >
              <option value="">(default)</option>
              <option value="noBorders">noBorders</option>
              <option value="headerLineOnly">headerLineOnly</option>
              <option value="lightHorizontalLines">lightHorizontalLines</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}
