"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Plus, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Template } from "@/types";

interface TemplateDropdownProps {
  templates: Template[];
  currentTemplate: Template | null;
  onSelect: (id: string) => void;
  onRename: (name: string) => void;
  onCreateNew: () => void;
}

export function TemplateDropdown({
  templates,
  currentTemplate,
  onSelect,
  onRename,
  onCreateNew,
}: TemplateDropdownProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const templateName = currentTemplate?.name ?? "Untitled";

  // Focus input when editing
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const startEditing = () => {
    setEditValue(templateName);
    setIsEditing(true);
  };

  const saveEdit = () => {
    if (editValue.trim()) {
      onRename(editValue.trim());
    }
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      saveEdit();
    } else if (e.key === "Escape") {
      cancelEdit();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={saveEdit}
          className="h-8 w-48 rounded-md border border-input bg-background px-2 text-sm font-serif focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={saveEdit}>
          <Check className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={cancelEdit}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-9 gap-2 px-3 font-serif text-base font-normal"
        >
          <span className="max-w-[200px] truncate">{templateName}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <ScrollArea className={templates.length > 8 ? "h-64" : ""}>
          {templates.map((t) => (
            <DropdownMenuItem
              key={t.id}
              className={t.id === currentTemplate?.id ? "bg-accent/50 font-medium" : ""}
              onClick={() => onSelect(t.id)}
            >
              {t.name}
            </DropdownMenuItem>
          ))}
        </ScrollArea>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={startEditing}>
          <Pencil className="mr-2 h-3.5 w-3.5" />
          Rename template
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onCreateNew}>
          <Plus className="mr-2 h-3.5 w-3.5" />
          New template
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
