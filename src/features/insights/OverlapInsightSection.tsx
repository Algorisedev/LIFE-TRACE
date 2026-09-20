import React from 'react';
import { TemporalOverlapMetric, TimeframeActivity } from '../../data/types/insight';
import { Network, Clock, Calendar } from 'lucide-react';

interface OverlapInsightSectionProps {
  temporalOverlaps: TemporalOverlapMetric[];
  activity: TimeframeActivity;
}

export const OverlapInsightSection: React.FC<OverlapInsightSectionProps> = ({
  temporalOverlaps,
  activity,
}) => {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Find peak hour of activity
  const peakHour = Object.entries(activity.byHourOfDay).reduce(
    (max, curr) => (curr[1] > max[1] ? curr : max),
    ['0', 0]
  );
  const peakHourNum = parseInt(peakHour[0], 10);
  const peakHourLabel = `${peakHourNum.toString().padStart(2, '0')}:00 – ${(peakHourNum + 1) % 24}:00 UTC`;

  return (
    <div className="bg-[#0c0d15] border border-gray-800 rounded-2xl p-6 space-y-6 shadow-xl font-mono">
      <div className="flex items-center space-x-2 border-b border-gray-800 pb-3">
        <Network className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-bold text-white font-sans">CROSS-SOURCE TEMPORAL DENSITY</h3>
      </div>

      {/* Temporal Window Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {temporalOverlaps.map((o, i) => (
          <div key={i} className="bg-black/50 p-4 rounded-xl border border-gray-800/80 space-y-1">
            <div className="text-[10px] text-gray-400 uppercase">
              {o.windowType === '30_min'
                ? '±30 MINUTE WINDOW'
                : o.windowType === '2_hours'
                ? '±2 HOUR WINDOW'
                : 'SAME DAY WINDOW'}
            </div>
            <div className="text-xl font-bold text-purple-400">{o.connectionCount.toLocaleString()} Overlaps</div>
            <div className="text-[10px] text-gray-500">Cross-Dataset Synchronies</div>
          </div>
        ))}
      </div>

      {/* Hourly Density Distribution */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>Activity Distribution by Hour of Day (UTC)</span>
          </h4>
          <span className="text-[11px] text-amber-400 font-bold">Peak: {peakHourLabel}</span>
        </div>

        {/* 24-Hour Bar Graph */}
        <div className="grid grid-cols-12 md:grid-cols-24 gap-1 h-28 items-end bg-black/50 p-3 rounded-xl border border-gray-800/80">
          {Object.entries(activity.byHourOfDay).map(([hr, count]) => {
            const maxVal = Math.max(...Object.values(activity.byHourOfDay), 1);
            const pct = Math.max(10, Math.round((count / maxVal) * 100));
            const isPeak = parseInt(hr, 10) === peakHourNum;

            return (
              <div key={hr} className="flex flex-col items-center h-full justify-end group relative" title={`${hr}:00 — ${count.toLocaleString()} events`}>
                <div
                  style={{ height: `${pct}%` }}
                  className={`w-full rounded-t transition-all ${
                    isPeak ? 'bg-amber-400' : 'bg-blue-500/60 group-hover:bg-blue-400'
                  }`}
                />
                <span className="text-[8px] text-gray-500 font-mono mt-1">{hr}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day of Week Distribution */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center space-x-1.5">
          <Calendar className="w-3.5 h-3.5 text-emerald-400" />
          <span>Activity Distribution by Day of Week</span>
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {Object.entries(activity.byDayOfWeek).map(([dow, count]) => (
            <div key={dow} className="bg-gray-900/60 p-3 rounded-lg border border-gray-800/60 text-center">
              <div className="text-[10px] text-gray-400 uppercase">{dayNames[parseInt(dow, 10)]}</div>
              <div className="text-sm font-bold text-white mt-1">{count.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
