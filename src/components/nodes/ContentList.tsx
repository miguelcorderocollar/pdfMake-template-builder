"use client";

import { useApp } from "@/lib/app-context";
import { ContentListItem } from "./ContentListItem";

export function ContentList() {
	const { state } = useApp();
	return (
		<div className="space-y-3">
			<div className="sticky top-0 z-10 -mx-3 mb-1 px-3 py-2 bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b rounded-t-lg">
				<div className="text-xs font-medium text-muted-foreground">Content Items ({state.currentTemplate?.docDefinition.content.length ?? 0})</div>
			</div>
			{state.currentTemplate?.docDefinition.content.map((item, index) => (
				<ContentListItem key={index} index={index} item={item} />
			))}
		</div>
	);
}
