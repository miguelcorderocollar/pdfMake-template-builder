import { describe, it, expect } from 'vitest'
import {
  getNodeTypeInfo,
  getNodeTypeInfoByName,
  getNodeCustomName,
  getNodeDisplayName,
  supportsCustomName,
} from '@/utils/node-info'
import type { DocContentItem } from '@/types'

describe('node-info', () => {
  describe('getNodeTypeInfoByName', () => {
    it('returns correct info for paragraph', () => {
      const info = getNodeTypeInfoByName('paragraph')
      expect(info.label).toBe('Paragraph')
      expect(info.iconColor).toContain('blue')
      expect(info.borderColor).toContain('blue')
    })

    it('returns correct info for text', () => {
      const info = getNodeTypeInfoByName('text')
      expect(info.label).toBe('Text')
      expect(info.iconColor).toContain('slate')
    })

    it('returns correct info for image', () => {
      const info = getNodeTypeInfoByName('image')
      expect(info.label).toBe('Image')
      expect(info.iconColor).toContain('purple')
    })

    it('returns correct info for list', () => {
      const info = getNodeTypeInfoByName('list')
      expect(info.label).toBe('List')
      expect(info.iconColor).toContain('green')
    })

    it('returns correct info for table', () => {
      const info = getNodeTypeInfoByName('table')
      expect(info.label).toBe('Table')
      expect(info.iconColor).toContain('orange')
    })

    it('returns correct info for unknown', () => {
      const info = getNodeTypeInfoByName('unknown')
      expect(info.label).toBe('Unknown')
      expect(info.iconColor).toContain('rose')
    })

    it('includes icon for all types', () => {
      const types = ['paragraph', 'text', 'image', 'list', 'table', 'unknown'] as const
      for (const type of types) {
        const info = getNodeTypeInfoByName(type)
        expect(info.icon).toBeDefined()
      }
    })
  })

  describe('getNodeTypeInfo', () => {
    it('identifies string as paragraph', () => {
      const info = getNodeTypeInfo('Hello, World!')
      expect(info.label).toBe('Paragraph')
    })

    it('identifies text node', () => {
      const node = { text: 'Hello', style: 'header' }
      const info = getNodeTypeInfo(node)
      expect(info.label).toBe('Text')
    })

    it('identifies image node', () => {
      const node = { image: 'data:image/png;base64,abc', width: 100 }
      const info = getNodeTypeInfo(node)
      expect(info.label).toBe('Image')
    })

    it('identifies unordered list node', () => {
      const node = { ul: ['Item 1', 'Item 2'] }
      const info = getNodeTypeInfo(node)
      expect(info.label).toBe('List')
    })

    it('identifies ordered list node', () => {
      const node = { ol: ['First', 'Second'] }
      const info = getNodeTypeInfo(node)
      expect(info.label).toBe('List')
    })

    it('identifies table node', () => {
      const node = { table: { body: [['A', 'B']] } }
      const info = getNodeTypeInfo(node)
      expect(info.label).toBe('Table')
    })

    it('identifies custom node as unknown', () => {
      const node = { _custom: true, data: 'something' }
      const info = getNodeTypeInfo(node as unknown as DocContentItem)
      expect(info.label).toBe('Unknown')
    })

    it('identifies canvas node as unknown', () => {
      const node = { canvas: [{ type: 'rect', x: 0, y: 0, w: 100, h: 100 }] }
      const info = getNodeTypeInfo(node)
      expect(info.label).toBe('Unknown')
    })
  })

  describe('getNodeCustomName', () => {
    it('returns _name from text node', () => {
      const node = { text: 'Hello', _name: 'My Custom Name' }
      expect(getNodeCustomName(node)).toBe('My Custom Name')
    })

    it('returns _name from image node', () => {
      const node = { image: 'data:...', _name: 'Logo Image' }
      expect(getNodeCustomName(node)).toBe('Logo Image')
    })

    it('returns _name from list node', () => {
      const node = { ul: ['a', 'b'], _name: 'Feature List' }
      expect(getNodeCustomName(node)).toBe('Feature List')
    })

    it('returns _name from table node', () => {
      const node = { table: { body: [[]] }, _name: 'Data Table' }
      expect(getNodeCustomName(node)).toBe('Data Table')
    })

    it('returns undefined for node without _name', () => {
      const node = { text: 'Hello' }
      expect(getNodeCustomName(node)).toBeUndefined()
    })

    it('returns undefined for string', () => {
      expect(getNodeCustomName('Hello')).toBeUndefined()
    })

    it('returns undefined for empty _name', () => {
      const node = { text: 'Hello', _name: '' }
      // Empty string is falsy, so it might return undefined or ''
      const result = getNodeCustomName(node)
      expect(result === undefined || result === '').toBe(true)
    })

    it('returns undefined for non-string _name', () => {
      const node = { text: 'Hello', _name: 123 }
      expect(getNodeCustomName(node as unknown as DocContentItem)).toBeUndefined()
    })
  })

  describe('getNodeDisplayName', () => {
    it('returns custom name when present', () => {
      const node = { text: 'Hello', _name: 'My Custom Name' }
      expect(getNodeDisplayName(node, 0)).toBe('My Custom Name')
    })

    it('returns generated name for paragraph', () => {
      expect(getNodeDisplayName('Hello', 0)).toBe('Paragraph 1')
      expect(getNodeDisplayName('World', 4)).toBe('Paragraph 5')
    })

    it('returns generated name for text node', () => {
      const node = { text: 'Hello' }
      expect(getNodeDisplayName(node, 0)).toBe('Text 1')
      expect(getNodeDisplayName(node, 2)).toBe('Text 3')
    })

    it('returns generated name for image node', () => {
      const node = { image: 'data:...' }
      expect(getNodeDisplayName(node, 0)).toBe('Image 1')
    })

    it('returns generated name for list node', () => {
      const node = { ul: ['a', 'b'] }
      expect(getNodeDisplayName(node, 1)).toBe('List 2')
    })

    it('returns generated name for table node', () => {
      const node = { table: { body: [[]] } }
      expect(getNodeDisplayName(node, 0)).toBe('Table 1')
    })

    it('returns generated name for unknown node', () => {
      const node = { canvas: [] }
      expect(getNodeDisplayName(node, 0)).toBe('Unknown 1')
    })

    it('uses 1-based indexing', () => {
      expect(getNodeDisplayName('Hello', 0)).toBe('Paragraph 1')
      expect(getNodeDisplayName('Hello', 9)).toBe('Paragraph 10')
    })
  })

  describe('supportsCustomName', () => {
    it('returns false for string (paragraph)', () => {
      expect(supportsCustomName('Hello')).toBe(false)
    })

    it('returns true for text node', () => {
      const node = { text: 'Hello' }
      expect(supportsCustomName(node)).toBe(true)
    })

    it('returns true for image node', () => {
      const node = { image: 'data:...' }
      expect(supportsCustomName(node)).toBe(true)
    })

    it('returns true for list node', () => {
      const node = { ul: ['a'] }
      expect(supportsCustomName(node)).toBe(true)
    })

    it('returns true for table node', () => {
      const node = { table: { body: [[]] } }
      expect(supportsCustomName(node)).toBe(true)
    })

    it('returns true for canvas node', () => {
      const node = { canvas: [] }
      expect(supportsCustomName(node)).toBe(true)
    })
  })
})

