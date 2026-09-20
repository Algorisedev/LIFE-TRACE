import Papa from 'papaparse';
import { LifeTraceEvent } from '../types/event';
import { normalizeSpotifyRow, RawSpotifyRow } from '../normalizers/spotifyNormalizer';
import { normalizeHouseholdRow, RawHouseholdRow } from '../normalizers/householdNormalizer';
import { normalizeTransactionsRow, RawMultiFacetRow } from '../normalizers/transactionsNormalizer';
import { sanitizeEventForUI } from '../../utils/privacy/privacyFilter';
import { EventIndex } from '../../utils/indexing/eventIndex';
import {
  generateStoryMoments,
  computeArchiveHighlight,
  StoryMoment,
  ArchiveHighlight,
} from '../../utils/analysis/storyEngine';

export interface DatasetLoadStats {
  spotifyCount: number;
  householdCount: number;
  transactionsCount: number;
  totalCount: number;
  loadTimeMs: number;
}

export interface DatasetLoadResult {
  events: LifeTraceEvent[];
  stats: DatasetLoadStats;
  storyMoments: StoryMoment[];
  archiveHighlight: ArchiveHighlight | null;
}

/**
 * Fallback main-thread loader when Web Worker is not available.
 */
export async function loadAllDatasetsDirectly(
  onProgress?: (phase: string) => void
): Promise<DatasetLoadResult> {
  const startTime = performance.now();

  // 1. Spotify
  onProgress?.('Loading Spotify History...');
  const spotifyRes = await fetch('/datasets/spotify/spotify_history.csv');
  const spotifyText = await spotifyRes.text();
  const spotifyParsed = Papa.parse<RawSpotifyRow>(spotifyText, { header: true, skipEmptyLines: true });
  const spotifyEvents: LifeTraceEvent[] = [];
  for (let i = 0; i < spotifyParsed.data.length; i++) {
    const ev = normalizeSpotifyRow(spotifyParsed.data[i], i);
    if (ev) spotifyEvents.push(sanitizeEventForUI(ev));
  }

  // 2. Household
  onProgress?.('Loading Household Transactions...');
  const householdRes = await fetch('/datasets/household/Daily Household Transactions.csv');
  const householdText = await householdRes.text();
  const householdParsed = Papa.parse<RawHouseholdRow>(householdText, { header: true, skipEmptyLines: true });
  const householdEvents: LifeTraceEvent[] = [];
  for (let i = 0; i < householdParsed.data.length; i++) {
    const ev = normalizeHouseholdRow(householdParsed.data[i], i);
    if (ev) householdEvents.push(sanitizeEventForUI(ev));
  }

  // 3. Transactions (JSON)
  onProgress?.('Loading Multi-Facet Transactions...');
  const txRes = await fetch('/datasets/transactions/Augmented_IndiaTransactMultiFacet2024.json');
  const txJson: RawMultiFacetRow[] = await txRes.json();
  const txEvents: LifeTraceEvent[] = [];
  for (let i = 0; i < txJson.length; i++) {
    const ev = normalizeTransactionsRow(txJson[i], i);
    if (ev) txEvents.push(sanitizeEventForUI(ev));
  }

  const allEvents = [...spotifyEvents, ...householdEvents, ...txEvents];
  const fallbackIndex = new EventIndex(allEvents);
  const archiveHighlight = computeArchiveHighlight(fallbackIndex);
  const storyMoments = generateStoryMoments(fallbackIndex, archiveHighlight);

  const endTime = performance.now();

  return {
    events: allEvents,
    storyMoments,
    archiveHighlight,
    stats: {
      spotifyCount: spotifyEvents.length,
      householdCount: householdEvents.length,
      transactionsCount: txEvents.length,
      totalCount: allEvents.length,
      loadTimeMs: Math.round(endTime - startTime),
    },
  };
}
