import React from 'react';
import { EventCategory, SourceType } from '../../data/types/event';
import { Search, Filter, RotateCcw, SortAsc, Calendar } from 'lucide-react';

export interface FilterState {
  searchQuery: string;
  source: 'all' | SourceType;
  category: 'all' | EventCategory;
  monthRange: string; // 'all' or 'YYYY-MM'
  sortBy: 'newest' | 'oldest' | 'value_desc' | 'value_asc';
}

interface ExploreFiltersProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onReset: () => void;
  availableMonths: string[];
  totalFilteredCount: number;
}

export const ExploreFilters: React.FC<ExploreFiltersProps> = ({
  filters,
  onFilterChange,
  onReset,
  availableMonths,
  totalFilteredCount,
}) => {
  return (
    <div className="bg-[#0c0d15] border border-gray-800 rounded-xl p-4 sm:p-5 space-y-4 shadow-xl">
      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={filters.searchQuery}
          onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
          placeholder="Search track names, artists, merchants, categories, or notes..."
          className="w-full bg-[#07070a] border border-gray-800 focus:border-blue-500 text-gray-100 placeholder-gray-500 font-mono text-xs pl-10 pr-4 py-2.5 rounded-lg outline-none transition-colors"
        />
        {filters.searchQuery && (
          <button
            onClick={() => onFilterChange({ searchQuery: '' })}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 font-mono text-xs"
          >
            CLEAR
          </button>
        )}
      </div>

      {/* Filter Options Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 font-mono text-xs">
        {/* Source Filter */}
        <div className="space-y-1">
          <label className="text-[10px] text-gray-400 uppercase tracking-wider flex items-center space-x-1">
            <Filter className="w-3 h-3 text-blue-400" />
            <span>SOURCE</span>
          </label>
          <select
            value={filters.source}
            onChange={(e) => onFilterChange({ source: e.target.value as any })}
            className="w-full bg-[#07070a] border border-gray-800 text-gray-200 px-3 py-2 rounded-lg outline-none focus:border-blue-500"
          >
            <option value="all">All Sources</option>
            <option value="spotify">Spotify Media</option>
            <option value="household">Household Txs</option>
            <option value="transactions">Multi-Facet Txs</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="space-y-1">
          <label className="text-[10px] text-gray-400 uppercase tracking-wider">CATEGORY</label>
          <select
            value={filters.category}
            onChange={(e) => onFilterChange({ category: e.target.value as any })}
            className="w-full bg-[#07070a] border border-gray-800 text-gray-200 px-3 py-2 rounded-lg outline-none focus:border-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="media">Media Streams</option>
            <option value="expense">Expenses</option>
            <option value="income">Income</option>
          </select>
        </div>

        {/* Time Period / Month Filter */}
        <div className="space-y-1">
          <label className="text-[10px] text-gray-400 uppercase tracking-wider flex items-center space-x-1">
            <Calendar className="w-3 h-3 text-purple-400" />
            <span>MONTH FILTER</span>
          </label>
          <select
            value={filters.monthRange}
            onChange={(e) => onFilterChange({ monthRange: e.target.value })}
            className="w-full bg-[#07070a] border border-gray-800 text-gray-200 px-3 py-2 rounded-lg outline-none focus:border-blue-500"
          >
            <option value="all">All Months (2013-2024)</option>
            {availableMonths.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div className="space-y-1">
          <label className="text-[10px] text-gray-400 uppercase tracking-wider flex items-center space-x-1">
            <SortAsc className="w-3 h-3 text-amber-400" />
            <span>SORT ORDER</span>
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => onFilterChange({ sortBy: e.target.value as any })}
            className="w-full bg-[#07070a] border border-gray-800 text-gray-200 px-3 py-2 rounded-lg outline-none focus:border-blue-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="value_desc">Highest Value First</option>
          </select>
        </div>

        {/* Reset & Stats Summary */}
        <div className="col-span-2 sm:col-span-4 lg:col-span-1 flex items-end justify-between lg:justify-end gap-3 pt-1">
          <div className="text-gray-400 text-[11px] lg:hidden">
            Showing <strong className="text-white">{totalFilteredCount.toLocaleString()}</strong> results
          </div>
          <button
            onClick={onReset}
            className="flex items-center space-x-1.5 px-3 py-2 bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white border border-gray-800 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET</span>
          </button>
        </div>
      </div>
    </div>
  );
};
