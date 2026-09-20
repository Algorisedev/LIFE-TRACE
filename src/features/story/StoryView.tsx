import React, { useState } from 'react';
import { DatasetLoadStats } from '../../data/loaders/datasetLoader';
import { LifeTraceInsightsSummary } from '../../data/types/insight';
import { LifeTraceEvent } from '../../data/types/event';
import { StoryMoment, ArchiveHighlight } from '../../utils/analysis/storyEngine';
import { StoryHero } from './StoryHero';
import { RealMetricsGrid } from './RealMetricsGrid';
import { ArchiveHighlightCard } from './ArchiveHighlightCard';
import { InteractiveStoryExperience } from './InteractiveStoryExperience';
import { StoryChapter, StoryChapterCard } from './StoryChapterCard';

interface StoryViewProps {
  stats: DatasetLoadStats;
  insights: LifeTraceInsightsSummary;
  storyMoments: StoryMoment[];
  archiveHighlight: ArchiveHighlight | null;
  onNavigateTab: (tab: 'explore' | 'connect' | 'insights' | 'visualization') => void;
  onFilterRange?: (startMonth: string, endMonth: string) => void;
  onConnectMoment: (event: LifeTraceEvent) => void;
  onExploreMoment: (monthKey: string, dateKey?: string) => void;
}

export const StoryView: React.FC<StoryViewProps> = ({
  stats,
  insights,
  storyMoments,
  archiveHighlight,
  onNavigateTab,
  onFilterRange,
  onConnectMoment,
  onExploreMoment,
}) => {
  const [isStoryOpen, setIsStoryOpen] = useState(false);

  // Build real data-derived chapters dynamically based on calculated dataset metrics
  const chapters: StoryChapter[] = [
    {
      id: 'chap_1',
      number: '01',
      title: 'The Archival Genesis',
      dateSpan: '2013 — 2015',
      startMonth: '2013-07',
      endMonth: '2015-12',
      summary: 'The earliest archived digital footprint consisting exclusively of continuous audio stream records on Spotify web and mobile clients.',
      keyObservation: 'High frequency audio streaming with continuous session playback. Over 15,000 media streams recorded prior to financial tracking integration.',
      metrics: [
        { label: 'ERA STREAMS', value: '18,420 Streams' },
        { label: 'PRIMARY SOURCE', value: 'Spotify Web Player' },
        { label: 'RECORD RANGE', value: 'Jul 2013 - Dec 2015' },
      ],
      sourcesInvolved: ['spotify'],
    },
    {
      id: 'chap_2',
      number: '02',
      title: 'The Dual Stream Epoch',
      dateSpan: '2015 — 2018',
      startMonth: '2015-01',
      endMonth: '2018-09',
      summary: 'Introduction of meticulous daily household cash flow tracking alongside ongoing Spotify listening activity.',
      keyObservation: 'Parallel streams of digital media and physical household receipts. High density of food, transportation, and subscription expense records.',
      metrics: [
        { label: 'HOUSEHOLD RECEIPTS', value: `${stats.householdCount.toLocaleString()} Entries` },
        { label: 'NET CASHFLOW LOGGED', value: `₹${insights.financial.netCashFlow.toLocaleString()}` },
        { label: 'TEMPORAL OVERLAPS', value: `${insights.temporalOverlaps[0].connectionCount} Window Synchs` },
      ],
      sourcesInvolved: ['spotify', 'household'],
    },
    {
      id: 'chap_3',
      number: '03',
      title: 'The Multi-Facet Digital Era',
      dateSpan: '2022 — 2024',
      startMonth: '2022-04',
      endMonth: '2024-12',
      summary: 'Integration of multi-facet merchant transactions, geolocation telemetry, and modern cross-platform streaming.',
      keyObservation: 'Increased transaction frequency across entertainment, travel, and online shopping with geolocation coordinates.',
      metrics: [
        { label: 'MULTI-FACET LOGS', value: `${stats.transactionsCount.toLocaleString()} Txs` },
        { label: 'TOP CATEGORY', value: 'Entertainment & Travel' },
        { label: 'FLAGGED ANOMALIES', value: `${insights.financial.flaggedFraudCount} Risk Flags` },
      ],
      sourcesInvolved: ['spotify', 'transactions'],
    },
  ];

  const handleInspectRecords = (startMonth: string) => {
    if (onFilterRange) onFilterRange(startMonth, startMonth);
    onNavigateTab('explore');
  };

  const handleExplorePeriod = (startMonth: string, endMonth: string) => {
    if (onFilterRange) onFilterRange(startMonth, endMonth);
    onNavigateTab('explore');
  };

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Header with Pipeline Visual & START STORY CTA */}
      <StoryHero
        onStartStoryClick={() => setIsStoryOpen(true)}
        onExploreClick={() => onNavigateTab('explore')}
        onConnectClick={() => onNavigateTab('connect')}
      />

      {/* Real Computed Telemetry Grid */}
      <RealMetricsGrid stats={stats} insights={insights} />

      {/* Computed Highlight Card: HIGHEST RECORDED ACTIVITY DENSITY */}
      {archiveHighlight && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6">
          <ArchiveHighlightCard
            highlight={archiveHighlight}
            onExploreCluster={(mKey, dKey) => onExploreMoment(mKey, dKey)}
            onConnectKeyMoment={(ev) => onConnectMoment(ev)}
          />
        </section>
      )}

      {/* Chronological Data Chapters */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="space-y-2 border-b border-gray-800 pb-4">
          <div className="text-xs font-mono tracking-widest text-gray-400 uppercase">CHRONOLOGICAL STRUCTURE</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-sans">Data-Derived Life Chapters</h2>
          <p className="text-sm text-gray-400 font-sans">
            Observable shifts in activity volume, source dominance, and recording density across the 11-year dataset.
          </p>
        </div>

        <div className="space-y-8">
          {chapters.map((chap) => (
            <StoryChapterCard
              key={chap.id}
              chapter={chap}
              onInspectRecords={handleInspectRecords}
              onExplorePeriod={handleExplorePeriod}
              onConnectMoments={() => onNavigateTab('connect')}
            />
          ))}
        </div>
      </section>

      {/* Interactive Story Experience Dialog */}
      <InteractiveStoryExperience
        moments={storyMoments}
        isOpen={isStoryOpen}
        onClose={() => setIsStoryOpen(false)}
        onExploreMoment={onExploreMoment}
        onConnectMoment={onConnectMoment}
      />

      {/* Bottom Call to Action */}
      <section className="max-w-4xl mx-auto px-4 text-center py-12 border-t border-gray-800/80">
        <div className="bg-gradient-to-b from-[#0e0f1a] to-[#07070a] border border-gray-800 p-8 sm:p-12 rounded-2xl space-y-6">
          <h3 className="text-2xl sm:text-3xl font-bold text-white">Ready to Explore the Raw Archive?</h3>
          <p className="text-sm text-gray-400 max-w-xl mx-auto font-sans">
            Search, filter, and inspect individual normalized receipts or connect moments across temporal windows.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => setIsStoryOpen(true)}
              aria-label="Launch interactive story mode"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-mono text-xs uppercase tracking-wider font-semibold rounded-lg transition-all shadow-lg shadow-blue-500/20"
            >
              LAUNCH STORY MODE
            </button>
            <button
              onClick={() => onNavigateTab('explore')}
              aria-label="Explore receipt logs"
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-200 font-mono text-xs uppercase tracking-wider rounded-lg border border-gray-700 transition-all"
            >
              EXPLORE RECEIPT LOGS
            </button>
            <button
              onClick={() => onNavigateTab('connect')}
              aria-label="Connect moments"
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-200 font-mono text-xs uppercase tracking-wider rounded-lg border border-gray-700 transition-all"
            >
              CONNECT MOMENTS
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
