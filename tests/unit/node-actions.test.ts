import { describe, it, expect } from 'vitest'
import { createUpdateNodeNameAction } from '@/utils/node-actions'
import type { DocContentItem } from '@/types'

describe('node-actions', () => {
  describe('createUpdateNodeNameAction', () => {
    it('returns null for string (paragraph)', () => {
      const result = createUpdateNodeNameAction('Hello', 0, 'My Name')
      expect(result).toBeNull()
    })

    it('creates UPDATE_TEXT_NODE action for text node', () => {
      const node = { text: 'Hello', style: 'header' }
      const result = createUpdateNodeNameAction(node, 2, 'My Text Node')

      expect(result).toEqual({
        type: 'CONTENT_OP',
        payload: {
          type: 'UPDATE_TEXT_NODE',
          payload: { index: 2, _name: 'My Text Node' },
        },
      })
    })

    it('creates UPDATE_IMAGE_NODE action for image node', () => {
      const node = { image: 'data:image/png;base64,abc', width: 100 }
      const result = createUpdateNodeNameAction(node, 5, 'Logo')

      expect(result).toEqual({
        type: 'CONTENT_OP',
        payload: {
          type: 'UPDATE_IMAGE_NODE',
          payload: { index: 5, _name: 'Logo' },
        },
      })
    })

    it('creates UPDATE_LIST_NODE action for unordered list', () => {
      const node = { ul: ['Item 1', 'Item 2'] }
      const result = createUpdateNodeNameAction(node, 1, 'Feature List')

      expect(result).toEqual({
        type: 'CONTENT_OP',
        payload: {
          type: 'UPDATE_LIST_NODE',
          payload: { index: 1, _name: 'Feature List' },
        },
      })
    })

    it('creates UPDATE_LIST_NODE action for ordered list', () => {
      const node = { ol: ['First', 'Second'] }
      const result = createUpdateNodeNameAction(node, 3, 'Steps')

      expect(result).toEqual({
        type: 'CONTENT_OP',
        payload: {
          type: 'UPDATE_LIST_NODE',
          payload: { index: 3, _name: 'Steps' },
        },
      })
    })

    it('creates UPDATE_TABLE_NODE action for table node', () => {
      const node = {
        table: {
          body: [
            ['Header 1', 'Header 2'],
            ['Cell 1', 'Cell 2'],
          ],
        },
      }
      const result = createUpdateNodeNameAction(node, 0, 'Data Table')

      expect(result).toEqual({
        type: 'CONTENT_OP',
        payload: {
          type: 'UPDATE_TABLE_NODE',
          payload: { index: 0, _name: 'Data Table' },
        },
      })
    })

    it('handles undefined name (clearing the name)', () => {
      const node = { text: 'Hello', _name: 'Old Name' }
      const result = createUpdateNodeNameAction(node, 0, undefined)

      expect(result).toEqual({
        type: 'CONTENT_OP',
        payload: {
          type: 'UPDATE_TEXT_NODE',
          payload: { index: 0, _name: undefined },
        },
      })
    })

    it('handles empty string name', () => {
      const node = { text: 'Hello' }
      const result = createUpdateNodeNameAction(node, 0, '')

      expect(result).toEqual({
        type: 'CONTENT_OP',
        payload: {
          type: 'UPDATE_TEXT_NODE',
          payload: { index: 0, _name: '' },
        },
      })
    })

    it('returns null for unknown node types', () => {
      // Canvas node without image/text/list/table
      const node = { canvas: [{ type: 'rect' }] }
      const result = createUpdateNodeNameAction(node as unknown as DocContentItem, 0, 'Name')
      expect(result).toBeNull()
    })

    it('returns null for custom nodes', () => {
      const node = { _custom: true, someData: 'value' }
      const result = createUpdateNodeNameAction(node as unknown as DocContentItem, 0, 'Name')
      expect(result).toBeNull()
    })

    it('preserves the correct index in payload', () => {
      const node = { text: 'Hello' }
      
      const result0 = createUpdateNodeNameAction(node, 0, 'Name')
      expect(result0?.payload.payload.index).toBe(0)

      const result5 = createUpdateNodeNameAction(node, 5, 'Name')
      expect(result5?.payload.payload.index).toBe(5)

      const result99 = createUpdateNodeNameAction(node, 99, 'Name')
      expect(result99?.payload.payload.index).toBe(99)
    })
  })
})

