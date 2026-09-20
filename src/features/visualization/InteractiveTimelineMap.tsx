import React, { useState } from 'react';
import { EventIndex } from '../../utils/indexing/eventIndex';
import { SourceTag } from '../../components/common/SourceTag';
import { Calendar, ArrowRight, ShieldCheck } from 'lucide-react';

interface InteractiveTimelineMapProps {
  index: EventIndex;
  onInspectMonth: (monthKey: string) => void;
}

export const InteractiveTimelineMap: React.FC<InteractiveTimelineMapProps> = ({
  index,
  onInspectMonth,
}) => {
  const years = ['2013', '2014', '2015', '2016', '2017', '2018', '2022', '2023', '2024'];
  const [selectedYear, setSelectedYear] = useState('2023');

  const yearMonths = index.getAvailableMonths().filter(m => m.startsWith(selectedYear));

  return (
    <div className="bg-[#0c0d15] border border-gray-800 rounded-2xl p-6 space-y-6 shadow-xl font-mono">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-800 pb-3">
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-bold text-white font-sans">INTERACTIVE TIMELINE MATRIX</h3>
        </div>

        {/* Year selector pills */}
        <div className="flex flex-wrap gap-1 bg-black/50 p-1 rounded-lg border border-gray-800 text-xs">
          {years.map(yr => (
            <button
              key={yr}
              onClick={() => setSelectedYear(yr)}
              className={`px-3 py-1 rounded transition-colors ${
                selectedYear === yr
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {yr}
            </button>
          ))}
        </div>
      </div>

      {/* Months Grid for Selected Year */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {yearMonths.map(monthKey => {
          const events = index.queryByMonth(monthKey);
          let spot = 0;
          let hh = 0;
          let tx = 0;

          for (const e of events) {
            if (e.source === 'spotify') spot++;
            else if (e.source === 'household') hh++;
            else if (e.source === 'transactions') tx++;
          }

          return (
            <div
              key={monthKey}
              onClick={() => onInspectMonth(monthKey)}
              className="bg-[#07070a] border border-gray-800 hover:border-gray-700 p-4 rounded-xl space-y-3 cursor-pointer transition-all hover:bg-[#0f101b] group"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors font-sans">
                  {monthKey}
                </span>
                <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
              </div>

              <div className="text-xs text-gray-400 font-bold">
                {events.length.toLocaleString()} Total Events
              </div>

              <div className="space-y-1 text-[11px]">
                {spot > 0 && (
                  <div className="flex items-center justify-between">
                    <SourceTag source="spotify" />
                    <span className="text-emerald-400">{spot.toLocaleString()}</span>
                  </div>
                )}
                {hh > 0 && (
                  <div className="flex items-center justify-between">
                    <SourceTag source="household" />
                    <span className="text-blue-400">{hh.toLocaleString()}</span>
                  </div>
                )}
                {tx > 0 && (
                  <div className="flex items-center justify-between">
                    <SourceTag source="transactions" />
                    <span className="text-amber-400">{tx.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-black/40 border border-gray-800 p-3 rounded-xl text-xs text-gray-400 flex items-center space-x-2">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>Select any month tile above to filter and inspect detailed receipt logs in Explore view.</span>
      </div>
    </div>
  );
};
