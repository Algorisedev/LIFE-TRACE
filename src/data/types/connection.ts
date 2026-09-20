import { LifeTraceEvent } from './event';

export type WindowType = 'same_day' | '30_min' | '2_hours';

export interface LifeTraceConnection {
  id: string;
  eventA: LifeTraceEvent;
  eventB: LifeTraceEvent;
  timeDiffMs: number;
  windowType: WindowType;
  /**
   * Relationship explanation strictly using non-causal temporal language
   * E.g. "Occurred within 30 minutes in the same temporal window"
   */
  relationshipReason: string;
}
