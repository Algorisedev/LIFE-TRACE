import { SourceType } from './event';

export interface TimeframeActivity {
  byYear: Record<string, number>;
  byMonth: Record<string, number>; // YYYY-MM -> count
  byDayOfWeek: Record<number, number>; // 0 (Sun) - 6 (Sat) -> count
  byHourOfDay: Record<number, number>; // 0 - 23 -> count
}

export interface ListeningMetrics {
  totalMsPlayed: number;
  totalHoursPlayed: number;
  totalStreams: number;
  topArtists: Array<{ artist: string; count: number; durationMs: number }>;
  topTracks: Array<{ track: string; artist: string; count: number; durationMs: number }>;
  platformBreakdown: Record<string, number>;
  skipCount: number;
  skipRate: number; // percentage 0 - 100
}

export interface FinancialMetrics {
  totalIncome: number;
  totalExpense: number;
  netCashFlow: number;
  transactionCount: number;
  householdCount: number;
  multiFacetCount: number;
  categoryBreakdown: Record<string, number>;
  modeBreakdown: Record<string, number>;
  flaggedFraudCount: number;
}

export interface SourceActivityDensity {
  source: SourceType;
  eventCount: number;
  percentage: number;
}

export interface TemporalOverlapMetric {
  windowType: 'same_day' | '30_min' | '2_hours';
  connectionCount: number;
  crossSourceCount: number; // e.g. Spotify + Household or Spotify + MultiFacet
}

export interface LifeTraceInsightsSummary {
  totalEvents: number;
  dateRange: { start: string; end: string; startTimestamp: number; endTimestamp: number };
  activity: TimeframeActivity;
  listening: ListeningMetrics;
  financial: FinancialMetrics;
  sources: SourceActivityDensity[];
  temporalOverlaps: TemporalOverlapMetric[];
}
