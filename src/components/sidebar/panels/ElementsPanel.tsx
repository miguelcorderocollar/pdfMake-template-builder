"use client";

import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/app-context";
import { getNodeTypeInfoByName } from "@/utils/node-info";

export function ElementsPanel() {
  const { dispatch } = useApp();
  
  // Get type info for each node type (with border colors)
  const paragraphInfo = getNodeTypeInfoByName('paragraph');
  const textInfo = getNodeTypeInfoByName('text');
  const imageInfo = getNodeTypeInfoByName('image');
  const listInfo = getNodeTypeInfoByName('list');
  const tableInfo = getNodeTypeInfoByName('table');
  const unknownInfo = getNodeTypeInfoByName('unknown');
  const ParagraphIcon = paragraphInfo.icon;
  const TextIcon = textInfo.icon;
  const ImageIcon = imageInfo.icon;
  const ListIcon = listInfo.icon;
  const TableIcon = tableInfo.icon;
  const UnknownIcon = unknownInfo.icon;
  
  return (
    <div>
      <h3 className="font-medium mb-3">Element Palette</h3>
      <div className="grid gap-2">
        <Button
          variant="outline"
          className={`justify-start gap-2 border-l-4 ${paragraphInfo.borderColor}`}
          onClick={() => dispatch({ type: 'CONTENT_OP', payload: { type: 'ADD_STRING', payload: { value: 'New paragraph' } } })}
        >
          <ParagraphIcon className={`h-4 w-4 ${paragraphInfo.iconColor}`} data-darkreader-ignore suppressHydrationWarning />
          <span>Paragraph</span>
        </Button>
        <Button
          variant="outline"
          className={`justify-start gap-2 border-l-4 ${textInfo.borderColor}`}
          onClick={() => dispatch({ type: 'CONTENT_OP', payload: { type: 'ADD_TEXT_NODE', payload: { text: 'New text', style: undefined } } })}
        >
          <TextIcon className={`h-4 w-4 ${textInfo.iconColor}`} data-darkreader-ignore suppressHydrationWarning />
          <span>Text Node</span>
        </Button>
        <Button
          variant="outline"
          className={`justify-start gap-2 border-l-4 ${imageInfo.borderColor}`}
          onClick={() => dispatch({ type: 'CONTENT_OP', payload: { type: 'ADD_IMAGE_NODE', payload: { image: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==', opacity: 1 } } })}
        >
          <ImageIcon className={`h-4 w-4 ${imageInfo.iconColor}`} data-darkreader-ignore suppressHydrationWarning />
          <span>Image</span>
        </Button>
        <Button
          variant="outline"
          className={`justify-start gap-2 border-l-4 ${listInfo.borderColor}`}
          onClick={() => dispatch({ type: 'CONTENT_OP', payload: { type: 'ADD_LIST_NODE', payload: { ul: ['item 1', 'item 2', 'item 3'] } } })}
        >
          <ListIcon className={`h-4 w-4 ${listInfo.iconColor}`} data-darkreader-ignore suppressHydrationWarning />
          <span>List</span>
        </Button>
        <Button
          variant="outline"
          className={`justify-start gap-2 border-l-4 ${tableInfo.borderColor}`}
          onClick={() => dispatch({ type: 'CONTENT_OP', payload: { type: 'ADD_TABLE_NODE', payload: { table: { body: [['A1','B1','C1'], ['A2','B2','C2']] } } } })}
        >
          <TableIcon className={`h-4 w-4 ${tableInfo.iconColor}`} data-darkreader-ignore suppressHydrationWarning />
          <span>Table</span>
        </Button>
        <Button
          variant="outline"
          className={`justify-start gap-2 border-l-4 ${unknownInfo.borderColor}`}
          onClick={() => dispatch({ type: 'CONTENT_OP', payload: { type: 'ADD_CUSTOM_NODE', payload: { content: {} } } })}
        >
          <UnknownIcon className={`h-4 w-4 ${unknownInfo.iconColor}`} data-darkreader-ignore suppressHydrationWarning />
          <span>Custom Node</span>
        </Button>
      </div>
    </div>
  );
}


