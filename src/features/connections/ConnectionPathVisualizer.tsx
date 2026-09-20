import React from 'react';
import { LifeTraceConnection } from '../../data/types/connection';
import { SourceTag } from '../../components/common/SourceTag';
import { Clock, ArrowDown, Network, Tag, Info } from 'lucide-react';

interface ConnectionPathVisualizerProps {
  connection: LifeTraceConnection;
  connectionIndex?: number;
}

export const ConnectionPathVisualizer: React.FC<ConnectionPathVisualizerProps> = ({
  connection,
  connectionIndex,
}) => {
  const { eventA, eventB, timeDiffMs, relationshipReason, windowType } = connection;

  const mins = Math.round(timeDiffMs / 60000);
  const hours = (timeDiffMs / (3600 * 1000)).toFixed(1);

  // Determine direction: after, before, or simultaneous
  const isAfter = eventB.timestamp > eventA.timestamp;
  const isSimultaneous = timeDiffMs === 0;
  
  let diffLabel = '';
  if (isSimultaneous) {
    diffLabel = 'Simultaneous timestamp';
  } else if (mins < 60) {
    diffLabel = `Occurred ${mins} minute(s) ${isAfter ? 'after' : 'before'} anchor event`;
  } else {
    diffLabel = `Occurred ~${hours} hour(s) ${isAfter ? 'after' : 'before'} anchor event`;
  }

  const formatExactTime = (ts: number, fallbackDate: string) => {
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) + ' UTC';
    } catch {
      return fallbackDate;
    }
  };

  return (
    <article className="bg-[#0c0d15] border border-gray-800/90 hover:border-gray-700/80 rounded-2xl p-6 sm:p-7 space-y-5 shadow-2xl relative overflow-hidden font-mono transition-all">
      {/* Thread Card Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-800/80 pb-3">
        <div className="flex items-center space-x-2 text-xs text-blue-400 font-bold">
          <Network className="w-4 h-4" />
          <span>TEMPORAL PATH {connectionIndex !== undefined ? `#0${connectionIndex + 1}` : ''}</span>
        </div>
        <div className="flex items-center space-x-2 text-[10px] text-gray-500">
          <span className="px-2 py-0.5 rounded bg-gray-900 border border-gray-800 font-semibold uppercase">
            WINDOW: ±{windowType.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Structured Temporal Path: ANCHOR EVENT ↓ TIME GAP ↓ RELATED EVENT ↓ SOURCE */}
      <div className="space-y-3 relative">
        {/* 1. ANCHOR EVENT */}
        <div className="bg-[#12131f] border border-blue-500/30 rounded-xl p-4 space-y-2 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
                ANCHOR EVENT
              </span>
              <span className="text-xs text-gray-400 flex items-center space-x-1">
                <Clock className="w-3 h-3 text-gray-400" />
                <span>{eventA.dateKey} • {formatExactTime(eventA.timestamp, eventA.dateKey)}</span>
              </span>
            </div>
            <SourceTag source={eventA.source} />
          </div>

          <h4 className="text-base font-bold text-white font-sans">{eventA.title}</h4>
          <div className="text-xs text-gray-400 flex items-center justify-between">
            <span>{eventA.subtitle}</span>
            <span className="text-[11px] text-gray-400 uppercase font-mono">
              Category: {eventA.category}
            </span>
          </div>
        </div>

        {/* 2. TIME GAP CONNECTOR */}
        <div className="flex flex-col items-center justify-center py-1 relative">
          <div className="w-0.5 h-3 bg-gradient-to-b from-blue-500/60 to-purple-500/60" />
          <div className="my-1 px-3.5 py-1 rounded-full bg-gradient-to-r from-blue-950/80 to-purple-950/80 border border-purple-500/40 text-purple-300 text-xs font-semibold shadow-md inline-flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span>{diffLabel}</span>
          </div>
          <div className="w-0.5 h-3 bg-gradient-to-b from-purple-500/60 to-emerald-500/60" />
          <ArrowDown className="w-4 h-4 text-emerald-400" />
        </div>

        {/* 3. RELATED EVENT */}
        <div className="bg-[#12131f] border border-purple-500/30 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded">
                RELATED EVENT
              </span>
              <span className="text-xs text-gray-400 flex items-center space-x-1">
                <Clock className="w-3 h-3 text-gray-400" />
                <span>{eventB.dateKey} • {formatExactTime(eventB.timestamp, eventB.dateKey)}</span>
              </span>
            </div>
            <SourceTag source={eventB.source} />
          </div>

          <h4 className="text-base font-bold text-white font-sans">{eventB.title}</h4>
          <div className="text-xs text-gray-400 flex items-center justify-between">
            <span>{eventB.subtitle}</span>
            <span className="text-[11px] text-gray-400 uppercase font-mono">
              Category: {eventB.category}
            </span>
          </div>
        </div>

        {/* 4. SOURCE & TELEMETRY NODE */}
        <div className="bg-[#080910] border border-gray-800/90 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2 text-gray-400">
            <Tag className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] uppercase font-semibold text-gray-400">CORRELATED SOURCE:</span>
            <SourceTag source={eventB.source} />
          </div>
          <div className="text-[11px] text-gray-400 font-mono">
            {eventB.source === 'spotify' && eventB.metadata.platform
              ? `Client: ${eventB.metadata.platform}`
              : eventB.source === 'transactions' && eventB.metadata.merchant
              ? `Merchant: ${eventB.metadata.merchant}`
              : eventB.source === 'household' && eventB.metadata.mode
              ? `Mode: ${eventB.metadata.mode}`
              : `ID: ${eventB.id.slice(0, 16)}`}
          </div>
        </div>
      </div>

      {/* Relationship Statement */}
      <div className="bg-black/50 p-4 rounded-xl border border-gray-800/80 space-y-1.5 text-xs">
        <div className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold flex items-center space-x-1.5">
          <Info className="w-3.5 h-3.5 text-blue-400" />
          <span>TEMPORAL OBSERVATION</span>
        </div>
        <p className="text-gray-300 leading-relaxed font-sans">
          "{relationshipReason}"
        </p>
      </div>
    </article>
  );
};
