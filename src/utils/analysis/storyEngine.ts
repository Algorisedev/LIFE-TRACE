import { EventCategory, LifeTraceEvent, SourceType } from '../../data/types/event';
import { EventIndex } from '../indexing/eventIndex';

export interface StoryMoment {
  id: string;
  stepNumber: number; // 1 to 5
  dateKey: string; // YYYY-MM-DD
  monthKey: string; // YYYY-MM
  formattedDate: string; // e.g., '14 Aug 2023'
  title: string;
  narrative: string;
  eventCount: number;
  sourceBreakdown: Record<SourceType, number>;
  categories: EventCategory[];
  connectionCount: number;
  compositeScore: number;
  representativeEvent: LifeTraceEvent;
  isPeakDensity?: boolean;
}

export interface ArchiveHighlight {
  dateKey: string;
  monthKey: string;
  formattedDate: string;
  eventCount: number;
  sourcesPresent: SourceType[];
  sourceBreakdown: Record<SourceType, number>;
  connectionCount: number;
  compositeScore: number;
  metricsBreakdown: {
    densityScore: number; // 0-100 (40% weight)
    diversityScore: number; // 0-100 (30% weight)
    connectionScore: number; // 0-100 (30% weight)
  };
  representativeEvent: LifeTraceEvent;
  narrative: string;
}

/**
 * Format a YYYY-MM-DD date key into an editorial format like "14 Aug 2023".
 */
export function formatEditorialDate(dateKey: string): string {
  if (!dateKey) return '';
  const parts = dateKey.split('-');
  if (parts.length < 3) return dateKey;
  const year = parts[0];
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthName = monthNames[monthIdx] || parts[1];
  return `${day} ${monthName} ${year}`;
}

export interface DateClusterStats {
  dateKey: string;
  events: LifeTraceEvent[];
  eventCount: number;
  sources: Set<SourceType>;
  sourceBreakdown: Record<SourceType, number>;
  categories: Set<EventCategory>;
  crossSourceConnections: number;
  representativeEvent: LifeTraceEvent;
  compositeScore: number;
  densityScore: number;
  diversityScore: number;
  connectionScore: number;
}

/**
 * Analyze daily clusters from the index and compute deterministic metrics.
 */
export function analyzeDateClusters(index: EventIndex): DateClusterStats[] {
  if (!index || index.size === 0) return [];

  const clusters: DateClusterStats[] = [];

  // Group events by dateKey
  const dateSet = new Set<string>();
  for (let i = 0; i < index.events.length; i++) {
    dateSet.add(index.events[i].dateKey);
  }

  const allDates = Array.from(dateSet).sort();

  let maxDailyCount = 1;
  let maxDailyConnections = 1;

  // First pass: gather counts and cross-source connections
  const rawStats: Array<{
    dateKey: string;
    events: LifeTraceEvent[];
    eventCount: number;
    sources: Set<SourceType>;
    sourceBreakdown: Record<SourceType, number>;
    categories: Set<EventCategory>;
    crossSourceConnections: number;
    representativeEvent: LifeTraceEvent;
  }> = [];

  for (const dateKey of allDates) {
    const dayEvents = index.queryByDate(dateKey);
    if (dayEvents.length === 0) continue;

    const sources = new Set<SourceType>();
    const categories = new Set<EventCategory>();
    const sourceBreakdown: Record<SourceType, number> = { spotify: 0, household: 0, transactions: 0 };

    let representativeEvent = dayEvents[0];
    let hasNonSpotify = false;

    for (const ev of dayEvents) {
      sources.add(ev.source);
      categories.add(ev.category);
      sourceBreakdown[ev.source] = (sourceBreakdown[ev.source] || 0) + 1;

      // Prefer financial/transaction events as representative anchor if present
      if (ev.source !== 'spotify' && !hasNonSpotify) {
        representativeEvent = ev;
        hasNonSpotify = true;
      }
    }

    // Compute cross-source overlaps in this date
    let crossSourceConnections = 0;
    if (sources.size > 1) {
      const spotifyCount = sourceBreakdown.spotify || 0;
      const nonSpotifyCount = (sourceBreakdown.household || 0) + (sourceBreakdown.transactions || 0);
      crossSourceConnections = Math.min(spotifyCount, nonSpotifyCount);
    }

    if (dayEvents.length > maxDailyCount) maxDailyCount = dayEvents.length;
    if (crossSourceConnections > maxDailyConnections) maxDailyConnections = crossSourceConnections;

    rawStats.push({
      dateKey,
      events: dayEvents,
      eventCount: dayEvents.length,
      sources,
      sourceBreakdown,
      categories,
      crossSourceConnections,
      representativeEvent,
    });
  }

  // Second pass: compute deterministic composite score
  // Formula: 40% event density, 30% source diversity, 30% cross-source temporal connections
  for (const stat of rawStats) {
    const densityScore = (stat.eventCount / maxDailyCount) * 100;
    const diversityScore = (stat.sources.size / 3) * 100;
    const connectionScore = maxDailyConnections > 0 
      ? (stat.crossSourceConnections / maxDailyConnections) * 100 
      : 0;

    const compositeScore = Math.round((0.40 * densityScore + 0.30 * diversityScore + 0.30 * connectionScore) * 10) / 10;

    clusters.push({
      ...stat,
      densityScore: Math.round(densityScore * 10) / 10,
      diversityScore: Math.round(diversityScore * 10) / 10,
      connectionScore: Math.round(connectionScore * 10) / 10,
      compositeScore,
    });
  }

  return clusters;
}

/**
 * Computes the highlight card: "HIGHEST RECORDED ACTIVITY DENSITY".
 * Strictly explainable with composite score formula:
 * 40% event density, 30% source diversity, 30% cross-source temporal connections.
 */
export function computeArchiveHighlight(index: EventIndex): ArchiveHighlight | null {
  const clusters = analyzeDateClusters(index);
  if (clusters.length === 0) return null;

  // Sort descending by composite score, then by eventCount, then by date
  const sorted = [...clusters].sort((a, b) => {
    if (b.compositeScore !== a.compositeScore) return b.compositeScore - a.compositeScore;
    if (b.eventCount !== a.eventCount) return b.eventCount - a.eventCount;
    return b.dateKey.localeCompare(a.dateKey);
  });

  const top = sorted[0];
  const formattedDate = formatEditorialDate(top.dateKey);
  const sourcesArr = Array.from(top.sources);
  const monthKey = top.dateKey.substring(0, 7);

  const sourcesList = sourcesArr.map(s => s.toUpperCase()).join(', ');
  const narrative = `${formattedDate} contains ${top.eventCount} recorded events across ${sourcesArr.length} source(s) (${sourcesList}) with ${top.crossSourceConnections} cross-source temporal connections, achieving a ${top.compositeScore}/100 composite density rating.`;

  return {
    dateKey: top.dateKey,
    monthKey,
    formattedDate,
    eventCount: top.eventCount,
    sourcesPresent: sourcesArr,
    sourceBreakdown: top.sourceBreakdown,
    connectionCount: top.crossSourceConnections,
    compositeScore: top.compositeScore,
    metricsBreakdown: {
      densityScore: top.densityScore,
      diversityScore: top.diversityScore,
      connectionScore: top.connectionScore,
    },
    representativeEvent: top.representativeEvent,
    narrative,
  };
}

/**
 * Derive a strictly factual, data-grounded title based on the cluster's actual properties.
 * Guarantees that only the canonical highlight receives "Highest Recorded Activity Density",
 * and moments with >1 sources never receive "Single-Source".
 */
export function deriveMomentTitle(cluster: DateClusterStats, peakDateKey: string): string {
  if (cluster.dateKey === peakDateKey) {
    return 'Highest Recorded Activity Density';
  }

  if (cluster.sources.size === 1) {
    const singleSource = Array.from(cluster.sources)[0];
    const sourceName = singleSource.charAt(0).toUpperCase() + singleSource.slice(1);
    return `Single-Source ${sourceName} Stream Logs`;
  }

  if (cluster.sources.size === 3) {
    return 'Triple-Source Unified Activity Window';
  }

  if (cluster.sourceBreakdown.transactions > 0 && cluster.sourceBreakdown.spotify > 0) {
    return 'Multi-Facet Transaction & Media Activity Window';
  }

  if (cluster.crossSourceConnections > 0) {
    return 'Multi-Source Cross-Temporal Activity Window';
  }

  return 'Multi-Source Recorded Activity Window';
}

/**
 * Generate exactly 5 deterministic, data-derived story moments across the archive (or min(5, totalDays)).
 * Uses the canonical ArchiveHighlight as the single source of truth for the peak density moment.
 */
export function generateStoryMoments(index: EventIndex, precomputedHighlight?: ArchiveHighlight | null): StoryMoment[] {
  const clusters = analyzeDateClusters(index);
  if (clusters.length === 0) return [];

  const highlight = precomputedHighlight !== undefined ? precomputedHighlight : computeArchiveHighlight(index);
  const peakDateKey = highlight?.dateKey || '';

  const sortedByDate = [...clusters].sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  const totalDays = sortedByDate.length;

  let finalDays: DateClusterStats[] = [];

  if (totalDays <= 5) {
    finalDays = sortedByDate;
  } else {
    // 1. Genesis: pick highest volume day from earliest 25% of timeline
    const genesisPool = sortedByDate.slice(0, Math.max(1, Math.floor(totalDays * 0.25)));
    const genesisDay = [...genesisPool].sort((a, b) => b.eventCount - a.eventCount)[0] || sortedByDate[0];

    // 2. Dual-Source: earliest day with both spotify and household
    const dualSourceDay = sortedByDate.find(c => c.sourceBreakdown.spotify > 0 && c.sourceBreakdown.household > 0) ||
      sortedByDate[Math.floor(totalDays * 0.35)];

    // 3. Peak Density Day: EXACT canonical highlight
    const peakDay = clusters.find(c => c.dateKey === peakDateKey) || sortedByDate[Math.floor(totalDays * 0.5)];

    // 4. Multi-Facet Transaction Day: day with multi-facet transactions and cross-source connections
    const multiFacetDay = sortedByDate.find(c => c.sourceBreakdown.transactions > 0 && c.sourceBreakdown.spotify > 0 && c.dateKey !== peakDay.dateKey) ||
      sortedByDate.find(c => c.sourceBreakdown.transactions > 0) ||
      sortedByDate[Math.floor(totalDays * 0.75)];

    // 5. Recent Day: highest activity day from the final 20% of the archive
    const recentPool = sortedByDate.slice(Math.max(0, Math.floor(totalDays * 0.8)));
    const recentDay = [...recentPool].sort((a, b) => b.compositeScore - a.compositeScore || b.eventCount - a.eventCount)[0] ||
      sortedByDate[sortedByDate.length - 1];

    // Deduplicate and ensure exactly 5 sorted chronologically
    const candidateDays = [genesisDay, dualSourceDay, peakDay, multiFacetDay, recentDay];
    const uniqueMap = new Map<string, DateClusterStats>();
    for (const day of candidateDays) {
      if (day) uniqueMap.set(day.dateKey, day);
    }

    // Backfill from remaining days sorted by composite score if needed
    if (uniqueMap.size < 5) {
      const topComposite = [...clusters].sort((a, b) => b.compositeScore - a.compositeScore);
      for (const top of topComposite) {
        if (!uniqueMap.has(top.dateKey)) {
          uniqueMap.set(top.dateKey, top);
        }
        if (uniqueMap.size === 5) break;
      }
    }

    finalDays = Array.from(uniqueMap.values())
      .sort((a, b) => a.dateKey.localeCompare(b.dateKey))
      .slice(0, 5);
  }

  return finalDays.map((cluster, idx) => {
    const stepNumber = idx + 1;
    const formattedDate = formatEditorialDate(cluster.dateKey);
    const monthKey = cluster.dateKey.substring(0, 7);
    const sourcesList = Array.from(cluster.sources).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' and ');
    const isPeak = cluster.dateKey === peakDateKey;

    // Dynamically derive factual title strictly matching actual cluster data
    const title = deriveMomentTitle(cluster, peakDateKey);

    let narrative = '';
    if (isPeak) {
      narrative = `${formattedDate} contains ${cluster.eventCount} recorded events across ${sourcesList} sources with ${cluster.crossSourceConnections} cross-source temporal connections, achieving a ${cluster.compositeScore}/100 composite density rating.`;
    } else if (cluster.sources.size === 1) {
      narrative = `${formattedDate} contains ${cluster.eventCount} recorded events in the ${sourcesList} archive stream.`;
    } else if (cluster.crossSourceConnections > 0) {
      narrative = `${formattedDate} contains ${cluster.eventCount} recorded events across ${sourcesList} sources with ${cluster.crossSourceConnections} cross-source temporal connections.`;
    } else {
      narrative = `${formattedDate} contains ${cluster.eventCount} recorded events across ${sourcesList} sources within the single 24-hour recording window.`;
    }

    return {
      id: `story_moment_${stepNumber}_${cluster.dateKey}`,
      stepNumber,
      dateKey: cluster.dateKey,
      monthKey,
      formattedDate,
      title,
      narrative,
      eventCount: cluster.eventCount,
      sourceBreakdown: cluster.sourceBreakdown,
      categories: Array.from(cluster.categories),
      connectionCount: cluster.crossSourceConnections,
      compositeScore: cluster.compositeScore,
      representativeEvent: cluster.representativeEvent,
      isPeakDensity: isPeak,
    };
  });
}
