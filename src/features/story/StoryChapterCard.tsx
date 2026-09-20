import React from 'react';
import { ArrowUpRight } from 'lucide-react';

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
  onExploreChapter: (startMonth: string, endMonth: string) => void;
}

export const StoryChapterCard: React.FC<StoryChapterCardProps> = ({ chapter, onExploreChapter }) => {
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

        <button
          onClick={() => onExploreChapter(chapter.startMonth, chapter.endMonth)}
          className="inline-flex items-center space-x-1 text-xs font-mono text-blue-400 hover:text-blue-300 transition-colors"
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
        <p className="text-sm md:text-base text-gray-300 leading-relaxed">
          {chapter.summary}
        </p>
      </div>

      {/* Key Observation Banner */}
      <div className="bg-black/50 border border-gray-800/80 p-4 rounded-xl space-y-1 font-mono text-xs text-gray-300">
        <div className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">DATA OBSERVED</div>
        <p className="text-gray-300 leading-normal">{chapter.keyObservation}</p>
      </div>

      {/* Chapter Specific Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
        {chapter.metrics.map((m, idx) => (
          <div key={idx} className="bg-gray-900/50 p-3 rounded-lg border border-gray-800/60 font-mono">
            <div className="text-[10px] text-gray-400 uppercase truncate">{m.label}</div>
            <div className="text-sm sm:text-base font-bold text-white mt-0.5">{m.value}</div>
          </div>
        ))}
      </div>
    </article>
  );
};
