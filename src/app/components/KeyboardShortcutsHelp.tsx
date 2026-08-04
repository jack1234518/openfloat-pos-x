'use client';

import { useState } from 'react';
import { Keyboard, X } from 'lucide-react';

export function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);

  const shortcuts = [
    { keys: ['Ctrl', 'S'], action: 'Save' },
    { keys: ['Ctrl', 'P'], action: 'Print' },
    { keys: ['Ctrl', 'K'], action: 'Search' },
    { keys: ['F1'], action: 'Help' },
    { keys: ['Esc'], action: 'Close/Cancel' },
    { keys: ['Enter'], action: 'Submit/Confirm' },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-full shadow-lg transition z-40"
        title="Keyboard Shortcuts"
      >
        <Keyboard className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">Keyboard Shortcuts</h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-2">
              {shortcuts.map((shortcut, idx) => (
                <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-800">
                  <div className="flex gap-1">
                    {shortcut.keys.map((key, i) => (
                      <kbd key={i} className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs font-mono text-white">
                        {key}
                      </kbd>
                    ))}
                  </div>
                  <span className="text-sm text-slate-300">{shortcut.action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}