"use client";

import type { ListNode, OrderedListNode, UnorderedListNode } from "@/types";

export function ListNodePreview({ data }: { data: ListNode }) {
	const isOrdered = 'ol' in data;
	const items = isOrdered ? (data as OrderedListNode).ol : (data as UnorderedListNode).ul;
	const visibleItems = items.slice(0, 3);
	const remaining = items.length - 3;
	
	return (
		<div className="text-sm">
			<div className="p-3 rounded-md bg-muted/20 border border-dashed space-y-2.5">
				<div className="flex items-center gap-2">
					<span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-600 text-white dark:bg-emerald-500 dark:text-white shadow-sm">
						{isOrdered ? 'Ordered' : 'Unordered'}
					</span>
					<span className="text-xs font-medium text-muted-foreground">
						{items.length} item{items.length !== 1 ? 's' : ''}
					</span>
				</div>
				<ul className="space-y-1 text-muted-foreground">
					{visibleItems.map((item, idx) => (
						<li key={idx} className="flex items-start gap-2 text-xs">
							<span className="text-muted-foreground/60 shrink-0">
								{isOrdered ? `${idx + 1}.` : '•'}
							</span>
							<span className="truncate">{item}</span>
						</li>
					))}
					{remaining > 0 && (
						<li className="text-xs text-muted-foreground/60 italic">
							... and {remaining} more item{remaining !== 1 ? 's' : ''}
						</li>
					)}
				</ul>
			</div>
		</div>
	);
}

