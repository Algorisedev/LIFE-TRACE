import React from 'react';
import { ArrowRight, BookOpen, Sparkles, Network } from 'lucide-react';
import { PipelineVisual } from '../../components/common/PipelineVisual';

interface StoryHeroProps {
  onStartStoryClick: () => void;
  onExploreClick: () => void;
  onConnectClick: () => void;
}

export const StoryHero: React.FC<StoryHeroProps> = ({
  onStartStoryClick,
  onExploreClick,
  onConnectClick,
}) => {
  return (
    <section className="relative overflow-hidden py-12 md:py-20 border-b border-gray-800/80 bg-gradient-to-b from-[#0c0e18] via-[#07070a] to-[#07070a]">
      {/* Background subtle glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-blue-600/10 via-purple-500/10 to-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-8 relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono tracking-widest uppercase">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>UNIFIED ARCHIVAL NARRATIVE • v2.0</span>
        </div>

        {/* Title and Tagline */}
        <div className="space-y-3 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white font-sans leading-none">
            LIFE TRACE
          </h1>
          <p className="text-lg sm:text-2xl md:text-3xl font-mono text-gray-300 font-light tracking-wide uppercase">
            THREE DATASETS. THOUSANDS OF MOMENTS. ONE STORY.
          </p>
          <div className="text-xs font-mono text-gray-400 tracking-wider uppercase">
            Unified Personal Data Archive
          </div>
        </div>

        <p className="max-w-2xl mx-auto text-gray-400 text-sm md:text-base leading-relaxed">
          An objective, client-side personal data archive aggregating 11 years of digital audio streaming, daily household cashflows, and multi-facet transaction records into a unified chronological matrix.
        </p>

        {/* DATA ARCHITECTURE PIPELINE VISUAL (RAW RECEIPTS -> NORMALIZED MOMENTS -> TEMPORAL CONNECTIONS -> INSIGHTS -> STORY) */}
        <div className="pt-2 pb-2">
          <PipelineVisual />
        </div>

        {/* Prominent Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {/* Prominent START STORY button */}
          <button
            onClick={onStartStoryClick}
            aria-label="Start Interactive Story Mode"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-mono text-sm tracking-wider uppercase font-bold transition-all shadow-xl shadow-blue-500/25 border border-blue-400/30 focus-visible:ring-2 focus-visible:ring-blue-400 outline-none transform active:scale-98"
          >
            <BookOpen className="w-4 h-4" />
            <span>START STORY</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onExploreClick}
            aria-label="Explore Archive Receipt Logs"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-[#12131f] hover:bg-[#1a1c2c] text-gray-200 border border-gray-700/80 font-mono text-xs tracking-wider uppercase font-semibold transition-all focus-visible:ring-2 focus-visible:ring-gray-400 outline-none"
          >
            <span>EXPLORE ARCHIVE</span>
          </button>

          <button
            onClick={onConnectClick}
            aria-label="Connect Moments"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-[#12131f] hover:bg-[#1a1c2c] text-gray-200 border border-gray-700/80 font-mono text-xs tracking-wider uppercase font-semibold transition-all focus-visible:ring-2 focus-visible:ring-gray-400 outline-none"
          >
            <Network className="w-4 h-4 text-purple-400" />
            <span>CONNECT MOMENTS</span>
          </button>
        </div>
      </div>
    </section>
  );
};
