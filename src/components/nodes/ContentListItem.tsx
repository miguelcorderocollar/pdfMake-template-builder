"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { useApp } from "@/lib/app-context";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { ParagraphItem } from "@/components/nodes/ParagraphItem";
import { TextNodeItem } from "@/components/nodes/TextNodeItem";
import { ImageNodeItem } from "@/components/nodes/ImageNodeItem";
import { ListNodeItem } from "@/components/nodes/ListNodeItem";
import { TableNodeItem } from "@/components/nodes/TableNodeItem";
import { UnknownNodeEditor } from "@/components/nodes/UnknownNodeEditor";
import type { DocContentItem } from "@/types";
import {
  isImageNode,
  isTextNode,
  isListNode,
  isTableNode,
  hasCustomFlag,
} from "@/utils/node-type-guards";

export function ContentListItem({ index, item }: { index: number; item: DocContentItem }) {
	const { state, dispatch } = useApp();
	const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

	const handleDelete = () => {
		setDeleteConfirmOpen(true);
	};

	const handleConfirmDelete = () => {
		dispatch({ type: 'CONTENT_OP', payload: { type: 'DELETE_ITEM', payload: { index } } });
	};

	return (<>
		<div className="group rounded-lg border bg-card text-card-foreground shadow-sm">
			<div className="flex items-start gap-3 p-3 border-b bg-muted/30">
				<div className="flex-1">
					<div className="text-xs font-medium text-muted-foreground">Item {index + 1}</div>
				</div>
				<div className="flex items-center gap-1">
					<button
						className="h-7 w-7 inline-flex items-center justify-center rounded border bg-background"
						onClick={() => index > 0 && dispatch({ type: 'CONTENT_OP', payload: { type: 'MOVE_ITEM', payload: { from: index, to: index - 1 } } })}
						title="Move up"
					>
						<ArrowUp className="h-3 w-3" data-darkreader-ignore suppressHydrationWarning />
					</button>
					<button
						className="h-7 w-7 inline-flex items-center justify-center rounded border bg-background"
						onClick={() => index < (state.currentTemplate!.docDefinition.content.length - 1) && dispatch({ type: 'CONTENT_OP', payload: { type: 'MOVE_ITEM', payload: { from: index, to: index + 1 } } })}
						title="Move down"
					>
						<ArrowDown className="h-3 w-3" data-darkreader-ignore suppressHydrationWarning />
					</button>
					<button
						className="h-7 w-7 inline-flex items-center justify-center rounded border bg-background"
						onClick={() => dispatch({ type: 'CONTENT_OP', payload: { type: 'ADD_STRING', payload: { index, value: 'New paragraph' } } })}
						title="Insert above"
					>
						+
					</button>
					<button
						className="h-7 w-7 inline-flex items-center justify-center rounded border bg-background text-destructive"
						onClick={handleDelete}
						title="Delete"
					>
						<Trash2 className="h-3 w-3" data-darkreader-ignore suppressHydrationWarning />
					</button>
				</div>
			</div>
			<div className="p-3">
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
