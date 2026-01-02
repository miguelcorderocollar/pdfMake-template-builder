import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { ContentList } from '@/components/nodes/ContentList'
import type { AppState, AppAction, Template } from '@/types'
import { appReducer } from '@/lib/app-reducer'

// Mock the app context
const TestAppContext = React.createContext<{
  state: AppState
  dispatch: React.Dispatch<AppAction>
} | undefined>(undefined)

vi.mock('@/lib/app-context', () => ({
  useApp: () => {
    const context = React.useContext(TestAppContext)
    if (!context) throw new Error('useApp must be used within provider')
    return context
  },
}))

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

function TestProvider({
  children,
  initialState,
}: {
  children: React.ReactNode
  initialState: AppState
}) {
  const [state, dispatch] = React.useReducer(appReducer, initialState)
  return (
    <TestAppContext.Provider value={{ state, dispatch }}>
      {children}
    </TestAppContext.Provider>
  )
}

describe('ContentList', () => {
  it('renders with empty content', () => {
    const state = createTestState()
    
    render(
      <TestProvider initialState={state}>
        <ContentList />
      </TestProvider>
    )

    expect(screen.getByText('Content Items (0)')).toBeInTheDocument()
  })

  it('displays content count', () => {
    const state = createTestState({
      currentTemplate: {
        id: 'test-1',
        name: 'Test',
        docDefinition: {
          content: ['First', 'Second', 'Third'],
          styles: {},
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })

    render(
      <TestProvider initialState={state}>
        <ContentList />
      </TestProvider>
    )

    expect(screen.getByText('Content Items (3)')).toBeInTheDocument()
  })

  it('renders string content items', () => {
    const state = createTestState({
      currentTemplate: {
        id: 'test-1',
        name: 'Test',
        docDefinition: {
          content: ['Hello World'],
          styles: {},
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })

    render(
      <TestProvider initialState={state}>
        <ContentList />
      </TestProvider>
    )

    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })

  it('renders text node content items', () => {
    const state = createTestState({
      currentTemplate: {
        id: 'test-1',
        name: 'Test',
        docDefinition: {
          content: [{ text: 'Styled Text', style: 'header' }],
          styles: { header: { fontSize: 24 } },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })

    render(
      <TestProvider initialState={state}>
        <ContentList />
      </TestProvider>
    )

    // Text node preview should show the text
    expect(screen.getByText('Styled Text')).toBeInTheDocument()
  })

  it('renders list node content items', () => {
    const state = createTestState({
      currentTemplate: {
        id: 'test-1',
        name: 'Test',
        docDefinition: {
          content: [{ ul: ['Item 1', 'Item 2'] }],
          styles: {},
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })

    render(
      <TestProvider initialState={state}>
        <ContentList />
      </TestProvider>
    )

    // List items should be rendered
    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
  })

  it('renders table node content items', () => {
    const state = createTestState({
      currentTemplate: {
        id: 'test-1',
        name: 'Test',
        docDefinition: {
          content: [{
            table: {
              body: [
                ['Header 1', 'Header 2'],
                ['Cell 1', 'Cell 2'],
              ],
            },
          }],
          styles: {},
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })

    render(
      <TestProvider initialState={state}>
        <ContentList />
      </TestProvider>
    )

    // Table cells should be rendered
    expect(screen.getByText('Header 1')).toBeInTheDocument()
    expect(screen.getByText('Cell 1')).toBeInTheDocument()
  })

  it('renders multiple content item types', () => {
    const state = createTestState({
      currentTemplate: {
        id: 'test-1',
        name: 'Test',
        docDefinition: {
          content: [
            'Paragraph',
            { text: 'Text Node' },
            { ul: ['List Item'] },
          ],
          styles: {},
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })

    render(
      <TestProvider initialState={state}>
        <ContentList />
      </TestProvider>
    )

    expect(screen.getByText('Content Items (3)')).toBeInTheDocument()
    expect(screen.getByText('Paragraph')).toBeInTheDocument()
    expect(screen.getByText('Text Node')).toBeInTheDocument()
    expect(screen.getByText('List Item')).toBeInTheDocument()
  })
})

