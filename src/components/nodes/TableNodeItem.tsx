"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TableNode } from "@/types";

export function TableNodeItem({
  data,
  onChange,
}: {
  data: TableNode;
  onChange: (next: Partial<TableNode>) => void;
}) {
  const cols = useMemo(() => data.table.body[0]?.length ?? 0, [data.table.body]);
  const rows = data.table.body.length;
  const [showAdvanced, setShowAdvanced] = useState(false);

  const setCell = (r: number, c: number, value: string) => {
    const body = data.table.body.map((row, ri) =>
      row.map((cell, ci) => (ri === r && ci === c ? value : cell))
    );
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
    <div className="space-y-4">
      {/* Table info and actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {rows} rows × {cols} columns
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={addRow} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Row
          </Button>
          <Button variant="outline" size="sm" onClick={addCol} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Column
          </Button>
        </div>
      </div>

      {/* Table editor */}
      <ScrollArea className="w-full whitespace-nowrap rounded-lg border border-border">
        <table className="w-full border-collapse">
          <tbody>
            {data.table.body.map((row, r) => (
              <tr
                key={r}
                className={`border-b border-border last:border-b-0 ${
                  data.table.headerRows && r < data.table.headerRows
                    ? "bg-muted/50"
                    : ""
                }`}
              >
                {row.map((cell, c) => (
                  <td key={c} className="border-r border-border last:border-r-0 p-0">
                    <Input
                      className="h-10 min-w-[100px] border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:bg-accent/30"
                      value={cell}
                      onChange={(e) => setCell(r, c, e.target.value)}
                      placeholder={
                        data.table.headerRows && r < data.table.headerRows
                          ? "Header"
                          : "Cell"
                      }
                    />
                  </td>
                ))}
                <td className="w-10 p-0 bg-muted/30">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-none text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => removeRow(r)}
                    disabled={rows <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
            {cols > 0 && (
              <tr className="bg-muted/30">
                {new Array(cols).fill(0).map((_, c) => (
                  <td key={c} className="p-0 border-r border-border last:border-r-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full h-8 rounded-none text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => removeCol(c)}
                      disabled={cols <= 1}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                ))}
                <td className="w-10" />
              </tr>
            )}
          </tbody>
        </table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

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
        Table Options
      </button>

      {/* Advanced options */}
      {showAdvanced && (
        <div className="p-4 rounded-lg bg-muted/30 border border-border space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="header-rows" className="text-xs">
                Header Rows
              </Label>
              <Input
                id="header-rows"
                type="number"
                min={0}
                value={data.table.headerRows ?? 0}
                onChange={(e) =>
                  onChange({
                    table: {
                      ...data.table,
                      headerRows:
                        e.target.value === "" ? undefined : Number(e.target.value),
                    },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="layout-style" className="text-xs">
                Layout Style
              </Label>
              <Select
                value={data.layout ?? "__default__"}
                onValueChange={(value) =>
                  onChange({
                    layout: (value === "__default__" ? undefined : value) as TableNode["layout"],
                  })
                }
              >
                <SelectTrigger id="layout-style">
                  <SelectValue placeholder="(default)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__default__">(default)</SelectItem>
                  <SelectItem value="noBorders">No Borders</SelectItem>
                  <SelectItem value="headerLineOnly">Header Line Only</SelectItem>
                  <SelectItem value="lightHorizontalLines">Light Horizontal Lines</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
