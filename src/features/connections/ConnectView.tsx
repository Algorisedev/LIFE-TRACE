import React, { useState, useMemo } from 'react';
import { LifeTraceEvent } from '../../data/types/event';
import { WindowType } from '../../data/types/connection';
import { EventIndex } from '../../utils/indexing/eventIndex';
import { findConnectionsForEvent } from '../../utils/analysis/connectionEngine';
import { ConnectionPathVisualizer } from './ConnectionPathVisualizer';
import { ReceiptCard } from '../explore/ReceiptCard';
import { Network, Search, Filter, ShieldCheck, Info } from 'lucide-react';

interface ConnectViewProps {
  index: EventIndex;
  selectedAnchorEvent?: LifeTraceEvent | null;
  onSelectAnchorEvent?: (ev: LifeTraceEvent) => void;
}

export const ConnectView: React.FC<ConnectViewProps> = ({
  index,
  selectedAnchorEvent,
  onSelectAnchorEvent,
}) => {
  // If no anchor event selected, default to a prominent transaction/household event with rich connections
  const defaultAnchor = useMemo(() => {
    if (selectedAnchorEvent) return selectedAnchorEvent;
    // Find an event with cross-source density
    const txs = index.queryBySource('transactions');
    return txs.length > 0 ? txs[0] : index.events[0];
  }, [index, selectedAnchorEvent]);

  const [activeAnchor, setActiveAnchor] = useState<LifeTraceEvent>(defaultAnchor);
  const [windowType, setWindowType] = useState<WindowType>('30_min');
  const [crossSourceOnly, setCrossSourceOnly] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Update active anchor if prop changes
  React.useEffect(() => {
    if (selectedAnchorEvent) {
      setActiveAnchor(selectedAnchorEvent);
    }
  }, [selectedAnchorEvent]);

  // Compute connections using connectionEngine
  const connections = useMemo(() => {
    if (!activeAnchor) return [];
    return findConnectionsForEvent(activeAnchor, index, windowType, crossSourceOnly);
  }, [activeAnchor, index, windowType, crossSourceOnly]);

  // Search candidate anchor events
  const candidateAnchors = useMemo(() => {
    if (!searchQuery.trim()) {
      // Default sample subset of events across sources
      const spot = index.queryBySource('spotify').slice(0, 4);
      const hh = index.queryBySource('household').slice(0, 3);
      const tx = index.queryBySource('transactions').slice(0, 3);
      return [...tx, ...hh, ...spot];
    }
    const q = searchQuery.toLowerCase().trim();
    return index.events
      .filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.subtitle.toLowerCase().includes(q) ||
          (e.metadata.merchant && e.metadata.merchant.toLowerCase().includes(q))
      )
      .slice(0, 15);
  }, [index, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-mono">
      {/* Header Banner */}
      <div className="space-y-3 border-b border-gray-800 pb-4">
        <div className="inline-flex items-center space-x-2 text-xs text-blue-400 font-bold uppercase tracking-widest">
          <Network className="w-4 h-4" />
          <span>TEMPORAL CORRELATION ENGINE</span>
        </div>
        <h2 className="text-3xl font-bold text-white font-sans">CONNECT THE MOMENTS</h2>
        <p className="text-sm text-gray-400 max-w-2xl font-sans">
          Select any archived record to query nearby cross-source events occurring within the exact same temporal window.
        </p>

        {/* Prominent Microcopy: Non-Causality Assurance */}
        <div className="inline-flex items-center space-x-2 bg-blue-950/30 border border-blue-500/30 px-3.5 py-1.5 rounded-lg text-xs text-blue-300">
          <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span className="font-semibold">
            Connections represent temporal proximity between recorded events, not causation.
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Anchor Event Selector & Controls */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0c0d15] border border-gray-800 rounded-xl p-5 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              1. Select Anchor Record
            </h3>

            {/* Anchor Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search event to connect..."
                aria-label="Search anchor event"
                className="w-full bg-[#07070a] border border-gray-800 text-xs text-gray-200 pl-9 pr-3 py-2 rounded-lg outline-none focus:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-400"
              />
            </div>

            {/* Candidate List */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {candidateAnchors.map((ev) => (
                <ReceiptCard
                  key={ev.id}
                  event={ev}
                  isSelected={ev.id === activeAnchor.id}
                  onClick={(selected) => {
                    setActiveAnchor(selected);
                    if (onSelectAnchorEvent) onSelectAnchorEvent(selected);
                  }}
                />
              ))}
            </div>
          </div>

          {/* Window & Filter Controls */}
          <div className="bg-[#0c0d15] border border-gray-800 rounded-xl p-5 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center space-x-2">
              <Filter className="w-4 h-4 text-purple-400" />
              <span>2. Temporal Window Controls</span>
            </h3>

            <div className="space-y-2 text-xs">
              <label className="text-gray-400 block">TIME WINDOW</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setWindowType('30_min')}
                  aria-label="Select 30-minute time window"
                  className={`py-2 px-3 rounded-lg border text-center font-bold transition-all focus-visible:ring-2 focus-visible:ring-blue-400 outline-none ${
                    windowType === '30_min'
                      ? 'bg-blue-500/20 text-blue-400 border-blue-500/50 shadow-inner'
                      : 'bg-gray-900 text-gray-400 border-gray-800 hover:bg-gray-800'
                  }`}
                >
                  ±30 Mins
                </button>
                <button
                  onClick={() => setWindowType('2_hours')}
                  aria-label="Select 2-hour time window"
                  className={`py-2 px-3 rounded-lg border text-center font-bold transition-all focus-visible:ring-2 focus-visible:ring-blue-400 outline-none ${
                    windowType === '2_hours'
                      ? 'bg-blue-500/20 text-blue-400 border-blue-500/50 shadow-inner'
                      : 'bg-gray-900 text-gray-400 border-gray-800 hover:bg-gray-800'
                  }`}
                >
                  ±2 Hours
                </button>
                <button
                  onClick={() => setWindowType('same_day')}
                  aria-label="Select same-day time window"
                  className={`py-2 px-3 rounded-lg border text-center font-bold transition-all focus-visible:ring-2 focus-visible:ring-blue-400 outline-none ${
                    windowType === 'same_day'
                      ? 'bg-blue-500/20 text-blue-400 border-blue-500/50 shadow-inner'
                      : 'bg-gray-900 text-gray-400 border-gray-800 hover:bg-gray-800'
                  }`}
                >
                  Same Day
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-800 flex items-center justify-between text-xs">
              <span className="text-gray-300">Cross-Source Only</span>
              <button
                onClick={() => setCrossSourceOnly(!crossSourceOnly)}
                role="switch"
                aria-checked={crossSourceOnly}
                aria-label="Toggle Cross-Source Only filter"
                className={`w-12 h-6 rounded-full transition-colors p-1 focus-visible:ring-2 focus-visible:ring-blue-400 outline-none ${
                  crossSourceOnly ? 'bg-blue-600' : 'bg-gray-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    crossSourceOnly ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Connection Path Visualizations */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <h3 className="text-lg font-bold text-white font-sans">
              Matched Temporal Connections ({connections.length})
            </h3>
            <span className="text-xs text-gray-400 truncate max-w-xs">
              Anchor: <strong className="text-white">{activeAnchor.title}</strong>
            </span>
          </div>

          {connections.length === 0 ? (
            <div className="bg-[#0c0d15] border border-dashed border-gray-800 rounded-xl p-8 text-center space-y-3 font-mono">
              <p className="text-gray-400 text-sm">
                No events found within the <strong className="text-white">±{windowType.replace('_', ' ')}</strong> window for this anchor record.
              </p>
              <p className="text-xs text-gray-500">
                Try switching the window size to "±2 Hours" or "Same Day" to expand the search scope.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {connections.map((conn, idx) => (
                <ConnectionPathVisualizer
                  key={conn.id}
                  connection={conn}
                  connectionIndex={idx}
                />
              ))}
            </div>
          )}

          {/* Privacy & Non-Causality Guarantee Note */}
          <div className="bg-black/40 border border-gray-800 p-4 rounded-xl text-xs text-gray-400 flex items-start space-x-2 font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Non-Causal Assurance:</strong> Connections measure exact timestamp proximity across datasets. They indicate temporal co-occurrence, never psychological or causal inference.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
