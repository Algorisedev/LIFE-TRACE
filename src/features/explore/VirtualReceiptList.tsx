import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { LifeTraceEvent } from '../../data/types/event';
import { ReceiptCard } from './ReceiptCard';
import { FileQuestion } from 'lucide-react';

interface VirtualReceiptListProps {
  events: LifeTraceEvent[];
  onSelectEvent: (event: LifeTraceEvent) => void;
  selectedEventId?: string;
}

export const VirtualReceiptList: React.FC<VirtualReceiptListProps> = ({
  events,
  onSelectEvent,
  selectedEventId,
}) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: events.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 88, // estimated receipt card height in pixels
    overscan: 10,
  });

  if (events.length === 0) {
    return (
      <div className="py-20 text-center space-y-4 border border-dashed border-gray-800 rounded-xl bg-[#0c0d15] p-8">
        <FileQuestion className="w-10 h-10 text-gray-500 mx-auto" />
        <div className="space-y-1">
          <h4 className="text-lg font-bold text-white font-sans">No Events Found</h4>
          <p className="text-xs text-gray-400 font-mono">
            No archived receipts matched your active search query or filter constraints.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className="h-[650px] overflow-y-auto pr-1 border border-gray-800/80 rounded-xl bg-[#07070a]"
    >
      <div
        className="w-full relative"
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualItem) => {
          const event = events[virtualItem.index];
          return (
            <div
              key={virtualItem.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
                padding: '4px 6px',
              }}
            >
              <ReceiptCard
                event={event}
                onClick={onSelectEvent}
                isSelected={event.id === selectedEventId}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
