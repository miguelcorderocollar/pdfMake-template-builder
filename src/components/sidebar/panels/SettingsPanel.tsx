"use client";

import { useMemo, useState, useEffect } from "react";
import { useApp } from "@/lib/app-context";
import type { DocDefinition } from "@/types";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

const PAGE_SIZES = ["A4", "LETTER", "A5", "A3", "LEGAL"];

export function SettingsPanel() {
  const { state, dispatch } = useApp();
  const dd = state.currentTemplate?.docDefinition;
  const ddStable = useMemo(() => dd ?? {}, [dd]);

  const filename = state.filename ?? "document.pdf";

  // Header/Footer state
  const [headerMode, setHeaderMode] = useState<"static" | "dynamic">("static");
  const [footerMode, setFooterMode] = useState<"static" | "dynamic">("static");
  const [headerContent, setHeaderContent] = useState("");
  const [footerContent, setFooterContent] = useState("");
  const [headerFunction, setHeaderFunction] = useState("");
  const [footerFunction, setFooterFunction] = useState("");

  type CommonDefaults = {
    pageSize: string;
    pageOrientation: "portrait" | "landscape";
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
      pageSize: typeof d.pageSize === "string" ? d.pageSize : "A4",
      pageOrientation: d.pageOrientation ?? "portrait",
      pageMargins: Array.isArray(d.pageMargins) ? d.pageMargins : [40, 60, 40, 60],
      background: typeof d.background === "string" ? d.background : "",
      watermarkText:
        typeof d.watermark === "object" && d.watermark?.text
          ? String(d.watermark.text)
          : "",
      infoTitle: d.info?.title ?? "",
      language: d.language ?? "",
      filename,
    };
  }, [ddStable, filename]);

  // Initialize header/footer state from docDefinition
  useEffect(() => {
    const d = ddStable as DocDefinition;
    if (d.header) {
      if (typeof d.header === "function") {
        setHeaderMode("dynamic");
        setHeaderFunction(d.header.toString());
        setHeaderContent("");
      } else {
        setHeaderMode("static");
        setHeaderContent(
          typeof d.header === "string" ? d.header : JSON.stringify(d.header, null, 2)
        );
        setHeaderFunction("");
      }
    } else {
      setHeaderMode("static");
      setHeaderContent("");
      setHeaderFunction("");
    }

    if (d.footer) {
      if (typeof d.footer === "function") {
        setFooterMode("dynamic");
        setFooterFunction(d.footer.toString());
        setFooterContent("");
      } else {
        setFooterMode("static");
        setFooterContent(
          typeof d.footer === "string" ? d.footer : JSON.stringify(d.footer, null, 2)
        );
        setFooterFunction("");
      }
    } else {
      setFooterMode("static");
      setFooterContent("");
      setFooterFunction("");
    }
  }, [ddStable]);

  function updateCommon(partial: Partial<CommonDefaults>) {
    if (partial.filename !== undefined) {
      dispatch({ type: "SET_FILENAME", payload: partial.filename });
    }
    const d = ddStable as Partial<DocDefinition>;
    const toUpdate: Partial<DocDefinition> = {};
    if (partial.pageSize !== undefined) toUpdate.pageSize = partial.pageSize;
    if (partial.pageOrientation !== undefined)
      toUpdate.pageOrientation = partial.pageOrientation;
    if (partial.pageMargins !== undefined) toUpdate.pageMargins = partial.pageMargins;
    if (partial.background !== undefined)
      toUpdate.background = partial.background || undefined;
    if (partial.watermarkText !== undefined)
      toUpdate.watermark = partial.watermarkText ? { text: partial.watermarkText } : undefined;
    if (partial.infoTitle !== undefined)
      toUpdate.info = { ...(d.info ?? {}), title: partial.infoTitle };
    if (partial.language !== undefined)
      toUpdate.language = partial.language || undefined;
    if (Object.keys(toUpdate).length) {
      dispatch({ type: "UPDATE_DOC_SETTINGS", payload: toUpdate });
    }
  }

  function updateHeader() {
    const toUpdate: Partial<DocDefinition> = {};
    if (headerMode === "static") {
      if (headerContent.trim()) {
        try {
          toUpdate.header = JSON.parse(headerContent);
        } catch {
          toUpdate.header = headerContent.trim();
        }
      } else {
        toUpdate.header = undefined;
      }
    } else {
      if (headerFunction.trim()) {
        try {
          const funcBody = headerFunction.trim();
          const cleanBody = funcBody.startsWith("function")
            ? funcBody.replace(/^function\s*\([^)]*\)\s*\{([\s\S]*)\}$/, "$1")
            : funcBody;
          toUpdate.header = new Function(
            "currentPage",
            "pageCount",
            "pageSize",
            cleanBody
          ) as DocDefinition["header"];
        } catch (error) {
          console.error("Invalid header function:", error);
        }
      } else {
        toUpdate.header = undefined;
      }
    }
    if (Object.keys(toUpdate).length) {
      dispatch({ type: "UPDATE_DOC_SETTINGS", payload: toUpdate });
    }
  }

  function updateFooter() {
    const toUpdate: Partial<DocDefinition> = {};
    if (footerMode === "static") {
      if (footerContent.trim()) {
        try {
          toUpdate.footer = JSON.parse(footerContent);
        } catch {
          toUpdate.footer = footerContent.trim();
        }
      } else {
        toUpdate.footer = undefined;
      }
    } else {
      if (footerFunction.trim()) {
        try {
          const funcBody = footerFunction.trim();
          const cleanBody = funcBody.startsWith("function")
            ? funcBody.replace(/^function\s*\([^)]*\)\s*\{([\s\S]*)\}$/, "$1")
            : funcBody;
          toUpdate.footer = new Function(
            "currentPage",
            "pageCount",
            "pageSize",
            cleanBody
          ) as DocDefinition["footer"];
        } catch (error) {
          console.error("Invalid footer function:", error);
        }
      } else {
        toUpdate.footer = undefined;
      }
    }
    if (Object.keys(toUpdate).length) {
      dispatch({ type: "UPDATE_DOC_SETTINGS", payload: toUpdate });
    }
  }

  type AdvancedDefaults = {
    compress: boolean;
    version?: DocDefinition["version"];
    userPassword: string;
    ownerPassword: string;
    permissions: NonNullable<DocDefinition["permissions"]>;
    subset?: DocDefinition["subset"];
    tagged: boolean;
    displayTitle: boolean;
    infoAuthor: string;
  };

  const advanced: AdvancedDefaults = (() => {
    const d = ddStable as Partial<DocDefinition>;
    return {
      compress: d.compress ?? true,
      version: d.version,
      userPassword: d.userPassword ?? "",
      ownerPassword: d.ownerPassword ?? "",
      permissions: (d.permissions ?? {}) as NonNullable<DocDefinition["permissions"]>,
      subset: d.subset,
      tagged: d.tagged ?? false,
      displayTitle: d.displayTitle ?? false,
      infoAuthor: d.info?.author ?? "",
    };
  })();

  function updateAdvanced(partial: Partial<AdvancedDefaults>) {
    const d = ddStable as Partial<DocDefinition>;
    const toUpdate: Partial<DocDefinition> = {};
    if (partial.compress !== undefined) toUpdate.compress = partial.compress;
    if (partial.version !== undefined) toUpdate.version = partial.version;
    if (partial.userPassword !== undefined)
      toUpdate.userPassword = partial.userPassword || undefined;
    if (partial.ownerPassword !== undefined)
      toUpdate.ownerPassword = partial.ownerPassword || undefined;
    if (partial.permissions !== undefined) toUpdate.permissions = partial.permissions;
    if (partial.subset !== undefined) toUpdate.subset = partial.subset;
    if (partial.tagged !== undefined) toUpdate.tagged = partial.tagged;
    if (partial.displayTitle !== undefined) toUpdate.displayTitle = partial.displayTitle;
    if (partial.infoAuthor !== undefined)
      toUpdate.info = { ...(d.info ?? {}), author: partial.infoAuthor };
    if (Object.keys(toUpdate).length) {
      dispatch({ type: "UPDATE_DOC_SETTINGS", payload: toUpdate });
    }
  }

  function parseMargins(value: string): number[] | null {
    const parts = value
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
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
      <Card className="p-4 space-y-4">
        <h3 className="text-sm font-medium">Common Settings</h3>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="filename">Filename</Label>
            <Input
              id="filename"
              value={commonDefaults.filename}
              onChange={(e) => updateCommon({ filename: e.target.value })}
              placeholder="document.pdf"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="pageSize">Page Size</Label>
              <Select
                value={commonDefaults.pageSize}
                onValueChange={(value) => updateCommon({ pageSize: value })}
              >
                <SelectTrigger id="pageSize">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="orientation">Orientation</Label>
              <Select
                value={commonDefaults.pageOrientation}
                onValueChange={(value) =>
                  updateCommon({
                    pageOrientation: value as "portrait" | "landscape",
                  })
                }
              >
                <SelectTrigger id="orientation">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="portrait">Portrait</SelectItem>
                  <SelectItem value="landscape">Landscape</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="margins">Margins (pt) — 1, 2 or 4 numbers</Label>
            <Input
              id="margins"
              defaultValue={(commonDefaults.pageMargins as number[]).join(", ")}
              onBlur={(e) => {
                const parsed = parseMargins(e.target.value);
                if (parsed) updateCommon({ pageMargins: parsed });
              }}
              placeholder="40, 60, 40, 60"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="watermark">Watermark text</Label>
            <Input
              id="watermark"
              defaultValue={commonDefaults.watermarkText}
              onBlur={(e) => updateCommon({ watermarkText: e.target.value })}
              placeholder="e.g. Confidential"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Document title</Label>
            <Input
              id="title"
              defaultValue={commonDefaults.infoTitle}
              onBlur={(e) => updateCommon({ infoTitle: e.target.value })}
              placeholder="Awesome PDF"
            />
          </div>
        </div>
      </Card>

      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between">
            Headers & Footers
            <ChevronDown className="h-4 w-4" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 space-y-4">
          <Card className="p-4 space-y-3">
            <h4 className="text-sm font-medium">Header</h4>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={headerMode === "static" ? "default" : "outline"}
                onClick={() => setHeaderMode("static")}
              >
                Static
              </Button>
              <Button
                size="sm"
                variant={headerMode === "dynamic" ? "default" : "outline"}
                onClick={() => setHeaderMode("dynamic")}
              >
                Dynamic
              </Button>
            </div>
            {headerMode === "static" ? (
              <div className="space-y-2">
                <Label htmlFor="headerContent">Header Content</Label>
                <Textarea
                  id="headerContent"
                  value={headerContent}
                  onChange={(e) => setHeaderContent(e.target.value)}
                  placeholder='Text or JSON (e.g., {"text": "Header", "alignment": "center"})'
                  className="min-h-[80px]"
                />
                <Button size="sm" onClick={updateHeader} className="w-full">
                  Update Header
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="headerFunction">Function Code</Label>
                <Textarea
                  id="headerFunction"
                  value={headerFunction}
                  onChange={(e) => setHeaderFunction(e.target.value)}
                  placeholder="return { text: 'Header', alignment: 'center' };"
                  className="min-h-[100px] font-mono text-xs"
                />
                <p className="text-xs text-muted-foreground">
                  Variables: currentPage, pageCount, pageSize
                </p>
                <Button size="sm" onClick={updateHeader} className="w-full">
                  Update Header Function
                </Button>
              </div>
            )}
          </Card>

          <Card className="p-4 space-y-3">
            <h4 className="text-sm font-medium">Footer</h4>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={footerMode === "static" ? "default" : "outline"}
                onClick={() => setFooterMode("static")}
              >
                Static
              </Button>
              <Button
                size="sm"
                variant={footerMode === "dynamic" ? "default" : "outline"}
                onClick={() => setFooterMode("dynamic")}
              >
                Dynamic
              </Button>
            </div>
            {footerMode === "static" ? (
              <div className="space-y-2">
                <Label htmlFor="footerContent">Footer Content</Label>
                <Textarea
                  id="footerContent"
                  value={footerContent}
                  onChange={(e) => setFooterContent(e.target.value)}
                  placeholder='Text or JSON (e.g., {"columns": ["Left", {"text": "Right", "alignment": "right"}]})'
                  className="min-h-[80px]"
                />
                <Button size="sm" onClick={updateFooter} className="w-full">
                  Update Footer
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="footerFunction">Function Code</Label>
                <Textarea
                  id="footerFunction"
                  value={footerFunction}
                  onChange={(e) => setFooterFunction(e.target.value)}
                  placeholder="return { columns: ['Left', { text: 'Right', alignment: 'right' }] };"
                  className="min-h-[100px] font-mono text-xs"
                />
                <p className="text-xs text-muted-foreground">
                  Variables: currentPage, pageCount, pageSize
                </p>
                <Button size="sm" onClick={updateFooter} className="w-full">
                  Update Footer Function
                </Button>
              </div>
            )}
          </Card>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between">
            Advanced Settings
            <ChevronDown className="h-4 w-4" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <Card className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <Switch
                  id="compress"
                  checked={advanced.compress}
                  onCheckedChange={(checked) => updateAdvanced({ compress: checked })}
                />
                <Label htmlFor="compress">Compress</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="tagged"
                  checked={advanced.tagged}
                  onCheckedChange={(checked) => updateAdvanced({ tagged: checked })}
                />
                <Label htmlFor="tagged">Tagged PDF</Label>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="pdfVersion">PDF Version</Label>
              <Select
                value={advanced.version || "__auto__"}
                onValueChange={(value) =>
                  updateAdvanced({
                    version: (value === "__auto__" ? undefined : value) as DocDefinition["version"],
                  })
                }
              >
                <SelectTrigger id="pdfVersion">
                  <SelectValue placeholder="auto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__auto__">auto</SelectItem>
                  <SelectItem value="1.3">1.3</SelectItem>
                  <SelectItem value="1.4">1.4</SelectItem>
                  <SelectItem value="1.5">1.5</SelectItem>
                  <SelectItem value="1.6">1.6</SelectItem>
                  <SelectItem value="1.7">1.7</SelectItem>
                  <SelectItem value="1.7ext3">1.7ext3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="userPassword">User Password</Label>
                <Input
                  id="userPassword"
                  type="password"
                  defaultValue={advanced.userPassword}
                  onBlur={(e) => updateAdvanced({ userPassword: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ownerPassword">Owner Password</Label>
                <Input
                  id="ownerPassword"
                  type="password"
                  defaultValue={advanced.ownerPassword}
                  onBlur={(e) => updateAdvanced({ ownerPassword: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Permissions</Label>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    Edit permissions
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Permissions</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-3">
                    {(
                      [
                        ["printing", ["lowResolution", "highResolution", "false"]],
                        ["modifying", ["true", "false"]],
                        ["copying", ["true", "false"]],
                        ["annotating", ["true", "false"]],
                        ["fillingForms", ["true", "false"]],
                        ["contentAccessibility", ["true", "false"]],
                        ["documentAssembly", ["true", "false"]],
                      ] as Array<
                        [keyof NonNullable<DocDefinition["permissions"]>, string[]]
                      >
                    ).map(([key, options]) => (
                      <div key={String(key)} className="space-y-2">
                        <Label className="text-xs capitalize">{String(key)}</Label>
                        <Select
                          value={String(advanced.permissions?.[key] ?? "false")}
                          onValueChange={(val) => {
                            const next: NonNullable<DocDefinition["permissions"]> = {
                              ...(advanced.permissions ?? {}),
                            };
                            if (key === "printing") {
                              next[key] =
                                val === "false"
                                  ? false
                                  : (val as "lowResolution" | "highResolution");
                            } else {
                              next[key] = val === "true";
                            }
                            updateAdvanced({ permissions: next });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {options.map((o) => (
                              <SelectItem key={o} value={o}>
                                {o}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pdfSubset">PDF/A subset</Label>
              <Select
                value={advanced.subset || "__none__"}
                onValueChange={(value) =>
                  updateAdvanced({
                    subset: (value === "__none__" ? undefined : value) as DocDefinition["subset"],
                  })
                }
              >
                <SelectTrigger id="pdfSubset">
                  <SelectValue placeholder="none" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">none</SelectItem>
                  <SelectItem value="PDF/A-1">PDF/A-1</SelectItem>
                  <SelectItem value="PDF/A-1a">PDF/A-1a</SelectItem>
                  <SelectItem value="PDF/A-1b">PDF/A-1b</SelectItem>
                  <SelectItem value="PDF/A-2">PDF/A-2</SelectItem>
                  <SelectItem value="PDF/A-2a">PDF/A-2a</SelectItem>
                  <SelectItem value="PDF/A-2b">PDF/A-2b</SelectItem>
                  <SelectItem value="PDF/A-3">PDF/A-3</SelectItem>
                  <SelectItem value="PDF/A-3a">PDF/A-3a</SelectItem>
                  <SelectItem value="PDF/A-3b">PDF/A-3b</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                defaultValue={advanced.infoAuthor}
                onBlur={(e) => updateAdvanced({ infoAuthor: e.target.value })}
                placeholder="Author name"
              />
            </div>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export default SettingsPanel;
