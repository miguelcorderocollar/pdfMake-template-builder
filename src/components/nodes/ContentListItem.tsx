"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  MoreVertical,
  Pencil,
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  Save,
  X,
} from "lucide-react";
import { useApp } from "@/lib/app-context";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { TextNodeItem } from "@/components/nodes/TextNodeItem";
import { ImageNodeItem } from "@/components/nodes/ImageNodeItem";
import { ListNodeItem } from "@/components/nodes/ListNodeItem";
import { TableNodeItem } from "@/components/nodes/TableNodeItem";
import { UnknownNodeEditor } from "@/components/nodes/UnknownNodeEditor";
import { TextNodePreview } from "@/components/nodes/previews/TextNodePreview";
import { ImageNodePreview } from "@/components/nodes/previews/ImageNodePreview";
import { ListNodePreview } from "@/components/nodes/previews/ListNodePreview";
import { TableNodePreview } from "@/components/nodes/previews/TableNodePreview";
import { UnknownNodePreview } from "@/components/nodes/previews/UnknownNodePreview";
import type { DocContentItem } from "@/types";
import {
  isImageNode,
  isTextNode,
  isListNode,
  isTableNode,
  hasCustomFlag,
} from "@/utils/node-type-guards";
import {
  getNodeTypeInfo,
  getNodeCustomName,
  getNodeDisplayName,
  supportsCustomName,
} from "@/utils/node-info";
import { createUpdateNodeNameAction } from "@/utils/node-actions";
import { useInlineEdit } from "@/hooks/use-inline-edit";

// Map node type to CSS accent class
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

export function ContentListItem({
  index,
  item,
}: {
  index: number;
  item: DocContentItem;
}) {
	const { state, dispatch } = useApp();
	const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [draftItem, setDraftItem] = useState<DocContentItem>(item);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

	// Sync draft item when prop item changes (when not editing)
	useEffect(() => {
		if (!isEditing) {
			setDraftItem(item);
		}
	}, [item, isEditing]);

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("click", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

	// Use custom hook for inline editing
	const inlineEdit = useInlineEdit();

	const handleDelete = useCallback(() => {
    setMenuOpen(false);
		setDeleteConfirmOpen(true);
	}, []);

	const handleConfirmDelete = useCallback(() => {
    dispatch({
      type: "CONTENT_OP",
      payload: { type: "DELETE_ITEM", payload: { index } },
    });
	}, [dispatch, index]);

	const handleEdit = useCallback(() => {
    setMenuOpen(false);
    setDraftItem(item);
		setIsEditing(true);
	}, [item]);

	const handleSave = useCallback(() => {
    if (typeof draftItem === "string") {
      dispatch({
        type: "CONTENT_OP",
        payload: { type: "UPDATE_STRING", payload: { index, value: draftItem } },
      });
		} else if (isImageNode(draftItem)) {
      dispatch({
        type: "CONTENT_OP",
        payload: { type: "UPDATE_IMAGE_NODE", payload: { index, ...draftItem } },
      });
		} else if (isListNode(draftItem)) {
      dispatch({
        type: "CONTENT_OP",
        payload: {
          type: "UPDATE_LIST_NODE",
          payload: {
            index,
            ...(draftItem as Partial<
              import("@/types").UnorderedListNode | import("@/types").OrderedListNode
            >),
          },
        },
      });
		} else if (isTableNode(draftItem)) {
      dispatch({
        type: "CONTENT_OP",
        payload: {
          type: "UPDATE_TABLE_NODE",
          payload: { index, ...(draftItem as Partial<import("@/types").TableNode>) },
        },
      });
		} else if (isTextNode(draftItem)) {
      dispatch({
        type: "CONTENT_OP",
        payload: {
          type: "UPDATE_TEXT_NODE",
          payload: { index, text: draftItem.text, style: draftItem.style },
        },
      });
		}
		setIsEditing(false);
	}, [dispatch, index, draftItem]);

	const handleCancel = useCallback(() => {
    setDraftItem(item);
		setIsEditing(false);
	}, [item]);

  const handleMoveUp = useCallback(() => {
    setMenuOpen(false);
    if (index > 0) {
      dispatch({
        type: "CONTENT_OP",
        payload: { type: "MOVE_ITEM", payload: { from: index, to: index - 1 } },
      });
    }
  }, [dispatch, index]);

  const handleMoveDown = useCallback(() => {
    setMenuOpen(false);
    const contentLength = state.currentTemplate?.docDefinition.content.length ?? 0;
    if (index < contentLength - 1) {
      dispatch({
        type: "CONTENT_OP",
        payload: { type: "MOVE_ITEM", payload: { from: index, to: index + 1 } },
      });
    }
  }, [dispatch, index, state.currentTemplate]);

  const handleInsertAbove = useCallback(() => {
    setMenuOpen(false);
    dispatch({
      type: "CONTENT_OP",
      payload: { type: "ADD_STRING", payload: { index, value: "New paragraph" } },
    });
  }, [dispatch, index]);

	// Get node information
	const nodeTypeInfo = getNodeTypeInfo(item);
	const NodeIcon = nodeTypeInfo.icon;
	const customName = getNodeCustomName(item);
	const displayName = getNodeDisplayName(item, index);
  const hasCustomNameValue = !!customName;
	const canEditName = supportsCustomName(item);
  const accentClass = getNodeAccentClass(nodeTypeInfo.label);
  const contentLength = state.currentTemplate?.docDefinition.content.length ?? 0;

	// Name editing handlers
	const handleNameEdit = () => {
		if (!canEditName) return;
    inlineEdit.startEditing(customName || "");
	};

	const handleNameSave = (name: string) => {
		const action = createUpdateNodeNameAction(item, index, name || undefined);
		if (action) {
			dispatch(action);
		}
	};

  // Get style name for badge
  const getStyleBadge = () => {
    if (typeof item === "string") return null;
    if (isTextNode(item) && item.style) {
      return Array.isArray(item.style) ? item.style.join(", ") : item.style;
    }
    return null;
  };
  const styleBadge = getStyleBadge();

	return (
    <div
      className={`${accentClass} group rounded-lg bg-card border border-border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden`}
      data-content-index={index}
    >
      {/* Card with left accent line */}
      <div className="flex">
        {/* Left accent line */}
        <div className="w-0.5 node-border flex-shrink-0" />

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3">
            {/* Node icon */}
            <div className="flex-shrink-0 node-icon">
              <NodeIcon className="h-5 w-5" />
							</div>
				
            {/* Name section */}
            <div className="flex-1 min-w-0 group/name">
					{inlineEdit.isEditing ? (
						<input
							ref={inlineEdit.inputRef}
							type="text"
                  className="h-7 w-full rounded border border-input bg-background px-2 text-sm font-serif focus:outline-none focus:ring-2 focus:ring-ring"
							placeholder={displayName}
							value={inlineEdit.draft}
							onChange={(e) => inlineEdit.setDraft(e.target.value)}
							onBlur={() => inlineEdit.saveEditing(handleNameSave)}
							onKeyDown={(e) => inlineEdit.handleKeyDown(e, handleNameSave)}
						/>
					) : (
							<div 
                  className={`flex items-center gap-2 ${canEditName ? "cursor-pointer" : ""}`}
								onDoubleClick={handleNameEdit}
                  title={canEditName ? "Double-click to rename" : undefined}
							>
                  <span
                    className={`text-base truncate font-serif ${
                      hasCustomNameValue ? "font-normal" : "text-muted-foreground"
                    }`}
                  >
									{displayName}
								</span>
							{canEditName && (
								<button
                      className="opacity-0 group-hover/name:opacity-100 p-1 rounded hover:bg-accent transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNameEdit();
                      }}
                      title="Rename"
								>
                      <Pencil className="h-3 w-3 text-muted-foreground" />
								</button>
							)}
                </div>
              )}

              {/* Style badge */}
              {styleBadge && (
                <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full node-badge">
                  {styleBadge}
                </span>
					)}
				</div>
				
            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
					{isEditing ? (
						<>
                  <Button
                    variant="default"
                    size="sm"
										onClick={handleSave}
                    className="h-8 gap-1.5"
                  >
                    <Save className="h-3.5 w-3.5" />
                    Save
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
										onClick={handleCancel}
                    className="h-8 gap-1.5"
									>
                    <X className="h-3.5 w-3.5" />
                    Cancel
                  </Button>
						</>
					) : (
                <>
                  {/* Edit button - always visible */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleEdit}
                    className="h-8 gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Edit</span>
                  </Button>

                  {/* Kebab menu */}
                  <div className="relative" ref={menuRef}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen((v) => !v);
                      }}
                      className="h-8 w-8"
                      aria-label="More actions"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>

                    {menuOpen && (
                      <div
                        className="absolute right-0 top-full mt-1 w-48 rounded-md border border-border bg-popover shadow-lg z-50 animate-fade-in"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="py-1">
								<button
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
									onClick={handleEdit}
								>
                            <Pencil className="h-4 w-4" />
                            Edit
                          </button>
                          {canEditName && (
                            <button
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
                              onClick={() => {
                                setMenuOpen(false);
                                handleNameEdit();
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                              Rename
								</button>
					)}
							<button
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
                            onClick={handleInsertAbove}
							>
                            <Plus className="h-4 w-4" />
                            Insert above
							</button>
                        </div>

                        <div className="border-t border-border" />
					
                        <div className="py-1">
							<button
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleMoveUp}
                            disabled={index === 0}
							>
                            <ArrowUp className="h-4 w-4" />
                            Move up
							</button>
							<button
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleMoveDown}
                            disabled={index >= contentLength - 1}
							>
                            <ArrowDown className="h-4 w-4" />
                            Move down
							</button>
                        </div>

                        <div className="border-t border-border" />
					
                        <div className="py-1">
							<button
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
								onClick={handleDelete}
							>
                            <Trash2 className="h-4 w-4" />
                            Delete
							</button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
				</div>
			</div>

          {/* Content area */}
			<div 
            className={`px-4 pb-4 ${!isEditing ? "cursor-pointer" : ""}`}
				onDoubleClick={() => !isEditing && handleEdit()}
				title={!isEditing ? "Double-click to edit" : undefined}
			>
				{isEditing ? (
              // Edit Mode
              typeof draftItem === "string" ? (
						<textarea
                  className="w-full resize-y rounded-md border border-input bg-background p-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring"
							rows={3}
							value={draftItem}
							onChange={(e) => setDraftItem(e.target.value)}
						/>
					) : hasCustomFlag(draftItem) ? (
						<UnknownNodeEditor index={index} value={draftItem} />
					) : isImageNode(draftItem) ? (
						<ImageNodeItem
							data={draftItem}
							onChange={(next) => setDraftItem({ ...draftItem, ...next })}
						/>
					) : isListNode(draftItem) ? (
						<ListNodeItem
                  data={draftItem as import("@/types").ListNode}
							onChange={(next) => setDraftItem({ ...draftItem, ...next })}
						/>
					) : isTableNode(draftItem) ? (
						<TableNodeItem
                  data={draftItem as import("@/types").TableNode}
							onChange={(next) => setDraftItem({ ...draftItem, ...next })}
						/>
					) : isTextNode(draftItem) ? (
						<TextNodeItem
							text={draftItem.text}
                  styleName={
                    Array.isArray(draftItem.style)
                      ? draftItem.style.join(", ")
                      : draftItem.style
                  }
							styles={state.currentTemplate?.docDefinition.styles}
							onChangeText={(text) => setDraftItem({ ...draftItem, text })}
							onChangeStyle={(name) => setDraftItem({ ...draftItem, style: name })}
							onUpdateStyleDef={(name, def) =>
                    dispatch({
                      type: "STYLES_OP",
                      payload: { type: "UPDATE_STYLE", payload: { name, def } },
                    })
							}
						/>
					) : (
						<UnknownNodeEditor index={index} value={draftItem} />
					)
            ) : // Preview Mode
            typeof item === "string" ? (
              <div className="text-sm text-muted-foreground">
								<p className="whitespace-pre-wrap break-words line-clamp-3">
									{item || <span className="italic">Empty paragraph</span>}
								</p>
								{item.length > 150 && (
                  <span className="text-xs text-muted-foreground/60 mt-1 block">
										({item.length} characters)
									</span>
								)}
						</div>
					) : hasCustomFlag(item) ? (
						<UnknownNodePreview value={item} />
					) : isImageNode(item) ? (
						<ImageNodePreview data={item} />
					) : isListNode(item) ? (
              <ListNodePreview data={item as import("@/types").ListNode} />
					) : isTableNode(item) ? (
              <TableNodePreview data={item as import("@/types").TableNode} />
					) : isTextNode(item) ? (
						<TextNodePreview 
							text={item.text} 
                styleName={
                  Array.isArray(item.style) ? item.style.join(", ") : item.style
                }
						/>
					) : (
						<UnknownNodePreview value={item} />
				)}
          </div>
        </div>
			</div>
			
			{/* Delete Confirmation Modal */}
			<ConfirmationModal
				open={deleteConfirmOpen}
				onOpenChange={setDeleteConfirmOpen}
				title="Delete Item"
				description="Are you sure you want to delete this item? This action cannot be undone."
				confirmText="Delete"
				cancelText="Cancel"
				onConfirm={handleConfirmDelete}
				variant="destructive"
			/>
		</div>
	);
}
