import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useLocalStoragePersistence } from '@/hooks/use-local-storage-persistence'
import type { AppState, AppAction, Template } from '@/types'

// Create a minimal valid state
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

describe('useLocalStoragePersistence', () => {
  let localStorageData: Record<string, string>
  let originalLocalStorage: Storage

  beforeEach(() => {
    localStorageData = {}
    originalLocalStorage = window.localStorage
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn((key: string) => localStorageData[key] ?? null),
        setItem: vi.fn((key: string, value: string) => {
          localStorageData[key] = value
        }),
        removeItem: vi.fn((key: string) => {
          delete localStorageData[key]
        }),
        clear: vi.fn(() => {
          localStorageData = {}
        }),
      },
      writable: true,
    })
  })

  afterEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      writable: true,
    })
  })

  describe('loading from localStorage', () => {
    it('dispatches SET_TEMPLATE when templates exist in localStorage', () => {
      const savedTemplates = [
        {
          id: 'saved-1',
          name: 'Saved Template',
          docDefinition: { content: ['Hello'] },
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ]
      localStorageData['templates_v1'] = JSON.stringify(savedTemplates)
      localStorageData['currentTemplateId_v1'] = 'saved-1'

      const state = createTestState()
      const dispatch = vi.fn()

      renderHook(() => useLocalStoragePersistence(state, dispatch))

      expect(dispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'SET_TEMPLATE' })
      )
      expect(dispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'IMPORT_TEMPLATES' })
      )
    })

    it('loads theme from localStorage', () => {
      localStorageData['theme_v1'] = 'dark'

      const state = createTestState()
      const dispatch = vi.fn()

      renderHook(() => useLocalStoragePersistence(state, dispatch))

      expect(dispatch).toHaveBeenCalledWith({ type: 'SET_THEME', payload: 'dark' })
    })

    it('loads filename from localStorage', () => {
      localStorageData['filename'] = 'my-doc.pdf'

      const state = createTestState()
      const dispatch = vi.fn()

      renderHook(() => useLocalStoragePersistence(state, dispatch))

      expect(dispatch).toHaveBeenCalledWith({ type: 'SET_FILENAME', payload: 'my-doc.pdf' })
    })

    it('handles back-compat with old docDefinition key', () => {
      const oldDocDef = { content: ['Old format'], styles: {} }
      localStorageData['docDefinition'] = JSON.stringify(oldDocDef)

      const state = createTestState()
      const dispatch = vi.fn()

      renderHook(() => useLocalStoragePersistence(state, dispatch))

      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_DOCDEFINITION',
        payload: oldDocDef,
      })
    })

    it('handles localStorage errors gracefully', () => {
      // Simulate localStorage throwing an error
      vi.spyOn(window.localStorage, 'getItem').mockImplementation(() => {
        throw new Error('Storage quota exceeded')
      })

      const state = createTestState()
      const dispatch = vi.fn()

      // Should not throw
      expect(() => {
        renderHook(() => useLocalStoragePersistence(state, dispatch))
      }).not.toThrow()
    })

    it('handles invalid JSON gracefully', () => {
      localStorageData['templates_v1'] = 'not valid json {'

      const state = createTestState()
      const dispatch = vi.fn()

      // Should not throw
      expect(() => {
        renderHook(() => useLocalStoragePersistence(state, dispatch))
      }).not.toThrow()
    })
  })

  describe('persisting to localStorage', () => {
    it('saves templates when state changes', () => {
      const state = createTestState()
      const dispatch = vi.fn()

      renderHook(() => useLocalStoragePersistence(state, dispatch))

      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        'templates_v1',
        expect.any(String)
      )
    })

    it('saves currentTemplateId when state changes', () => {
      const state = createTestState({ currentTemplateId: 'my-template' })
      const dispatch = vi.fn()

      renderHook(() => useLocalStoragePersistence(state, dispatch))

      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        'currentTemplateId_v1',
        'my-template'
      )
    })

    it('saves theme when state changes', () => {
      const state = createTestState({ theme: 'dark' })
      const dispatch = vi.fn()

      renderHook(() => useLocalStoragePersistence(state, dispatch))

      expect(window.localStorage.setItem).toHaveBeenCalledWith('theme_v1', 'dark')
    })

    it('saves filename when state changes', () => {
      const state = createTestState({ filename: 'my-file.pdf' })
      const dispatch = vi.fn()

      renderHook(() => useLocalStoragePersistence(state, dispatch))

      expect(window.localStorage.setItem).toHaveBeenCalledWith('filename', 'my-file.pdf')
    })

    it('handles storage errors gracefully on save', () => {
      vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
        throw new Error('Storage quota exceeded')
      })

      const state = createTestState()
      const dispatch = vi.fn()

      // Should not throw
      expect(() => {
        renderHook(() => useLocalStoragePersistence(state, dispatch))
      }).not.toThrow()
    })

    it('updates when state changes', () => {
      const dispatch = vi.fn()
      const initialState = createTestState({ theme: 'light' })

      const { rerender } = renderHook(
        ({ state }) => useLocalStoragePersistence(state, dispatch),
        { initialProps: { state: initialState } }
      )

      // Update state
      const newState = createTestState({ theme: 'dark' })
      rerender({ state: newState })

      // Should have been called with the new theme
      const setItemCalls = (window.localStorage.setItem as ReturnType<typeof vi.fn>).mock.calls as [string, string][]
      const themeCalls = setItemCalls.filter(([key]) => key === 'theme_v1')
      expect(themeCalls[themeCalls.length - 1][1]).toBe('dark')
    })
  })
})

