import { useState, useCallback } from "react";
import type { TextSpan } from "@/types";

/**
 * Utility to ensure span is an object
 */
function normalizeSpan(span: TextSpan, property: string, value: unknown): TextSpan {
  if (typeof span === "string") {
    return { text: span, [property]: value };
  }
  return { ...span, [property]: value };
}

/**
 * Get text content from span
 */
export function getSpanText(span: TextSpan): string {
  return typeof span === "string" ? span : span.text;
}

/**
 * Get all properties from a span with defaults
 */
export function getSpanProps(span: TextSpan) {
  if (typeof span === "string") {
    return { 
      bold: false, 
      italics: false, 
      fontSize: undefined, 
      color: undefined, 
      style: undefined,
      link: undefined,
      linkToPage: undefined,
      linkToDestination: undefined,
      id: undefined,
    };
  }
  return {
    bold: span.bold || false,
    italics: span.italics || false,
    fontSize: span.fontSize,
    color: span.color,
    style: span.style,
    link: span.link,
    linkToPage: span.linkToPage,
    linkToDestination: span.linkToDestination,
    id: span.id,
  };
}

/**
 * Check if span has any link property
 */
export function hasAnyLink(span: TextSpan): boolean {
  if (typeof span === "string") return false;
  return !!(span.link || span.linkToPage || span.linkToDestination);
}

/**
 * Custom hook for managing rich text spans
 */
export function useSpanEditor(spans: TextSpan[], onChange: (spans: TextSpan[]) => void) {
  const [selectedSpanIndex, setSelectedSpanIndex] = useState<number | null>(null);
  const [showLinksSection, setShowLinksSection] = useState<Record<number, boolean>>({});

  const updateSpan = useCallback((index: number, newSpan: TextSpan) => {
    const updated = [...spans];
    updated[index] = newSpan;
    onChange(updated);
  }, [spans, onChange]);

  const addSpan = useCallback(() => {
    onChange([...spans, ""]);
    setSelectedSpanIndex(spans.length);
  }, [spans, onChange]);

  const deleteSpan = useCallback((index: number) => {
    const updated = spans.filter((_, i) => i !== index);
    onChange(updated);
    if (selectedSpanIndex === index) {
      setSelectedSpanIndex(null);
    } else if (selectedSpanIndex !== null && selectedSpanIndex > index) {
      setSelectedSpanIndex(selectedSpanIndex - 1);
    }
  }, [spans, onChange, selectedSpanIndex]);

  /**
   * Generic property setter - works for all properties
   */
  const setSpanProperty = useCallback(<K extends keyof NonNullable<Exclude<TextSpan, string>>>(
    index: number,
    property: K,
    value: NonNullable<Exclude<TextSpan, string>>[K]
  ) => {
    const span = spans[index];
    updateSpan(index, normalizeSpan(span, property, value));
  }, [spans, updateSpan]);

  /**
   * Update text content of span
   */
  const setSpanText = useCallback((index: number, text: string) => {
    const span = spans[index];
    if (typeof span === "string") {
      updateSpan(index, text);
    } else {
      updateSpan(index, { ...span, text });
    }
  }, [spans, updateSpan]);

  /**
   * Toggle boolean properties (bold, italic)
   */
  const toggleSpanProperty = useCallback((index: number, property: 'bold' | 'italics') => {
    const span = spans[index];
    if (typeof span === "string") {
      updateSpan(index, { text: span, [property]: true });
    } else {
      updateSpan(index, { ...span, [property]: !span[property] });
    }
  }, [spans, updateSpan]);

  /**
   * Toggle links section visibility
   */
  const toggleLinksSection = useCallback((index: number) => {
    setShowLinksSection(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  }, []);

  return {
    selectedSpanIndex,
    setSelectedSpanIndex,
    showLinksSection,
    addSpan,
    deleteSpan,
    setSpanText,
    setSpanProperty,
    toggleSpanProperty,
    toggleLinksSection,
  };
}

