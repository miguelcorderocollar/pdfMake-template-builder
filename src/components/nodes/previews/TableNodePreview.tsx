"use client";

import type { TableNode } from "@/types";

export function TableNodePreview({ data }: { data: TableNode }) {
	const rows = data.table.body.length;
	const cols = data.table.body[0]?.length ?? 0;
	const headerRows = data.table.headerRows ?? 0;
	
	return (
		<div className="text-sm">
			<div className="p-3 rounded-md bg-muted/20 border border-dashed space-y-2.5">
				<div className="flex items-center gap-2 flex-wrap">
					<span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-600 text-white dark:bg-amber-500 dark:text-white shadow-sm">
						Table
					</span>
					<span className="text-xs font-medium text-muted-foreground">
						{rows} × {cols}
					</span>
					{headerRows > 0 && (
						<span className="text-xs text-muted-foreground/70">
							• {headerRows} header
						</span>
					)}
					{data.layout && (
						<span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600">
							{data.layout}
						</span>
					)}
				</div>
				
				{/* Mini table preview */}
				<div className="overflow-hidden rounded border bg-background/50">
					<table className="w-full text-xs">
						<tbody>
							{data.table.body.slice(0, 3).map((row, r) => (
								<tr key={r} className={`border-b last:border-b-0 ${r < headerRows ? 'bg-muted/50 font-medium' : ''}`}>
									{row.slice(0, 3).map((cell, c) => (
										<td key={c} className="border-r last:border-r-0 p-1.5 truncate max-w-[100px]">
											{cell || <span className="text-muted-foreground/50">—</span>}
										</td>
									))}
									{row.length > 3 && (
										<td className="p-1.5 text-muted-foreground/60 italic">
											+{row.length - 3}
										</td>
									)}
								</tr>
							))}
							{rows > 3 && (
								<tr>
									<td colSpan={Math.min(cols, 3) + (cols > 3 ? 1 : 0)} className="p-1.5 text-center text-muted-foreground/60 italic">
										... {rows - 3} more row{rows - 3 !== 1 ? 's' : ''}
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}

