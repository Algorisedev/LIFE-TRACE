import React from 'react';
import { EventIndex } from '../../utils/indexing/eventIndex';
import { ActivityHeatmapCanvas } from './ActivityHeatmapCanvas';
import { InteractiveTimelineMap } from './InteractiveTimelineMap';
import { Activity } from 'lucide-react';

interface VisualizationViewProps {
  index: EventIndex;
  onInspectMonth: (monthKey: string) => void;
}

export const VisualizationView: React.FC<VisualizationViewProps> = ({
  index,
  onInspectMonth,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-mono">
      {/* Header Banner */}
      <div className="space-y-2 border-b border-gray-800 pb-4">
        <div className="inline-flex items-center space-x-2 text-xs text-blue-400 font-bold uppercase tracking-widest">
          <Activity className="w-4 h-4" />
          <span>CANVAS & TIMELINE VISUALIZATION</span>
        </div>
        <h2 className="text-3xl font-bold text-white font-sans">INTERACTIVE LIFE MATRIX</h2>
        <p className="text-sm text-gray-400 max-w-2xl font-sans">
          High-performance canvas heatmap and multi-source timeline map for exploring 11 years of archived records.
        </p>
      </div>

      {/* HTML5 Canvas Heatmap */}
      <ActivityHeatmapCanvas index={index} onSelectPeriod={onInspectMonth} />

      {/* Interactive Timeline Matrix */}
      <InteractiveTimelineMap index={index} onInspectMonth={onInspectMonth} />
    </div>
  );
};
