"use client";

import { useEffect, useRef, useState } from "react";

type ImageNodeData = {
  image: string;
  width?: number;
  height?: number;
  fit?: [number, number];
  opacity?: number;
  _name?: string;
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

  const fit = data.fit;
  useEffect(() => {
    setFitW(fit ? String(fit[0]) : "");
    setFitH(fit ? String(fit[1]) : "");
  }, [fit]);

  // Auto-detect mode based on current image value unless the user explicitly chose a mode
  const image = data.image ?? "";
  useEffect(() => {
    if (userPickedModeRef.current) return;
    const val = String(image || "");
    if (val.startsWith('data:')) {
      setMode('base64');
    } else if (/^https?:\/\//i.test(val)) {
      setMode('url');
    } else if (val) {
      // Fallback: unknown string; keep current selection
    }
  }, [image]);

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
    } catch {
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
    <div className="text-sm space-y-3">
      <div className="flex items-center gap-2">
        <label className="text-xs text-muted-foreground min-w-[60px]">Source:</label>
        <select
          className="h-8 rounded-md border border-input bg-background px-2 text-xs hover:bg-accent transition-colors"
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
      </div>

      <div className="space-y-2">

        {mode === 'file' && (
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="h-8 text-xs file:mr-2 file:h-8 file:px-3 file:rounded-md file:border file:text-xs file:bg-background hover:file:bg-accent"
              onChange={handleFileChange}
            />
          </div>
        )}

        {mode === 'url' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="url"
                className="h-8 flex-1 rounded-md border border-input bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="https://example.com/image.png or data:image/png;base64,..."
                value={urlDraft}
                onChange={(e) => setUrlDraft(e.target.value)}
              />
              <button
                className="h-8 px-3 rounded-md border text-xs hover:bg-accent transition-colors disabled:opacity-50"
                onClick={applyUrl}
                disabled={urlBusy}
              >
                {urlBusy ? 'Converting…' : 'Use URL'}
              </button>
            </div>
            {urlError && <div className="text-xs text-destructive">{urlError}</div>}
          </div>
        )}

        {mode === 'base64' && (
          <div className="space-y-2">
            <textarea
              className="min-h-20 rounded-md border border-input bg-background p-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Example: data:image/jpeg;base64,/9j/4RC5RXhpZgAATU0AKgA..."
              value={b64Draft}
              onChange={(e) => setB64Draft(e.target.value)}
            />
            <div className="flex items-center gap-2">
              <button className="h-8 px-3 rounded-md border text-xs hover:bg-accent transition-colors" onClick={applyBase64}>Use Data URL</button>
              {b64Error && <div className="text-xs text-destructive">{b64Error}</div>}
            </div>
          </div>
        )}
      </div>

      <div className="p-3 rounded-md bg-muted/50 border space-y-3">
        <div className="text-xs font-medium text-muted-foreground">Dimensions</div>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Width</span>
            <input
              type="number"
              className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
              value={data.width ?? ""}
              onChange={(e) => onChange({ width: e.target.value === "" ? undefined : Number(e.target.value) })}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Height</span>
            <input
              type="number"
              className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
              value={data.height ?? ""}
              onChange={(e) => onChange({ height: e.target.value === "" ? undefined : Number(e.target.value) })}
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Fit Width</span>
            <input
              type="number"
              className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
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
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Fit Height</span>
            <input
              type="number"
              className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
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

        <label className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Opacity</span>
          <input
            type="number"
            step="0.05"
            min={0}
            max={1}
            className="h-8 w-32 rounded-md border border-input bg-background px-2 text-xs"
            value={data.opacity ?? ""}
            onChange={(e) => onChange({ opacity: e.target.value === "" ? undefined : Math.max(0, Math.min(1, Number(e.target.value))) })}
          />
        </label>
      </div>

      {(() => {
        const livePreview = (() => {
          if (mode === 'base64' && isValidDataUrlBase64(b64Draft)) return b64Draft;
          if (mode === 'url' && (isValidHttpUrl(urlDraft) || isValidDataUrlBase64(urlDraft))) return urlDraft;
          return null;
        })();
        const src = livePreview || data.image || '';
        return src ? (
          <div className="p-3 rounded-md bg-muted/50 border">
            <div className="text-xs font-medium text-muted-foreground mb-2">Preview</div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="image preview" className="max-h-40 rounded-md border" />
          </div>
        ) : null;
      })()}
    </div>
  );
}


