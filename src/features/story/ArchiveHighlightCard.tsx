import React from 'react';
import { ArchiveHighlight } from '../../utils/analysis/storyEngine';
import { LifeTraceEvent } from '../../data/types/event';
import { Activity, Layers, ArrowRight, Link, BarChart2 } from 'lucide-react';
import { SourceTag } from '../../components/common/SourceTag';

interface ArchiveHighlightCardProps {
  highlight: ArchiveHighlight;
  onExploreCluster: (monthKey: string, dateKey?: string) => void;
  onConnectKeyMoment: (event: LifeTraceEvent) => void;
}

export const ArchiveHighlightCard: React.FC<ArchiveHighlightCardProps> = ({
  highlight,
  onExploreCluster,
  onConnectKeyMoment,
}) => {
  const {
    formattedDate,
    dateKey,
    monthKey,
    eventCount,
    sourcesPresent,
    sourceBreakdown,
    connectionCount,
    compositeScore,
    metricsBreakdown,
    representativeEvent,
    narrative,
  } = highlight;

  return (
    <div className="bg-gradient-to-b from-[#111322] via-[#0d0e1a] to-[#080910] border border-blue-500/30 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden font-mono">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Header Label */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-800/90 pb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">
              MOMENT OF THE ARCHIVE
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white font-sans tracking-tight">
              HIGHEST RECORDED ACTIVITY DENSITY
            </h3>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-blue-950/40 border border-blue-800/40 px-3 py-1.5 rounded-xl">
          <BarChart2 className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-xs text-gray-400">Composite Index:</span>
          <span className="text-sm font-bold text-blue-300">{compositeScore.toFixed(1)} / 100</span>
        </div>
      </div>

      {/* Narrative Statement */}
      <div className="bg-[#07070c]/80 border border-gray-800/80 p-4 rounded-xl text-xs sm:text-sm text-gray-200 leading-relaxed font-sans">
        <p>{narrative}</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Metric 1: Event Volume */}
        <div className="bg-[#121422] border border-gray-800/80 p-3.5 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-[10px] text-gray-400 uppercase">
            <span>24H Event Density</span>
            <span className="text-blue-400 font-bold">40% Weight</span>
          </div>
          <div className="text-xl font-bold text-white font-sans">{eventCount.toLocaleString()} events</div>
          <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full"
              style={{ width: `${Math.min(100, metricsBreakdown.densityScore)}%` }}
            />
          </div>
          <div className="text-[10px] text-gray-400">Rating: {metricsBreakdown.densityScore.toFixed(1)}%</div>
        </div>

        {/* Metric 2: Source Diversity */}
        <div className="bg-[#121422] border border-gray-800/80 p-3.5 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-[10px] text-gray-400 uppercase">
            <span>Source Diversity</span>
            <span className="text-purple-400 font-bold">30% Weight</span>
          </div>
          <div className="text-xl font-bold text-white font-sans">{sourcesPresent.length} / 3 Sources</div>
          <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-purple-500 h-full rounded-full"
              style={{ width: `${Math.min(100, metricsBreakdown.diversityScore)}%` }}
            />
          </div>
          <div className="text-[10px] text-gray-400">Rating: {metricsBreakdown.diversityScore.toFixed(1)}%</div>
        </div>

        {/* Metric 3: Temporal Connections */}
        <div className="bg-[#121422] border border-gray-800/80 p-3.5 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-[10px] text-gray-400 uppercase">
            <span>Cross-Source Overlaps</span>
            <span className="text-emerald-400 font-bold">30% Weight</span>
          </div>
          <div className="text-xl font-bold text-white font-sans">{connectionCount} Connections</div>
          <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full"
              style={{ width: `${Math.min(100, metricsBreakdown.connectionScore)}%` }}
            />
          </div>
          <div className="text-[10px] text-gray-400">Rating: {metricsBreakdown.connectionScore.toFixed(1)}%</div>
        </div>
      </div>

      {/* Sources & Action Buttons Footer */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 border-t border-gray-800/80">
        <div className="flex items-center space-x-2 flex-wrap gap-y-1.5">
          <span className="text-[11px] text-gray-400 flex items-center space-x-1">
            <Layers className="w-3 h-3 text-gray-400" />
            <span>SOURCES:</span>
          </span>
          {sourcesPresent.map((s) => (
            <span key={s} className="inline-flex items-center space-x-1">
              <SourceTag source={s} />
              <span className="text-[11px] text-gray-400">({sourceBreakdown[s]})</span>
            </span>
          ))}
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={() => onExploreCluster(monthKey, dateKey)}
            aria-label={`Explore record cluster for ${formattedDate}`}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold uppercase tracking-wider transition-all focus-visible:ring-2 focus-visible:ring-blue-400 outline-none"
          >
            <span>EXPLORE CLUSTER</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          {representativeEvent && (
            <button
              onClick={() => onConnectKeyMoment(representativeEvent)}
              aria-label={`Connect key event from ${formattedDate}`}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 text-xs font-semibold uppercase tracking-wider transition-all focus-visible:ring-2 focus-visible:ring-gray-400 outline-none"
            >
              <Link className="w-3.5 h-3.5 text-purple-400" />
              <span>CONNECT MOMENT</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
