import { describe, it, expect } from 'vitest';
import { findConnectionsForEvent } from '../src/utils/analysis/connectionEngine';
import { EventIndex } from '../src/utils/indexing/eventIndex';
import { LifeTraceEvent } from '../src/data/types/event';

const t0 = 1680000000000; // Epoch timestamp

const sampleEvents: LifeTraceEvent[] = [
  {
    id: 'spot_1',
    timestamp: t0,
    dateKey: '2023-03-28',
    source: 'spotify',
    category: 'media',
    title: 'Ambient Music',
    subtitle: 'Artist 1',
    value: 200000,
    metadata: {},
  },
  {
    id: 'tx_1',
    timestamp: t0 + 15 * 60 * 1000, // 15 mins later
    dateKey: '2023-03-28',
    source: 'transactions',
    category: 'expense',
    title: 'Coffee Shop',
    subtitle: 'food',
    value: 250,
    metadata: {},
  },
  {
    id: 'hh_1',
    timestamp: t0 + 90 * 60 * 1000, // 90 mins later (1.5 hours)
    dateKey: '2023-03-28',
    source: 'household',
    category: 'expense',
    title: 'Groceries',
    subtitle: 'supermarket',
    value: 1200,
    metadata: {},
  },
  {
    id: 'tx_2',
    timestamp: t0 + 5 * 3600 * 1000, // 5 hours later, same day
    dateKey: '2023-03-28',
    source: 'transactions',
    category: 'expense',
    title: 'Bookstore',
    subtitle: 'shopping',
    value: 450,
    metadata: {},
  },
];

describe('Connection Engine & Temporal Overlap Analysis', () => {
  const index = new EventIndex(sampleEvents);
  const targetEvent = sampleEvents[0]; // spot_1 at t0

  it('detects events within 30 minutes window', () => {
    const conns = findConnectionsForEvent(targetEvent, index, '30_min');
    expect(conns.length).toBe(1);
    expect(conns[0].eventB.id).toBe('tx_1');
    expect(conns[0].timeDiffMs).toBe(15 * 60 * 1000);
  });

  it('detects events within 2 hours window', () => {
    const conns = findConnectionsForEvent(targetEvent, index, '2_hours');
    expect(conns.length).toBe(2);
    expect(conns.map(c => c.eventB.id)).toEqual(['tx_1', 'hh_1']);
  });

  it('detects all events on the same day', () => {
    const conns = findConnectionsForEvent(targetEvent, index, 'same_day');
    expect(conns.length).toBe(3);
    expect(conns.map(c => c.eventB.id)).toEqual(['tx_1', 'hh_1', 'tx_2']);
  });

  it('strictly enforces non-causal language in relationship descriptions', () => {
    const conns = findConnectionsForEvent(targetEvent, index, '30_min');
    expect(conns.length).toBeGreaterThan(0);
    
    for (const conn of conns) {
      const reason = conn.relationshipReason.toLowerCase();
      
      // Prohibited causal / psychological terms
      expect(reason).not.toContain('caused');
      expect(reason).not.toContain('proves');
      expect(reason).not.toContain('felt');
      expect(reason).not.toContain('became');

      // Mandatory temporal correlation terms
      expect(reason).toContain('occurred within');
    }
  });
});
