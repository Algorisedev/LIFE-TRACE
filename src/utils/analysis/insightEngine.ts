import { LifeTraceEvent } from '../../data/types/event';
import {
  FinancialMetrics,
  LifeTraceInsightsSummary,
  ListeningMetrics,
  SourceActivityDensity,
  TimeframeActivity,
} from '../../data/types/insight';
import { EventIndex } from '../indexing/eventIndex';
import { countTotalCrossSourceConnections } from './connectionEngine';

/**
 * Deterministic analysis functions for observable patterns in LIFE TRACE.
 * Traceable to raw records. Zero psychological or personality claims.
 */

export function computeTimeframeActivity(events: ReadonlyArray<LifeTraceEvent>): TimeframeActivity {
  const byYear: Record<string, number> = {};
  const byMonth: Record<string, number> = {};
  const byDayOfWeek: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  const byHourOfDay: Record<number, number> = {};

  for (let i = 0; i < 24; i++) byHourOfDay[i] = 0;

  for (const ev of events) {
    const yr = ev.dateKey.substring(0, 4);
    const mo = ev.dateKey.substring(0, 7);
    
    byYear[yr] = (byYear[yr] || 0) + 1;
    byMonth[mo] = (byMonth[mo] || 0) + 1;

    const dt = new Date(ev.timestamp);
    const dow = dt.getUTCDay();
    const hr = dt.getUTCHours();

    byDayOfWeek[dow] = (byDayOfWeek[dow] || 0) + 1;
    byHourOfDay[hr] = (byHourOfDay[hr] || 0) + 1;
  }

  return { byYear, byMonth, byDayOfWeek, byHourOfDay };
}

export function computeListeningMetrics(events: ReadonlyArray<LifeTraceEvent>): ListeningMetrics {
  let totalMsPlayed = 0;
  let totalStreams = 0;
  let skipCount = 0;
  const artistMap: Record<string, { count: number; durationMs: number }> = {};
  const trackMap: Record<string, { track: string; artist: string; count: number; durationMs: number }> = {};
  const platformBreakdown: Record<string, number> = {};

  for (const ev of events) {
    if (ev.source !== 'spotify') continue;

    totalStreams++;
    const ms = ev.value || 0;
    totalMsPlayed += ms;

    if (ev.metadata.skipped) {
      skipCount++;
    }

    const artist = ev.subtitle || 'Unknown Artist';
    const track = ev.title || 'Unknown Track';
    const platform = ev.metadata.platform || 'Unknown Platform';

    platformBreakdown[platform] = (platformBreakdown[platform] || 0) + 1;

    if (!artistMap[artist]) {
      artistMap[artist] = { count: 0, durationMs: 0 };
    }
    artistMap[artist].count++;
    artistMap[artist].durationMs += ms;

    const trackKey = `${track}___${artist}`;
    if (!trackMap[trackKey]) {
      trackMap[trackKey] = { track, artist, count: 0, durationMs: 0 };
    }
    trackMap[trackKey].count++;
    trackMap[trackKey].durationMs += ms;
  }

  const topArtists = Object.entries(artistMap)
    .map(([artist, data]) => ({ artist, count: data.count, durationMs: data.durationMs }))
    .sort((a, b) => b.durationMs - a.durationMs)
    .slice(0, 10);

  const topTracks = Object.values(trackMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const totalHoursPlayed = parseFloat((totalMsPlayed / (1000 * 3600)).toFixed(2));
  const skipRate = totalStreams > 0 ? parseFloat(((skipCount / totalStreams) * 100).toFixed(2)) : 0;

  return {
    totalMsPlayed,
    totalHoursPlayed,
    totalStreams,
    topArtists,
    topTracks,
    platformBreakdown,
    skipCount,
    skipRate,
  };
}

export function computeFinancialMetrics(events: ReadonlyArray<LifeTraceEvent>): FinancialMetrics {
  let totalIncome = 0;
  let totalExpense = 0;
  let transactionCount = 0;
  let householdCount = 0;
  let multiFacetCount = 0;
  let flaggedFraudCount = 0;
  const categoryBreakdown: Record<string, number> = {};
  const modeBreakdown: Record<string, number> = {};

  for (const ev of events) {
    if (ev.source === 'spotify') continue;

    transactionCount++;
    if (ev.source === 'household') householdCount++;
    if (ev.source === 'transactions') multiFacetCount++;

    if (ev.metadata.isFraud) flaggedFraudCount++;

    const val = ev.value || 0;
    if (ev.category === 'income') {
      totalIncome += val;
    } else {
      totalExpense += val;
    }

    const cat = ev.subtitle || ev.title || 'Uncategorized';
    categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + val;

    const mode = ev.metadata.mode || 'Credit/Debit/Digital';
    modeBreakdown[mode] = (modeBreakdown[mode] || 0) + val;
  }

  totalIncome = parseFloat(totalIncome.toFixed(2));
  totalExpense = parseFloat(totalExpense.toFixed(2));
  const netCashFlow = parseFloat((totalIncome - totalExpense).toFixed(2));

  return {
    totalIncome,
    totalExpense,
    netCashFlow,
    transactionCount,
    householdCount,
    multiFacetCount,
    categoryBreakdown,
    modeBreakdown,
    flaggedFraudCount,
  };
}

export function computeSourceActivityDensity(events: ReadonlyArray<LifeTraceEvent>): SourceActivityDensity[] {
  const total = events.length;
  if (total === 0) return [];

  const counts: Record<string, number> = { spotify: 0, household: 0, transactions: 0 };
  for (const ev of events) {
    counts[ev.source] = (counts[ev.source] || 0) + 1;
  }

  return Object.entries(counts).map(([src, cnt]) => ({
    source: src as any,
    eventCount: cnt,
    percentage: parseFloat(((cnt / total) * 100).toFixed(2)),
  }));
}

export function computeInsightsSummary(index: EventIndex): LifeTraceInsightsSummary {
  const events = index.events;
  const totalEvents = events.length;

  const startTimestamp = events.length > 0 ? events[0].timestamp : 0;
  const endTimestamp = events.length > 0 ? events[events.length - 1].timestamp : 0;
  const start = events.length > 0 ? events[0].dateKey : '';
  const end = events.length > 0 ? events[events.length - 1].dateKey : '';

  const activity = computeTimeframeActivity(events);
  const listening = computeListeningMetrics(events);
  const financial = computeFinancialMetrics(events);
  const sources = computeSourceActivityDensity(events);

  // Compute TRUE total cross-source overlap counts using O(log N) binary search
  const total30MinOverlaps = countTotalCrossSourceConnections(index, '30_min');
  const total2HoursOverlaps = countTotalCrossSourceConnections(index, '2_hours');
  const totalSameDayOverlaps = countTotalCrossSourceConnections(index, 'same_day');

  return {
    totalEvents,
    dateRange: { start, end, startTimestamp, endTimestamp },
    activity,
    listening,
    financial,
    sources,
    temporalOverlaps: [
      { windowType: '30_min', connectionCount: total30MinOverlaps, crossSourceCount: total30MinOverlaps },
      { windowType: '2_hours', connectionCount: total2HoursOverlaps, crossSourceCount: total2HoursOverlaps },
      { windowType: 'same_day', connectionCount: totalSameDayOverlaps, crossSourceCount: totalSameDayOverlaps },
    ],
  };
}
