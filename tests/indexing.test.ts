import { describe, it, expect } from 'vitest';
import { EventIndex } from '../src/utils/indexing/eventIndex';
import { LifeTraceEvent } from '../src/data/types/event';

const mockEvents: LifeTraceEvent[] = [
  {
    id: '1',
    timestamp: 1000,
    dateKey: '2023-01-01',
    source: 'spotify',
    category: 'media',
    title: 'Song A',
    subtitle: 'Artist A',
    value: 100,
    metadata: {},
  },
  {
    id: '2',
    timestamp: 2000,
    dateKey: '2023-01-01',
    source: 'household',
    category: 'expense',
    title: 'Food',
    subtitle: 'Snacks',
    value: 50,
    metadata: {},
  },
  {
    id: '3',
    timestamp: 5000,
    dateKey: '2023-01-02',
    source: 'transactions',
    category: 'expense',
    title: 'Store',
    subtitle: 'Shopping',
    value: 500,
    metadata: {},
  },
];

describe('EventIndex & Binary Search Range Querying', () => {
  const index = new EventIndex(mockEvents);

  it('sorts events chronologically on initialization', () => {
    expect(index.events[0].id).toBe('1');
    expect(index.events[1].id).toBe('2');
    expect(index.events[2].id).toBe('3');
  });

  it('performs O(log N) binary search range queries accurately', () => {
    const range1 = index.queryTimeRange(1000, 2000);
    expect(range1.length).toBe(2);
    expect(range1.map(e => e.id)).toEqual(['1', '2']);

    const range2 = index.queryTimeRange(2500, 6000);
    expect(range2.length).toBe(1);
    expect(range2[0].id).toBe('3');
  });

  it('queries by date map index accurately', () => {
    const Jan1Events = index.queryByDate('2023-01-01');
    expect(Jan1Events.length).toBe(2);

    const Jan2Events = index.queryByDate('2023-01-02');
    expect(Jan2Events.length).toBe(1);
  });

  it('queries by source accurately', () => {
    const spotify = index.queryBySource('spotify');
    expect(spotify.length).toBe(1);
    expect(spotify[0].title).toBe('Song A');
  });
});
