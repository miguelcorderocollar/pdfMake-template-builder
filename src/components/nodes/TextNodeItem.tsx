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
		<div className="text-sm">
			<div className="flex items-center justify-between mb-1">
				<div className="text-xs text-muted-foreground">
					Text {styleName ? <span className="ml-2">style: {styleName}</span> : null}
				</div>
				<div className="flex items-center gap-2">
					<select
						className="h-7 px-2 rounded border bg-background text-xs"
						value={styleName ?? ''}
						onChange={(e) => onChangeStyle(e.target.value || undefined)}
					>
						<option value="">(no style)</option>
						{styles && Object.keys(styles).map((name) => (
							<option key={name} value={name}>{name}</option>
						))}
					</select>
					<button
						className="h-7 px-2 rounded border text-xs"
						onClick={() => setShowStyleEditor((v) => !v)}
						disabled={!styleName}
						title={styleName ? `Edit style ${styleName}` : 'Select a style first'}
					>
						Edit Style
					</button>
				</div>
			</div>

			{editing ? (
				<textarea
					ref={inputRef}
					className="w-full resize-y rounded border bg-background p-2"
					rows={3}
					value={draft}
					onChange={(e) => setDraft(e.target.value)}
					onBlur={() => { setEditing(false); onChangeText(draft); }}
					onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { setEditing(false); onChangeText(draft); } if (e.key === 'Escape') { setEditing(false); } }}
				/>
			) : (
				<div className="whitespace-pre-wrap break-words cursor-text" onClick={() => setEditing(true)}>
					{text}
				</div>
			)}

			{showStyleEditor && styleName && (
				<div className="mt-2 grid grid-cols-3 gap-2 text-xs">
					<label className="flex items-center gap-1">
						<span>fontSize</span>
						<input
							type="number"
							className="h-7 w-16 rounded border bg-background px-2"
							value={currentDef?.fontSize ?? ''}
							onChange={(e) => onUpdateStyleDef(styleName, { fontSize: e.target.value === '' ? undefined : Number(e.target.value) })}
						/>
					</label>
					<label className="flex items-center gap-1">
						<input
							type="checkbox"
							className="h-4 w-4"
							checked={Boolean(currentDef?.bold)}
							onChange={(e) => onUpdateStyleDef(styleName, { bold: e.target.checked })}
						/>
						<span>bold</span>
					</label>
					<label className="flex items-center gap-1">
						<input
							type="checkbox"
							className="h-4 w-4"
							checked={Boolean(currentDef?.italics)}
							onChange={(e) => onUpdateStyleDef(styleName, { italics: e.target.checked })}
						/>
						<span>italics</span>
					</label>
				</div>
			)}
		</div>
	);
}
