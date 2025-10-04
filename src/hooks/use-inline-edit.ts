import { useState, useEffect, useRef } from "react";

/**
 * Custom hook for managing inline editing state
 */
export function useInlineEdit(initialValue: string = '') {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus and select text when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const startEditing = (currentValue: string = '') => {
    setDraft(currentValue);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const saveEditing = (onSave: (value: string) => void) => {
    const trimmed = draft.trim();
    setIsEditing(false);
    onSave(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent, onSave: (value: string) => void) => {
    if (e.key === 'Enter') {
      saveEditing(onSave);
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  return {
    isEditing,
    draft,
    setDraft,
    inputRef,
    startEditing,
    cancelEditing,
    saveEditing,
    handleKeyDown,
  };
}

