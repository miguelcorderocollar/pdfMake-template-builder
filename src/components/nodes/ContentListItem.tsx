"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Trash2, Plus, Pencil } from "lucide-react";
import { useApp } from "@/lib/app-context";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ParagraphItem } from "@/components/nodes/ParagraphItem";
import { TextNodeItem } from "@/components/nodes/TextNodeItem";
import { ImageNodeItem } from "@/components/nodes/ImageNodeItem";
import { ListNodeItem } from "@/components/nodes/ListNodeItem";
import { TableNodeItem } from "@/components/nodes/TableNodeItem";
import { UnknownNodeEditor } from "@/components/nodes/UnknownNodeEditor";
import type { DocContentItem } from "@/types";
import { isImageNode, isTextNode, isListNode, isTableNode, hasCustomFlag } from "@/utils/node-type-guards";
import { getNodeTypeInfo, getNodeCustomName, getNodeDisplayName, supportsCustomName } from "@/utils/node-info";
import { createUpdateNodeNameAction } from "@/utils/node-actions";
import { useInlineEdit } from "@/hooks/use-inline-edit";

export function ContentListItem({ index, item }: { index: number; item: DocContentItem }) {
	const { state, dispatch } = useApp();
	const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

	// Use custom hook for inline editing
	const inlineEdit = useInlineEdit();

	const handleDelete = () => {
		setDeleteConfirmOpen(true);
	};

	const handleConfirmDelete = () => {
		dispatch({ type: 'CONTENT_OP', payload: { type: 'DELETE_ITEM', payload: { index } } });
	};

	// Get node information
	const nodeTypeInfo = getNodeTypeInfo(item);
	const NodeIcon = nodeTypeInfo.icon;
	const customName = getNodeCustomName(item);
	const displayName = getNodeDisplayName(item, index);
	const hasCustomName = !!customName;
	const canEditName = supportsCustomName(item);

	// Name editing handlers
	const handleNameEdit = () => {
		if (!canEditName) return;
		inlineEdit.startEditing(customName || '');
	};

	const handleNameSave = (name: string) => {
		const action = createUpdateNodeNameAction(item, index, name || undefined);
		if (action) {
			dispatch(action);
		}
	};

	return (<>
		<div className={`group rounded-lg border border-border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow border-l-4 ${nodeTypeInfo.borderColor}`} data-content-index={index}>
			<div className={"flex items-start gap-3 p-3 border-b bg-muted/30"}>
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<div className="flex flex-col items-center gap-1">
								<NodeIcon className={`h-5 w-5 ${nodeTypeInfo.iconColor}`} data-darkreader-ignore suppressHydrationWarning />
								<span className="text-[10px] font-medium text-muted-foreground">#{index + 1}</span>
							</div>
						</TooltipTrigger>
						<TooltipContent>
							<p>{nodeTypeInfo.label}</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
				
				<div className="flex items-center gap-1 flex-1 min-w-0 group/name">
					{inlineEdit.isEditing ? (
						<input
							ref={inlineEdit.inputRef}
							type="text"
							className="h-7 flex-1 min-w-0 rounded border border-input bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
							placeholder={displayName}
							value={inlineEdit.draft}
							onChange={(e) => inlineEdit.setDraft(e.target.value)}
							onBlur={() => inlineEdit.saveEditing(handleNameSave)}
							onKeyDown={(e) => inlineEdit.handleKeyDown(e, handleNameSave)}
						/>
					) : (
						<>
							<div 
								className={`flex-1 min-w-0 rounded px-2 py-1 -mx-2 transition-colors ${canEditName ? 'cursor-pointer hover:bg-accent/30' : ''}`}
								onDoubleClick={handleNameEdit}
								title={canEditName ? "Double-click to edit name" : undefined}
							>
								<span className={`text-xs truncate block ${hasCustomName ? 'font-medium' : 'text-muted-foreground italic'}`}>
									{displayName}
								</span>
							</div>
							{canEditName && (
								<button
									className="opacity-0 group-hover/name:opacity-100 h-6 w-6 inline-flex items-center justify-center rounded hover:bg-accent transition-all"
									onClick={handleNameEdit}
									title="Edit name"
								>
									<Pencil className="h-3 w-3" />
								</button>
							)}
						</>
					)}
				</div>
				
				<div className="flex items-center gap-1">
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<button
									className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
									onClick={() => index > 0 && dispatch({ type: 'CONTENT_OP', payload: { type: 'MOVE_ITEM', payload: { from: index, to: index - 1 } } })}
									disabled={index === 0}
								>
									<ArrowUp className="h-4 w-4" data-darkreader-ignore suppressHydrationWarning />
								</button>
							</TooltipTrigger>
							<TooltipContent>
								<p>Move up</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
					
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<button
									className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
									onClick={() => index < (state.currentTemplate!.docDefinition.content.length - 1) && dispatch({ type: 'CONTENT_OP', payload: { type: 'MOVE_ITEM', payload: { from: index, to: index + 1 } } })}
									disabled={index >= state.currentTemplate!.docDefinition.content.length - 1}
								>
									<ArrowDown className="h-4 w-4" data-darkreader-ignore suppressHydrationWarning />
								</button>
							</TooltipTrigger>
							<TooltipContent>
								<p>Move down</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
					
					<div className="w-px h-6 bg-border mx-1" />
					
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<button
									className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
									onClick={() => dispatch({ type: 'CONTENT_OP', payload: { type: 'ADD_STRING', payload: { index, value: 'New paragraph' } } })}
								>
									<Plus className="h-4 w-4" data-darkreader-ignore suppressHydrationWarning />
								</button>
							</TooltipTrigger>
							<TooltipContent>
								<p>Insert new item above</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
					
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<button
									className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-border bg-background hover:bg-destructive hover:text-destructive-foreground transition-colors"
									onClick={handleDelete}
								>
									<Trash2 className="h-4 w-4" data-darkreader-ignore suppressHydrationWarning />
								</button>
							</TooltipTrigger>
							<TooltipContent>
								<p>Delete item</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
			</div>
			<div className="p-4">
				{typeof item === 'string' ? (
					<ParagraphItem
						value={item}
						onChange={(value) =>
							dispatch({ type: 'CONTENT_OP', payload: { type: 'UPDATE_STRING', payload: { index, value } } })
						}
					/>
				) : hasCustomFlag(item) ? (
					<UnknownNodeEditor index={index} value={item} />
				) : isImageNode(item) ? (
					<ImageNodeItem
						data={item}
						onChange={(next) =>
							dispatch({ type: 'CONTENT_OP', payload: { type: 'UPDATE_IMAGE_NODE', payload: { index, ...next } } })
						}
					/>
				) : isListNode(item) ? (
					<ListNodeItem
						data={item as unknown as import("@/types").ListNode}
						onChange={(next) =>
							dispatch({ type: 'CONTENT_OP', payload: { type: 'UPDATE_LIST_NODE', payload: { index, ...(next as Partial<import("@/types").UnorderedListNode> | Partial<import("@/types").OrderedListNode>) } } })
						}
					/>
				) : isTableNode(item) ? (
					<TableNodeItem
						data={item as unknown as import("@/types").TableNode}
						onChange={(next) =>
							dispatch({ type: 'CONTENT_OP', payload: { type: 'UPDATE_TABLE_NODE', payload: { index, ...(next as Partial<import("@/types").TableNode>) } } })
						}
					/>
				) : isTextNode(item) ? (
					<TextNodeItem
						text={item.text}
						styleName={Array.isArray(item.style) ? item.style.join(', ') : item.style}
						styles={state.currentTemplate?.docDefinition.styles}
						onChangeText={(text) =>
							dispatch({ type: 'CONTENT_OP', payload: { type: 'UPDATE_TEXT_NODE', payload: { index, text } } })
						}
						onChangeStyle={(name) =>
							dispatch({ type: 'CONTENT_OP', payload: { type: 'UPDATE_TEXT_NODE', payload: { index, style: name } } })
						}
						onUpdateStyleDef={(name, def) =>
							dispatch({ type: 'STYLES_OP', payload: { type: 'UPDATE_STYLE', payload: { name, def } } })
						}
					/>
				) : (
					<UnknownNodeEditor index={index} value={item} />
				)}
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
	</>);
}
