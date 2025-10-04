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
			{editing ? (
				<textarea
					ref={inputRef}
					className="w-full resize-y rounded-md border border-input bg-background p-3 leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
					rows={3}
					value={draft}
					onChange={(e) => setDraft(e.target.value)}
					onBlur={() => { setEditing(false); onChange(draft); }}
					onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { setEditing(false); onChange(draft); } }}
				/>
			) : (
				<div
					className="whitespace-pre-wrap break-words leading-relaxed cursor-text p-3 rounded-md hover:bg-accent/50 transition-colors min-h-[3rem] flex items-center"
					onClick={() => setEditing(true)}
				>
					{value || <span className="text-muted-foreground italic">Click to edit paragraph...</span>}
				</div>
			)}
		</div>
	);
}
