import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  parseDate,
  isTemplateLike,
  normalizeToTemplate,
  normalizeToTemplateForImport,
  exportTemplateToFile,
  exportTemplatesToFile,
  generateUniqueTemplateName,
  duplicateTemplate,
} from '@/utils/template-utils'
import type { Template, DocDefinition } from '@/types'

describe('template-utils', () => {
  describe('parseDate', () => {
    it('returns the same Date object if passed a Date', () => {
      const date = new Date('2024-06-15T10:30:00Z')
      expect(parseDate(date)).toBe(date)
    })

    it('parses a valid ISO date string', () => {
      const result = parseDate('2024-06-15T10:30:00Z')
      expect(result).toBeInstanceOf(Date)
      expect(result.toISOString()).toBe('2024-06-15T10:30:00.000Z')
    })

    it('parses a timestamp number', () => {
      const timestamp = 1718444400000 // 2024-06-15
      const result = parseDate(timestamp)
      expect(result).toBeInstanceOf(Date)
      expect(result.getTime()).toBe(timestamp)
    })

    it('returns current date for invalid input', () => {
      const before = Date.now()
      const result = parseDate('invalid-date')
      const after = Date.now()
      
      expect(result).toBeInstanceOf(Date)
      expect(result.getTime()).toBeGreaterThanOrEqual(before)
      expect(result.getTime()).toBeLessThanOrEqual(after)
    })

    it('returns current date for null', () => {
      const before = Date.now()
      const result = parseDate(null)
      const after = Date.now()
      
      expect(result.getTime()).toBeGreaterThanOrEqual(before)
      expect(result.getTime()).toBeLessThanOrEqual(after)
    })

    it('returns current date for undefined', () => {
      const before = Date.now()
      const result = parseDate(undefined)
      const after = Date.now()
      
      expect(result.getTime()).toBeGreaterThanOrEqual(before)
      expect(result.getTime()).toBeLessThanOrEqual(after)
    })
  })

  describe('isTemplateLike', () => {
    it('returns true for valid template shape', () => {
      const input = {
        id: 'test-1',
        name: 'Test Template',
        docDefinition: { content: [], styles: {} },
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      expect(isTemplateLike(input)).toBe(true)
    })

    it('returns true even without dates (partial template)', () => {
      const input = {
        id: 'test-1',
        name: 'Test Template',
        docDefinition: { content: [] },
      }
      expect(isTemplateLike(input)).toBe(true)
    })

    it('returns false for object without id', () => {
      const input = {
        name: 'Test Template',
        docDefinition: { content: [] },
      }
      expect(isTemplateLike(input)).toBe(false)
    })

    it('returns false for object without name', () => {
      const input = {
        id: 'test-1',
        docDefinition: { content: [] },
      }
      expect(isTemplateLike(input)).toBe(false)
    })

    it('returns false for object without docDefinition', () => {
      const input = {
        id: 'test-1',
        name: 'Test Template',
      }
      expect(isTemplateLike(input)).toBe(false)
    })

    it('returns false for null', () => {
      expect(isTemplateLike(null)).toBe(false)
    })

    it('returns false for undefined', () => {
      expect(isTemplateLike(undefined)).toBe(false)
    })

    it('returns false for string', () => {
      expect(isTemplateLike('not a template')).toBe(false)
    })

    it('returns false for array', () => {
      expect(isTemplateLike([])).toBe(false)
    })
  })

  describe('normalizeToTemplate', () => {
    it('normalizes a template-like object', () => {
      const input = {
        id: 'my-id',
        name: 'My Template',
        docDefinition: { content: ['Hello'], styles: {} },
        createdAt: '2024-01-01',
        updatedAt: '2024-01-02',
      }

      const result = normalizeToTemplate(input)

      expect(result.id).toBe('my-id')
      expect(result.name).toBe('My Template')
      expect(result.docDefinition.content).toEqual(['Hello'])
      expect(result.createdAt).toBeInstanceOf(Date)
      expect(result.updatedAt).toBeInstanceOf(Date)
    })

    it('generates ID if missing', () => {
      const input = {
        id: undefined,
        name: 'My Template',
        docDefinition: { content: [] },
      }

      const result = normalizeToTemplate(input)

      expect(result.id).toMatch(/^tpl-\d+$/)
    })

    it('uses default name if missing', () => {
      const input = {
        id: 'test-id',
        name: undefined,
        docDefinition: { content: [] },
      }

      const result = normalizeToTemplate(input)

      expect(result.name).toBe('Imported Template')
    })

    it('uses default docDefinition if missing', () => {
      const input = {
        id: 'test-id',
        name: 'Test',
        docDefinition: undefined,
      }

      const result = normalizeToTemplate(input)

      expect(result.docDefinition).toEqual({ content: [], styles: {} })
    })

    it('treats plain DocDefinition as content only', () => {
      const docDef: DocDefinition = {
        content: ['Hello', 'World'],
        styles: { header: { fontSize: 24 } },
      }

      const result = normalizeToTemplate(docDef)

      expect(result.id).toMatch(/^tpl-\d+$/)
      expect(result.name).toBe('Imported Template')
      expect(result.docDefinition).toEqual(docDef)
    })
  })

  describe('normalizeToTemplateForImport', () => {
    it('always generates a new ID, ignoring original ID', () => {
      const input = {
        id: 'original-id',
        name: 'My Template',
        docDefinition: { content: ['Hello'], styles: {} },
      }

      const result = normalizeToTemplateForImport(input)

      expect(result.id).not.toBe('original-id')
      expect(result.id).toMatch(/^tpl-\d+/)
      expect(result.name).toBe('My Template')
      expect(result.docDefinition.content).toEqual(['Hello'])
    })

    it('generates unique ID when existing IDs are provided', () => {
      const existingIds = ['tpl-123', 'tpl-456', 'tpl-789']
      const input = {
        id: 'original-id',
        name: 'Template',
        docDefinition: { content: [], styles: {} },
      }

      const result = normalizeToTemplateForImport(input, existingIds)

      expect(result.id).not.toBe('original-id')
      expect(existingIds).not.toContain(result.id)
      expect(result.id).toMatch(/^tpl-\d+/)
    })

    it('handles ID collisions by generating unique ID', () => {
      // Create a scenario where the generated ID might collide
      const timestamp = Date.now()
      const existingIds = [`tpl-${timestamp}`]
      const input = {
        id: 'original-id',
        name: 'Template',
        docDefinition: { content: [], styles: {} },
      }

      const result = normalizeToTemplateForImport(input, existingIds)

      expect(result.id).not.toBe('original-id')
      expect(existingIds).not.toContain(result.id)
      // Should have a random suffix if collision occurred
      expect(result.id).toMatch(/^tpl-\d+/)
    })

    it('normalizes template-like object with new ID', () => {
      const input = {
        id: 'old-id',
        name: 'My Template',
        docDefinition: { content: ['Hello'], styles: {} },
        createdAt: '2024-01-01',
        updatedAt: '2024-01-02',
      }

      const result = normalizeToTemplateForImport(input)

      expect(result.id).not.toBe('old-id')
      expect(result.name).toBe('My Template')
      expect(result.docDefinition.content).toEqual(['Hello'])
      expect(result.createdAt).toBeInstanceOf(Date)
      expect(result.updatedAt).toBeInstanceOf(Date)
    })

    it('generates ID if missing in input', () => {
      const input = {
        id: undefined,
        name: 'My Template',
        docDefinition: { content: [] },
      }

      const result = normalizeToTemplateForImport(input)

      expect(result.id).toMatch(/^tpl-\d+/)
      expect(result.name).toBe('My Template')
    })

    it('uses default name if missing', () => {
      const input = {
        id: 'test-id',
        name: undefined,
        docDefinition: { content: [] },
      }

      const result = normalizeToTemplateForImport(input)

      expect(result.id).toMatch(/^tpl-\d+/)
      expect(result.name).toBe('Imported Template')
    })

    it('treats plain DocDefinition as content only', () => {
      const docDef: DocDefinition = {
        content: ['Hello', 'World'],
        styles: { header: { fontSize: 24 } },
      }

      const result = normalizeToTemplateForImport(docDef)

      expect(result.id).toMatch(/^tpl-\d+/)
      expect(result.name).toBe('Imported Template')
      expect(result.docDefinition).toEqual(docDef)
    })

    it('works with empty existing IDs array', () => {
      const input = {
        id: 'original-id',
        name: 'Template',
        docDefinition: { content: [], styles: {} },
      }

      const result = normalizeToTemplateForImport(input, [])

      expect(result.id).not.toBe('original-id')
      expect(result.id).toMatch(/^tpl-\d+/)
    })

    it('ensures multiple imports get unique IDs', () => {
      const existingIds: string[] = []
      const input = {
        id: 'same-id',
        name: 'Template',
        docDefinition: { content: [], styles: {} },
      }

      const result1 = normalizeToTemplateForImport(input, existingIds)
      existingIds.push(result1.id)
      
      const result2 = normalizeToTemplateForImport(input, existingIds)
      existingIds.push(result2.id)
      
      const result3 = normalizeToTemplateForImport(input, existingIds)
      existingIds.push(result3.id)

      expect(result1.id).not.toBe(result2.id)
      expect(result2.id).not.toBe(result3.id)
      expect(result1.id).not.toBe(result3.id)
      expect(existingIds).toHaveLength(3)
    })
  })

  describe('generateUniqueTemplateName', () => {
    it('returns base name if no conflicts', () => {
      const result = generateUniqueTemplateName('My Template', ['Other Template'])
      expect(result).toBe('My Template')
    })

    it('appends number if base name exists', () => {
      const result = generateUniqueTemplateName('My Template', ['My Template'])
      expect(result).toBe('My Template 2')
    })

    it('increments number for multiple conflicts', () => {
      const existing = ['My Template', 'My Template 2', 'My Template 3']
      const result = generateUniqueTemplateName('My Template', existing)
      expect(result).toBe('My Template 4')
    })

    it('handles gaps in numbering', () => {
      const existing = ['My Template', 'My Template 3']
      const result = generateUniqueTemplateName('My Template', existing)
      expect(result).toBe('My Template 2')
    })

    it('works with empty existing names', () => {
      const result = generateUniqueTemplateName('New Template', [])
      expect(result).toBe('New Template')
    })
  })

  describe('duplicateTemplate', () => {
    it('creates a copy with new ID', () => {
      const original: Template = {
        id: 'original-id',
        name: 'Original Template',
        docDefinition: { content: ['Hello'], styles: { header: { fontSize: 20 } } },
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }

      const copy = duplicateTemplate(original)

      expect(copy.id).not.toBe(original.id)
      expect(copy.id).toMatch(/^tpl-\d+$/)
    })

    it('prefixes name with "Copy of"', () => {
      const original: Template = {
        id: 'original-id',
        name: 'My Template',
        docDefinition: { content: [], styles: {} },
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const copy = duplicateTemplate(original)

      expect(copy.name).toBe('Copy of My Template')
    })

    it('deep clones docDefinition', () => {
      const original: Template = {
        id: 'original-id',
        name: 'Original',
        docDefinition: {
          content: [{ text: 'Hello' }],
          styles: { header: { fontSize: 20 } },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const cloned = duplicateTemplate(original)

      // Verify it's a different object reference
      expect(cloned.docDefinition).not.toBe(original.docDefinition)
      expect(cloned.docDefinition.content).not.toBe(original.docDefinition.content)
      
      // Modify the cloned template
      const clonedFirstItem = cloned.docDefinition.content[0] as { text: string }
      clonedFirstItem.text = 'Modified'
      
      const clonedHeaderStyle = cloned.docDefinition.styles!.header!
      clonedHeaderStyle.fontSize = 30

      // Original should be unchanged
      const originalFirstItem = original.docDefinition.content[0] as { text: string }
      expect(originalFirstItem.text).toBe('Hello')
      expect(original.docDefinition.styles!.header!.fontSize).toBe(20)
    })

    it('sets new createdAt and updatedAt dates', () => {
      const oldDate = new Date('2020-01-01')
      const original: Template = {
        id: 'original-id',
        name: 'Original',
        docDefinition: { content: [], styles: {} },
        createdAt: oldDate,
        updatedAt: oldDate,
      }

      const before = Date.now()
      const copy = duplicateTemplate(original)
      const after = Date.now()

      expect(copy.createdAt.getTime()).toBeGreaterThanOrEqual(before)
      expect(copy.createdAt.getTime()).toBeLessThanOrEqual(after)
      expect(copy.updatedAt.getTime()).toBeGreaterThanOrEqual(before)
      expect(copy.updatedAt.getTime()).toBeLessThanOrEqual(after)
    })
  })

  describe('exportTemplateToFile', () => {
    let mockCreateObjectURL: ReturnType<typeof vi.fn>
    let mockRevokeObjectURL: ReturnType<typeof vi.fn>
    let mockAppendChild: ReturnType<typeof vi.fn>
    let mockRemoveChild: ReturnType<typeof vi.fn>
    let mockClick: ReturnType<typeof vi.fn>
    let createdAnchor: HTMLAnchorElement

    beforeEach(() => {
      mockCreateObjectURL = vi.fn().mockReturnValue('blob:test-url')
      mockRevokeObjectURL = vi.fn()
      mockClick = vi.fn()
      mockAppendChild = vi.fn()
      mockRemoveChild = vi.fn()

      URL.createObjectURL = mockCreateObjectURL
      URL.revokeObjectURL = mockRevokeObjectURL

      const originalCreateElement = document.createElement.bind(document)
      vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
        if (tag === 'a') {
          createdAnchor = originalCreateElement('a') as HTMLAnchorElement
          createdAnchor.click = mockClick
          return createdAnchor
        }
        return originalCreateElement(tag)
      })

      vi.spyOn(document.body, 'appendChild').mockImplementation(mockAppendChild)
      vi.spyOn(document.body, 'removeChild').mockImplementation(mockRemoveChild)
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('creates a downloadable JSON file', () => {
      const template: Template = {
        id: 'test-1',
        name: 'Test Template',
        docDefinition: { content: ['Hello'], styles: {} },
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      exportTemplateToFile(template)

      expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob))
      expect(createdAnchor.download).toBe('Test Template.json')
      expect(mockClick).toHaveBeenCalled()
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:test-url')
    })

    it('uses fallback name if template name is empty', () => {
      const template: Template = {
        id: 'test-1',
        name: '',
        docDefinition: { content: [], styles: {} },
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      exportTemplateToFile(template)

      expect(createdAnchor.download).toBe('template.json')
    })
  })

  describe('exportTemplatesToFile', () => {
    let mockCreateObjectURL: ReturnType<typeof vi.fn>
    let mockRevokeObjectURL: ReturnType<typeof vi.fn>
    let mockClick: ReturnType<typeof vi.fn>
    let createdAnchor: HTMLAnchorElement

    beforeEach(() => {
      mockCreateObjectURL = vi.fn().mockReturnValue('blob:test-url')
      mockRevokeObjectURL = vi.fn()
      mockClick = vi.fn()

      URL.createObjectURL = mockCreateObjectURL
      URL.revokeObjectURL = mockRevokeObjectURL

      const originalCreateElement = document.createElement.bind(document)
      vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
        if (tag === 'a') {
          createdAnchor = originalCreateElement('a') as HTMLAnchorElement
          createdAnchor.click = mockClick
          return createdAnchor
        }
        return originalCreateElement(tag)
      })

      vi.spyOn(document.body, 'appendChild').mockImplementation(() => createdAnchor)
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => createdAnchor)
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('exports multiple templates with default filename', () => {
      const templates: Template[] = [
        {
          id: 'test-1',
          name: 'Template 1',
          docDefinition: { content: [], styles: {} },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'test-2',
          name: 'Template 2',
          docDefinition: { content: [], styles: {} },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      exportTemplatesToFile(templates)

      expect(mockCreateObjectURL).toHaveBeenCalled()
      expect(createdAnchor.download).toBe('templates.json')
      expect(mockClick).toHaveBeenCalled()
    })

    it('uses custom filename when provided', () => {
      const templates: Template[] = []

      exportTemplatesToFile(templates, 'my-templates.json')

      expect(createdAnchor.download).toBe('my-templates.json')
    })
  })
})

