'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface PaginatedTableProps<T> {
  data: T[];
  columns: Column<T>[];
  itemsPerPage?: number;
  onRowClick?: (item: T) => void;
}

export function PaginatedTable<T extends Record<string, any>>({
  data,
  columns,
  itemsPerPage = 10,
  onRowClick,
}: PaginatedTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortField) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (aVal === undefined || bVal === undefined) return 0;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return sortDirection === 'asc' 
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [data, sortField, sortDirection]);

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <p>No data available</p>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto table-container">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800">
              {columns.map((col) => (
                <th 
                  key={String(col.key)} 
                  className="pb-2 text-slate-400 font-bold cursor-pointer hover:text-white transition"
                  onClick={() => col.key && handleSort(String(col.key))}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {sortField === col.key && (
                      <span className="text-blue-400">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item, idx) => (
              <tr 
                key={idx} 
                className={`border-b border-slate-800/50 hover:bg-slate-900/50 transition ${
                  onRowClick ? 'cursor-pointer' : ''
                }`}
                onClick={() => onRowClick && onRowClick(item)}
              >
                {columns.map((col) => (
                  <td key={String(col.key)} className="py-2.5">
                    {col.render ? col.render(item) : item[col.key as keyof T]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
          <span className="text-xs text-slate-400">
            Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, sortedData.length)} of {sortedData.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-1.5 bg-slate-900 border border-slate-700 rounded hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 bg-slate-900 border border-slate-700 rounded hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            <span className="px-3 py-1 text-sm text-white bg-slate-800 rounded">
              {currentPage} / {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 bg-slate-900 border border-slate-700 rounded hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-1.5 bg-slate-900 border border-slate-700 rounded hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}