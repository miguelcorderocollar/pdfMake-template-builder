import { describe, it, expect } from 'vitest'
import {
  isImageNode,
  isTextNode,
  isListNode,
  isTableNode,
  hasCustomFlag,
  isTextSpanArray,
} from '@/utils/node-type-guards'

describe('node-type-guards', () => {
  describe('isImageNode', () => {
    it('returns true for valid image node', () => {
      const node = { image: 'data:image/png;base64,abc123', width: 100 }
      expect(isImageNode(node)).toBe(true)
    })

    it('returns true for image node with all properties', () => {
      const node = {
        image: 'https://example.com/image.png',
        width: 200,
        height: 150,
        fit: [100, 100] as [number, number],
        opacity: 0.5,
      }
      expect(isImageNode(node)).toBe(true)
    })

    it('returns false for text node', () => {
      const node = { text: 'Hello' }
      expect(isImageNode(node)).toBe(false)
    })

    it('returns false for string', () => {
      expect(isImageNode('Hello')).toBe(false)
    })

    it('returns false for list node', () => {
      const node = { ul: ['a', 'b'] }
      expect(isImageNode(node)).toBe(false)
    })

    it('returns false for table node', () => {
      const node = { table: { body: [['a']] } }
      expect(isImageNode(node)).toBe(false)
    })
  })

  describe('isTextNode', () => {
    it('returns true for simple text node', () => {
      const node = { text: 'Hello, World!' }
      expect(isTextNode(node)).toBe(true)
    })

    it('returns true for text node with style', () => {
      const node = { text: 'Styled text', style: 'header' }
      expect(isTextNode(node)).toBe(true)
    })

    it('returns true for text node with array of styles', () => {
      const node = { text: 'Multi-styled', style: ['bold', 'header'] }
      expect(isTextNode(node)).toBe(true)
    })

    it('returns true for text node with spans', () => {
      const node = {
        text: [
          'Plain text',
          { text: 'Bold', bold: true },
        ],
      }
      expect(isTextNode(node)).toBe(true)
    })

    it('returns false for string', () => {
      expect(isTextNode('Hello')).toBe(false)
    })

    it('returns false for image node', () => {
      const node = { image: 'data:image/png;base64,abc' }
      expect(isTextNode(node)).toBe(false)
    })

    it('returns false for list node', () => {
      const node = { ul: ['a', 'b'] }
      expect(isTextNode(node)).toBe(false)
    })
  })

  describe('isListNode', () => {
    it('returns true for unordered list', () => {
      const node = { ul: ['Item 1', 'Item 2', 'Item 3'] }
      expect(isListNode(node)).toBe(true)
    })

    it('returns true for ordered list', () => {
      const node = { ol: ['First', 'Second', 'Third'] }
      expect(isListNode(node)).toBe(true)
    })

    it('returns true for unordered list with type', () => {
      const node = { ul: ['a', 'b'], type: 'square' as const }
      expect(isListNode(node)).toBe(true)
    })

    it('returns true for ordered list with type and start', () => {
      const node = { ol: ['a', 'b'], type: 'lower-alpha' as const, start: 3 }
      expect(isListNode(node)).toBe(true)
    })

    it('returns false for string', () => {
      expect(isListNode('Hello')).toBe(false)
    })

    it('returns false for text node', () => {
      const node = { text: 'Hello' }
      expect(isListNode(node)).toBe(false)
    })

    it('returns false for image node', () => {
      const node = { image: 'data:image/png;base64,abc' }
      expect(isListNode(node)).toBe(false)
    })

    it('returns false for table node', () => {
      const node = { table: { body: [['a']] } }
      expect(isListNode(node)).toBe(false)
    })
  })

  describe('isTableNode', () => {
    it('returns true for simple table', () => {
      const node = {
        table: {
          body: [
            ['Header 1', 'Header 2'],
            ['Cell 1', 'Cell 2'],
          ],
        },
      }
      expect(isTableNode(node)).toBe(true)
    })

    it('returns true for table with layout', () => {
      const node = {
        table: {
          body: [['A', 'B']],
          headerRows: 1,
        },
        layout: 'lightHorizontalLines' as const,
      }
      expect(isTableNode(node)).toBe(true)
    })

    it('returns true for table with widths', () => {
      const node = {
        table: {
          body: [['A', 'B']],
          widths: ['*', 'auto'],
        },
      }
      expect(isTableNode(node)).toBe(true)
    })

    it('returns false for string', () => {
      expect(isTableNode('Hello')).toBe(false)
    })

    it('returns false for text node', () => {
      const node = { text: 'Hello' }
      expect(isTableNode(node)).toBe(false)
    })

    it('returns false for list node', () => {
      const node = { ul: ['a', 'b'] }
      expect(isTableNode(node)).toBe(false)
    })

    it('returns false for image node', () => {
      const node = { image: 'data:image/png;base64,abc' }
      expect(isTableNode(node)).toBe(false)
    })
  })

  describe('hasCustomFlag', () => {
    it('returns true for object with _custom flag', () => {
      const node = { _custom: true, someData: 'value' }
      expect(hasCustomFlag(node)).toBe(true)
    })

    it('returns true for _custom with any value', () => {
      const node = { _custom: 'yes' }
      expect(hasCustomFlag(node)).toBe(true)
    })

    it('returns false for object without _custom', () => {
      const node = { text: 'Hello' }
      expect(hasCustomFlag(node)).toBe(false)
    })

    it('returns false for string', () => {
      expect(hasCustomFlag('Hello')).toBe(false)
    })

    it('returns false for null-like values in content', () => {
      // Test that it handles DocContentItem types properly
      const stringNode = 'Just a string'
      expect(hasCustomFlag(stringNode)).toBe(false)
    })
  })

  describe('isTextSpanArray', () => {
    it('returns true for array of strings', () => {
      const spans = ['Hello', 'World']
      expect(isTextSpanArray(spans)).toBe(true)
    })

    it('returns true for array of span objects', () => {
      const spans = [
        { text: 'Bold', bold: true },
        { text: 'Italic', italics: true },
      ]
      expect(isTextSpanArray(spans)).toBe(true)
    })

    it('returns true for mixed array', () => {
      const spans = [
        'Plain text',
        { text: 'Bold', bold: true },
        'More plain text',
      ]
      expect(isTextSpanArray(spans)).toBe(true)
    })

    it('returns true for empty array', () => {
      expect(isTextSpanArray([])).toBe(true)
    })

    it('returns false for plain string', () => {
      expect(isTextSpanArray('Hello')).toBe(false)
    })
  })
})

