import { useEffect, useState, useMemo } from 'react';
import { LifeTraceEvent } from '../data/types/event';
import { LifeTraceInsightsSummary } from '../data/types/insight';
import { DatasetLoadStats, loadAllDatasetsDirectly } from '../data/loaders/datasetLoader';
import { EventIndex } from '../utils/indexing/eventIndex';
import { computeInsightsSummary } from '../utils/analysis/insightEngine';
import { StoryMoment, ArchiveHighlight } from '../utils/analysis/storyEngine';
import DataLoaderWorker from '../workers/dataLoader.worker?worker';

export interface UseLifeTraceDataResult {
  loading: boolean;
  progress: string;
  error: string | null;
  events: LifeTraceEvent[];
  index: EventIndex | null;
  insights: LifeTraceInsightsSummary | null;
  stats: DatasetLoadStats | null;
  storyMoments: StoryMoment[];
  archiveHighlight: ArchiveHighlight | null;
}

export function useLifeTraceData(): UseLifeTraceDataResult {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState('Initializing datasets...');
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<LifeTraceEvent[]>([]);
  const [stats, setStats] = useState<DatasetLoadStats | null>(null);
  const [storyMoments, setStoryMoments] = useState<StoryMoment[]>([]);
  const [archiveHighlight, setArchiveHighlight] = useState<ArchiveHighlight | null>(null);

  useEffect(() => {
    let activeWorker: Worker | null = null;
    let isCancelled = false;

    async function fallbackLoad() {
      try {
        const result = await loadAllDatasetsDirectly((phase) => {
          if (!isCancelled) setProgress(phase);
        });
        if (!isCancelled) {
          setEvents(result.events);
          setStats(result.stats);
          setStoryMoments(result.storyMoments);
          setArchiveHighlight(result.archiveHighlight);
          setLoading(false);
          setProgress('Complete');
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          const message = err instanceof Error ? err.message : 'Failed to load datasets';
          setError(message);
          setLoading(false);
        }
      }
    }

    async function loadData() {
      try {
        if (typeof Worker !== 'undefined') {
          activeWorker = new DataLoaderWorker();
          
          activeWorker.onmessage = (e: MessageEvent) => {
            if (isCancelled) return;
            const msg = e.data;
            if (msg.type === 'PROGRESS') {
              setProgress(msg.phase);
            } else if (msg.type === 'SUCCESS') {
              setEvents(msg.events);
              setStats(msg.stats);
              setStoryMoments(msg.storyMoments || []);
              setArchiveHighlight(msg.archiveHighlight || null);
              setLoading(false);
              setProgress('Complete');
            } else if (msg.type === 'ERROR') {
              setError(msg.error);
              setLoading(false);
            }
          };

          activeWorker.onerror = (err) => {
            if (isCancelled) return;
            console.warn('Worker error, switching to main thread loader:', err);
            fallbackLoad();
          };

          activeWorker.postMessage({ baseUrl: window.location.origin });
        } else {
          await fallbackLoad();
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          console.warn('Worker initialization failed:', err);
          await fallbackLoad();
        }
      }
    }

    loadData();

    return () => {
      isCancelled = true;
      if (activeWorker) {
        activeWorker.terminate();
      }
    };
  }, []);

  const index = useMemo(() => {
    if (events.length === 0) return null;
    return new EventIndex(events);
  }, [events]);

  const insights = useMemo(() => {
    if (!index) return null;
    return computeInsightsSummary(index);
  }, [index]);

  return {
    loading,
    progress,
    error,
    events,
    index,
    insights,
    stats,
    storyMoments,
    archiveHighlight,
  };
}
