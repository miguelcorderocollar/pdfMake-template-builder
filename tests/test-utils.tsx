import React, { ReactElement, useReducer } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { vi } from 'vitest'
import type { AppState, AppAction, Template, DocDefinition } from '@/types'
import { appReducer } from '@/lib/app-reducer'

// Default minimal template for testing
export const createTestTemplate = (overrides?: Partial<Template>): Template => ({
  id: 'test-template-1',
  name: 'Test Template',
  docDefinition: {
    content: [],
    styles: {},
  },
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
})

// Default test state
export const createTestState = (overrides?: Partial<AppState>): AppState => {
  const template = createTestTemplate()
  return {
    currentTemplate: template,
    templates: [template],
    currentTemplateId: template.id,
    selectedIndex: null,
    isPreviewMode: false,
    isLoading: false,
    filename: 'test.pdf',
    theme: 'light',
    dirty: false,
    ...overrides,
  }
}

// Create context type matching the app
interface TestAppContextType {
  state: AppState
  dispatch: React.Dispatch<AppAction>
}

const TestAppContext = React.createContext<TestAppContextType | undefined>(undefined)

// Test provider that doesn't use localStorage persistence
interface TestAppProviderProps {
  children: React.ReactNode
  initialState?: Partial<AppState>
  onDispatch?: (action: AppAction) => void
}

export function TestAppProvider({ children, initialState, onDispatch }: TestAppProviderProps) {
  const fullInitialState = createTestState(initialState)
  const [state, baseDispatch] = useReducer(appReducer, fullInitialState)

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

// Hook for tests to access context
export function useTestApp() {
  const context = React.useContext(TestAppContext)
  if (context === undefined) {
    throw new Error('useTestApp must be used within a TestAppProvider')
  }
  return context
}

// Custom render function with app context
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialState?: Partial<AppState>
  onDispatch?: (action: AppAction) => void
}

export function renderWithAppContext(
  ui: ReactElement,
  { initialState, onDispatch, ...renderOptions }: CustomRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <TestAppProvider initialState={initialState} onDispatch={onDispatch}>
        {children}
      </TestAppProvider>
    )
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    // Return the initial state for assertions
    initialState: createTestState(initialState),
  }
}

// Mock localStorage utilities
export function createMockLocalStorage() {
  let store: Record<string, string> = {}
  
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
    get length() {
      return Object.keys(store).length
    },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
    // Test helpers
    _getStore: () => ({ ...store }),
    _setStore: (newStore: Record<string, string>) => {
      store = { ...newStore }
    },
  }
}

// Helper to create a DocDefinition with content
export function createTestDocDefinition(overrides?: Partial<DocDefinition>): DocDefinition {
  return {
    content: [],
    styles: {},
    ...overrides,
  }
}

// Helper to create content items for testing
export const testContentItems = {
  string: 'Hello, World!',
  textNode: { text: 'Text node content', style: 'header' },
  imageNode: { image: 'data:image/png;base64,abc123', width: 100, height: 100 },
  unorderedList: { ul: ['Item 1', 'Item 2', 'Item 3'] },
  orderedList: { ol: ['First', 'Second', 'Third'] },
  table: {
    table: {
      body: [
        ['Header 1', 'Header 2'],
        ['Cell 1', 'Cell 2'],
      ],
    },
  },
}

// Re-export testing library utilities
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'

