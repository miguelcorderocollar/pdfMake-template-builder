import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import React from 'react'
import { useTemplateManagement } from '@/hooks/use-template-management'
import type { AppState, AppAction, Template } from '@/types'
import { appReducer } from '@/lib/app-reducer'

// Create a test provider that wraps the hook with AppContext
function createTestState(overrides?: Partial<AppState>): AppState {
  const template: Template = {
    id: 'test-1',
    name: 'Test Template',
    docDefinition: { content: [], styles: {} },
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

// Test wrapper component that provides context
interface TestAppContextType {
  state: AppState
  dispatch: React.Dispatch<AppAction>
}

const TestAppContext = React.createContext<TestAppContextType | undefined>(undefined)

// Override useApp for testing
vi.mock('@/lib/app-context', () => ({
  useApp: () => {
    const context = React.useContext(TestAppContext)
    if (!context) throw new Error('useApp must be used within provider')
    return context
  },
}))

function TestProvider({
  children,
  initialState,
  onDispatch,
}: {
  children: React.ReactNode
  initialState: AppState
  onDispatch?: (action: AppAction) => void
}) {
  const [state, baseDispatch] = React.useReducer(appReducer, initialState)
  
  const dispatch = React.useCallback(
    (action: AppAction) => {
      onDispatch?.(action)
      baseDispatch(action)
    },
    [onDispatch]
  )

  return (
    <TestAppContext.Provider value={{ state, dispatch }}>
      {children}
    </TestAppContext.Provider>
  )
}

describe('useTemplateManagement', () => {
  let mockConfirm: ReturnType<typeof vi.fn>
  let mockAlert: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockConfirm = vi.fn().mockReturnValue(true)
    mockAlert = vi.fn()
    globalThis.confirm = mockConfirm
    globalThis.alert = mockAlert
    
    // Mock URL methods for export
    URL.createObjectURL = vi.fn().mockReturnValue('blob:test')
    URL.revokeObjectURL = vi.fn()
    
    // Mock click for downloads
    HTMLAnchorElement.prototype.click = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('state access', () => {
    it('provides templates array', () => {
      const state = createTestState()
      
      const { result } = renderHook(() => useTemplateManagement(), {
        wrapper: ({ children }) => (
          <TestProvider initialState={state}>{children}</TestProvider>
        ),
      })

      expect(result.current.templates).toHaveLength(1)
      expect(result.current.templates[0].id).toBe('test-1')
    })

    it('provides current template', () => {
      const state = createTestState()
      
      const { result } = renderHook(() => useTemplateManagement(), {
        wrapper: ({ children }) => (
          <TestProvider initialState={state}>{children}</TestProvider>
        ),
      })

      expect(result.current.currentTemplate?.id).toBe('test-1')
    })

    it('provides dirty flag', () => {
      const state = createTestState({ dirty: true })
      
      const { result } = renderHook(() => useTemplateManagement(), {
        wrapper: ({ children }) => (
          <TestProvider initialState={state}>{children}</TestProvider>
        ),
      })

      expect(result.current.isDirty).toBe(true)
    })
  })

  describe('saveTemplate', () => {
    it('dispatches SAVE_TEMPLATE action', () => {
      const state = createTestState()
      const onDispatch = vi.fn()
      
      const { result } = renderHook(() => useTemplateManagement(), {
        wrapper: ({ children }) => (
          <TestProvider initialState={state} onDispatch={onDispatch}>
            {children}
          </TestProvider>
        ),
      })

      act(() => {
        result.current.saveTemplate()
      })

      expect(onDispatch).toHaveBeenCalledWith({ type: 'SAVE_TEMPLATE' })
    })

    it('alerts if template name is empty', () => {
      const template = { ...createTestState().currentTemplate!, name: '' }
      const state = createTestState({ currentTemplate: template })
      const onDispatch = vi.fn()
      
      const { result } = renderHook(() => useTemplateManagement(), {
        wrapper: ({ children }) => (
          <TestProvider initialState={state} onDispatch={onDispatch}>
            {children}
          </TestProvider>
        ),
      })

      act(() => {
        result.current.saveTemplate()
      })

      expect(mockAlert).toHaveBeenCalled()
      expect(onDispatch).not.toHaveBeenCalledWith({ type: 'SAVE_TEMPLATE' })
    })

    it('alerts if template name is only whitespace', () => {
      const template = { ...createTestState().currentTemplate!, name: '   ' }
      const state = createTestState({ currentTemplate: template })
      
      const { result } = renderHook(() => useTemplateManagement(), {
        wrapper: ({ children }) => (
          <TestProvider initialState={state}>{children}</TestProvider>
        ),
      })

      act(() => {
        result.current.saveTemplate()
      })

      expect(mockAlert).toHaveBeenCalled()
    })
  })

  describe('deleteTemplate', () => {
    it('dispatches DELETE_TEMPLATE action', () => {
      const state = createTestState()
      const onDispatch = vi.fn()
      
      const { result } = renderHook(() => useTemplateManagement(), {
        wrapper: ({ children }) => (
          <TestProvider initialState={state} onDispatch={onDispatch}>
            {children}
          </TestProvider>
        ),
      })

      act(() => {
        result.current.deleteTemplate('test-1')
      })

      expect(onDispatch).toHaveBeenCalledWith({
        type: 'DELETE_TEMPLATE',
        payload: { id: 'test-1' },
      })
    })
  })

  describe('copyCurrentTemplate', () => {
    it('duplicates and selects new template', () => {
      const state = createTestState()
      const onDispatch = vi.fn()
      
      const { result } = renderHook(() => useTemplateManagement(), {
        wrapper: ({ children }) => (
          <TestProvider initialState={state} onDispatch={onDispatch}>
            {children}
          </TestProvider>
        ),
      })

      act(() => {
        result.current.copyCurrentTemplate()
      })

      expect(onDispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'IMPORT_TEMPLATES' })
      )
      expect(onDispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'SELECT_TEMPLATE_BY_ID' })
      )
    })
  })

  describe('createNewTemplate', () => {
    it('creates a new template with unique name', () => {
      const state = createTestState()
      const onDispatch = vi.fn()
      
      const { result } = renderHook(() => useTemplateManagement(), {
        wrapper: ({ children }) => (
          <TestProvider initialState={state} onDispatch={onDispatch}>
            {children}
          </TestProvider>
        ),
      })

      act(() => {
        result.current.createNewTemplate()
      })

      expect(onDispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'IMPORT_TEMPLATES' })
      )
      expect(onDispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'SELECT_TEMPLATE_BY_ID' })
      )
    })

    it('prompts to save if dirty', () => {
      const state = createTestState({ dirty: true })
      mockConfirm.mockReturnValue(true)
      const onDispatch = vi.fn()
      
      const { result } = renderHook(() => useTemplateManagement(), {
        wrapper: ({ children }) => (
          <TestProvider initialState={state} onDispatch={onDispatch}>
            {children}
          </TestProvider>
        ),
      })

      act(() => {
        result.current.createNewTemplate()
      })

      expect(mockConfirm).toHaveBeenCalled()
    })
  })

  describe('selectTemplate', () => {
    it('dispatches SELECT_TEMPLATE_BY_ID action', () => {
      const template2: Template = {
        id: 'test-2',
        name: 'Second Template',
        docDefinition: { content: [], styles: {} },
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      const state = createTestState({
        templates: [createTestState().currentTemplate!, template2],
      })
      const onDispatch = vi.fn()
      
      const { result } = renderHook(() => useTemplateManagement(), {
        wrapper: ({ children }) => (
          <TestProvider initialState={state} onDispatch={onDispatch}>
            {children}
          </TestProvider>
        ),
      })

      act(() => {
        result.current.selectTemplate('test-2')
      })

      expect(onDispatch).toHaveBeenCalledWith({
        type: 'SELECT_TEMPLATE_BY_ID',
        payload: { id: 'test-2' },
      })
    })

    it('prompts to save if dirty', () => {
      const state = createTestState({ dirty: true })
      mockConfirm.mockReturnValue(false) // User cancels save
      const onDispatch = vi.fn()
      
      const { result } = renderHook(() => useTemplateManagement(), {
        wrapper: ({ children }) => (
          <TestProvider initialState={state} onDispatch={onDispatch}>
            {children}
          </TestProvider>
        ),
      })

      act(() => {
        result.current.selectTemplate('other-id')
      })

      expect(mockConfirm).toHaveBeenCalled()
    })
  })

  describe('importTemplateFromJSON', () => {
    it('imports valid JSON template', () => {
      const state = createTestState()
      const onDispatch = vi.fn()
      
      const { result } = renderHook(() => useTemplateManagement(), {
        wrapper: ({ children }) => (
          <TestProvider initialState={state} onDispatch={onDispatch}>
            {children}
          </TestProvider>
        ),
      })

      const json = JSON.stringify({
        id: 'imported-1',
        name: 'Imported',
        docDefinition: { content: ['Hello'], styles: {} },
      })

      let success = false
      act(() => {
        success = result.current.importTemplateFromJSON(json)
      })

      expect(success).toBe(true)
      expect(onDispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'IMPORT_TEMPLATES' })
      )
    })

    it('handles invalid JSON', () => {
      const state = createTestState()
      const onDispatch = vi.fn()
      
      const { result } = renderHook(() => useTemplateManagement(), {
        wrapper: ({ children }) => (
          <TestProvider initialState={state} onDispatch={onDispatch}>
            {children}
          </TestProvider>
        ),
      })

      let success = true
      act(() => {
        success = result.current.importTemplateFromJSON('not valid json')
      })

      expect(success).toBe(false)
      expect(mockAlert).toHaveBeenCalled()
    })

    it('handles array of templates', () => {
      const state = createTestState()
      const onDispatch = vi.fn()
      
      const { result } = renderHook(() => useTemplateManagement(), {
        wrapper: ({ children }) => (
          <TestProvider initialState={state} onDispatch={onDispatch}>
            {children}
          </TestProvider>
        ),
      })

      const json = JSON.stringify([
        {
          id: 'imported-1',
          name: 'Imported',
          docDefinition: { content: [], styles: {} },
        },
      ])

      let success = false
      act(() => {
        success = result.current.importTemplateFromJSON(json)
      })

      expect(success).toBe(true)
    })

    it('creates new template instead of overwriting existing one with same ID', () => {
      const state = createTestState()
      const onDispatch = vi.fn()
      
      const { result } = renderHook(() => useTemplateManagement(), {
        wrapper: ({ children }) => (
          <TestProvider initialState={state} onDispatch={onDispatch}>
            {children}
          </TestProvider>
        ),
      })

      // Import a template with the same ID as an existing template
      const json = JSON.stringify({
        id: 'test-1', // Same ID as existing template in createTestState
        name: 'Should Not Overwrite',
        docDefinition: { content: ['New content'], styles: {} },
      })

      act(() => {
        result.current.importTemplateFromJSON(json)
      })

      // Verify that IMPORT_TEMPLATES was called
      const importCall = onDispatch.mock.calls.find(
        call => call[0].type === 'IMPORT_TEMPLATES'
      )
      expect(importCall).toBeDefined()
      
      // Verify the imported template has a different ID (new ID generated)
      const importedTemplate = importCall![0].payload.templates[0]
      expect(importedTemplate.id).not.toBe('test-1')
      expect(importedTemplate.name).toBe('Should Not Overwrite')
      expect(importedTemplate.docDefinition.content).toEqual(['New content'])
    })
  })

  describe('exportCurrent', () => {
    it('exports current template to file', () => {
      const state = createTestState()
      
      const { result } = renderHook(() => useTemplateManagement(), {
        wrapper: ({ children }) => (
          <TestProvider initialState={state}>{children}</TestProvider>
        ),
      })

      act(() => {
        result.current.exportCurrent()
      })

      expect(URL.createObjectURL).toHaveBeenCalled()
    })
  })

  describe('exportAll', () => {
    it('exports all templates to file', () => {
      const state = createTestState()
      
      const { result } = renderHook(() => useTemplateManagement(), {
        wrapper: ({ children }) => (
          <TestProvider initialState={state}>{children}</TestProvider>
        ),
      })

      act(() => {
        result.current.exportAll()
      })

      expect(URL.createObjectURL).toHaveBeenCalled()
    })
  })
})

