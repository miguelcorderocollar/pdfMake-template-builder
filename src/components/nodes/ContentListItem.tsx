"use client";

import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { useApp } from "@/lib/app-context";
import { ParagraphItem } from "@/components/nodes/ParagraphItem";
import { TextNodeItem } from "@/components/nodes/TextNodeItem";
import { ImageNodeItem } from "@/components/nodes/ImageNodeItem";
import { ListNodeItem } from "@/components/nodes/ListNodeItem";
import { TableNodeItem } from "@/components/nodes/TableNodeItem";
import type { DocContentItem } from "@/types";

function isImageNode(item: DocContentItem): item is { image: string; width?: number; height?: number; fit?: [number, number]; opacity?: number } {
  return typeof item === 'object' && item !== null && 'image' in (item as Record<string, unknown>);
}

function isTextNode(item: DocContentItem): item is { text: string; style?: string | string[] } {
  return typeof item === 'object' && item !== null && 'text' in (item as Record<string, unknown>);
}

function isListNode(item: DocContentItem): item is ({ ul: Array<string>; type?: 'square' | 'circle' | 'none'; color?: string; markerColor?: string } | { ol: Array<string>; type?: 'lower-alpha' | 'upper-alpha' | 'upper-roman' | 'lower-roman' | 'none'; start?: number; reversed?: boolean; separator?: string | [string, string]; color?: string; markerColor?: string }) {
  return typeof item === 'object' && item !== null && (( 'ul' in (item as Record<string, unknown>) ) || ( 'ol' in (item as Record<string, unknown>) ));
}

function isTableNode(item: DocContentItem): item is import("@/types").TableNode {
  return typeof item === 'object' && item !== null && ('table' in (item as Record<string, unknown>));
}

export function ContentListItem({ index, item }: { index: number; item: DocContentItem }) {
	const { state, dispatch } = useApp();
	return (
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
						onClick={() => {
							if (confirm('Delete this item?')) {
								dispatch({ type: 'CONTENT_OP', payload: { type: 'DELETE_ITEM', payload: { index } } });
							}
						}}
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
					) : (
						isImageNode(item) ? (
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
						) : (
						isTextNode(item) ? (
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
						) : null
						)
					)}
				</div>
		</div>
	);
}
