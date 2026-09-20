import React from 'react';
import { LifeTraceInsightsSummary } from '../../data/types/insight';
import { MusicInsightSection } from './MusicInsightSection';
import { FinancialInsightSection } from './FinancialInsightSection';
import { OverlapInsightSection } from './OverlapInsightSection';
import { PieChart, ShieldCheck } from 'lucide-react';

interface InsightsViewProps {
  insights: LifeTraceInsightsSummary;
}

export const InsightsView: React.FC<InsightsViewProps> = ({ insights }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-mono">
      {/* Header Banner */}
      <div className="space-y-2 border-b border-gray-800 pb-4">
        <div className="inline-flex items-center space-x-2 text-xs text-purple-400 font-bold uppercase tracking-widest">
          <PieChart className="w-4 h-4" />
          <span>DETERMINISTIC ANALYTICS ENGINE</span>
        </div>
        <h2 className="text-3xl font-bold text-white font-sans">INSIGHTS & TELEMETRY</h2>
        <p className="text-sm text-gray-400 max-w-2xl font-sans">
          Observable patterns, listening metrics, transaction cash flows, and temporal density derived directly from real dataset records.
        </p>
      </div>

      {/* Music Section */}
      <MusicInsightSection listening={insights.listening} />

      {/* Financial Section */}
      <FinancialInsightSection financial={insights.financial} />

      {/* Overlap & Density Section */}
      <OverlapInsightSection temporalOverlaps={insights.temporalOverlaps} activity={insights.activity} />

      {/* Traceability Footer */}
      <div className="bg-black/40 border border-gray-800 p-4 rounded-xl text-xs text-gray-400 flex items-center space-x-2 font-mono">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>
          <strong>Traceability Guarantee:</strong> Every metric displayed above is calculated deterministically from exact records in the local datasets. Zero subjective, personality, or psychological assumptions are generated.
        </span>
      </div>
    </div>
  );
};
