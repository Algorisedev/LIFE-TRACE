import React from 'react';
import { Database, Binary, Network, BarChart3, BookOpen, ArrowRight } from 'lucide-react';

export const PipelineVisual: React.FC = () => {
  const steps = [
    {
      label: 'RAW RECEIPTS',
      desc: '162k+ Multi-format logs',
      icon: Database,
      accent: 'border-gray-700 text-gray-400',
    },
    {
      label: 'NORMALIZED MOMENTS',
      desc: 'Unified schema & PII filter',
      icon: Binary,
      accent: 'border-blue-500/40 text-blue-400',
    },
    {
      label: 'TEMPORAL CONNECTIONS',
      desc: 'O(log N) proximity windows',
      icon: Network,
      accent: 'border-purple-500/40 text-purple-400',
    },
    {
      label: 'INSIGHTS',
      desc: 'Deterministic aggregates',
      icon: BarChart3,
      accent: 'border-emerald-500/40 text-emerald-400',
    },
    {
      label: 'STORY',
      desc: 'Guided archival narrative',
      icon: BookOpen,
      accent: 'border-amber-500/40 text-amber-400',
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto font-mono">
      <div className="bg-[#0c0d15]/90 border border-gray-800/80 rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-sm">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-800/80">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[11px] uppercase tracking-widest text-gray-400 font-semibold">
              DATA ARCHITECTURE PIPELINE
            </span>
          </div>
          <span className="text-[10px] text-gray-500 uppercase tracking-wider">
            CLIENT-SIDE DETERMINISTIC FLOW
          </span>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className="relative flex items-center">
                <div className="w-full bg-[#12131f] border border-gray-800/90 rounded-xl p-3.5 space-y-1.5 transition-all hover:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className={`p-1.5 rounded-lg bg-gray-900 border ${step.accent}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[10px] text-gray-500 font-bold">0{idx + 1}</span>
                  </div>
                  <div className="text-xs font-bold text-gray-200 tracking-tight font-mono">
                    {step.label}
                  </div>
                  <div className="text-[11px] text-gray-400 leading-tight">
                    {step.desc}
                  </div>
                </div>

                {/* Arrow indicator on desktop between steps */}
                {idx < steps.length - 1 && (
                  <div className="hidden lg:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-gray-600 pointer-events-none">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
