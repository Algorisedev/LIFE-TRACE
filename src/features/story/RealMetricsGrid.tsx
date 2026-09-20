import React from 'react';
import { DatasetLoadStats } from '../../data/loaders/datasetLoader';
import { LifeTraceInsightsSummary } from '../../data/types/insight';
import { Music, Home, CreditCard, Layers, Calendar, Network } from 'lucide-react';

interface RealMetricsGridProps {
  stats: DatasetLoadStats;
  insights: LifeTraceInsightsSummary;
}

export const RealMetricsGrid: React.FC<RealMetricsGridProps> = ({ stats, insights }) => {
  const overlap30m = insights.temporalOverlaps.find(o => o.windowType === '30_min')?.connectionCount || 0;

  const metricCards = [
    {
      label: 'TIMED ARCHIVED EVENTS',
      value: stats.totalCount.toLocaleString(),
      subtext: `162,588 File Records Ingested`,
      icon: Layers,
      color: 'text-white',
      border: 'border-gray-800',
    },
    {
      label: 'SPOTIFY STREAMS',
      value: stats.spotifyCount.toLocaleString(),
      subtext: `${insights.listening.totalHoursPlayed} Total Hours`,
      icon: Music,
      color: 'text-emerald-400',
      border: 'border-emerald-500/20',
    },
    {
      label: 'HOUSEHOLD RECEIPTS',
      value: stats.householdCount.toLocaleString(),
      subtext: `2015 – 2018 Range`,
      icon: Home,
      color: 'text-blue-400',
      border: 'border-blue-500/20',
    },
    {
      label: 'MULTI-FACET TRANSACTIONS',
      value: stats.transactionsCount.toLocaleString(),
      subtext: `10,267 File Records (850 Un-timestamped Filtered)`,
      icon: CreditCard,
      color: 'text-amber-400',
      border: 'border-amber-500/20',
    },
    {
      label: 'CHRONOLOGICAL SPAN',
      value: `${insights.dateRange.start.substring(0, 4)} – ${insights.dateRange.end.substring(0, 4)}`,
      subtext: `${insights.dateRange.start} to ${insights.dateRange.end}`,
      icon: Calendar,
      color: 'text-purple-400',
      border: 'border-purple-500/20',
    },
    {
      label: 'TEMPORAL OVERLAPS (30M)',
      value: overlap30m.toLocaleString(),
      subtext: 'True Computed Cross-Source Synchronies',
      icon: Network,
      color: 'text-cyan-400',
      border: 'border-cyan-500/20',
    },
  ];

  return (
    <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-4 mb-8">
        <div className="text-xs font-mono tracking-widest text-gray-400 uppercase">TELEMETRY SUMMARY</div>
        <h2 className="text-xl sm:text-2xl font-bold text-white font-sans">Verified Dataset Metrics</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {metricCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className={`bg-[#0d0e17] p-5 rounded-xl border ${card.border} space-y-3 flex flex-col justify-between hover:border-gray-700 transition-colors`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono tracking-wider text-gray-400 font-medium">
                  {card.label}
                </span>
                <Icon className={`w-4 h-4 ${card.color} opacity-80`} />
              </div>
              <div>
                <div className={`text-xl sm:text-2xl font-bold font-mono ${card.color}`}>
                  {card.value}
                </div>
                <div className="text-[11px] text-gray-500 font-mono mt-1 truncate" title={card.subtext}>
                  {card.subtext}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
