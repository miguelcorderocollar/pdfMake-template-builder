"use client";

import { useEffect, useRef, useState } from "react";

export function TextNodeItem({
	text,
	styleName,
	onChangeText,
	styles,
	onChangeStyle,
	onUpdateStyleDef,
}: {
	text: string;
	styleName?: string;
	onChangeText: (t: string) => void;
	styles?: Record<string, { fontSize?: number; bold?: boolean; italics?: boolean }>;
	onChangeStyle: (name: string | undefined) => void;
	onUpdateStyleDef: (name: string, def: Partial<{ fontSize?: number; bold?: boolean; italics?: boolean }>) => void;
}) {
	const [editing, setEditing] = useState(false);
	const [draft, setDraft] = useState(text);
	const [showStyleEditor, setShowStyleEditor] = useState(false);
	const inputRef = useRef<HTMLTextAreaElement>(null);

	useEffect(() => { setDraft(text); }, [text]);
	useEffect(() => { if (editing && inputRef.current) inputRef.current.focus(); }, [editing]);

	const currentDef = styleName && styles ? styles[styleName] : undefined;

	return (
		<div className="text-sm space-y-3">
			<div className="flex items-center justify-between gap-2">
				<div className="flex items-center gap-2">
					<label className="text-xs text-muted-foreground">Style:</label>
					<select
						className="h-8 px-2 rounded-md border border-input bg-background text-xs hover:bg-accent transition-colors"
						value={styleName ?? ''}
						onChange={(e) => onChangeStyle(e.target.value || undefined)}
					>
						<option value="">(no style)</option>
						{styles && Object.keys(styles).map((name) => (
							<option key={name} value={name}>{name}</option>
						))}
					</select>
				</div>
				<button
					className="h-8 px-3 rounded-md border text-xs hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					onClick={() => setShowStyleEditor((v) => !v)}
					disabled={!styleName}
					title={styleName ? `Edit style ${styleName}` : 'Select a style first'}
				>
					Edit Style
				</button>
			</div>

			{editing ? (
				<textarea
					ref={inputRef}
					className="w-full resize-y rounded-md border border-input bg-background p-3 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
					rows={3}
					value={draft}
					onChange={(e) => setDraft(e.target.value)}
					onBlur={() => { setEditing(false); onChangeText(draft); }}
					onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { setEditing(false); onChangeText(draft); } if (e.key === 'Escape') { setEditing(false); } }}
				/>
			) : (
				<div className="whitespace-pre-wrap break-words cursor-text p-3 rounded-md hover:bg-accent/50 transition-colors min-h-[3rem] flex items-center" onClick={() => setEditing(true)}>
					{text || <span className="text-muted-foreground italic">Click to edit text...</span>}
				</div>
			)}

			{showStyleEditor && styleName && (
				<div className="p-3 rounded-md bg-muted/50 border">
					<div className="text-xs font-medium text-muted-foreground mb-2">Style Properties</div>
					<div className="grid grid-cols-3 gap-3 text-xs">
						<label className="flex flex-col gap-1">
							<span className="text-muted-foreground">Font Size</span>
							<input
								type="number"
								className="h-8 w-full rounded-md border border-input bg-background px-2"
								value={currentDef?.fontSize ?? ''}
								onChange={(e) => onUpdateStyleDef(styleName, { fontSize: e.target.value === '' ? undefined : Number(e.target.value) })}
							/>
						</label>
						<label className="flex items-center gap-2">
							<input
								type="checkbox"
								className="h-4 w-4 rounded"
								checked={Boolean(currentDef?.bold)}
								onChange={(e) => onUpdateStyleDef(styleName, { bold: e.target.checked })}
							/>
							<span>Bold</span>
						</label>
						<label className="flex items-center gap-2">
							<input
								type="checkbox"
								className="h-4 w-4 rounded"
								checked={Boolean(currentDef?.italics)}
								onChange={(e) => onUpdateStyleDef(styleName, { italics: e.target.checked })}
							/>
							<span>Italics</span>
						</label>
					</div>
				</div>
			)}
		</div>
	);
}
