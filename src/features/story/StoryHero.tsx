import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface StoryHeroProps {
  onExploreClick: () => void;
  onConnectClick: () => void;
}

export const StoryHero: React.FC<StoryHeroProps> = ({ onExploreClick, onConnectClick }) => {
  return (
    <section className="relative overflow-hidden py-16 md:py-24 border-b border-gray-800/80 bg-gradient-to-b from-[#0c0e18] via-[#07070a] to-[#07070a]">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-blue-600/10 via-emerald-500/10 to-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-8 relative z-10">
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono tracking-widest uppercase">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>UNIFIED ARCHIVAL NARRATIVE</span>
        </div>

        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white font-sans text-balance leading-none">
            LIFE TRACE
          </h1>
          <p className="text-xl sm:text-2xl md:text-3xl font-mono text-gray-300 font-light tracking-wide text-balance uppercase">
            THREE DATASETS. THOUSANDS OF MOMENTS. ONE STORY.
          </p>
        </div>

        <p className="max-w-2xl mx-auto text-gray-400 text-sm md:text-base leading-relaxed text-balance">
          An objective, client-side life archive aggregating 11 years of digital streaming, daily household cashflows, and multi-facet transaction logs into a unified chronological matrix.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={onExploreClick}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs tracking-wider uppercase font-semibold transition-all shadow-lg shadow-blue-500/20"
          >
            <span>EXPLORE ARCHIVE</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onConnectClick}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-200 border border-gray-700 font-mono text-xs tracking-wider uppercase transition-all"
          >
            <span>CONNECT MOMENTS</span>
          </button>
        </div>
      </div>
    </section>
  );
};
