'use client';

import { useState } from 'react';
import { Download, ChevronDown } from 'lucide-react';
import { exportToCSV, exportToJSON } from '../utils/export';

interface ExportButtonProps {
  data: any[];
  filename: string;
  label?: string;
}

export function ExportButton({ data, filename, label = 'Export' }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-3 py-2 rounded-xl transition"
      >
        <Download className="h-4 w-4" />
        {label}
        <ChevronDown className="h-4 w-4" />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 bg-slate-950 border border-slate-800 rounded-xl shadow-xl z-50 min-w-[150px]">
          <button
            onClick={() => {
              exportToCSV(data, filename);
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white rounded-t-xl transition"
          >
            📊 Export CSV
          </button>
          <button
            onClick={() => {
              exportToJSON(data, filename);
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white rounded-b-xl transition"
          >
            📄 Export JSON
          </button>
        </div>
      )}
    </div>
  );
}