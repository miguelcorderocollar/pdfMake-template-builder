"use client";

export function ParagraphPreview({ value }: { value: string }) {
	return (
		<div className="text-sm text-muted-foreground relative group">
			<div className="p-3 rounded-md bg-muted/20 border border-dashed">
				<p className="whitespace-pre-wrap break-words line-clamp-3">
					{value || <span className="italic">Empty paragraph</span>}
				</p>
				{value.length > 150 && (
					<span className="text-xs text-muted-foreground/60 mt-2 block">
						({value.length} characters)
					</span>
				)}
			</div>
		</div>
	);
}

