'use client';

import { useEffect } from 'react';

interface KeyboardShortcutHandlers {
  onEscape?: () => void;
  onEnter?: () => void;
  onCtrlS?: () => void;
  onCtrlP?: () => void;
  onF1?: () => void;
  onCtrlK?: () => void;
}

export function useKeyboardShortcuts(handlers: KeyboardShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'Escape' && handlers.onEscape) {
        e.preventDefault();
        handlers.onEscape();
      }
      
      if (e.key === 'Enter' && handlers.onEnter) {
        e.preventDefault();
        handlers.onEnter();
      }
      
      if (e.ctrlKey && e.key === 's' && handlers.onCtrlS) {
        e.preventDefault();
        handlers.onCtrlS();
      }
      
      if (e.ctrlKey && e.key === 'p' && handlers.onCtrlP) {
        e.preventDefault();
        handlers.onCtrlP();
      }
      
      if (e.key === 'F1' && handlers.onF1) {
        e.preventDefault();
        handlers.onF1();
      }
      
      if (e.ctrlKey && e.key === 'k' && handlers.onCtrlK) {
        e.preventDefault();
        handlers.onCtrlK();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
}