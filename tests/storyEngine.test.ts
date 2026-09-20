import { describe, it, expect } from 'vitest';
import { EventIndex } from '../src/utils/indexing/eventIndex';
import { LifeTraceEvent } from '../src/data/types/event';
import {
  analyzeDateClusters,
  computeArchiveHighlight,
  generateStoryMoments,
  formatEditorialDate,
} from '../src/utils/analysis/storyEngine';

const mockEvents: LifeTraceEvent[] = [
  // 1. 2013: Genesis era - Spotify only
  {
    id: 'spot_1',
    timestamp: new Date('2013-08-10T10:00:00Z').getTime(),
    dateKey: '2013-08-10',
    source: 'spotify',
    category: 'media',
    title: 'Track A',
    subtitle: 'Artist A',
    value: 180000,
    metadata: { platform: 'web' },
  },
  {
    id: 'spot_2',
    timestamp: new Date('2013-08-10T10:05:00Z').getTime(),
    dateKey: '2013-08-10',
    source: 'spotify',
    category: 'media',
    title: 'Track B',
    subtitle: 'Artist B',
    value: 200000,
    metadata: { platform: 'web' },
  },

  // 2. 2016: Dual stream era - Spotify + Household
  {
    id: 'spot_3',
    timestamp: new Date('2016-04-15T12:00:00Z').getTime(),
    dateKey: '2016-04-15',
    source: 'spotify',
    category: 'media',
    title: 'Track C',
    subtitle: 'Artist C',
    value: 150000,
    metadata: {},
  },
  {
    id: 'hh_1',
    timestamp: new Date('2016-04-15T12:15:00Z').getTime(),
    dateKey: '2016-04-15',
    source: 'household',
    category: 'expense',
    title: 'Grocery Store',
    subtitle: 'Food & Supplies',
    value: 350,
    metadata: { mode: 'Cash' },
  },

  // 3. 2020: Mid-era transition
  {
    id: 'spot_mid',
    timestamp: new Date('2020-05-18T16:00:00Z').getTime(),
    dateKey: '2020-05-18',
    source: 'spotify',
    category: 'media',
    title: 'Podcast Episode',
    subtitle: 'Host A',
    value: 1200000,
    metadata: {},
  },
  {
    id: 'hh_mid',
    timestamp: new Date('2020-05-18T16:30:00Z').getTime(),
    dateKey: '2020-05-18',
    source: 'household',
    category: 'expense',
    title: 'Electric Utility',
    subtitle: 'Bills',
    value: 1200,
    metadata: { mode: 'NetBanking' },
  },

  // 4. 2023: Peak density era - All 3 sources co-occurring with overlaps
  {
    id: 'spot_4',
    timestamp: new Date('2023-08-14T09:00:00Z').getTime(),
    dateKey: '2023-08-14',
    source: 'spotify',
    category: 'media',
    title: 'Track D',
    subtitle: 'Artist D',
    value: 210000,
    metadata: {},
  },
  {
    id: 'spot_5',
    timestamp: new Date('2023-08-14T09:15:00Z').getTime(),
    dateKey: '2023-08-14',
    source: 'spotify',
    category: 'media',
    title: 'Track E',
    subtitle: 'Artist E',
    value: 190000,
    metadata: {},
  },
  {
    id: 'hh_2',
    timestamp: new Date('2023-08-14T09:20:00Z').getTime(),
    dateKey: '2023-08-14',
    source: 'household',
    category: 'expense',
    title: 'Transit Ticket',
    subtitle: 'Transportation',
    value: 80,
    metadata: { mode: 'UPI' },
  },
  {
    id: 'tx_1',
    timestamp: new Date('2023-08-14T09:30:00Z').getTime(),
    dateKey: '2023-08-14',
    source: 'transactions',
    category: 'expense',
    title: 'Coffee Shop',
    subtitle: 'Dining',
    value: 240,
    metadata: { merchant: 'Café Java' },
  },

  // 5. 2024: Recent era
  {
    id: 'spot_6',
    timestamp: new Date('2024-11-20T14:00:00Z').getTime(),
    dateKey: '2024-11-20',
    source: 'spotify',
    category: 'media',
    title: 'Track F',
    subtitle: 'Artist F',
    value: 220000,
    metadata: {},
  },
  {
    id: 'tx_2',
    timestamp: new Date('2024-11-20T14:10:00Z').getTime(),
    dateKey: '2024-11-20',
    source: 'transactions',
    category: 'income',
    title: 'Consulting Payout',
    subtitle: 'Direct Credit',
    value: 15000,
    metadata: { merchant: 'Enterprise Inc' },
  },
];

describe('storyEngine: Deterministic Story Generation & Composite Metrics', () => {
  const index = new EventIndex(mockEvents);

  it('formats date keys into editorial format accurately', () => {
    expect(formatEditorialDate('2023-08-14')).toBe('14 Aug 2023');
    expect(formatEditorialDate('2013-01-05')).toBe('5 Jan 2013');
  });

  it('analyzes date clusters and correctly evaluates source breakdowns and overlaps', () => {
    const clusters = analyzeDateClusters(index);
    expect(clusters.length).toBe(5);

    const peakCluster = clusters.find(c => c.dateKey === '2023-08-14');
    expect(peakCluster).toBeDefined();
    expect(peakCluster?.eventCount).toBe(4);
    expect(peakCluster?.sources.size).toBe(3);
    expect(peakCluster?.sourceBreakdown.spotify).toBe(2);
    expect(peakCluster?.sourceBreakdown.household).toBe(1);
    expect(peakCluster?.sourceBreakdown.transactions).toBe(1);
    expect(peakCluster?.crossSourceConnections).toBe(2);
  });

  it('computes composite score using 40% density, 30% diversity, and 30% connections', () => {
    const highlight = computeArchiveHighlight(index);
    expect(highlight).not.toBeNull();
    // 2023-08-14 has max events (4), max sources (3/3), max connections (2)
    expect(highlight?.dateKey).toBe('2023-08-14');
    expect(highlight?.formattedDate).toBe('14 Aug 2023');
    expect(highlight?.eventCount).toBe(4);
    expect(highlight?.sourcesPresent.length).toBe(3);
    expect(highlight?.metricsBreakdown.densityScore).toBe(100);
    expect(highlight?.metricsBreakdown.diversityScore).toBe(100);
    expect(highlight?.metricsBreakdown.connectionScore).toBe(100);
    expect(highlight?.compositeScore).toBe(100);
  });

  it('ensures narrative strings are strictly non-causal and grounded in observable counts', () => {
    const highlight = computeArchiveHighlight(index);
    expect(highlight?.narrative).toContain('14 Aug 2023 contains 4 recorded events');
    expect(highlight?.narrative).toContain('composite density rating');
    expect(highlight?.narrative).not.toMatch(/feel|mood|emotion|personality|caused|because of/i);
  });

  it('generates exactly 5 deterministic story moments', () => {
    const moments = generateStoryMoments(index);
    expect(moments.length).toBe(5);

    // Verify step numbers 1 through 5
    expect(moments.map(m => m.stepNumber)).toEqual([1, 2, 3, 4, 5]);

    // Verify chronological order
    for (let i = 0; i < moments.length - 1; i++) {
      expect(moments[i].dateKey <= moments[i + 1].dateKey).toBe(true);
    }

    // Verify each moment has a representativeEvent, valid narrative, and source breakdown
    for (const moment of moments) {
      expect(moment.representativeEvent).toBeDefined();
      expect(moment.eventCount).toBeGreaterThan(0);
      expect(moment.narrative.length).toBeGreaterThan(10);
      expect(moment.narrative).not.toMatch(/feel|mood|emotion|personality|caused/i);
    }
  });

  it('identifies the peak density moment within story moments', () => {
    const moments = generateStoryMoments(index);
    const peakMoment = moments.find(m => m.isPeakDensity);
    expect(peakMoment).toBeDefined();
    expect(peakMoment?.dateKey).toBe('2023-08-14');
  });
});
