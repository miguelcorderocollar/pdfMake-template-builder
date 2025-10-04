"use client";

import { useState, useCallback, useEffect } from "react";
import { ArrowDown, ArrowUp, Trash2, Plus, Pencil, Edit3, Save, X } from "lucide-react";
import { useApp } from "@/lib/app-context";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
import { isImageNode, isTextNode, isListNode, isTableNode, hasCustomFlag } from "@/utils/node-type-guards";
import { getNodeTypeInfo, getNodeCustomName, getNodeDisplayName, supportsCustomName } from "@/utils/node-info";
import { createUpdateNodeNameAction } from "@/utils/node-actions";
import { useInlineEdit } from "@/hooks/use-inline-edit";

export function ContentListItem({ index, item }: { index: number; item: DocContentItem }) {
	const { state, dispatch } = useApp();
	const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [draftItem, setDraftItem] = useState<DocContentItem>(item);

	// Sync draft item when prop item changes (when not editing)
	useEffect(() => {
		if (!isEditing) {
			setDraftItem(item);
		}
	}, [item, isEditing]);

	// Use custom hook for inline editing
	const inlineEdit = useInlineEdit();

	const handleDelete = useCallback(() => {
		setDeleteConfirmOpen(true);
	}, []);

	const handleConfirmDelete = useCallback(() => {
		dispatch({ type: 'CONTENT_OP', payload: { type: 'DELETE_ITEM', payload: { index } } });
	}, [dispatch, index]);

	const handleEdit = useCallback(() => {
		setDraftItem(item); // Reset draft to current item
		setIsEditing(true);
	}, [item]);

	const handleSave = useCallback(() => {
		// Dispatch the changes based on node type
		if (typeof draftItem === 'string') {
			dispatch({ type: 'CONTENT_OP', payload: { type: 'UPDATE_STRING', payload: { index, value: draftItem } } });
		} else if (isImageNode(draftItem)) {
			dispatch({ type: 'CONTENT_OP', payload: { type: 'UPDATE_IMAGE_NODE', payload: { index, ...draftItem } } });
		} else if (isListNode(draftItem)) {
			dispatch({ type: 'CONTENT_OP', payload: { type: 'UPDATE_LIST_NODE', payload: { index, ...(draftItem as Partial<import("@/types").UnorderedListNode> | Partial<import("@/types").OrderedListNode>) } } });
		} else if (isTableNode(draftItem)) {
			dispatch({ type: 'CONTENT_OP', payload: { type: 'UPDATE_TABLE_NODE', payload: { index, ...(draftItem as Partial<import("@/types").TableNode>) } } });
		} else if (isTextNode(draftItem)) {
			dispatch({ type: 'CONTENT_OP', payload: { type: 'UPDATE_TEXT_NODE', payload: { index, text: draftItem.text, style: draftItem.style } } });
		}
		setIsEditing(false);
	}, [dispatch, index, draftItem]);

	const handleCancel = useCallback(() => {
		setDraftItem(item); // Reset draft
		setIsEditing(false);
	}, [item]);

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

	return (
		<TooltipProvider>
			<div className={`group rounded-lg border border-border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow border-l-4 ${nodeTypeInfo.borderColor}`} data-content-index={index}>
				<div className={"flex items-start gap-3 p-3 border-b bg-muted/30"}>
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
					{isEditing ? (
						<>
							<Tooltip>
								<TooltipTrigger asChild>
									<button
										className="h-8 px-3 inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
										onClick={handleSave}
									>
										<Save className="h-4 w-4" data-darkreader-ignore suppressHydrationWarning />
										<span className="text-xs font-medium">Save</span>
									</button>
								</TooltipTrigger>
								<TooltipContent>
									<p>Save changes</p>
								</TooltipContent>
							</Tooltip>
							
							<Tooltip>
								<TooltipTrigger asChild>
									<button
										className="h-8 px-3 inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
										onClick={handleCancel}
									>
										<X className="h-4 w-4" data-darkreader-ignore suppressHydrationWarning />
										<span className="text-xs font-medium">Cancel</span>
									</button>
								</TooltipTrigger>
								<TooltipContent>
									<p>Discard changes</p>
								</TooltipContent>
							</Tooltip>
						</>
					) : (
						<Tooltip>
							<TooltipTrigger asChild>
								<button
									className="h-8 px-3 inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
									onClick={handleEdit}
								>
									<Edit3 className="h-4 w-4" data-darkreader-ignore suppressHydrationWarning />
									<span className="text-xs font-medium">Edit</span>
								</button>
							</TooltipTrigger>
							<TooltipContent>
								<p>Edit this item</p>
							</TooltipContent>
						</Tooltip>
					)}
					
					<div className="w-px h-6 bg-border mx-1" />
					
					<Tooltip>
						<TooltipTrigger asChild>
							<button
								className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
								onClick={() => index > 0 && dispatch({ type: 'CONTENT_OP', payload: { type: 'MOVE_ITEM', payload: { from: index, to: index - 1 } } })}
								disabled={index === 0 || isEditing}
							>
								<ArrowUp className="h-4 w-4" data-darkreader-ignore suppressHydrationWarning />
							</button>
						</TooltipTrigger>
						<TooltipContent>
							<p>Move up</p>
						</TooltipContent>
					</Tooltip>
					
					<Tooltip>
						<TooltipTrigger asChild>
							<button
								className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
								onClick={() => index < (state.currentTemplate!.docDefinition.content.length - 1) && dispatch({ type: 'CONTENT_OP', payload: { type: 'MOVE_ITEM', payload: { from: index, to: index + 1 } } })}
								disabled={index >= state.currentTemplate!.docDefinition.content.length - 1 || isEditing}
							>
								<ArrowDown className="h-4 w-4" data-darkreader-ignore suppressHydrationWarning />
							</button>
						</TooltipTrigger>
						<TooltipContent>
							<p>Move down</p>
						</TooltipContent>
					</Tooltip>
					
					<div className="w-px h-6 bg-border mx-1" />
					
					<Tooltip>
						<TooltipTrigger asChild>
							<button
								className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
								onClick={() => dispatch({ type: 'CONTENT_OP', payload: { type: 'ADD_STRING', payload: { index, value: 'New paragraph' } } })}
								disabled={isEditing}
							>
								<Plus className="h-4 w-4" data-darkreader-ignore suppressHydrationWarning />
							</button>
						</TooltipTrigger>
						<TooltipContent>
							<p>Insert new item above</p>
						</TooltipContent>
					</Tooltip>
					
					<Tooltip>
						<TooltipTrigger asChild>
							<button
								className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-border bg-background hover:bg-destructive hover:text-destructive-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
								onClick={handleDelete}
								disabled={isEditing}
							>
								<Trash2 className="h-4 w-4" data-darkreader-ignore suppressHydrationWarning />
							</button>
						</TooltipTrigger>
						<TooltipContent>
							<p>Delete item</p>
						</TooltipContent>
					</Tooltip>
				</div>
			</div>
			<div 
				className={`p-4 ${!isEditing ? 'cursor-pointer hover:bg-accent/10 transition-colors' : ''}`}
				onDoubleClick={() => !isEditing && handleEdit()}
				title={!isEditing ? "Double-click to edit" : undefined}
			>
				{isEditing ? (
					// Edit Mode - Full editors
					typeof draftItem === 'string' ? (
						<textarea
							className="w-full resize-y rounded-md border border-input bg-background p-3 leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
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
							data={draftItem as unknown as import("@/types").ListNode}
							onChange={(next) => setDraftItem({ ...draftItem, ...next })}
						/>
					) : isTableNode(draftItem) ? (
						<TableNodeItem
							data={draftItem as unknown as import("@/types").TableNode}
							onChange={(next) => setDraftItem({ ...draftItem, ...next })}
						/>
					) : isTextNode(draftItem) ? (
						<TextNodeItem
							text={draftItem.text}
							styleName={Array.isArray(draftItem.style) ? draftItem.style.join(', ') : draftItem.style}
							styles={state.currentTemplate?.docDefinition.styles}
							onChangeText={(text) => setDraftItem({ ...draftItem, text })}
							onChangeStyle={(name) => setDraftItem({ ...draftItem, style: name })}
							onUpdateStyleDef={(name, def) =>
								dispatch({ type: 'STYLES_OP', payload: { type: 'UPDATE_STYLE', payload: { name, def } } })
							}
						/>
					) : (
						<UnknownNodeEditor index={index} value={draftItem} />
					)
				) : (
					// Preview Mode - Compact view
					typeof item === 'string' ? (
						<div className="text-sm text-muted-foreground relative group">
							<div className="p-3 rounded-md bg-muted/20 border border-dashed">
								<p className="whitespace-pre-wrap break-words line-clamp-3">
									{item || <span className="italic">Empty paragraph</span>}
								</p>
								{item.length > 150 && (
									<span className="text-xs text-muted-foreground/60 mt-2 block">
										({item.length} characters)
									</span>
								)}
							</div>
						</div>
					) : hasCustomFlag(item) ? (
						<UnknownNodePreview value={item} />
					) : isImageNode(item) ? (
						<ImageNodePreview data={item} />
					) : isListNode(item) ? (
						<ListNodePreview data={item as unknown as import("@/types").ListNode} />
					) : isTableNode(item) ? (
						<TableNodePreview data={item as unknown as import("@/types").TableNode} />
					) : isTextNode(item) ? (
						<TextNodePreview 
							text={item.text} 
							styleName={Array.isArray(item.style) ? item.style.join(', ') : item.style}
						/>
					) : (
						<UnknownNodePreview value={item} />
					)
				)}
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
		</TooltipProvider>
	);
}
