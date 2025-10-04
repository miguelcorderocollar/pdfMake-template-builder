"use client";

import { useApp } from "@/lib/app-context";
import { GripVertical } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { getNodeTypeInfo, getNodeDisplayName } from "@/utils/node-info";

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
      type: 'CONTENT_OP',
      payload: { type: 'MOVE_ITEM', payload: { from, to } }
    });
  };

  const handleNodeClick = (index: number) => {
    dispatch({ type: 'SET_SELECTED_INDEX', payload: index });
    
    // Scroll to the node in the main content list
    const element = document.querySelector(`[data-content-index="${index}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  if (content.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center text-sm text-muted-foreground">
          <p>No content yet</p>
          <p className="text-xs mt-2">Add elements to see them here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b bg-muted/30">
        <h3 className="font-semibold text-sm">Document Overview</h3>
        <p className="text-xs text-muted-foreground mt-1">
          {content.length} node{content.length !== 1 ? 's' : ''}
        </p>
      </div>
      
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
                          flex items-center gap-2 p-2 rounded-md border cursor-pointer
                          transition-all
                          ${isSelected 
                            ? 'bg-primary/10 border-primary ring-2 ring-primary/20' 
                            : 'bg-card hover:bg-accent/50 border-border'
                          }
                          ${snapshot.isDragging ? 'shadow-lg' : 'shadow-sm'}
                        `}
                        onClick={() => handleNodeClick(index)}
                      >
                        <div
                          {...provided.dragHandleProps}
                          className="flex-shrink-0 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
                        >
                          <GripVertical className="h-4 w-4" />
                        </div>
                        
                        <div className="flex-shrink-0">
                          <NodeIcon className={`h-4 w-4 ${typeInfo.iconColor}`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium truncate">
                            {name}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {typeInfo.label} #{index + 1}
                          </div>
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
