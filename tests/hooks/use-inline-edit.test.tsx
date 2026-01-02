import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useInlineEdit } from '@/hooks/use-inline-edit'

describe('useInlineEdit', () => {
  describe('initial state', () => {
    it('starts in non-editing mode', () => {
      const { result } = renderHook(() => useInlineEdit())
      expect(result.current.isEditing).toBe(false)
    })

    it('has empty draft by default', () => {
      const { result } = renderHook(() => useInlineEdit())
      expect(result.current.draft).toBe('')
    })

    it('uses provided initial value', () => {
      const { result } = renderHook(() => useInlineEdit('Initial'))
      expect(result.current.draft).toBe('Initial')
    })

    it('provides inputRef', () => {
      const { result } = renderHook(() => useInlineEdit())
      expect(result.current.inputRef).toBeDefined()
      expect(result.current.inputRef.current).toBeNull()
    })
  })

  describe('startEditing', () => {
    it('sets isEditing to true', () => {
      const { result } = renderHook(() => useInlineEdit())
      
      act(() => {
        result.current.startEditing('Hello')
      })
      
      expect(result.current.isEditing).toBe(true)
    })

    it('sets draft to provided value', () => {
      const { result } = renderHook(() => useInlineEdit())
      
      act(() => {
        result.current.startEditing('New Value')
      })
      
      expect(result.current.draft).toBe('New Value')
    })

    it('uses empty string if no value provided', () => {
      const { result } = renderHook(() => useInlineEdit('Initial'))
      
      act(() => {
        result.current.startEditing()
      })
      
      expect(result.current.draft).toBe('')
    })
  })

  describe('cancelEditing', () => {
    it('sets isEditing to false', () => {
      const { result } = renderHook(() => useInlineEdit())
      
      act(() => {
        result.current.startEditing('Hello')
      })
      expect(result.current.isEditing).toBe(true)
      
      act(() => {
        result.current.cancelEditing()
      })
      expect(result.current.isEditing).toBe(false)
    })

    it('preserves draft value', () => {
      const { result } = renderHook(() => useInlineEdit())
      
      act(() => {
        result.current.startEditing('Hello')
        result.current.setDraft('Modified')
      })
      
      act(() => {
        result.current.cancelEditing()
      })
      
      expect(result.current.draft).toBe('Modified')
    })
  })

  describe('saveEditing', () => {
    it('calls onSave with trimmed value', () => {
      const { result } = renderHook(() => useInlineEdit())
      const onSave = vi.fn()
      
      act(() => {
        result.current.startEditing('  Hello World  ')
        result.current.setDraft('  Hello World  ')
      })
      
      act(() => {
        result.current.saveEditing(onSave)
      })
      
      expect(onSave).toHaveBeenCalledWith('Hello World')
    })

    it('sets isEditing to false', () => {
      const { result } = renderHook(() => useInlineEdit())
      const onSave = vi.fn()
      
      act(() => {
        result.current.startEditing('Hello')
      })
      
      act(() => {
        result.current.saveEditing(onSave)
      })
      
      expect(result.current.isEditing).toBe(false)
    })
  })

  describe('setDraft', () => {
    it('updates the draft value', () => {
      const { result } = renderHook(() => useInlineEdit())
      
      act(() => {
        result.current.setDraft('New Draft')
      })
      
      expect(result.current.draft).toBe('New Draft')
    })
  })

  describe('handleKeyDown', () => {
    it('saves on Enter key', () => {
      const { result } = renderHook(() => useInlineEdit())
      const onSave = vi.fn()
      
      act(() => {
        result.current.startEditing('Test Value')
      })
      
      act(() => {
        result.current.handleKeyDown(
          { key: 'Enter' } as React.KeyboardEvent,
          onSave
        )
      })
      
      expect(onSave).toHaveBeenCalledWith('Test Value')
      expect(result.current.isEditing).toBe(false)
    })

    it('cancels on Escape key', () => {
      const { result } = renderHook(() => useInlineEdit())
      const onSave = vi.fn()
      
      act(() => {
        result.current.startEditing('Test Value')
      })
      
      act(() => {
        result.current.handleKeyDown(
          { key: 'Escape' } as React.KeyboardEvent,
          onSave
        )
      })
      
      expect(onSave).not.toHaveBeenCalled()
      expect(result.current.isEditing).toBe(false)
    })

    it('does nothing on other keys', () => {
      const { result } = renderHook(() => useInlineEdit())
      const onSave = vi.fn()
      
      act(() => {
        result.current.startEditing('Test Value')
      })
      
      act(() => {
        result.current.handleKeyDown(
          { key: 'a' } as React.KeyboardEvent,
          onSave
        )
      })
      
      expect(onSave).not.toHaveBeenCalled()
      expect(result.current.isEditing).toBe(true)
    })
  })
})

