"use client";

import { useApp } from "@/lib/app-context";
import { ContentListItem } from "./ContentListItem";

export function ContentList() {
	const { state } = useApp();
  const content = state.currentTemplate?.docDefinition.content ?? [];

  if (content.length === 0) {
	return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-muted-foreground">
          <p className="text-lg font-serif mb-2">No content yet</p>
          <p className="text-sm">
            Add elements from the sidebar to start building your document
          </p>
        </div>
			</div>
    );
  }

  return (
    <div className="space-y-4">
      {content.map((item, index) => (
				<ContentListItem key={index} index={index} item={item} />
			))}
		</div>
	);
}
