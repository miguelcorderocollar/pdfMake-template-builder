import { describe, it, expect, beforeEach } from 'vitest'
import { appReducer } from '@/lib/app-reducer'
import type { AppState, AppAction, Template, DocDefinition } from '@/types'

// Helper to create a minimal valid state
function createTestState(overrides?: Partial<AppState>): AppState {
  const template: Template = {
    id: 'test-1',
    name: 'Test Template',
    docDefinition: {
      content: [],
      styles: {},
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  }

  return {
    currentTemplate: template,
    templates: [template],
    currentTemplateId: 'test-1',
    selectedIndex: null,
    isPreviewMode: false,
    isLoading: false,
    filename: 'test.pdf',
    theme: 'light',
    dirty: false,
    ...overrides,
  }
}

describe('appReducer', () => {
  let initialState: AppState

  beforeEach(() => {
    initialState = createTestState()
  })

  describe('SET_TEMPLATE', () => {
    it('sets the current template', () => {
      const newTemplate: Template = {
        id: 'new-1',
        name: 'New Template',
        docDefinition: { content: ['Hello'], styles: {} },
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const action: AppAction = { type: 'SET_TEMPLATE', payload: newTemplate }
      const result = appReducer(initialState, action)

      expect(result.currentTemplate).toEqual(newTemplate)
      expect(result.currentTemplateId).toBe('new-1')
      expect(result.selectedIndex).toBeNull()
      expect(result.dirty).toBe(false)
    })
  })

  describe('SET_DOCDEFINITION', () => {
    it('updates the docDefinition and marks as dirty', () => {
      const newDD: DocDefinition = {
        content: ['Updated content'],
        styles: { header: { fontSize: 20 } },
      }

      const action: AppAction = { type: 'SET_DOCDEFINITION', payload: newDD }
      const result = appReducer(initialState, action)

      expect(result.currentTemplate?.docDefinition).toEqual(newDD)
      expect(result.dirty).toBe(true)
    })

    it('does nothing if currentTemplate is null', () => {
      const stateWithoutTemplate = { ...initialState, currentTemplate: null }
      const action: AppAction = {
        type: 'SET_DOCDEFINITION',
        payload: { content: [], styles: {} },
      }
      const result = appReducer(stateWithoutTemplate, action)
      expect(result).toEqual(stateWithoutTemplate)
    })
  })

  describe('UPDATE_DOC_SETTINGS', () => {
    it('updates doc settings and marks as dirty', () => {
      const action: AppAction = {
        type: 'UPDATE_DOC_SETTINGS',
        payload: { pageSize: 'A4', pageOrientation: 'landscape' },
      }
      const result = appReducer(initialState, action)

      expect(result.currentTemplate?.docDefinition.pageSize).toBe('A4')
      expect(result.currentTemplate?.docDefinition.pageOrientation).toBe('landscape')
      expect(result.dirty).toBe(true)
    })
  })

  describe('SET_FILENAME', () => {
    it('updates the filename', () => {
      const action: AppAction = { type: 'SET_FILENAME', payload: 'new-file.pdf' }
      const result = appReducer(initialState, action)
      expect(result.filename).toBe('new-file.pdf')
    })
  })

  describe('SET_TEMPLATE_NAME', () => {
    it('updates the template name and marks as dirty', () => {
      const action: AppAction = { type: 'SET_TEMPLATE_NAME', payload: 'Updated Name' }
      const result = appReducer(initialState, action)

      expect(result.currentTemplate?.name).toBe('Updated Name')
      expect(result.dirty).toBe(true)
    })
  })

  describe('CONTENT_OP', () => {
    describe('ADD_STRING', () => {
      it('adds a string at the end by default', () => {
        const action: AppAction = {
          type: 'CONTENT_OP',
          payload: { type: 'ADD_STRING', payload: { value: 'New paragraph' } },
        }
        const result = appReducer(initialState, action)

        expect(result.currentTemplate?.docDefinition.content).toEqual(['New paragraph'])
        expect(result.dirty).toBe(true)
      })

      it('adds a string at a specific index', () => {
        const stateWithContent = createTestState({
          currentTemplate: {
            ...initialState.currentTemplate!,
            docDefinition: { content: ['First', 'Third'], styles: {} },
          },
        })

        const action: AppAction = {
          type: 'CONTENT_OP',
          payload: { type: 'ADD_STRING', payload: { index: 1, value: 'Second' } },
        }
        const result = appReducer(stateWithContent, action)

        expect(result.currentTemplate?.docDefinition.content).toEqual(['First', 'Second', 'Third'])
      })
    })

    describe('ADD_TEXT_NODE', () => {
      it('adds a text node with text and style', () => {
        const action: AppAction = {
          type: 'CONTENT_OP',
          payload: {
            type: 'ADD_TEXT_NODE',
            payload: { text: 'Styled text', style: 'header' },
          },
        }
        const result = appReducer(initialState, action)

        expect(result.currentTemplate?.docDefinition.content).toEqual([
          { text: 'Styled text', style: 'header' },
        ])
      })
    })

    describe('ADD_IMAGE_NODE', () => {
      it('adds an image node', () => {
        const action: AppAction = {
          type: 'CONTENT_OP',
          payload: {
            type: 'ADD_IMAGE_NODE',
            payload: { image: 'data:image/png;base64,abc', width: 100 },
          },
        }
        const result = appReducer(initialState, action)

        expect(result.currentTemplate?.docDefinition.content).toHaveLength(1)
        const item = result.currentTemplate?.docDefinition.content[0] as Record<string, unknown>
        expect(item.image).toBe('data:image/png;base64,abc')
        expect(item.width).toBe(100)
      })
    })

    describe('ADD_LIST_NODE', () => {
      it('adds an unordered list node', () => {
        const action: AppAction = {
          type: 'CONTENT_OP',
          payload: {
            type: 'ADD_LIST_NODE',
            payload: { ul: ['Item 1', 'Item 2'] },
          },
        }
        const result = appReducer(initialState, action)

        const item = result.currentTemplate?.docDefinition.content[0] as Record<string, unknown>
        expect(item.ul).toEqual(['Item 1', 'Item 2'])
      })

      it('adds an ordered list node', () => {
        const action: AppAction = {
          type: 'CONTENT_OP',
          payload: {
            type: 'ADD_LIST_NODE',
            payload: { ol: ['First', 'Second'] },
          },
        }
        const result = appReducer(initialState, action)

        const item = result.currentTemplate?.docDefinition.content[0] as Record<string, unknown>
        expect(item.ol).toEqual(['First', 'Second'])
      })
    })

    describe('ADD_TABLE_NODE', () => {
      it('adds a table node', () => {
        const action: AppAction = {
          type: 'CONTENT_OP',
          payload: {
            type: 'ADD_TABLE_NODE',
            payload: {
              table: {
                body: [
                  ['A', 'B'],
                  ['C', 'D'],
                ],
              },
            },
          },
        }
        const result = appReducer(initialState, action)

        const item = result.currentTemplate?.docDefinition.content[0] as Record<string, unknown>
        expect(item.table).toEqual({
          body: [
            ['A', 'B'],
            ['C', 'D'],
          ],
        })
      })
    })

    describe('ADD_CUSTOM_NODE', () => {
      it('adds a custom node', () => {
        const customContent = { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 100, y2: 100 }] }
        const action: AppAction = {
          type: 'CONTENT_OP',
          payload: {
            type: 'ADD_CUSTOM_NODE',
            payload: { content: customContent },
          },
        }
        const result = appReducer(initialState, action)

        expect(result.currentTemplate?.docDefinition.content[0]).toEqual(customContent)
      })
    })

    describe('UPDATE_STRING', () => {
      it('updates a string at the specified index', () => {
        const stateWithContent = createTestState({
          currentTemplate: {
            ...initialState.currentTemplate!,
            docDefinition: { content: ['Original'], styles: {} },
          },
        })

        const action: AppAction = {
          type: 'CONTENT_OP',
          payload: { type: 'UPDATE_STRING', payload: { index: 0, value: 'Updated' } },
        }
        const result = appReducer(stateWithContent, action)

        expect(result.currentTemplate?.docDefinition.content[0]).toBe('Updated')
      })
    })

    describe('UPDATE_TEXT_NODE', () => {
      it('updates text node properties', () => {
        const stateWithContent = createTestState({
          currentTemplate: {
            ...initialState.currentTemplate!,
            docDefinition: {
              content: [{ text: 'Original', style: 'body' }],
              styles: {},
            },
          },
        })

        const action: AppAction = {
          type: 'CONTENT_OP',
          payload: {
            type: 'UPDATE_TEXT_NODE',
            payload: { index: 0, text: 'Updated', style: 'header' },
          },
        }
        const result = appReducer(stateWithContent, action)

        const item = result.currentTemplate?.docDefinition.content[0] as Record<string, unknown>
        expect(item.text).toBe('Updated')
        expect(item.style).toBe('header')
      })

      it('updates _name on text node', () => {
        const stateWithContent = createTestState({
          currentTemplate: {
            ...initialState.currentTemplate!,
            docDefinition: {
              content: [{ text: 'Hello' }],
              styles: {},
            },
          },
        })

        const action: AppAction = {
          type: 'CONTENT_OP',
          payload: {
            type: 'UPDATE_TEXT_NODE',
            payload: { index: 0, _name: 'My Text Node' },
          },
        }
        const result = appReducer(stateWithContent, action)

        const item = result.currentTemplate?.docDefinition.content[0] as Record<string, unknown>
        expect(item._name).toBe('My Text Node')
      })
    })

    describe('UPDATE_IMAGE_NODE', () => {
      it('updates image node properties', () => {
        const stateWithContent = createTestState({
          currentTemplate: {
            ...initialState.currentTemplate!,
            docDefinition: {
              content: [{ image: 'data:image/png;base64,abc', width: 100 }],
              styles: {},
            },
          },
        })

        const action: AppAction = {
          type: 'CONTENT_OP',
          payload: {
            type: 'UPDATE_IMAGE_NODE',
            payload: { index: 0, width: 200, height: 150 },
          },
        }
        const result = appReducer(stateWithContent, action)

        const item = result.currentTemplate?.docDefinition.content[0] as Record<string, unknown>
        expect(item.width).toBe(200)
        expect(item.height).toBe(150)
      })
    })

    describe('UPDATE_LIST_NODE', () => {
      it('updates list items', () => {
        const stateWithContent = createTestState({
          currentTemplate: {
            ...initialState.currentTemplate!,
            docDefinition: {
              content: [{ ul: ['A', 'B'] }],
              styles: {},
            },
          },
        })

        const action: AppAction = {
          type: 'CONTENT_OP',
          payload: {
            type: 'UPDATE_LIST_NODE',
            payload: { index: 0, ul: ['X', 'Y', 'Z'] },
          },
        }
        const result = appReducer(stateWithContent, action)

        const item = result.currentTemplate?.docDefinition.content[0] as Record<string, unknown>
        expect(item.ul).toEqual(['X', 'Y', 'Z'])
      })

      it('switches from ul to ol and removes ul key', () => {
        const stateWithContent = createTestState({
          currentTemplate: {
            ...initialState.currentTemplate!,
            docDefinition: {
              content: [{ ul: ['A', 'B'] }],
              styles: {},
            },
          },
        })

        const action: AppAction = {
          type: 'CONTENT_OP',
          payload: {
            type: 'UPDATE_LIST_NODE',
            payload: { index: 0, ol: ['1', '2'] },
          },
        }
        const result = appReducer(stateWithContent, action)

        const item = result.currentTemplate?.docDefinition.content[0] as Record<string, unknown>
        expect(item.ol).toEqual(['1', '2'])
        expect(item.ul).toBeUndefined()
      })
    })

    describe('UPDATE_TABLE_NODE', () => {
      it('updates table body', () => {
        const stateWithContent = createTestState({
          currentTemplate: {
            ...initialState.currentTemplate!,
            docDefinition: {
              content: [{ table: { body: [['A', 'B']] } }],
              styles: {},
            },
          },
        })

        const action: AppAction = {
          type: 'CONTENT_OP',
          payload: {
            type: 'UPDATE_TABLE_NODE',
            payload: {
              index: 0,
              table: { body: [['X', 'Y'], ['Z', 'W']] },
            },
          },
        }
        const result = appReducer(stateWithContent, action)

        const item = result.currentTemplate?.docDefinition.content[0] as Record<string, unknown>
        const table = item.table as Record<string, unknown>
        expect(table.body).toEqual([['X', 'Y'], ['Z', 'W']])
      })
    })

    describe('MOVE_ITEM', () => {
      it('moves an item from one position to another', () => {
        const stateWithContent = createTestState({
          currentTemplate: {
            ...initialState.currentTemplate!,
            docDefinition: {
              content: ['A', 'B', 'C', 'D'],
              styles: {},
            },
          },
        })

        const action: AppAction = {
          type: 'CONTENT_OP',
          payload: { type: 'MOVE_ITEM', payload: { from: 0, to: 2 } },
        }
        const result = appReducer(stateWithContent, action)

        expect(result.currentTemplate?.docDefinition.content).toEqual(['B', 'C', 'A', 'D'])
      })

      it('moves an item backwards', () => {
        const stateWithContent = createTestState({
          currentTemplate: {
            ...initialState.currentTemplate!,
            docDefinition: {
              content: ['A', 'B', 'C', 'D'],
              styles: {},
            },
          },
        })

        const action: AppAction = {
          type: 'CONTENT_OP',
          payload: { type: 'MOVE_ITEM', payload: { from: 3, to: 1 } },
        }
        const result = appReducer(stateWithContent, action)

        expect(result.currentTemplate?.docDefinition.content).toEqual(['A', 'D', 'B', 'C'])
      })
    })

    describe('DELETE_ITEM', () => {
      it('deletes an item at the specified index', () => {
        const stateWithContent = createTestState({
          currentTemplate: {
            ...initialState.currentTemplate!,
            docDefinition: {
              content: ['A', 'B', 'C'],
              styles: {},
            },
          },
        })

        const action: AppAction = {
          type: 'CONTENT_OP',
          payload: { type: 'DELETE_ITEM', payload: { index: 1 } },
        }
        const result = appReducer(stateWithContent, action)

        expect(result.currentTemplate?.docDefinition.content).toEqual(['A', 'C'])
      })
    })
  })

  describe('STYLES_OP', () => {
    describe('ADD_STYLE', () => {
      it('adds a new style', () => {
        const action: AppAction = {
          type: 'STYLES_OP',
          payload: {
            type: 'ADD_STYLE',
            payload: { name: 'header', def: { fontSize: 24, bold: true } },
          },
        }
        const result = appReducer(initialState, action)

        expect(result.currentTemplate?.docDefinition.styles?.header).toEqual({
          fontSize: 24,
          bold: true,
        })
        expect(result.dirty).toBe(true)
      })
    })

    describe('UPDATE_STYLE', () => {
      it('updates an existing style', () => {
        const stateWithStyles = createTestState({
          currentTemplate: {
            ...initialState.currentTemplate!,
            docDefinition: {
              content: [],
              styles: { header: { fontSize: 20 } },
            },
          },
        })

        const action: AppAction = {
          type: 'STYLES_OP',
          payload: {
            type: 'UPDATE_STYLE',
            payload: { name: 'header', def: { bold: true } },
          },
        }
        const result = appReducer(stateWithStyles, action)

        expect(result.currentTemplate?.docDefinition.styles?.header).toEqual({
          fontSize: 20,
          bold: true,
        })
      })
    })

    describe('RENAME_STYLE', () => {
      it('renames a style', () => {
        const stateWithStyles = createTestState({
          currentTemplate: {
            ...initialState.currentTemplate!,
            docDefinition: {
              content: [],
              styles: { oldName: { fontSize: 16 } },
            },
          },
        })

        const action: AppAction = {
          type: 'STYLES_OP',
          payload: {
            type: 'RENAME_STYLE',
            payload: { from: 'oldName', to: 'newName' },
          },
        }
        const result = appReducer(stateWithStyles, action)

        expect(result.currentTemplate?.docDefinition.styles?.newName).toEqual({ fontSize: 16 })
        expect(result.currentTemplate?.docDefinition.styles?.oldName).toBeUndefined()
      })
    })

    describe('DELETE_STYLE', () => {
      it('deletes a style', () => {
        const stateWithStyles = createTestState({
          currentTemplate: {
            ...initialState.currentTemplate!,
            docDefinition: {
              content: [],
              styles: { header: { fontSize: 20 }, body: { fontSize: 12 } },
            },
          },
        })

        const action: AppAction = {
          type: 'STYLES_OP',
          payload: { type: 'DELETE_STYLE', payload: { name: 'header' } },
        }
        const result = appReducer(stateWithStyles, action)

        expect(result.currentTemplate?.docDefinition.styles?.header).toBeUndefined()
        expect(result.currentTemplate?.docDefinition.styles?.body).toEqual({ fontSize: 12 })
      })
    })
  })

  describe('SET_SELECTED_INDEX', () => {
    it('sets the selected index', () => {
      const action: AppAction = { type: 'SET_SELECTED_INDEX', payload: 5 }
      const result = appReducer(initialState, action)
      expect(result.selectedIndex).toBe(5)
    })

    it('clears the selected index with null', () => {
      const stateWithSelection = { ...initialState, selectedIndex: 3 }
      const action: AppAction = { type: 'SET_SELECTED_INDEX', payload: null }
      const result = appReducer(stateWithSelection, action)
      expect(result.selectedIndex).toBeNull()
    })
  })

  describe('CLEAR_TEMPLATE', () => {
    it('clears content and styles', () => {
      const stateWithContent = createTestState({
        currentTemplate: {
          ...initialState.currentTemplate!,
          docDefinition: {
            content: ['Hello', { text: 'World' }],
            styles: { header: { fontSize: 20 } },
          },
        },
        selectedIndex: 1,
      })

      const action: AppAction = { type: 'CLEAR_TEMPLATE' }
      const result = appReducer(stateWithContent, action)

      expect(result.currentTemplate?.docDefinition.content).toEqual([])
      expect(result.currentTemplate?.docDefinition.styles).toEqual({})
      expect(result.selectedIndex).toBeNull()
      expect(result.dirty).toBe(true)
    })
  })

  describe('RELOAD_DEFAULT_TEMPLATE', () => {
    it('reloads the demo template', () => {
      const stateWithContent = createTestState({
        currentTemplate: {
          ...initialState.currentTemplate!,
          docDefinition: { content: ['Custom content'], styles: {} },
        },
        filename: 'custom.pdf',
      })

      const action: AppAction = { type: 'RELOAD_DEFAULT_TEMPLATE' }
      const result = appReducer(stateWithContent, action)

      // Should have demo template content (not empty)
      expect(result.currentTemplate?.docDefinition.content.length).toBeGreaterThan(0)
      expect(result.selectedIndex).toBeNull()
      expect(result.filename).toBe('document.pdf')
      expect(result.dirty).toBe(true)
    })
  })

  describe('SET_PREVIEW_MODE', () => {
    it('sets preview mode to true', () => {
      const action: AppAction = { type: 'SET_PREVIEW_MODE', payload: true }
      const result = appReducer(initialState, action)
      expect(result.isPreviewMode).toBe(true)
    })

    it('sets preview mode to false', () => {
      const stateInPreview = { ...initialState, isPreviewMode: true }
      const action: AppAction = { type: 'SET_PREVIEW_MODE', payload: false }
      const result = appReducer(stateInPreview, action)
      expect(result.isPreviewMode).toBe(false)
    })
  })

  describe('SET_LOADING', () => {
    it('sets loading state', () => {
      const action: AppAction = { type: 'SET_LOADING', payload: true }
      const result = appReducer(initialState, action)
      expect(result.isLoading).toBe(true)
    })
  })

  describe('SAVE_TEMPLATE', () => {
    it('adds current template to templates list if not present', () => {
      const newTemplate: Template = {
        id: 'new-template',
        name: 'New Template',
        docDefinition: { content: [], styles: {} },
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      const state = createTestState({
        currentTemplate: newTemplate,
        templates: [initialState.currentTemplate!],
        dirty: true,
      })

      const action: AppAction = { type: 'SAVE_TEMPLATE' }
      const result = appReducer(state, action)

      expect(result.templates).toHaveLength(2)
      expect(result.templates?.some(t => t.id === 'new-template')).toBe(true)
      expect(result.dirty).toBe(false)
    })

    it('updates existing template in list', () => {
      const state = createTestState({ dirty: true })
      state.currentTemplate!.name = 'Updated Name'

      const action: AppAction = { type: 'SAVE_TEMPLATE' }
      const result = appReducer(state, action)

      expect(result.templates?.find(t => t.id === 'test-1')?.name).toBe('Updated Name')
      expect(result.dirty).toBe(false)
    })
  })

  describe('DELETE_TEMPLATE', () => {
    it('removes template from list', () => {
      const template2: Template = {
        id: 'test-2',
        name: 'Second Template',
        docDefinition: { content: [], styles: {} },
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      const state = createTestState({
        templates: [initialState.currentTemplate!, template2],
      })

      const action: AppAction = { type: 'DELETE_TEMPLATE', payload: { id: 'test-2' } }
      const result = appReducer(state, action)

      expect(result.templates).toHaveLength(1)
      expect(result.templates?.some(t => t.id === 'test-2')).toBe(false)
    })

    it('switches to first template if current is deleted', () => {
      const template2: Template = {
        id: 'test-2',
        name: 'Second Template',
        docDefinition: { content: [], styles: {} },
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      const state = createTestState({
        templates: [initialState.currentTemplate!, template2],
      })

      const action: AppAction = { type: 'DELETE_TEMPLATE', payload: { id: 'test-1' } }
      const result = appReducer(state, action)

      expect(result.currentTemplate?.id).toBe('test-2')
      expect(result.currentTemplateId).toBe('test-2')
    })
  })

  describe('IMPORT_TEMPLATES', () => {
    it('merges imported templates with existing ones', () => {
      const importedTemplate: Template = {
        id: 'imported-1',
        name: 'Imported Template',
        docDefinition: { content: [], styles: {} },
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const action: AppAction = {
        type: 'IMPORT_TEMPLATES',
        payload: { templates: [importedTemplate] },
      }
      const result = appReducer(initialState, action)

      expect(result.templates).toHaveLength(2)
      expect(result.templates?.some(t => t.id === 'imported-1')).toBe(true)
    })

    it('overwrites templates with same ID', () => {
      const updatedTemplate: Template = {
        id: 'test-1',
        name: 'Updated via Import',
        docDefinition: { content: ['New content'], styles: {} },
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const action: AppAction = {
        type: 'IMPORT_TEMPLATES',
        payload: { templates: [updatedTemplate] },
      }
      const result = appReducer(initialState, action)

      expect(result.templates).toHaveLength(1)
      expect(result.templates?.[0].name).toBe('Updated via Import')
    })
  })

  describe('SELECT_TEMPLATE_BY_ID', () => {
    it('selects a template by ID', () => {
      const template2: Template = {
        id: 'test-2',
        name: 'Second Template',
        docDefinition: { content: ['Second content'], styles: {} },
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      const state = createTestState({
        templates: [initialState.currentTemplate!, template2],
      })

      const action: AppAction = { type: 'SELECT_TEMPLATE_BY_ID', payload: { id: 'test-2' } }
      const result = appReducer(state, action)

      expect(result.currentTemplate?.id).toBe('test-2')
      expect(result.currentTemplateId).toBe('test-2')
      expect(result.selectedIndex).toBeNull()
      expect(result.dirty).toBe(false)
    })

    it('does nothing if ID not found', () => {
      const action: AppAction = { type: 'SELECT_TEMPLATE_BY_ID', payload: { id: 'nonexistent' } }
      const result = appReducer(initialState, action)

      expect(result).toEqual(initialState)
    })
  })

  describe('SET_THEME', () => {
    it('sets theme to dark', () => {
      const action: AppAction = { type: 'SET_THEME', payload: 'dark' }
      const result = appReducer(initialState, action)
      expect(result.theme).toBe('dark')
    })

    it('sets theme to light', () => {
      const state = { ...initialState, theme: 'dark' as const }
      const action: AppAction = { type: 'SET_THEME', payload: 'light' }
      const result = appReducer(state, action)
      expect(result.theme).toBe('light')
    })
  })

  describe('SET_DIRTY', () => {
    it('sets dirty flag', () => {
      const action: AppAction = { type: 'SET_DIRTY', payload: true }
      const result = appReducer(initialState, action)
      expect(result.dirty).toBe(true)
    })

    it('clears dirty flag', () => {
      const state = { ...initialState, dirty: true }
      const action: AppAction = { type: 'SET_DIRTY', payload: false }
      const result = appReducer(state, action)
      expect(result.dirty).toBe(false)
    })
  })

  describe('unknown action', () => {
    it('returns current state for unknown action types', () => {
      const action = { type: 'UNKNOWN_ACTION' } as unknown as AppAction
      const result = appReducer(initialState, action)
      expect(result).toEqual(initialState)
    })
  })
})

