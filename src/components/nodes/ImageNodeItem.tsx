"use client";

import { useEffect, useRef, useState } from "react";

type ImageNodeData = {
  image: string;
  width?: number;
  height?: number;
  fit?: [number, number];
  opacity?: number;
};

export function ImageNodeItem({
  data,
  onChange,
}: {
  data: ImageNodeData;
  onChange: (next: Partial<ImageNodeData>) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlDraft, setUrlDraft] = useState("");
  const [fitW, setFitW] = useState<string>(data.fit ? String(data.fit[0]) : "");
  const [fitH, setFitH] = useState<string>(data.fit ? String(data.fit[1]) : "");
  const [urlBusy, setUrlBusy] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);

  useEffect(() => {
    setFitW(data.fit ? String(data.fit[0]) : "");
    setFitH(data.fit ? String(data.fit[1]) : "");
  }, [data.fit]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      onChange({ image: result });
    };
    reader.readAsDataURL(file);
  };

  const applyUrl = async () => {
    const trimmed = urlDraft.trim();
    if (!trimmed) return;
    setUrlError(null);
    // If already a data URL, accept directly
    if (trimmed.startsWith('data:image/')) {
      onChange({ image: trimmed });
      setUrlDraft("");
      return;
    }

    setUrlBusy(true);
    try {
      const res = await fetch(trimmed, { mode: 'cors' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const reader = new FileReader();
      const dataUrl: string = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read as data URL'));
        reader.readAsDataURL(blob);
      });
      onChange({ image: dataUrl });
      setUrlDraft("");
    } catch (err) {
      setUrlError('Failed to fetch image or convert to data URL (CORS may block it).');
    } finally {
      setUrlBusy(false);
    }
  };

  return (
    <div className="text-sm">
      <div className="text-xs text-muted-foreground mb-2">Image</div>

      <div className="grid gap-2">
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="h-7 text-xs"
            onChange={handleFileChange}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="url"
            className="h-7 flex-1 rounded border bg-background px-2 text-xs"
            placeholder="https://example.com/image.png"
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
          />
          <button
            className="h-7 px-2 rounded border text-xs"
            onClick={applyUrl}
            disabled={urlBusy}
          >
            {urlBusy ? 'Converting…' : 'Use URL'}
          </button>
        </div>
        {urlError ? <div className="text-xs text-destructive">{urlError}</div> : null}

        <div className="grid grid-cols-2 gap-2">
          <label className="flex items-center gap-2">
            <span className="w-14">width</span>
            <input
              type="number"
              className="h-7 w-24 rounded border bg-background px-2 text-xs"
              value={data.width ?? ""}
              onChange={(e) => onChange({ width: e.target.value === "" ? undefined : Number(e.target.value) })}
            />
          </label>
          <label className="flex items-center gap-2">
            <span className="w-14">height</span>
            <input
              type="number"
              className="h-7 w-24 rounded border bg-background px-2 text-xs"
              value={data.height ?? ""}
              onChange={(e) => onChange({ height: e.target.value === "" ? undefined : Number(e.target.value) })}
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <label className="flex items-center gap-2">
            <span className="w-14">fit W</span>
            <input
              type="number"
              className="h-7 w-24 rounded border bg-background px-2 text-xs"
              value={fitW}
              onChange={(e) => {
                const val = e.target.value;
                setFitW(val);
                const num = val === "" ? undefined : Number(val);
                const other = fitH === "" ? undefined : Number(fitH);
                onChange({ fit: num === undefined && other === undefined ? undefined : [num ?? 0, other ?? 0] as [number, number] });
              }}
            />
          </label>
          <label className="flex items-center gap-2">
            <span className="w-14">fit H</span>
            <input
              type="number"
              className="h-7 w-24 rounded border bg-background px-2 text-xs"
              value={fitH}
              onChange={(e) => {
                const val = e.target.value;
                setFitH(val);
                const num = val === "" ? undefined : Number(val);
                const other = fitW === "" ? undefined : Number(fitW);
                onChange({ fit: num === undefined && other === undefined ? undefined : [other ?? 0, num ?? 0] as [number, number] });
              }}
            />
          </label>
        </div>

        <label className="flex items-center gap-2">
          <span className="w-14">opacity</span>
          <input
            type="number"
            step="0.05"
            min={0}
            max={1}
            className="h-7 w-24 rounded border bg-background px-2 text-xs"
            value={data.opacity ?? ""}
            onChange={(e) => onChange({ opacity: e.target.value === "" ? undefined : Math.max(0, Math.min(1, Number(e.target.value))) })}
          />
        </label>

        {data.image ? (
          <div className="mt-2">
            <div className="text-xs text-muted-foreground mb-1">preview</div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={data.image} alt="image preview" className="max-h-32 rounded border" />
          </div>
        ) : null}
      </div>
    </div>
  );
}


