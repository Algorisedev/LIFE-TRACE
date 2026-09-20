import React, { useState, useMemo } from 'react';
import { LifeTraceEvent } from '../../data/types/event';
import { EventIndex } from '../../utils/indexing/eventIndex';
import { ExploreFilters, FilterState } from './ExploreFilters';
import { VirtualReceiptList } from './VirtualReceiptList';
import { ReceiptDetailDrawer } from './ReceiptDetailDrawer';

interface ExploreViewProps {
  index: EventIndex;
  onConnectMoment: (event: LifeTraceEvent) => void;
  initialMonthRange?: string;
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  index,
  onConnectMoment,
  initialMonthRange = 'all',
}) => {
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    source: 'all',
    category: 'all',
    monthRange: initialMonthRange,
    sortBy: 'newest',
  });

  const [selectedEvent, setSelectedEvent] = useState<LifeTraceEvent | null>(null);

  const availableMonths = useMemo(() => index.getAvailableMonths(), [index]);

  // Fast client-side filtering leveraging EventIndex month queries and typed array slicing
  const filteredEvents = useMemo(() => {
    let candidateEvents: ReadonlyArray<LifeTraceEvent>;

    // 1. Initial candidates from indexed map if month filter active
    if (filters.monthRange !== 'all') {
      candidateEvents = index.queryByMonth(filters.monthRange);
    } else {
      candidateEvents = index.events;
    }

    let result = [...candidateEvents];

    // 2. Source filter
    if (filters.source !== 'all') {
      result = result.filter(e => e.source === filters.source);
    }

    // 3. Category filter
    if (filters.category !== 'all') {
      result = result.filter(e => e.category === filters.category);
    }

    // 4. Text search filter
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      result = result.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.subtitle.toLowerCase().includes(q) ||
        (e.metadata.note && e.metadata.note.toLowerCase().includes(q)) ||
        (e.metadata.merchant && e.metadata.merchant.toLowerCase().includes(q)) ||
        (e.metadata.city && e.metadata.city.toLowerCase().includes(q))
      );
    }

    // 5. Sorting
    if (filters.sortBy === 'newest') {
      result.sort((a, b) => b.timestamp - a.timestamp);
    } else if (filters.sortBy === 'oldest') {
      result.sort((a, b) => a.timestamp - b.timestamp);
    } else if (filters.sortBy === 'value_desc') {
      result.sort((a, b) => b.value - a.value);
    }

    return result;
  }, [index, filters]);

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleReset = () => {
    setFilters({
      searchQuery: '',
      source: 'all',
      category: 'all',
      monthRange: 'all',
      sortBy: 'newest',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-800 pb-4">
        <div>
          <div className="text-xs font-mono tracking-widest text-gray-400 uppercase">DATA ARCHIVE EXPLORER</div>
          <h2 className="text-2xl font-bold text-white font-sans">Primary Receipt Logs</h2>
        </div>

        <div className="text-right font-mono text-xs text-gray-400">
          Matched Records: <strong className="text-blue-400 text-sm">{filteredEvents.length.toLocaleString()}</strong> / {index.size.toLocaleString()}
        </div>
      </div>

      {/* Filter Controls Bar */}
      <ExploreFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
        availableMonths={availableMonths}
        totalFilteredCount={filteredEvents.length}
      />

      {/* Virtualized Receipt List */}
      <VirtualReceiptList
        events={filteredEvents}
        onSelectEvent={(ev) => setSelectedEvent(ev)}
        selectedEventId={selectedEvent?.id}
      />

      {/* Slide-out Receipt Detail Drawer */}
      <ReceiptDetailDrawer
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onConnectMoment={onConnectMoment}
      />
    </div>
  );
};
