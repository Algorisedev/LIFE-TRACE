import React from 'react';
import { LifeTraceConnection } from '../../data/types/connection';
import { SourceTag } from '../../components/common/SourceTag';
import { Clock, ArrowDown, Network, ShieldCheck } from 'lucide-react';

interface ConnectionPathVisualizerProps {
  connection: LifeTraceConnection;
}

export const ConnectionPathVisualizer: React.FC<ConnectionPathVisualizerProps> = ({ connection }) => {
  const { eventA, eventB, timeDiffMs, relationshipReason } = connection;

  const mins = Math.round(timeDiffMs / 60000);
  const hours = (timeDiffMs / (3600 * 1000)).toFixed(1);
  const diffLabel = timeDiffMs === 0 
    ? 'Simultaneous Timestamp' 
    : mins < 60 
    ? `${mins} Minute(s) Time Difference` 
    : `${hours} Hour(s) Time Difference`;

  return (
    <div className="bg-[#0c0d15] border border-gray-800 rounded-2xl p-6 space-y-6 shadow-xl relative overflow-hidden font-mono">
      <div className="flex items-center justify-between border-b border-gray-800 pb-3">
        <div className="flex items-center space-x-2 text-xs text-blue-400">
          <Network className="w-4 h-4" />
          <span className="font-bold tracking-wider">TEMPORAL CONNECTION PATH</span>
        </div>
        <span className="text-[10px] text-gray-500 font-mono">WINDOW: {connection.windowType.toUpperCase()}</span>
      </div>

      {/* Connection Flow Diagram */}
      <div className="space-y-4">
        {/* EVENT A Node */}
        <div className="bg-[#12131f] border border-gray-800 p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400 font-semibold uppercase">ANCHOR EVENT (A)</span>
            <SourceTag source={eventA.source} />
          </div>
          <h4 className="text-base font-bold text-white font-sans">{eventA.title}</h4>
          <div className="text-xs text-gray-400 flex items-center justify-between">
            <span>{eventA.subtitle}</span>
            <span className="flex items-center space-x-1 text-gray-500 text-[11px]">
              <Clock className="w-3 h-3" />
              <span>{eventA.dateKey}</span>
            </span>
          </div>
        </div>

        {/* Time Gap Indicator Connector */}
        <div className="flex flex-col items-center justify-center space-y-1 py-1 text-center">
          <div className="w-0.5 h-4 bg-blue-500/40" />
          <div className="bg-blue-500/10 border border-blue-500/30 text-blue-400 px-3 py-1 rounded-full text-xs font-bold shadow-sm inline-flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>{diffLabel}</span>
          </div>
          <div className="w-0.5 h-4 bg-blue-500/40" />
          <ArrowDown className="w-4 h-4 text-blue-400" />
        </div>

        {/* EVENT B Node */}
        <div className="bg-[#12131f] border border-gray-800 p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400 font-semibold uppercase">CORRELATED EVENT (B)</span>
            <SourceTag source={eventB.source} />
          </div>
          <h4 className="text-base font-bold text-white font-sans">{eventB.title}</h4>
          <div className="text-xs text-gray-400 flex items-center justify-between">
            <span>{eventB.subtitle}</span>
            <span className="flex items-center space-x-1 text-gray-500 text-[11px]">
              <Clock className="w-3 h-3" />
              <span>{eventB.dateKey}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Relationship Reason Statement */}
      <div className="bg-black/50 p-4 rounded-xl border border-gray-800/80 space-y-1 text-xs">
        <div className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold flex items-center space-x-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>NON-CAUSAL OBSERVABLE RELATIONSHIP</span>
        </div>
        <p className="text-gray-300 leading-normal font-sans pt-1">
          "{relationshipReason}"
        </p>
      </div>
    </div>
  );
};
