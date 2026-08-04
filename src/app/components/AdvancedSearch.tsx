'use client';

import { useState } from 'react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';

interface FilterOption {
  label: string;
  value: string;
  options: { label: string; value: string }[];
}

interface AdvancedSearchProps {
  onSearch: (query: string, filters: Record<string, string>) => void;
  placeholder?: string;
  filters?: FilterOption[];
}

export function AdvancedSearch({ 
  onSearch, 
  placeholder = "Search...",
  filters = []
}: AdvancedSearchProps) {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  const handleSearch = () => {
    onSearch(query, activeFilters);
  };

  const clearFilters = () => {
    setActiveFilters({});
    setQuery('');
    onSearch('', {});
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={placeholder}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        {filters.length > 0 && (
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 rounded-xl border transition ${
              showFilters 
                ? 'bg-blue-600 border-blue-500 text-white' 
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Filter className="h-4 w-4" />
          </button>
        )}
        
        <button
          onClick={handleSearch}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition"
        >
          Search
        </button>
        
        {(query || Object.keys(activeFilters).length > 0) && (
          <button
            onClick={clearFilters}
            className="p-2.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      
      {/* Filters dropdown */}
      {showFilters && filters.length > 0 && (
        <div className="absolute top-full mt-2 right-0 bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-xl z-50 min-w-[250px]">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-bold text-slate-300">Filters</span>
            <button 
              onClick={() => setShowFilters(false)} 
              className="text-slate-500 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          {filters.map((filter) => (
            <div key={filter.value} className="mb-3">
              <label className="text-xs text-slate-400 block mb-1">{filter.label}</label>
              <select
                value={activeFilters[filter.value] || ''}
                onChange={(e) => setActiveFilters({
                  ...activeFilters,
                  [filter.value]: e.target.value
                })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All</option>
                {filter.options.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
          
          <button
            onClick={() => {
              setShowFilters(false);
              handleSearch();
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition text-sm"
          >
            Apply Filters
          </button>
        </div>
      )}
    </div>
  );
}