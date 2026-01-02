import { describe, it, expect } from 'vitest'
import {
  serializeDocDefinition,
  deserializeDocDefinition,
} from '@/utils/doc-serialization'
import type { DocDefinition } from '@/types'

describe('doc-serialization', () => {
  describe('serializeDocDefinition', () => {
    it('returns plain object for simple docDefinition', () => {
      const docDef: DocDefinition = {
        content: ['Hello', 'World'],
        styles: { header: { fontSize: 24 } },
      }

      const result = serializeDocDefinition(docDef)

      expect(result.content).toEqual(['Hello', 'World'])
      expect(result.styles).toEqual({ header: { fontSize: 24 } })
    })

    it('converts header function to string', () => {
      const docDef: DocDefinition = {
        content: [],
        header: function(currentPage, pageCount) {
          return `Page ${currentPage} of ${pageCount}`
        },
      }

      const result = serializeDocDefinition(docDef)

      expect(result._headerFunction).toBeDefined()
      expect(typeof result._headerFunction).toBe('string')
      expect(result._headerFunction).toContain('currentPage')
      expect(result._headerFunction).toContain('pageCount')
      expect(result.header).toBeUndefined()
    })

    it('converts footer function to string', () => {
      const docDef: DocDefinition = {
        content: [],
        footer: function(currentPage, pageCount) {
          return { text: `${currentPage}/${pageCount}`, alignment: 'center' }
        },
      }

      const result = serializeDocDefinition(docDef)

      expect(result._footerFunction).toBeDefined()
      expect(typeof result._footerFunction).toBe('string')
      expect(result.footer).toBeUndefined()
    })

    it('converts background function to string', () => {
      const docDef: DocDefinition = {
        content: [],
        background: function(currentPage) {
          return currentPage === 1 ? { text: 'DRAFT' } : null
        },
      }

      const result = serializeDocDefinition(docDef)

      expect(result._backgroundFunction).toBeDefined()
      expect(typeof result._backgroundFunction).toBe('string')
      expect(result.background).toBeUndefined()
    })

    it('preserves non-function header/footer/background', () => {
      const docDef: DocDefinition = {
        content: [],
        header: 'Static header',
        footer: { text: 'Static footer' },
        background: { text: 'Watermark' },
      }

      const result = serializeDocDefinition(docDef)

      expect(result.header).toBe('Static header')
      expect(result.footer).toEqual({ text: 'Static footer' })
      expect(result.background).toEqual({ text: 'Watermark' })
      expect(result._headerFunction).toBeUndefined()
      expect(result._footerFunction).toBeUndefined()
      expect(result._backgroundFunction).toBeUndefined()
    })

    it('handles all three functions at once', () => {
      const docDef: DocDefinition = {
        content: ['Test'],
        header: () => 'Header',
        footer: () => 'Footer',
        background: () => 'Background',
      }

      const result = serializeDocDefinition(docDef)

      expect(result._headerFunction).toBeDefined()
      expect(result._footerFunction).toBeDefined()
      expect(result._backgroundFunction).toBeDefined()
      expect(result.header).toBeUndefined()
      expect(result.footer).toBeUndefined()
      expect(result.background).toBeUndefined()
    })
  })

  describe('deserializeDocDefinition', () => {
    it('returns plain docDefinition without function properties', () => {
      const serialized = {
        content: ['Hello'],
        styles: { header: { fontSize: 24 } },
        pageSize: 'A4',
      }

      const result = deserializeDocDefinition(serialized)

      expect(result.content).toEqual(['Hello'])
      expect(result.styles).toEqual({ header: { fontSize: 24 } })
      expect(result.pageSize).toBe('A4')
    })

    it('restores header function from string', () => {
      const serialized = {
        content: [],
        _headerFunction: 'function(currentPage, pageCount, pageSize) { return "Page " + currentPage; }',
      }

      const result = deserializeDocDefinition(serialized)

      expect(typeof result.header).toBe('function')
      expect((result as Record<string, unknown>)._headerFunction).toBeUndefined()
      
      // Test the restored function works
      if (typeof result.header === 'function') {
        const output = result.header(1, 5, { width: 595, height: 842 })
        expect(output).toBe('Page 1')
      }
    })

    it('restores footer function from string', () => {
      const serialized = {
        content: [],
        _footerFunction: 'function(currentPage, pageCount, pageSize) { return currentPage + "/" + pageCount; }',
      }

      const result = deserializeDocDefinition(serialized)

      expect(typeof result.footer).toBe('function')
      expect((result as Record<string, unknown>)._footerFunction).toBeUndefined()
      
      if (typeof result.footer === 'function') {
        const output = result.footer(3, 10, { width: 595, height: 842 })
        expect(output).toBe('3/10')
      }
    })

    it('restores background function from string', () => {
      const serialized = {
        content: [],
        _backgroundFunction: 'function(currentPage, pageSize) { return currentPage === 1 ? "First" : "Other"; }',
      }

      const result = deserializeDocDefinition(serialized)

      expect(typeof result.background).toBe('function')
      expect((result as Record<string, unknown>)._backgroundFunction).toBeUndefined()
      
      if (typeof result.background === 'function') {
        expect(result.background(1, { width: 595, height: 842 })).toBe('First')
        expect(result.background(2, { width: 595, height: 842 })).toBe('Other')
      }
    })

    it('handles invalid function string gracefully', () => {
      const serialized = {
        content: [],
        _headerFunction: 'this is not valid javascript {{{',
      }

      // Should not throw
      const result = deserializeDocDefinition(serialized)

      // Header should not be set if parsing failed
      expect(result.header).toBeUndefined()
      expect((result as Record<string, unknown>)._headerFunction).toBeUndefined()
    })

    it('handles arrow function syntax', () => {
      // Note: The regex in deserialize expects "function(...)" syntax
      // Arrow functions won't match the pattern but should not break
      const serialized = {
        content: [],
        _headerFunction: '(currentPage) => `Page ${currentPage}`',
      }

      // Should not throw
      const result = deserializeDocDefinition(serialized)

      // May or may not restore depending on implementation
      expect((result as Record<string, unknown>)._headerFunction).toBeUndefined()
    })

    it('preserves all other properties', () => {
      const serialized = {
        content: ['Test'],
        styles: { body: { fontSize: 12 } },
        pageSize: 'LETTER',
        pageOrientation: 'landscape',
        pageMargins: [40, 60, 40, 60],
        watermark: { text: 'DRAFT', opacity: 0.3 },
      }

      const result = deserializeDocDefinition(serialized)

      expect(result.content).toEqual(['Test'])
      expect(result.styles).toEqual({ body: { fontSize: 12 } })
      expect(result.pageSize).toBe('LETTER')
      expect(result.pageOrientation).toBe('landscape')
      expect(result.pageMargins).toEqual([40, 60, 40, 60])
      expect(result.watermark).toEqual({ text: 'DRAFT', opacity: 0.3 })
    })
  })

  describe('round-trip serialization', () => {
    it('preserves simple docDefinition through round-trip', () => {
      const original: DocDefinition = {
        content: ['Hello', { text: 'World', style: 'header' }],
        styles: { header: { fontSize: 24, bold: true } },
        pageSize: 'A4',
      }

      const serialized = serializeDocDefinition(original)
      const restored = deserializeDocDefinition(serialized)

      expect(restored.content).toEqual(original.content)
      expect(restored.styles).toEqual(original.styles)
      expect(restored.pageSize).toBe(original.pageSize)
    })

    it('preserves static header/footer through round-trip', () => {
      const original: DocDefinition = {
        content: [],
        header: 'Static Header',
        footer: ['Footer line 1', 'Footer line 2'],
      }

      const serialized = serializeDocDefinition(original)
      const restored = deserializeDocDefinition(serialized)

      expect(restored.header).toBe('Static Header')
      expect(restored.footer).toEqual(['Footer line 1', 'Footer line 2'])
    })
  })
})

