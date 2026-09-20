import React from 'react';
import { Database, Activity, ShieldCheck } from 'lucide-react';

interface LoadingScreenProps {
  progress: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ progress }) => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 font-mono">
      <div className="max-w-md w-full bg-[#0c0d15] border border-gray-800 rounded-xl p-8 space-y-6 shadow-2xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />

        <div className="space-y-2 text-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs tracking-wider">
            <Activity className="w-3.5 h-3.5 animate-spin" />
            <span>CLIENT-SIDE ENGINE INITIALIZING</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-sans">LIFE TRACE</h2>
          <p className="text-xs text-gray-400">Loading & Indexing 162k+ Normalized Events</p>
        </div>

        {/* Progress status */}
        <div className="space-y-3 bg-black/50 p-4 rounded-lg border border-gray-800/80">
          <div className="flex justify-between text-xs text-gray-300">
            <span className="truncate pr-2 font-mono text-gray-400">{progress}</span>
            <span className="text-emerald-400 font-bold shrink-0">WORKER ACTIVE</span>
          </div>
          <div className="w-full bg-gray-800/80 h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 via-emerald-400 to-amber-400 h-full w-full animate-pulse transition-all" />
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-2 gap-3 text-[11px] text-gray-400 pt-2 border-t border-gray-800/60">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Privacy Filter Active</span>
          </div>
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-blue-400 shrink-0" />
            <span>O(log N) Typed Index</span>
          </div>
        </div>
      </div>
    </div>
  );
};
