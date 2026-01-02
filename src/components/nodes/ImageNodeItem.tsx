"use client";

import { useEffect, useRef, useState } from "react";
import { Upload, Link, Code, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

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
  const [mode, setMode] = useState<"file" | "url" | "base64">("file");
  const [urlDraft, setUrlDraft] = useState("");
  const [fitW, setFitW] = useState<string>(data.fit ? String(data.fit[0]) : "");
  const [fitH, setFitH] = useState<string>(data.fit ? String(data.fit[1]) : "");
  const [urlBusy, setUrlBusy] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [b64Draft, setB64Draft] = useState<string>("");
  const [b64Error, setB64Error] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const userPickedModeRef = useRef(false);

  const isValidHttpUrl = (value: string) => /^https?:\/\//i.test(value);
  const isValidDataUrlBase64 = (value: string) =>
    /^data:[^;]+;base64,[A-Za-z0-9+/=\s]+$/i.test(value);

  const fit = data.fit;
  useEffect(() => {
    setFitW(fit ? String(fit[0]) : "");
    setFitH(fit ? String(fit[1]) : "");
  }, [fit]);

  const image = data.image ?? "";
  useEffect(() => {
    if (userPickedModeRef.current) return;
    const val = String(image || "");
    if (val.startsWith("data:")) {
      setMode("base64");
    } else if (/^https?:\/\//i.test(val)) {
      setMode("url");
    }
  }, [image]);

  useEffect(() => {
    if (mode === "url") {
      if (!urlDraft) {
        setUrlError(null);
      } else if (isValidHttpUrl(urlDraft) || isValidDataUrlBase64(urlDraft)) {
        setUrlError(null);
      } else {
        setUrlError("Enter a valid http(s) URL or data URL");
      }
    }
  }, [mode, urlDraft]);

  useEffect(() => {
    if (mode === "base64") {
      if (!b64Draft) {
        setB64Error(null);
      } else if (isValidDataUrlBase64(b64Draft)) {
        setB64Error(null);
      } else {
        setB64Error("Please paste a full data URL (data:image/...;base64,...)");
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

    if (trimmed.startsWith("data:image/")) {
      onChange({ image: trimmed });
      setUrlDraft("");
      return;
    }

    setUrlBusy(true);
    try {
      const res = await fetch(trimmed, { mode: "cors" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const reader = new FileReader();
      const dataUrl: string = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Failed to read as data URL"));
        reader.readAsDataURL(blob);
      });
      onChange({ image: dataUrl });
      setUrlDraft("");
    } catch {
      setUrlError("Failed to fetch image (CORS may block it)");
    } finally {
      setUrlBusy(false);
    }
  };

  const applyBase64 = () => {
    setB64Error(null);
    const trimmed = b64Draft.trim();
    if (!trimmed) return;
    if (!isValidDataUrlBase64(trimmed)) {
      setB64Error("Please paste a full data URL");
      return;
    }
    onChange({ image: trimmed });
    setB64Draft("");
  };

  const livePreview = (() => {
    if (mode === "base64" && isValidDataUrlBase64(b64Draft)) return b64Draft;
    if (mode === "url" && (isValidHttpUrl(urlDraft) || isValidDataUrlBase64(urlDraft)))
      return urlDraft;
    return null;
  })();
  const previewSrc = livePreview || data.image || "";

  return (
    <div className="space-y-4">
      {/* Source mode tabs */}
      <div className="flex items-center gap-2">
        <Label className="text-xs text-muted-foreground">Source:</Label>
        <div className="inline-flex rounded-md border border-border">
          <button
            onClick={() => {
              userPickedModeRef.current = true;
              setMode("file");
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs transition-colors ${
              mode === "file" ? "bg-primary text-primary-foreground" : "hover:bg-accent"
            }`}
          >
            <Upload className="h-3.5 w-3.5" />
            File
          </button>
          <button
            onClick={() => {
              userPickedModeRef.current = true;
              setMode("url");
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs transition-colors border-l border-border ${
              mode === "url" ? "bg-primary text-primary-foreground" : "hover:bg-accent"
            }`}
          >
            <Link className="h-3.5 w-3.5" />
            URL
          </button>
          <button
            onClick={() => {
            userPickedModeRef.current = true;
              setMode("base64");
          }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs transition-colors border-l border-border ${
              mode === "base64" ? "bg-primary text-primary-foreground" : "hover:bg-accent"
            }`}
          >
            <Code className="h-3.5 w-3.5" />
            Base64
          </button>
        </div>
      </div>

      {/* Source inputs */}
      {mode === "file" && (
        <div
          className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-accent/20 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            PNG, JPG, GIF, WebP
          </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
            className="hidden"
              onChange={handleFileChange}
            />
          </div>
        )}

      {mode === "url" && (
          <div className="space-y-2">
          <div className="flex gap-2">
            <Input
                type="url"
              placeholder="https://example.com/image.png"
                value={urlDraft}
                onChange={(e) => setUrlDraft(e.target.value)}
              />
            <Button onClick={applyUrl} disabled={urlBusy} size="sm">
              {urlBusy ? "Loading..." : "Load"}
            </Button>
            </div>
          {urlError && <p className="text-xs text-destructive">{urlError}</p>}
          </div>
        )}

      {mode === "base64" && (
          <div className="space-y-2">
          <Textarea
            className="min-h-20 font-mono text-xs"
            placeholder="data:image/png;base64,..."
              value={b64Draft}
              onChange={(e) => setB64Draft(e.target.value)}
            />
            <div className="flex items-center gap-2">
            <Button onClick={applyBase64} size="sm">
              Apply
            </Button>
            {b64Error && <p className="text-xs text-destructive">{b64Error}</p>}
          </div>
      </div>
      )}

      {/* Preview */}
      {previewSrc && (
        <div className="p-4 rounded-lg bg-muted/30 border border-border">
          <p className="text-xs text-muted-foreground mb-2">Preview</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewSrc}
            alt="Preview"
            className="max-h-48 rounded-md border border-border"
          />
        </div>
      )}

      <Separator />

      {/* Advanced options toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        {showAdvanced ? (
          <ChevronUp className="h-3.5 w-3.5" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" />
        )}
        Dimensions & Options
      </button>

      {/* Advanced options */}
      {showAdvanced && (
        <div className="p-4 rounded-lg bg-muted/30 border border-border space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="img-width" className="text-xs">Width</Label>
              <Input
                id="img-width"
              type="number"
              value={data.width ?? ""}
                onChange={(e) =>
                  onChange({
                    width: e.target.value === "" ? undefined : Number(e.target.value),
                  })
                }
                placeholder="auto"
            />
            </div>
            <div className="space-y-2">
              <Label htmlFor="img-height" className="text-xs">Height</Label>
              <Input
                id="img-height"
              type="number"
              value={data.height ?? ""}
                onChange={(e) =>
                  onChange({
                    height: e.target.value === "" ? undefined : Number(e.target.value),
                  })
                }
                placeholder="auto"
            />
            </div>
        </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fit-width" className="text-xs">Fit Width</Label>
              <Input
                id="fit-width"
              type="number"
              value={fitW}
              onChange={(e) => {
                const val = e.target.value;
                setFitW(val);
                const num = val === "" ? undefined : Number(val);
                const other = fitH === "" ? undefined : Number(fitH);
                  onChange({
                    fit:
                      num === undefined && other === undefined
                        ? undefined
                        : ([num ?? 0, other ?? 0] as [number, number]),
                  });
              }}
                placeholder="auto"
            />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fit-height" className="text-xs">Fit Height</Label>
              <Input
                id="fit-height"
              type="number"
              value={fitH}
              onChange={(e) => {
                const val = e.target.value;
                setFitH(val);
                const num = val === "" ? undefined : Number(val);
                const other = fitW === "" ? undefined : Number(fitW);
                  onChange({
                    fit:
                      num === undefined && other === undefined
                        ? undefined
                        : ([other ?? 0, num ?? 0] as [number, number]),
                  });
              }}
                placeholder="auto"
            />
            </div>
        </div>

          <div className="space-y-2">
            <Label htmlFor="opacity" className="text-xs">Opacity (0-1)</Label>
            <Input
              id="opacity"
            type="number"
              step="0.1"
            min={0}
            max={1}
              className="w-32"
            value={data.opacity ?? ""}
              onChange={(e) =>
                onChange({
                  opacity:
                    e.target.value === ""
                      ? undefined
                      : Math.max(0, Math.min(1, Number(e.target.value))),
                })
              }
              placeholder="1"
            />
          </div>
        </div>
      )}
    </div>
  );
}
