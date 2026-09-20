import React from 'react';
import { LifeTraceEvent } from '../../data/types/event';
import { SourceTag } from '../../components/common/SourceTag';
import { Clock, ShieldAlert, MapPin, FastForward } from 'lucide-react';

interface ReceiptCardProps {
  event: LifeTraceEvent;
  onClick: (event: LifeTraceEvent) => void;
  isSelected?: boolean;
}

export const ReceiptCard: React.FC<ReceiptCardProps> = ({ event, onClick, isSelected }) => {
  const dt = new Date(event.timestamp);
  const timeStr = dt.toUTCString().substring(17, 22) + ' UTC';

  const formatValue = () => {
    if (event.source === 'spotify') {
      const mins = Math.floor(event.value / 60000);
      const secs = Math.floor((event.value % 60000) / 1000);
      return `${mins}m ${secs}s`;
    }
    return `₹${event.value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  return (
    <div
      onClick={() => onClick(event)}
      className={`p-4 rounded-xl border transition-all cursor-pointer font-mono ${
        isSelected
          ? 'bg-blue-500/10 border-blue-500/50 shadow-md shadow-blue-500/10'
          : 'bg-[#0e0f17] border-gray-800/80 hover:border-gray-700 hover:bg-[#121422]'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left Info Column */}
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center space-x-2">
            <SourceTag source={event.source} />
            <span className="text-[11px] text-gray-400 flex items-center space-x-1">
              <Clock className="w-3 h-3 text-gray-500" />
              <span>{event.dateKey} • {timeStr}</span>
            </span>
          </div>

          {/* Title & Subtitle */}
          <div>
            <h4 className="text-sm font-semibold text-white font-sans truncate" title={event.title}>
              {event.title}
            </h4>
            <p className="text-xs text-gray-400 truncate" title={event.subtitle}>
              {event.subtitle || 'Unspecified'}
            </p>
          </div>
        </div>

        {/* Right Value Column */}
        <div className="text-right shrink-0 space-y-1">
          <div
            className={`text-sm font-bold font-mono ${
              event.category === 'income'
                ? 'text-emerald-400'
                : event.source === 'spotify'
                ? 'text-gray-300'
                : 'text-amber-400'
            }`}
          >
            {formatValue()}
          </div>

          {/* Special Metadata Indicators */}
          <div className="flex items-center justify-end space-x-1.5 text-[10px]">
            {event.metadata.isFraud && (
              <span className="inline-flex items-center space-x-1 text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">
                <ShieldAlert className="w-3 h-3" />
                <span>RISK FLAG</span>
              </span>
            )}
            {event.metadata.skipped && (
              <span className="inline-flex items-center space-x-1 text-gray-400 bg-gray-800 px-1.5 py-0.5 rounded">
                <FastForward className="w-3 h-3 text-yellow-500" />
                <span>SKIPPED</span>
              </span>
            )}
            {event.metadata.city && (
              <span className="inline-flex items-center space-x-1 text-gray-400">
                <MapPin className="w-3 h-3 text-gray-500" />
                <span>{event.metadata.city}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
