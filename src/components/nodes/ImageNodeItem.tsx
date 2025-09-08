"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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
  const [mode, setMode] = useState<'file' | 'url' | 'base64'>("file");
  const [urlDraft, setUrlDraft] = useState("");
  const [fitW, setFitW] = useState<string>(data.fit ? String(data.fit[0]) : "");
  const [fitH, setFitH] = useState<string>(data.fit ? String(data.fit[1]) : "");
  const [urlBusy, setUrlBusy] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [b64Draft, setB64Draft] = useState<string>("");
  const [b64Error, setB64Error] = useState<string | null>(null);
  const userPickedModeRef = useRef(false);

  // Helpers
  const isValidHttpUrl = (value: string) => /^https?:\/\//i.test(value);
  const isValidDataUrlBase64 = (value: string) => /^data:[^;]+;base64,[A-Za-z0-9+/=\s]+$/i.test(value);

  useEffect(() => {
    setFitW(data.fit ? String(data.fit[0]) : "");
    setFitH(data.fit ? String(data.fit[1]) : "");
  }, [data.fit]);

  // Auto-detect mode based on current image value unless the user explicitly chose a mode
  useEffect(() => {
    if (userPickedModeRef.current) return;
    const val = String((data as { image?: string }).image || "");
    if (val.startsWith('data:')) {
      setMode('base64');
    } else if (/^https?:\/\//i.test(val)) {
      setMode('url');
    } else if (val) {
      // Fallback: unknown string; keep current selection
    }
  }, [data.image]);

  // Validate drafts live and provide immediate feedback
  useEffect(() => {
    if (mode === 'url') {
      if (!urlDraft) {
        setUrlError(null);
      } else if (isValidHttpUrl(urlDraft) || isValidDataUrlBase64(urlDraft)) {
        setUrlError(null);
      } else {
        setUrlError('Enter a valid http(s) URL or a full data URL');
      }
    }
  }, [mode, urlDraft]);

  useEffect(() => {
    if (mode === 'base64') {
      if (!b64Draft) {
        setB64Error(null);
      } else if (isValidDataUrlBase64(b64Draft)) {
        setB64Error(null);
      } else {
        setB64Error('Please paste a full data URL like data:image/jpeg;base64,/9j...');
      }
    }
  }, [mode, b64Draft]);

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

  const applyBase64 = () => {
    setB64Error(null);
    const trimmed = b64Draft.trim();
    if (!trimmed) return;
    if (!isValidDataUrlBase64(trimmed)) {
      setB64Error('Please paste a full data URL like data:image/jpeg;base64,/9j...');
      return;
    }
    onChange({ image: trimmed });
    setB64Draft("");
  };

  return (
    <div className="text-sm">
      <div className="text-xs text-muted-foreground mb-2">Image</div>

      <div className="grid gap-2">
        <label className="flex items-center gap-2">
          <span className="w-14">source</span>
          <select
            className="h-7 rounded border bg-background px-2 text-xs"
            value={mode}
            onChange={(e) => {
              userPickedModeRef.current = true;
              setMode(e.target.value as typeof mode);
            }}
          >
            <option value="file">file</option>
            <option value="url">url</option>
            <option value="base64">base64</option>
          </select>
        </label>

        {mode === 'file' ? (
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="h-7 text-xs"
              onChange={handleFileChange}
            />
          </div>
        ) : null}

        {mode === 'url' ? (
          <>
            <div className="flex items-center gap-2">
              <input
                type="url"
                className="h-7 flex-1 rounded border bg-background px-2 text-xs"
                placeholder="https://example.com/image.png or data:image/png;base64,..."
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
          </>
        ) : null}

        {mode === 'base64' ? (
          <>
            <textarea
              className="min-h-20 rounded border bg-background p-2 text-xs"
              placeholder="Example: data:image/jpeg;base64,/9j/4RC5RXhpZgAATU0AKgA..."
              value={b64Draft}
              onChange={(e) => setB64Draft(e.target.value)}
            />
            <div className="flex items-center gap-2">
              <button className="h-7 px-2 rounded border text-xs" onClick={applyBase64}>Use Data URL</button>
              {b64Error ? <div className="text-xs text-destructive">{b64Error}</div> : null}
            </div>
          </>
        ) : null}

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

        {(() => {
          const livePreview = (() => {
            if (mode === 'base64' && isValidDataUrlBase64(b64Draft)) return b64Draft;
            if (mode === 'url' && (isValidHttpUrl(urlDraft) || isValidDataUrlBase64(urlDraft))) return urlDraft;
            return null;
          })();
          const src = livePreview || data.image || '';
          return src ? (
            <div className="mt-2">
              <div className="text-xs text-muted-foreground mb-1">preview</div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="image preview" className="max-h-32 rounded border" />
            </div>
          ) : null;
        })()}
      </div>
    </div>
  );
}


