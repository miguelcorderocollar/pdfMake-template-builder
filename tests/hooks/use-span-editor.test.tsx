import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import {
  useSpanEditor,
  getSpanText,
  getSpanProps,
  hasAnyLink,
} from '@/hooks/use-span-editor'
import type { TextSpan } from '@/types'

describe('use-span-editor utilities', () => {
  describe('getSpanText', () => {
    it('returns string directly', () => {
      expect(getSpanText('Hello')).toBe('Hello')
    })

    it('returns text from span object', () => {
      expect(getSpanText({ text: 'World', bold: true })).toBe('World')
    })

    it('handles empty string', () => {
      expect(getSpanText('')).toBe('')
    })

    it('handles span with empty text', () => {
      expect(getSpanText({ text: '' })).toBe('')
    })
  })

  describe('getSpanProps', () => {
    it('returns defaults for string span', () => {
      const props = getSpanProps('Hello')
      expect(props).toEqual({
        bold: false,
        italics: false,
        fontSize: undefined,
        color: undefined,
        style: undefined,
        link: undefined,
        linkToPage: undefined,
        linkToDestination: undefined,
        id: undefined,
      })
    })

    it('returns properties from span object', () => {
      const span: TextSpan = {
        text: 'Styled',
        bold: true,
        italics: true,
        fontSize: 16,
        color: 'red',
      }
      const props = getSpanProps(span)
      expect(props.bold).toBe(true)
      expect(props.italics).toBe(true)
      expect(props.fontSize).toBe(16)
      expect(props.color).toBe('red')
    })

    it('returns link properties', () => {
      const span: TextSpan = {
        text: 'Link',
        link: 'https://example.com',
        linkToPage: 2,
        linkToDestination: 'section1',
        id: 'myspan',
      }
      const props = getSpanProps(span)
      expect(props.link).toBe('https://example.com')
      expect(props.linkToPage).toBe(2)
      expect(props.linkToDestination).toBe('section1')
      expect(props.id).toBe('myspan')
    })

    it('returns false for undefined bold/italics', () => {
      const span: TextSpan = { text: 'Plain' }
      const props = getSpanProps(span)
      expect(props.bold).toBe(false)
      expect(props.italics).toBe(false)
    })
  })

  describe('hasAnyLink', () => {
    it('returns false for string span', () => {
      expect(hasAnyLink('Hello')).toBe(false)
    })

    it('returns false for span without links', () => {
      expect(hasAnyLink({ text: 'No link', bold: true })).toBe(false)
    })

    it('returns true for span with link', () => {
      expect(hasAnyLink({ text: 'Link', link: 'https://example.com' })).toBe(true)
    })

    it('returns true for span with linkToPage', () => {
      expect(hasAnyLink({ text: 'Page link', linkToPage: 3 })).toBe(true)
    })

    it('returns true for span with linkToDestination', () => {
      expect(hasAnyLink({ text: 'Dest link', linkToDestination: 'section' })).toBe(true)
    })

    it('returns true for span with multiple link types', () => {
      expect(hasAnyLink({
        text: 'Multi',
        link: 'https://example.com',
        linkToPage: 1,
      })).toBe(true)
    })
  })
})

describe('useSpanEditor hook', () => {
  describe('initial state', () => {
    it('has no selected span initially', () => {
      const onChange = vi.fn()
      const { result } = renderHook(() => useSpanEditor(['Hello'], onChange))
      expect(result.current.selectedSpanIndex).toBeNull()
    })

    it('has empty links section visibility', () => {
      const onChange = vi.fn()
      const { result } = renderHook(() => useSpanEditor(['Hello'], onChange))
      expect(result.current.showLinksSection).toEqual({})
    })
  })

  describe('addSpan', () => {
    it('adds empty string span', () => {
      const onChange = vi.fn()
      const { result } = renderHook(() => useSpanEditor(['Hello'], onChange))

      act(() => {
        result.current.addSpan()
      })

      expect(onChange).toHaveBeenCalledWith(['Hello', ''])
    })

    it('selects the new span', () => {
      const onChange = vi.fn()
      const { result } = renderHook(() => useSpanEditor(['A', 'B'], onChange))

      act(() => {
        result.current.addSpan()
      })

      expect(result.current.selectedSpanIndex).toBe(2)
    })
  })

  describe('deleteSpan', () => {
    it('removes span at index', () => {
      const onChange = vi.fn()
      const { result } = renderHook(() => useSpanEditor(['A', 'B', 'C'], onChange))

      act(() => {
        result.current.deleteSpan(1)
      })

      expect(onChange).toHaveBeenCalledWith(['A', 'C'])
    })

    it('clears selection if deleted span was selected', () => {
      const onChange = vi.fn()
      const { result } = renderHook(() => useSpanEditor(['A', 'B'], onChange))

      act(() => {
        result.current.setSelectedSpanIndex(1)
      })

      act(() => {
        result.current.deleteSpan(1)
      })

      expect(result.current.selectedSpanIndex).toBeNull()
    })

    it('adjusts selection if deleted span was before selected', () => {
      const onChange = vi.fn()
      const { result } = renderHook(() => useSpanEditor(['A', 'B', 'C'], onChange))

      act(() => {
        result.current.setSelectedSpanIndex(2)
      })

      act(() => {
        result.current.deleteSpan(0)
      })

      expect(result.current.selectedSpanIndex).toBe(1)
    })
  })

  describe('setSpanText', () => {
    it('updates string span text', () => {
      const onChange = vi.fn()
      const { result } = renderHook(() => useSpanEditor(['Hello'], onChange))

      act(() => {
        result.current.setSpanText(0, 'World')
      })

      expect(onChange).toHaveBeenCalledWith(['World'])
    })

    it('updates object span text', () => {
      const onChange = vi.fn()
      const spans: TextSpan[] = [{ text: 'Hello', bold: true }]
      const { result } = renderHook(() => useSpanEditor(spans, onChange))

      act(() => {
        result.current.setSpanText(0, 'World')
      })

      expect(onChange).toHaveBeenCalledWith([{ text: 'World', bold: true }])
    })
  })

  describe('setSpanProperty', () => {
    it('sets property on string span (converts to object)', () => {
      const onChange = vi.fn()
      const { result } = renderHook(() => useSpanEditor(['Hello'], onChange))

      act(() => {
        result.current.setSpanProperty(0, 'bold', true)
      })

      expect(onChange).toHaveBeenCalledWith([{ text: 'Hello', bold: true }])
    })

    it('sets property on object span', () => {
      const onChange = vi.fn()
      const spans: TextSpan[] = [{ text: 'Hello', bold: true }]
      const { result } = renderHook(() => useSpanEditor(spans, onChange))

      act(() => {
        result.current.setSpanProperty(0, 'italics', true)
      })

      expect(onChange).toHaveBeenCalledWith([{ text: 'Hello', bold: true, italics: true }])
    })

    it('sets link property', () => {
      const onChange = vi.fn()
      const spans: TextSpan[] = [{ text: 'Click me' }]
      const { result } = renderHook(() => useSpanEditor(spans, onChange))

      act(() => {
        result.current.setSpanProperty(0, 'link', 'https://example.com')
      })

      expect(onChange).toHaveBeenCalledWith([{ text: 'Click me', link: 'https://example.com' }])
    })
  })

  describe('toggleSpanProperty', () => {
    it('toggles bold on string span', () => {
      const onChange = vi.fn()
      const { result } = renderHook(() => useSpanEditor(['Hello'], onChange))

      act(() => {
        result.current.toggleSpanProperty(0, 'bold')
      })

      expect(onChange).toHaveBeenCalledWith([{ text: 'Hello', bold: true }])
    })

    it('toggles bold off on object span', () => {
      const onChange = vi.fn()
      const spans: TextSpan[] = [{ text: 'Hello', bold: true }]
      const { result } = renderHook(() => useSpanEditor(spans, onChange))

      act(() => {
        result.current.toggleSpanProperty(0, 'bold')
      })

      expect(onChange).toHaveBeenCalledWith([{ text: 'Hello', bold: false }])
    })

    it('toggles italics', () => {
      const onChange = vi.fn()
      const spans: TextSpan[] = [{ text: 'Hello' }]
      const { result } = renderHook(() => useSpanEditor(spans, onChange))

      act(() => {
        result.current.toggleSpanProperty(0, 'italics')
      })

      expect(onChange).toHaveBeenCalledWith([{ text: 'Hello', italics: true }])
    })
  })

  describe('toggleLinksSection', () => {
    it('toggles links section visibility', () => {
      const onChange = vi.fn()
      const { result } = renderHook(() => useSpanEditor(['Hello'], onChange))

      expect(result.current.showLinksSection[0]).toBeFalsy()

      act(() => {
        result.current.toggleLinksSection(0)
      })

      expect(result.current.showLinksSection[0]).toBe(true)

      act(() => {
        result.current.toggleLinksSection(0)
      })

      expect(result.current.showLinksSection[0]).toBe(false)
    })

    it('handles multiple indices independently', () => {
      const onChange = vi.fn()
      const { result } = renderHook(() => useSpanEditor(['A', 'B', 'C'], onChange))

      act(() => {
        result.current.toggleLinksSection(0)
        result.current.toggleLinksSection(2)
      })

      expect(result.current.showLinksSection[0]).toBe(true)
      expect(result.current.showLinksSection[1]).toBeFalsy()
      expect(result.current.showLinksSection[2]).toBe(true)
    })
  })

  describe('setSelectedSpanIndex', () => {
    it('sets selected span index', () => {
      const onChange = vi.fn()
      const { result } = renderHook(() => useSpanEditor(['A', 'B'], onChange))

      act(() => {
        result.current.setSelectedSpanIndex(1)
      })

      expect(result.current.selectedSpanIndex).toBe(1)
    })

    it('clears selection with null', () => {
      const onChange = vi.fn()
      const { result } = renderHook(() => useSpanEditor(['A'], onChange))

      act(() => {
        result.current.setSelectedSpanIndex(0)
      })

      act(() => {
        result.current.setSelectedSpanIndex(null)
      })

      expect(result.current.selectedSpanIndex).toBeNull()
    })
  })
})

