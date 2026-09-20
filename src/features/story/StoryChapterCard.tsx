import React from 'react';
import { ArrowUpRight, Compass, Link as LinkIcon } from 'lucide-react';

export interface StoryChapter {
  id: string;
  number: string;
  title: string;
  dateSpan: string;
  startMonth: string;
  endMonth: string;
  summary: string;
  keyObservation: string;
  metrics: Array<{ label: string; value: string }>;
  sourcesInvolved: Array<'spotify' | 'household' | 'transactions'>;
}

interface StoryChapterCardProps {
  chapter: StoryChapter;
  onInspectRecords: (startMonth: string) => void;
  onExplorePeriod: (startMonth: string, endMonth: string) => void;
  onConnectMoments: () => void;
}

export const StoryChapterCard: React.FC<StoryChapterCardProps> = ({
  chapter,
  onInspectRecords,
  onExplorePeriod,
  onConnectMoments,
}) => {
  return (
    <article className="bg-[#0c0d15] border border-gray-800/80 hover:border-gray-700/80 rounded-2xl p-6 md:p-8 space-y-6 transition-all shadow-xl relative overflow-hidden group">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-800/80 pb-4">
        <div className="flex items-center space-x-3">
          <span className="font-mono text-xs px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md font-semibold">
            CHAPTER {chapter.number}
          </span>
          <span className="font-mono text-xs text-gray-400 tracking-wider">
            {chapter.dateSpan}
          </span>
        </div>

        {/* Top Direct Action: Inspect Records */}
        <button
          onClick={() => onInspectRecords(chapter.startMonth)}
          aria-label={`Inspect records for Chapter ${chapter.number} starting ${chapter.startMonth}`}
          className="inline-flex items-center space-x-1 text-xs font-mono text-blue-400 hover:text-blue-300 transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 outline-none rounded p-1"
        >
          <span>INSPECT RECORDS</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main Content */}
      <div className="space-y-3">
        <h3 className="text-xl md:text-2xl font-bold text-white font-sans tracking-tight">
          {chapter.title}
        </h3>
        <p className="text-sm md:text-base text-gray-300 leading-relaxed font-sans">
          {chapter.summary}
        </p>
      </div>

      {/* Key Observation Banner */}
      <div className="bg-black/50 border border-gray-800/80 p-4 rounded-xl space-y-1 font-mono text-xs text-gray-300">
        <div className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">DATA OBSERVED</div>
        <p className="text-gray-300 leading-normal font-sans">{chapter.keyObservation}</p>
      </div>

      {/* Chapter Specific Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
        {chapter.metrics.map((m, idx) => (
          <div key={idx} className="bg-gray-900/50 p-3 rounded-lg border border-gray-800/60 font-mono">
            <div className="text-[10px] text-gray-400 uppercase truncate">{m.label}</div>
            <div className="text-sm sm:text-base font-bold text-white mt-0.5">{m.value}</div>
          </div>
        ))}
      </div>

      {/* Chapter Action Bar: Explore Period & Connect Moments */}
      <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-gray-800/60 font-mono text-xs">
        <button
          onClick={() => onExplorePeriod(chapter.startMonth, chapter.endMonth)}
          aria-label={`Explore period ${chapter.dateSpan} in Explore tab`}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-800 hover:border-gray-700 transition-all focus-visible:ring-2 focus-visible:ring-gray-400 outline-none"
        >
          <Compass className="w-3.5 h-3.5 text-blue-400" />
          <span>EXPLORE PERIOD ({chapter.startMonth})</span>
        </button>

        <button
          onClick={onConnectMoments}
          aria-label={`Connect moments from Chapter ${chapter.number}`}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-800 hover:border-gray-700 transition-all focus-visible:ring-2 focus-visible:ring-gray-400 outline-none"
        >
          <LinkIcon className="w-3.5 h-3.5 text-purple-400" />
          <span>CONNECT MOMENTS</span>
        </button>
      </div>
    </article>
  );
};
