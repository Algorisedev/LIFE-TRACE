import { useState } from 'react';
import { useLifeTraceData } from './hooks/useLifeTraceData';
import { Header, TabType } from './components/common/Header';
import { LoadingScreen } from './components/common/LoadingScreen';
import { StoryView } from './features/story/StoryView';
import { ExploreView } from './features/explore/ExploreView';
import { ConnectView } from './features/connections/ConnectView';
import { InsightsView } from './features/insights/InsightsView';
import { VisualizationView } from './features/visualization/VisualizationView';
import { LifeTraceEvent } from './data/types/event';

export function App() {
  const { loading, progress, error, stats, index, insights } = useLifeTraceData();
  const [activeTab, setActiveTab] = useState<TabType>('story');
  const [selectedAnchorEvent, setSelectedAnchorEvent] = useState<LifeTraceEvent | null>(null);
  const [exploreMonthRange, setExploreMonthRange] = useState<string>('all');

  const handleConnectMoment = (event: LifeTraceEvent) => {
    setSelectedAnchorEvent(event);
    setActiveTab('connect');
  };

  const handleFilterMonth = (monthKey: string) => {
    setExploreMonthRange(monthKey);
    setActiveTab('explore');
  };

  if (loading) {
    return <LoadingScreen progress={progress} />;
  }

  if (error || !index || !stats || !insights) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#07070a] text-white font-mono">
        <div className="max-w-md bg-red-950/60 border border-red-800 p-6 rounded-xl space-y-3">
          <h2 className="text-lg font-bold text-red-400">ENGINE INITIALIZATION ERROR</h2>
          <p className="text-xs text-gray-300">{error || 'Failed to initialize dataset index.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07070a] text-gray-100 flex flex-col font-sans">
      {/* Global Compact Header Navigation */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenSearch={() => setActiveTab('explore')}
        totalEventsCount={stats.totalCount}
      />

      {/* Main Experience Router */}
      <main className="flex-1">
        {activeTab === 'story' && (
          <StoryView
            stats={stats}
            insights={insights}
            onNavigateTab={setActiveTab}
            onFilterRange={(startM, _endM) => handleFilterMonth(startM)}
          />
        )}

        {activeTab === 'explore' && (
          <ExploreView
            index={index}
            onConnectMoment={handleConnectMoment}
            initialMonthRange={exploreMonthRange}
          />
        )}

        {activeTab === 'connect' && (
          <ConnectView
            index={index}
            selectedAnchorEvent={selectedAnchorEvent}
            onSelectAnchorEvent={setSelectedAnchorEvent}
          />
        )}

        {activeTab === 'insights' && (
          <InsightsView insights={insights} />
        )}

        {activeTab === 'visualization' && (
          <VisualizationView
            index={index}
            onInspectMonth={handleFilterMonth}
          />
        )}
      </main>

      {/* Persistent Editorial Footer */}
      <footer className="border-t border-gray-800/80 bg-[#07070a] py-8 text-center text-xs text-gray-400 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <strong className="text-gray-300">LIFE TRACE v2.0</strong> — 100% Client-Side Personal Data Archive
          </div>
          <div className="text-[11px] text-gray-400">
            Privacy-Protected • PII Redacted • O(log N) Indexed
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
