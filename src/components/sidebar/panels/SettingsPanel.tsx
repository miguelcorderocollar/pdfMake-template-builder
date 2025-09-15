"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/lib/app-context";
import type { DocDefinition } from "@/types";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Simple collapsible without importing extra primitives
function Collapsible({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border rounded-md">
      <button className="w-full text-left px-3 py-2 font-medium" onClick={() => setOpen(!open)} aria-expanded={open}>
        {title}
      </button>
      {open && <div className="p-3 space-y-3">{children}</div>}
    </div>
  );
}

const PAGE_SIZES = [
  "A4", "LETTER", "A5", "A3", "LEGAL",
];

export function SettingsPanel() {
  const { state, dispatch } = useApp();
  const dd = state.currentTemplate?.docDefinition;
  const ddStable = useMemo(() => dd ?? {}, [dd]);

  const filename = state.filename ?? "document.pdf";

  type CommonDefaults = {
    pageSize: string;
    pageOrientation: 'portrait' | 'landscape';
    pageMargins: number[];
    background: string;
    watermarkText: string;
    infoTitle: string;
    language: string;
    filename: string;
  };

  const commonDefaults = useMemo<CommonDefaults>(() => {
    const d = ddStable as Partial<DocDefinition>;
    return {
      pageSize: typeof d.pageSize === 'string' ? d.pageSize : 'A4',
      pageOrientation: d.pageOrientation ?? 'portrait',
      pageMargins: Array.isArray(d.pageMargins) ? d.pageMargins : [40, 60, 40, 60],
      background: typeof d.background === 'string' ? d.background : '',
      watermarkText: typeof d.watermark === 'object' && d.watermark?.text ? String(d.watermark.text) : '',
      infoTitle: d.info?.title ?? '',
      language: d.language ?? '',
      filename,
    };
  }, [ddStable, filename]);

  function updateCommon(partial: Partial<CommonDefaults>) {
    if (partial.filename !== undefined) {
      dispatch({ type: 'SET_FILENAME', payload: partial.filename });
    }
    const d = ddStable as Partial<DocDefinition>;
    const toUpdate: Partial<DocDefinition> = {};
    if (partial.pageSize !== undefined) toUpdate.pageSize = partial.pageSize;
    if (partial.pageOrientation !== undefined) toUpdate.pageOrientation = partial.pageOrientation;
    if (partial.pageMargins !== undefined) toUpdate.pageMargins = partial.pageMargins;
    if (partial.background !== undefined) toUpdate.background = partial.background || undefined;
    if (partial.watermarkText !== undefined) toUpdate.watermark = partial.watermarkText ? { text: partial.watermarkText } : undefined;
    if (partial.infoTitle !== undefined) toUpdate.info = { ...(d.info ?? {}), title: partial.infoTitle };
    if (partial.language !== undefined) toUpdate.language = partial.language || undefined;
    if (Object.keys(toUpdate).length) {
      dispatch({ type: 'UPDATE_DOC_SETTINGS', payload: toUpdate });
    }
  }

  type AdvancedDefaults = {
    compress: boolean;
    version?: DocDefinition['version'];
    userPassword: string;
    ownerPassword: string;
    permissions: NonNullable<DocDefinition['permissions']>;
    subset?: DocDefinition['subset'];
    tagged: boolean;
    displayTitle: boolean;
    infoAuthor: string;
  };

  const advanced: AdvancedDefaults = (() => {
    const d = ddStable as Partial<DocDefinition>;
    return {
      compress: d.compress ?? true,
      version: d.version,
      userPassword: d.userPassword ?? '',
      ownerPassword: d.ownerPassword ?? '',
      permissions: (d.permissions ?? {}) as NonNullable<DocDefinition['permissions']>,
      subset: d.subset,
      tagged: d.tagged ?? false,
      displayTitle: d.displayTitle ?? false,
      infoAuthor: d.info?.author ?? '',
    };
  })();

  function updateAdvanced(partial: Partial<AdvancedDefaults>) {
    const d = ddStable as Partial<DocDefinition>;
    const toUpdate: Partial<DocDefinition> = {};
    if (partial.compress !== undefined) toUpdate.compress = partial.compress;
    if (partial.version !== undefined) toUpdate.version = partial.version;
    if (partial.userPassword !== undefined) toUpdate.userPassword = partial.userPassword || undefined;
    if (partial.ownerPassword !== undefined) toUpdate.ownerPassword = partial.ownerPassword || undefined;
    if (partial.permissions !== undefined) toUpdate.permissions = partial.permissions;
    if (partial.subset !== undefined) toUpdate.subset = partial.subset;
    if (partial.tagged !== undefined) toUpdate.tagged = partial.tagged;
    if (partial.displayTitle !== undefined) toUpdate.displayTitle = partial.displayTitle;
    if (partial.infoAuthor !== undefined) toUpdate.info = { ...(d.info ?? {}), author: partial.infoAuthor };
    if (Object.keys(toUpdate).length) {
      dispatch({ type: 'UPDATE_DOC_SETTINGS', payload: toUpdate });
    }
  }

  // Simple numeric array input for margins
  function parseMargins(value: string): number[] | null {
    const parts = value.split(',').map((p) => p.trim()).filter(Boolean);
    if (parts.length === 0) return null;
    const nums = parts.map((p) => Number(p));
    if (nums.some((n) => Number.isNaN(n))) return null;
    if (nums.length === 1) return [nums[0], nums[0], nums[0], nums[0]];
    if (nums.length === 2) return [nums[0], nums[1], nums[0], nums[1]];
    if (nums.length === 4) return nums as [number, number, number, number];
    return null;
  }

  return (
    <div className="space-y-4">
      <Card className="p-3 space-y-3">
        <div className="text-sm font-medium">Common</div>
        <div className="space-y-2">
          <div className="space-y-1">
            <label className="text-xs">Filename</label>
            <Input value={commonDefaults.filename} onChange={(e) => updateCommon({ filename: e.target.value })} placeholder="document.pdf" />
          </div>
          <div className="space-y-1">
            <label className="text-xs">Page size</label>
            <select className="w-full h-9 rounded-md border bg-background px-3 text-sm" value={String(commonDefaults.pageSize)} onChange={(e) => updateCommon({ pageSize: e.target.value })}>
              {PAGE_SIZES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs">Orientation</label>
            <select className="w-full h-9 rounded-md border bg-background px-3 text-sm" value={String(commonDefaults.pageOrientation)} onChange={(e) => updateCommon({ pageOrientation: e.target.value === 'landscape' ? 'landscape' : 'portrait' })}>
              <option value="portrait">portrait</option>
              <option value="landscape">landscape</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs">Margins (pt) — accept 1, 2 or 4 numbers</label>
            <Input defaultValue={(commonDefaults.pageMargins as number[]).join(', ')} onBlur={(e) => {
              const parsed = parseMargins(e.target.value);
              if (parsed) updateCommon({ pageMargins: parsed });
            }} placeholder="40, 60, 40, 60" />
          </div>
          <div className="space-y-1">
            <label className="text-xs">Background (text)</label>
            <Input defaultValue={commonDefaults.background} onBlur={(e) => updateCommon({ background: e.target.value })} placeholder="e.g. simple text" />
          </div>
          <div className="space-y-1">
            <label className="text-xs">Watermark text</label>
            <Input defaultValue={commonDefaults.watermarkText} onBlur={(e) => updateCommon({ watermarkText: e.target.value })} placeholder="e.g. Confidential" />
          </div>
          <div className="space-y-1">
            <label className="text-xs">Document title</label>
            <Input defaultValue={commonDefaults.infoTitle} onBlur={(e) => updateCommon({ infoTitle: e.target.value })} placeholder="Awesome PDF" />
          </div>
          <div className="space-y-1">
            <label className="text-xs">Language (BCP-47)</label>
            <Input defaultValue={commonDefaults.language} onBlur={(e) => updateCommon({ language: e.target.value })} placeholder="en-US" />
          </div>
        </div>
      </Card>

      <Collapsible title="Advanced settings">
        <div className="grid grid-cols-1 gap-3">
          <div className="space-y-1">
            <label className="text-xs">Compress</label>
            <select className="w-full h-9 rounded-md border bg-background px-3 text-sm" value={advanced.compress ? 'true' : 'false'} onChange={(e) => updateAdvanced({ compress: e.target.value === 'true' })}>
              <option value="true">true</option>
              <option value="false">false</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs">PDF Version</label>
            <select className="w-full h-9 rounded-md border bg-background px-3 text-sm" value={advanced.version || ''} onChange={(e) => updateAdvanced({ version: (e.target.value || undefined) as DocDefinition['version'] })}>
              <option value="">auto</option>
              <option value="1.3">1.3</option>
              <option value="1.4">1.4</option>
              <option value="1.5">1.5</option>
              <option value="1.6">1.6</option>
              <option value="1.7">1.7</option>
              <option value="1.7ext3">1.7ext3</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs">User password</label>
            <Input type="password" defaultValue={advanced.userPassword} onBlur={(e) => updateAdvanced({ userPassword: e.target.value })} />
          </div>
          <div className="space-y-1">
            <label className="text-xs">Owner password</label>
            <Input type="password" defaultValue={advanced.ownerPassword} onBlur={(e) => updateAdvanced({ ownerPassword: e.target.value })} />
          </div>
          <div className="space-y-1">
            <label className="text-xs">Permissions</label>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary" className="h-8 px-3">Edit permissions</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Permissions</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {([
                    ['printing', ['lowResolution', 'highResolution', 'false']],
                    ['modifying', ['true', 'false']],
                    ['copying', ['true', 'false']],
                    ['annotating', ['true', 'false']],
                    ['fillingForms', ['true', 'false']],
                    ['contentAccessibility', ['true', 'false']],
                    ['documentAssembly', ['true', 'false']],
                  ] as Array<[
                    keyof NonNullable<DocDefinition['permissions']>,
                    string[]
                  ]>).map(([key, options]) => (
                    <div key={String(key)} className="space-y-1">
                      <label className="text-xs capitalize">{String(key)}</label>
                      <select
                        className="w-full h-9 rounded-md border bg-background px-3 text-sm"
                        value={String((advanced.permissions?.[key] ?? 'false'))}
                        onChange={(e) => {
                          const val = e.target.value;
                          const next: NonNullable<DocDefinition['permissions']> = { ...(advanced.permissions ?? {}) };
                          if (key === 'printing') {
                            next[key] = val === 'false' ? false : (val as 'lowResolution' | 'highResolution');
                          } else {
                            next[key] = val === 'true';
                          }
                          updateAdvanced({ permissions: next });
                        }}
                      >
                        {options.map((o) => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-1">
            <label className="text-xs">PDF/A subset</label>
            <select className="w-full h-9 rounded-md border bg-background px-3 text-sm" value={advanced.subset || ''} onChange={(e) => updateAdvanced({ subset: (e.target.value || undefined) as DocDefinition['subset'] })}>
              <option value="">none</option>
              <option value="PDF/A-1">PDF/A-1</option>
              <option value="PDF/A-1a">PDF/A-1a</option>
              <option value="PDF/A-1b">PDF/A-1b</option>
              <option value="PDF/A-2">PDF/A-2</option>
              <option value="PDF/A-2a">PDF/A-2a</option>
              <option value="PDF/A-2b">PDF/A-2b</option>
              <option value="PDF/A-3">PDF/A-3</option>
              <option value="PDF/A-3a">PDF/A-3a</option>
              <option value="PDF/A-3b">PDF/A-3b</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs">Tagged PDF</label>
            <select className="w-full h-9 rounded-md border bg-background px-3 text-sm" value={advanced.tagged ? 'true' : 'false'} onChange={(e) => updateAdvanced({ tagged: e.target.value === 'true' })}>
              <option value="true">true</option>
              <option value="false">false</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs">Display title in window</label>
            <select className="w-full h-9 rounded-md border bg-background px-3 text-sm" value={advanced.displayTitle ? 'true' : 'false'} onChange={(e) => updateAdvanced({ displayTitle: e.target.value === 'true' })}>
              <option value="true">true</option>
              <option value="false">false</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs">Author</label>
            <Input defaultValue={advanced.infoAuthor} onBlur={(e) => updateAdvanced({ infoAuthor: e.target.value })} placeholder="Author name" />
          </div>
        </div>
      </Collapsible>
    </div>
  );
}

export default SettingsPanel;


