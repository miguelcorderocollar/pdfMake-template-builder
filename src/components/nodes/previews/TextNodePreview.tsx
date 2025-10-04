"use client";

import type { TextSpan } from "@/types";
import { isTextSpanArray } from "@/utils/node-type-guards";

export function TextNodePreview({ 
	text, 
	styleName 
}: { 
	text: string | TextSpan[]; 
	styleName?: string;
}) {
	const isRich = isTextSpanArray(text);
	const displayText = typeof text === "string" 
		? text 
		: text.map(span => typeof span === "string" ? span : span.text).join("");
	
	return (
		<div className="text-sm">
			<div className="p-3 rounded-md bg-muted/20 border border-dashed space-y-2.5">
				<div className="flex items-center gap-2 flex-wrap">
					{isRich && (
						<span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-purple-600 text-white dark:bg-purple-500 dark:text-white shadow-sm">
							Rich Text
						</span>
					)}
					{styleName && (
						<span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-600 text-white dark:bg-blue-500 dark:text-white shadow-sm">
							{styleName}
						</span>
					)}
				</div>
				<p className="text-muted-foreground whitespace-pre-wrap break-words line-clamp-3">
					{displayText || <span className="italic">Empty text</span>}
				</p>
				{displayText.length > 150 && (
					<span className="text-xs text-muted-foreground/60">
						({displayText.length} characters)
					</span>
				)}
			</div>
		</div>
	);
}

