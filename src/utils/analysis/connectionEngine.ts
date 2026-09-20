import { LifeTraceConnection, WindowType } from '../../data/types/connection';
import { LifeTraceEvent } from '../../data/types/event';
import { EventIndex } from '../indexing/eventIndex';

const THIRTY_MIN_MS = 30 * 60 * 1000;
const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

/**
 * Standard non-causal descriptions enforcing temporal correlation without causation.
 */
function getRelationshipReason(windowType: WindowType, timeDiffMs: number, sourceA: string, sourceB: string): string {
  const mins = Math.round(timeDiffMs / (60 * 1000));
  const sameSource = sourceA === sourceB;
  const sourceContext = sameSource 
    ? `within ${sourceA}` 
    : `between ${sourceA} and ${sourceB}`;

  if (windowType === '30_min') {
    return `Occurred within ${mins} minute(s) in the same temporal activity window ${sourceContext}`;
  }
  if (windowType === '2_hours') {
    const hoursStr = (timeDiffMs / (3600 * 1000)).toFixed(1);
    return `Occurred within ~${hoursStr} hour(s) in a shared activity window ${sourceContext}`;
  }
  return `Occurred on the same date (temporal overlap) ${sourceContext}`;
}

/**
 * Find temporal connections for a target event within a specified time window.
 * Utilizes the EventIndex for fast binary search range queries.
 */
export function findConnectionsForEvent(
  targetEvent: LifeTraceEvent,
  index: EventIndex,
  windowType: WindowType,
  crossSourceOnly: boolean = false
): LifeTraceConnection[] {
  const connections: LifeTraceConnection[] = [];

  let candidates: LifeTraceEvent[] = [];

  if (windowType === 'same_day') {
    candidates = index.queryByDate(targetEvent.dateKey);
  } else {
    const windowMs = windowType === '30_min' ? THIRTY_MIN_MS : TWO_HOURS_MS;
    candidates = index.queryTimeRange(
      targetEvent.timestamp - windowMs,
      targetEvent.timestamp + windowMs
    );
  }

  for (const candidate of candidates) {
    // Avoid self-pairing
    if (candidate.id === targetEvent.id) continue;

    // Filter cross-source if requested
    if (crossSourceOnly && candidate.source === targetEvent.source) continue;

    const timeDiffMs = Math.abs(candidate.timestamp - targetEvent.timestamp);

    // Verify window constraints
    if (windowType === '30_min' && timeDiffMs > THIRTY_MIN_MS) continue;
    if (windowType === '2_hours' && timeDiffMs > TWO_HOURS_MS) continue;

    const relationshipReason = getRelationshipReason(
      windowType,
      timeDiffMs,
      targetEvent.source,
      candidate.source
    );

    connections.push({
      id: `conn_${targetEvent.id}_${candidate.id}`,
      eventA: targetEvent,
      eventB: candidate,
      timeDiffMs,
      windowType,
      relationshipReason,
    });
  }

  return connections;
}

/**
 * Fast binary-search calculator for true total cross-source overlaps across the dataset.
 */
export function countTotalCrossSourceConnections(
  index: EventIndex,
  windowType: WindowType
): number {
  let totalOverlaps = 0;
  const financialEvents = [
    ...index.queryBySource('household'),
    ...index.queryBySource('transactions'),
  ];

  const windowMs = windowType === '30_min' ? THIRTY_MIN_MS : TWO_HOURS_MS;

  for (const finEv of financialEvents) {
    if (windowType === 'same_day') {
      const dateMatches = index.queryByDate(finEv.dateKey);
      for (const m of dateMatches) {
        if (m.source === 'spotify') totalOverlaps++;
      }
    } else {
      const rangeMatches = index.queryTimeRange(
        finEv.timestamp - windowMs,
        finEv.timestamp + windowMs
      );
      for (const m of rangeMatches) {
        if (m.source === 'spotify') totalOverlaps++;
      }
    }
  }

  return totalOverlaps;
}

/**
 * Find cross-source temporal connections for sample display.
 */
export function findAllCrossSourceConnections(
  index: EventIndex,
  windowType: WindowType,
  maxLimit: number = 100
): LifeTraceConnection[] {
  const results: LifeTraceConnection[] = [];
  const events = index.events;
  const windowMs = windowType === '30_min' ? THIRTY_MIN_MS : TWO_HOURS_MS;

  for (let i = 0; i < events.length; i++) {
    const evA = events[i];
    // Only search financial events against media to optimize search space
    if (evA.source === 'spotify') continue;

    const rangeEvents = index.queryTimeRange(
      evA.timestamp - (windowType === 'same_day' ? 24 * 3600 * 1000 : windowMs),
      evA.timestamp + (windowType === 'same_day' ? 24 * 3600 * 1000 : windowMs)
    );

    for (const evB of rangeEvents) {
      if (evB.source !== 'spotify') continue;

      let valid = false;
      const timeDiffMs = Math.abs(evA.timestamp - evB.timestamp);

      if (windowType === 'same_day' && evA.dateKey === evB.dateKey) {
        valid = true;
      } else if (windowType === '30_min' && timeDiffMs <= THIRTY_MIN_MS) {
        valid = true;
      } else if (windowType === '2_hours' && timeDiffMs <= TWO_HOURS_MS) {
        valid = true;
      }

      if (valid) {
        results.push({
          id: `conn_${evA.id}_${evB.id}`,
          eventA: evA,
          eventB: evB,
          timeDiffMs,
          windowType,
          relationshipReason: getRelationshipReason(windowType, timeDiffMs, evA.source, evB.source),
        });

        if (results.length >= maxLimit) return results;
      }
    }
  }

  return results;
}
