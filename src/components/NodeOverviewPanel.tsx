"use client";

import { useApp } from "@/lib/app-context";
import { GripVertical } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { getNodeTypeInfo, getNodeDisplayName } from "@/utils/node-info";

// Map node type labels to CSS accent classes
function getNodeAccentClass(label: string): string {
  switch (label.toLowerCase()) {
    case "text":
    case "paragraph":
      return "node-accent-text";
    case "image":
      return "node-accent-image";
    case "list":
      return "node-accent-list";
    case "table":
      return "node-accent-table";
    default:
      return "node-accent-custom";
  }
}

export function NodeOverviewPanel() {
  const { state, dispatch } = useApp();

  const content = state.currentTemplate?.docDefinition?.content ?? [];
  const selectedIndex = state.selectedIndex;

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const from = result.source.index;
    const to = result.destination.index;

    if (from === to) return;

    dispatch({
      type: "CONTENT_OP",
      payload: { type: "MOVE_ITEM", payload: { from, to } },
    });
  };

  const handleNodeClick = (index: number) => {
    dispatch({ type: "SET_SELECTED_INDEX", payload: index });

    // Scroll to the node in the main content list
    const element = document.querySelector(`[data-content-index="${index}"]`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  if (content.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center text-sm text-muted-foreground">
          <p>No content yet</p>
          <p className="text-xs mt-2">Add elements from the sidebar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Node List */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="node-overview">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex-1 overflow-y-auto p-2 space-y-1"
            >
              {content.map((item, index) => {
                const typeInfo = getNodeTypeInfo(item);
                const NodeIcon = typeInfo.icon;
                const name = getNodeDisplayName(item, index);
                const isSelected = selectedIndex === index;
                const accentClass = getNodeAccentClass(typeInfo.label);

                return (
                  <Draggable
                    key={`node-${index}`}
                    draggableId={`node-${index}`}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`
                          ${accentClass}
                          flex items-center gap-2 py-2 px-2 rounded-md cursor-pointer
                          transition-all duration-150
                          border-l-2 node-border
                          ${
                            isSelected
                              ? "bg-primary/10 ring-1 ring-primary/30"
                              : "hover:bg-muted/50"
                          }
                          ${snapshot.isDragging ? "shadow-lg bg-card" : ""}
                        `}
                        onClick={() => handleNodeClick(index)}
                      >
                        {/* Drag handle */}
                        <div
                          {...provided.dragHandleProps}
                          className="flex-shrink-0 text-muted-foreground/50 hover:text-muted-foreground cursor-grab active:cursor-grabbing"
                        >
                          <GripVertical className="h-3.5 w-3.5" />
                        </div>

                        {/* Node icon with accent color */}
                        <div className="flex-shrink-0 node-icon">
                          <NodeIcon className="h-4 w-4" />
                        </div>

                        {/* Node name */}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate font-serif">
                            {name}
                          </div>
                        </div>

                        {/* Index indicator */}
                        <div className="flex-shrink-0 text-[10px] text-muted-foreground/60 tabular-nums">
                          #{index + 1}
                        </div>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
