import React, { useState, useEffect, useCallback } from 'react';
import { StoryMoment } from '../../utils/analysis/storyEngine';
import { LifeTraceEvent } from '../../data/types/event';
import { SourceTag } from '../../components/common/SourceTag';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  Compass,
  Link,
  Layers,
  Sparkles,
  Zap,
  CheckCircle2,
} from 'lucide-react';

interface InteractiveStoryExperienceProps {
  moments: StoryMoment[];
  isOpen: boolean;
  onClose: () => void;
  onExploreMoment: (monthKey: string, dateKey?: string) => void;
  onConnectMoment: (event: LifeTraceEvent) => void;
}

export const InteractiveStoryExperience: React.FC<InteractiveStoryExperienceProps> = ({
  moments,
  isOpen,
  onClose,
  onExploreMoment,
  onConnectMoment,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Reset to first moment when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
    }
  }, [isOpen]);

  const handleNext = useCallback(() => {
    if (currentIndex < moments.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onClose();
    }
  }, [currentIndex, moments.length, onClose]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  // Keyboard navigation support
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  if (!isOpen || moments.length === 0) return null;

  const currentMoment = moments[currentIndex];
  const stepLabel = `0${currentIndex + 1} / 0${moments.length}`;
  const isLast = currentIndex === moments.length - 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Interactive Story Mode: Moment ${currentIndex + 1} of ${moments.length}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn"
    >
      <div className="relative w-full max-w-3xl bg-[#0b0d17] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden font-mono flex flex-col max-h-[90vh]">
        {/* Top Progress & Navigation Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800/80 bg-[#07080f]">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>INTERACTIVE STORY MODE</span>
            </div>
            <span className="text-xs text-gray-400 font-semibold tracking-widest">{stepLabel}</span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Step progress dots */}
            <div className="flex items-center space-x-1.5 mr-2">
              {moments.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Jump to Story Moment ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentIndex
                      ? 'w-6 bg-blue-500'
                      : idx < currentIndex
                      ? 'w-2 bg-blue-900/80 hover:bg-blue-700'
                      : 'w-2 bg-gray-800 hover:bg-gray-700'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={onClose}
              aria-label="Close Interactive Story Mode"
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/80 transition-colors focus-visible:ring-2 focus-visible:ring-gray-400 outline-none"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Story Content Area */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
          {/* Moment Tag and Date Header */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span className="font-bold text-gray-200">{currentMoment.formattedDate}</span>
              <span className="text-gray-600">•</span>
              <span className="text-gray-400">24-Hour Archive Slice</span>
            </div>

            {currentMoment.isPeakDensity && (
              <span className="inline-flex items-center space-x-1 text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>Peak Density Cluster</span>
              </span>
            )}
          </div>

          {/* Title & Narrative */}
          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-sans tracking-tight">
              {currentMoment.title}
            </h2>
            <div className="bg-[#121422] border border-gray-800/90 p-4 rounded-xl text-sm sm:text-base text-gray-200 leading-relaxed font-sans shadow-inner">
              <p>{currentMoment.narrative}</p>
            </div>
          </div>

          {/* Observable Data Telemetry Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Total Recorded Events */}
            <div className="bg-[#07080f] border border-gray-800/80 p-3 rounded-xl space-y-0.5">
              <div className="text-[10px] text-gray-400 uppercase">EVENTS RECORDED</div>
              <div className="text-lg font-bold text-white font-mono">{currentMoment.eventCount}</div>
            </div>

            {/* Sources Represented */}
            <div className="bg-[#07080f] border border-gray-800/80 p-3 rounded-xl space-y-0.5">
              <div className="text-[10px] text-gray-400 uppercase">SOURCES INVOLVED</div>
              <div className="text-lg font-bold text-purple-300 font-mono">
                {Object.values(currentMoment.sourceBreakdown).filter((c) => c > 0).length} / 3 Sources
              </div>
            </div>

            {/* Cross-Source Temporal Overlaps */}
            <div className="bg-[#07080f] border border-gray-800/80 p-3 rounded-xl space-y-0.5">
              <div className="text-[10px] text-gray-400 uppercase">TEMPORAL LINKS</div>
              <div className="text-lg font-bold text-emerald-300 font-mono">
                {currentMoment.connectionCount} Overlaps
              </div>
            </div>

            {/* Activity Density Rating */}
            <div className="bg-[#07080f] border border-gray-800/80 p-3 rounded-xl space-y-0.5">
              <div className="text-[10px] text-gray-400 uppercase">COMPOSITE RATING</div>
              <div className="text-lg font-bold text-blue-300 font-mono">
                {currentMoment.compositeScore.toFixed(1)} / 100
              </div>
            </div>
          </div>

          {/* Source Breakdown Tags & Categories */}
          <div className="bg-[#07080f] border border-gray-800/80 p-4 rounded-xl space-y-3 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-800/60 pb-2">
              <div className="flex items-center space-x-1.5 text-gray-400 font-semibold">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                <span>SOURCE BREAKDOWN</span>
              </div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                {Object.entries(currentMoment.sourceBreakdown)
                  .filter(([_, count]) => count > 0)
                  .map(([src, count]) => (
                    <span key={src} className="inline-flex items-center space-x-1">
                      <SourceTag source={src as any} />
                      <span className="text-[11px] text-gray-400 font-mono">({count})</span>
                    </span>
                  ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 text-[11px]">
              <span className="text-gray-400 uppercase font-semibold">CATEGORIES LOGGED:</span>
              <span className="text-gray-300 uppercase tracking-wider font-mono">
                {currentMoment.categories.join(' • ')}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Navigation & Actions */}
        <div className="p-4 sm:p-6 border-t border-gray-800/80 bg-[#07080f] flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Action Links */}
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              onClick={() => {
                onExploreMoment(currentMoment.monthKey, currentMoment.dateKey);
                onClose();
              }}
              aria-label={`Explore records for moment ${currentMoment.formattedDate}`}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold uppercase tracking-wider transition-all focus-visible:ring-2 focus-visible:ring-blue-400 outline-none"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>EXPLORE THIS MOMENT</span>
            </button>

            {currentMoment.representativeEvent && (
              <button
                onClick={() => {
                  onConnectMoment(currentMoment.representativeEvent);
                  onClose();
                }}
                aria-label={`Connect temporal moment from ${currentMoment.formattedDate}`}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 text-xs font-semibold uppercase tracking-wider transition-all focus-visible:ring-2 focus-visible:ring-gray-400 outline-none"
              >
                <Link className="w-3.5 h-3.5 text-purple-400" />
                <span>CONNECT THIS MOMENT</span>
              </button>
            )}
          </div>

          {/* Stepper Buttons */}
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              aria-label="Previous Story Moment"
              className={`inline-flex items-center space-x-1 px-3.5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider border transition-all ${
                currentIndex === 0
                  ? 'bg-gray-900/50 text-gray-600 border-gray-800 cursor-not-allowed'
                  : 'bg-gray-900 text-gray-300 border-gray-700 hover:bg-gray-800 focus-visible:ring-2 focus-visible:ring-gray-400 outline-none'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>PREVIOUS</span>
            </button>

            <button
              onClick={handleNext}
              aria-label={isLast ? 'Complete Interactive Story Mode' : 'Next Story Moment'}
              className={`inline-flex items-center space-x-1 px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all focus-visible:ring-2 focus-visible:ring-blue-400 outline-none ${
                isLast
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              <span>{isLast ? 'FINISH STORY' : 'NEXT'}</span>
              {isLast ? <CheckCircle2 className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
