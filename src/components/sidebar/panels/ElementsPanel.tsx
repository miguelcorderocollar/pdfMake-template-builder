"use client";

import { useApp } from "@/lib/app-context";
import { Type, Image, List, Table, Code } from "lucide-react";

const elements = [
  {
    id: "text",
    name: "Text Node",
    description: "Rich or simple text content",
    icon: Type,
    accentClass: "node-accent-text",
    action: {
      type: "ADD_TEXT_NODE" as const,
      payload: { text: "New text", style: undefined },
    },
  },
  {
    id: "image",
    name: "Image",
    description: "Upload or link an image",
    icon: Image,
    accentClass: "node-accent-image",
    action: {
      type: "ADD_IMAGE_NODE" as const,
      payload: {
        image:
          "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==",
        opacity: 1,
      },
    },
  },
  {
    id: "list",
    name: "List",
    description: "Ordered or unordered list",
    icon: List,
    accentClass: "node-accent-list",
    action: {
      type: "ADD_LIST_NODE" as const,
      payload: { ul: ["Item 1", "Item 2", "Item 3"] },
    },
  },
  {
    id: "table",
    name: "Table",
    description: "Rows and columns of data",
    icon: Table,
    accentClass: "node-accent-table",
    action: {
      type: "ADD_TABLE_NODE" as const,
      payload: { table: { body: [["A1", "B1", "C1"], ["A2", "B2", "C2"]] } },
    },
  },
  {
    id: "custom",
    name: "Custom Node",
    description: "Raw pdfMake JSON",
    icon: Code,
    accentClass: "node-accent-custom",
    action: {
      type: "ADD_CUSTOM_NODE" as const,
      payload: { content: {} },
    },
  },
];

export function ElementsPanel() {
  const { dispatch } = useApp();
  
  return (
    <div className="space-y-4">
    <div>
        <h3 className="font-serif text-base mb-1">Add Element</h3>
        <p className="text-xs text-muted-foreground">
          Click to add a new element to your document
        </p>
      </div>

      <div className="grid gap-2">
        {elements.map((element) => {
          const Icon = element.icon;
          return (
            <button
              key={element.id}
              className={`${element.accentClass} flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-accent/30 transition-colors text-left group`}
              onClick={() =>
                dispatch({ type: "CONTENT_OP", payload: element.action })
              }
        >
              {/* Left accent */}
              <div className="w-1 h-8 rounded-full node-border opacity-60 group-hover:opacity-100 transition-opacity" />

              {/* Icon */}
              <div className="node-icon">
                <Icon className="h-5 w-5" />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{element.name}</div>
                <div className="text-xs text-muted-foreground">
                  {element.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
