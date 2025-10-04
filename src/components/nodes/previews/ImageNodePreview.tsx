"use client";

type ImageNodeData = {
	image: string;
	width?: number;
	height?: number;
	fit?: [number, number];
	opacity?: number;
};

export function ImageNodePreview({ data }: { data: ImageNodeData }) {
	const hasImage = Boolean(data.image);
	const dimensions = data.width || data.height 
		? `${data.width || 'auto'}×${data.height || 'auto'}`
		: data.fit
		? `fit ${data.fit[0]}×${data.fit[1]}`
		: 'auto size';
	
	return (
		<div className="text-sm">
			<div className="p-3 rounded-md bg-muted/20 border border-dashed">
				<div className="flex items-center gap-3">
					{hasImage && data.image.startsWith('data:') ? (
						<div className="shrink-0">
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img 
								src={data.image} 
								alt="preview" 
								className="h-16 w-16 object-cover rounded border"
							/>
						</div>
					) : (
						<div className="shrink-0 h-16 w-16 rounded border bg-muted flex items-center justify-center">
							<svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
							</svg>
						</div>
					)}
					<div className="flex-1 min-w-0">
						<div className="text-xs font-medium text-muted-foreground mb-1">
							{hasImage ? 'Image' : 'No image'}
						</div>
						<div className="text-xs text-muted-foreground/70">
							{dimensions}
						</div>
						{data.opacity !== undefined && data.opacity !== 1 && (
							<div className="text-xs text-muted-foreground/70">
								Opacity: {data.opacity}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

