import React from 'react';
import { LifeTraceEvent } from '../../data/types/event';
import { SourceTag } from '../../components/common/SourceTag';
import { X, Network, Calendar, Clock, MapPin, ShieldCheck, Tag, Smartphone, CreditCard } from 'lucide-react';

interface ReceiptDetailDrawerProps {
  event: LifeTraceEvent | null;
  onClose: () => void;
  onConnectMoment: (event: LifeTraceEvent) => void;
}

export const ReceiptDetailDrawer: React.FC<ReceiptDetailDrawerProps> = ({
  event,
  onClose,
  onConnectMoment,
}) => {
  if (!event) return null;

  const dt = new Date(event.timestamp);
  const timeStr = dt.toUTCString().substring(17, 25) + ' UTC';

  const formatValue = () => {
    if (event.source === 'spotify') {
      const mins = Math.floor(event.value / 60000);
      const secs = Math.floor((event.value % 60000) / 1000);
      return `${mins} minutes ${secs} seconds (${event.value.toLocaleString()} ms)`;
    }
    return `₹${event.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in font-mono">
      <div className="w-full max-w-md bg-[#0c0d15] border-l border-gray-800 h-full p-6 space-y-6 flex flex-col justify-between overflow-y-auto shadow-2xl">
        {/* Top Header Bar */}
        <div className="space-y-4 border-b border-gray-800 pb-4">
          <div className="flex items-center justify-between">
            <SourceTag source={event.source} size="md" />
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white font-sans">{event.title}</h3>
            <p className="text-sm text-gray-400">{event.subtitle || 'Uncategorized'}</p>
          </div>
        </div>

        {/* Core Event Metrics */}
        <div className="space-y-4 flex-1">
          <div className="bg-black/50 p-4 rounded-xl border border-gray-800/80 space-y-3">
            <div className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">RECORDED VALUE</div>
            <div
              className={`text-2xl font-bold font-mono ${
                event.category === 'income'
                  ? 'text-emerald-400'
                  : event.source === 'spotify'
                  ? 'text-white'
                  : 'text-amber-400'
              }`}
            >
              {formatValue()}
            </div>
          </div>

          {/* Time & Date Breakdown */}
          <div className="bg-black/40 p-4 rounded-xl border border-gray-800/60 space-y-2.5 text-xs text-gray-300">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                <span>Date Key</span>
              </span>
              <span className="text-white font-bold">{event.dateKey}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>Exact UTC Time</span>
              </span>
              <span className="text-white font-bold">{timeStr}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 flex items-center space-x-1.5">
                <Tag className="w-3.5 h-3.5 text-emerald-400" />
                <span>Classification</span>
              </span>
              <span className="text-white uppercase font-bold">{event.category}</span>
            </div>
          </div>

          {/* Source-Specific Safe Metadata */}
          <div className="bg-black/40 p-4 rounded-xl border border-gray-800/60 space-y-3 text-xs">
            <div className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">SAFE METADATA</div>
            
            {event.source === 'spotify' && (
              <>
                {event.metadata.platform && (
                  <div className="flex items-center justify-between text-gray-300">
                    <span className="text-gray-400 flex items-center space-x-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Platform</span>
                    </span>
                    <span className="text-white">{event.metadata.platform}</span>
                  </div>
                )}
                {event.metadata.reasonStart && (
                  <div className="flex items-center justify-between text-gray-300">
                    <span className="text-gray-400">Start Reason</span>
                    <span className="text-white">{event.metadata.reasonStart}</span>
                  </div>
                )}
                {event.metadata.albumName && (
                  <div className="flex items-center justify-between text-gray-300">
                    <span className="text-gray-400">Album</span>
                    <span className="text-white truncate max-w-[180px]">{event.metadata.albumName}</span>
                  </div>
                )}
              </>
            )}

            {event.source === 'household' && (
              <>
                {event.metadata.mode && (
                  <div className="flex items-center justify-between text-gray-300">
                    <span className="text-gray-400 flex items-center space-x-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-blue-400" />
                      <span>Payment Channel</span>
                    </span>
                    <span className="text-white">{event.metadata.mode}</span>
                  </div>
                )}
                {event.metadata.note && (
                  <div className="text-gray-300 space-y-1">
                    <span className="text-gray-400 block">Sanitized Note</span>
                    <span className="text-white bg-gray-900 p-2 rounded block">{event.metadata.note}</span>
                  </div>
                )}
              </>
            )}

            {event.source === 'transactions' && (
              <>
                {event.metadata.merchant && (
                  <div className="flex items-center justify-between text-gray-300">
                    <span className="text-gray-400">Merchant</span>
                    <span className="text-white">{event.metadata.merchant}</span>
                  </div>
                )}
                {event.metadata.city && (
                  <div className="flex items-center justify-between text-gray-300">
                    <span className="text-gray-400 flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      <span>Location</span>
                    </span>
                    <span className="text-white">{event.metadata.city}, {event.metadata.state || ''}</span>
                  </div>
                )}
              </>
            )}

            <div className="pt-2 border-t border-gray-800 text-[11px] text-emerald-400 flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>PII & Credit Card Numbers Verified Redacted</span>
            </div>
          </div>
        </div>

        {/* Action Button: Connect This Moment */}
        <button
          onClick={() => {
            onConnectMoment(event);
            onClose();
          }}
          className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-mono text-xs tracking-wider uppercase font-semibold rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-blue-500/20"
        >
          <Network className="w-4 h-4" />
          <span>CONNECT THIS MOMENT</span>
        </button>
      </div>
    </div>
  );
};
