"use client";

export function UnknownNodePreview({ value }: { value: unknown }) {
	const getNodeType = (node: unknown): string => {
		if (typeof node !== 'object' || node === null) return 'primitive';
		const obj = node as Record<string, unknown>;
		
		if ('columns' in obj) return 'columns';
		if ('stack' in obj) return 'stack';
		if ('canvas' in obj) return 'canvas';
		if ('svg' in obj) return 'svg';
		if ('qr' in obj) return 'qr';
		if ('toc' in obj) return 'toc';
		
		return 'custom';
	};
	
	const nodeType = getNodeType(value);
	const propertyCount = typeof value === 'object' && value !== null 
		? Object.keys(value as Record<string, unknown>).length 
		: 0;
	
	return (
		<div className="text-sm">
			<div className="p-3 rounded-md bg-muted/20 border border-dashed space-y-2.5">
				<div className="flex items-center gap-2">
					<span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-600 text-white dark:bg-slate-500 dark:text-white shadow-sm">
						{nodeType}
					</span>
					{propertyCount > 0 && (
						<span className="text-xs font-medium text-muted-foreground">
							{propertyCount} propert{propertyCount !== 1 ? 'ies' : 'y'}
						</span>
					)}
				</div>
				<div className="text-xs text-muted-foreground/70">
					Complex or custom node structure. Switch to edit mode to see full details.
				</div>
			</div>
		</div>
	);
}

