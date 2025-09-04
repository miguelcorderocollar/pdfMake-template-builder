"use client";

import { useApp } from "@/lib/app-context";
import { ContentListItem } from "./ContentListItem";

export function ContentList() {
	const { state } = useApp();
	return (
		<div className="space-y-3">
			{state.currentTemplate?.docDefinition.content.map((item, index) => (
				<ContentListItem key={index} index={index} item={item} />
			))}
		</div>
	);
}
