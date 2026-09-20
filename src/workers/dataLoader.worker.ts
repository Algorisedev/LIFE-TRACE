import Papa from 'papaparse';
import { LifeTraceEvent } from '../data/types/event';
import { normalizeSpotifyRow, RawSpotifyRow } from '../data/normalizers/spotifyNormalizer';
import { normalizeHouseholdRow, RawHouseholdRow } from '../data/normalizers/householdNormalizer';
import { normalizeTransactionsRow, RawMultiFacetRow } from '../data/normalizers/transactionsNormalizer';
import { sanitizeEventForUI } from '../utils/privacy/privacyFilter';

export interface WorkerProgressMessage {
  type: 'PROGRESS';
  phase: string;
  loaded: number;
  total: number;
}

export interface WorkerSuccessMessage {
  type: 'SUCCESS';
  events: LifeTraceEvent[];
  stats: {
    spotifyCount: number;
    householdCount: number;
    transactionsCount: number;
    totalCount: number;
    loadTimeMs: number;
  };
}

export interface WorkerErrorMessage {
  type: 'ERROR';
  error: string;
}

export type WorkerMessage = WorkerProgressMessage | WorkerSuccessMessage | WorkerErrorMessage;

self.onmessage = async (e: MessageEvent<{ baseUrl?: string }>) => {
  const startTime = performance.now();
  const baseUrl = e.data?.baseUrl || '';

  try {
    // 1. Fetch & parse Spotify History
    postMessage({ type: 'PROGRESS', phase: 'Loading Spotify History (150k streams)...', loaded: 0, total: 3 });
    const spotifyUrl = `${baseUrl}/datasets/spotify/spotify_history.csv`;
    const spotifyRes = await fetch(spotifyUrl);
    if (!spotifyRes.ok) throw new Error(`Failed to fetch ${spotifyUrl}: ${spotifyRes.statusText}`);
    const spotifyText = await spotifyRes.text();

    const spotifyParsed = Papa.parse<RawSpotifyRow>(spotifyText, {
      header: true,
      skipEmptyLines: true,
    });

    const spotifyEvents: LifeTraceEvent[] = [];
    for (let i = 0; i < spotifyParsed.data.length; i++) {
      const ev = normalizeSpotifyRow(spotifyParsed.data[i], i);
      if (ev) {
        spotifyEvents.push(sanitizeEventForUI(ev));
      }
    }

    // 2. Fetch & parse Household Transactions
    postMessage({ type: 'PROGRESS', phase: 'Loading Household Transactions...', loaded: 1, total: 3 });
    const householdUrl = `${baseUrl}/datasets/household/Daily Household Transactions.csv`;
    const householdRes = await fetch(householdUrl);
    if (!householdRes.ok) throw new Error(`Failed to fetch ${householdUrl}: ${householdRes.statusText}`);
    const householdText = await householdRes.text();

    const householdParsed = Papa.parse<RawHouseholdRow>(householdText, {
      header: true,
      skipEmptyLines: true,
    });

    const householdEvents: LifeTraceEvent[] = [];
    for (let i = 0; i < householdParsed.data.length; i++) {
      const ev = normalizeHouseholdRow(householdParsed.data[i], i);
      if (ev) {
        householdEvents.push(sanitizeEventForUI(ev));
      }
    }

    // 3. Fetch & parse Multi-Facet Transactions (JSON representation)
    postMessage({ type: 'PROGRESS', phase: 'Loading Multi-Facet Transactions...', loaded: 2, total: 3 });
    const txUrl = `${baseUrl}/datasets/transactions/Augmented_IndiaTransactMultiFacet2024.json`;
    const txRes = await fetch(txUrl);
    if (!txRes.ok) throw new Error(`Failed to fetch ${txUrl}: ${txRes.statusText}`);
    const txJson: RawMultiFacetRow[] = await txRes.json();

    const txEvents: LifeTraceEvent[] = [];
    for (let i = 0; i < txJson.length; i++) {
      const ev = normalizeTransactionsRow(txJson[i], i);
      if (ev) {
        txEvents.push(sanitizeEventForUI(ev));
      }
    }

    // Combine all events
    const allEvents = [...spotifyEvents, ...householdEvents, ...txEvents];
    const endTime = performance.now();
    const loadTimeMs = Math.round(endTime - startTime);

    postMessage({
      type: 'SUCCESS',
      events: allEvents,
      stats: {
        spotifyCount: spotifyEvents.length,
        householdCount: householdEvents.length,
        transactionsCount: txEvents.length,
        totalCount: allEvents.length,
        loadTimeMs,
      },
    });
  } catch (err: any) {
    postMessage({
      type: 'ERROR',
      error: err?.message || 'Unknown error while processing datasets',
    });
  }
};
