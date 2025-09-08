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
  const rows = useMemo(() => data.table.body.length, [data.table.body]);
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
    <div className="text-sm">
      <div className="text-xs text-muted-foreground mb-2">Table</div>

      <div className="flex items-center gap-2 mb-2">
        <button className="h-7 px-2 rounded border text-xs" onClick={addRow}>Add Row</button>
        <button className="h-7 px-2 rounded border text-xs" onClick={addCol}>Add Column</button>
      </div>

      <div className="overflow-auto">
        <table className="border-collapse">
          <tbody>
            {data.table.body.map((row, r) => (
              <tr key={r}>
                {row.map((cell, c) => (
                  <td key={c} className="border p-1">
                    <input
                      className="h-7 w-40 rounded border bg-background px-2 text-xs"
                      value={cell}
                      onChange={(e) => setCell(r, c, e.target.value)}
                    />
                  </td>
                ))}
                <td className="p-1">
                  <button className="h-7 px-2 rounded border text-xs" onClick={() => removeRow(r)}>Remove</button>
                </td>
              </tr>
            ))}
            {cols > 0 ? (
              <tr>
                {new Array(cols).fill(0).map((_, c) => (
                  <td key={c} className="p-1 text-center">
                    <button className="h-7 px-2 rounded border text-xs" onClick={() => removeCol(c)}>Remove</button>
                  </td>
                ))}
                <td />
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-3">
        <label className="flex items-center gap-2">
          <span className="w-20">headerRows</span>
          <input
            type="number"
            className="h-7 w-20 rounded border bg-background px-2 text-xs"
            value={data.table.headerRows ?? 0}
            onChange={(e) => onChange({ table: { ...data.table, headerRows: e.target.value === "" ? undefined : Number(e.target.value) } })}
          />
        </label>
        <label className="flex items-center gap-2">
          <span className="w-20">layout</span>
          <select
            className="h-7 rounded border bg-background px-2 text-xs"
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
  );
}
