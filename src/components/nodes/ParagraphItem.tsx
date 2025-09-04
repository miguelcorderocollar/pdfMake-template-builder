"use client";

import { useEffect, useRef, useState } from "react";

export function ParagraphItem({ value, onChange }: { value: string; onChange: (v: string) => void }) {
	const [editing, setEditing] = useState(false);
	const [draft, setDraft] = useState(value);
	const inputRef = useRef<HTMLTextAreaElement>(null);

	useEffect(() => {
		setDraft(value);
	}, [value]);

	useEffect(() => {
		if (editing && inputRef.current) {
			inputRef.current.focus();
		}
	}, [editing]);

	return (
		<div className="text-sm">
			<div className="text-xs text-muted-foreground mb-1">Paragraph</div>
			{editing ? (
				<textarea
					ref={inputRef}
					className="w-full resize-y rounded border bg-background p-2 leading-relaxed"
					rows={3}
					value={draft}
					onChange={(e) => setDraft(e.target.value)}
					onBlur={() => { setEditing(false); onChange(draft); }}
					onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { setEditing(false); onChange(draft); } }}
				/>
			) : (
				<div
					className="whitespace-pre-wrap break-words leading-relaxed cursor-text"
					onClick={() => setEditing(true)}
				>
					{value}
				</div>
			)}
		</div>
	);
}
