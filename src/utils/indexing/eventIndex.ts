import { EventCategory, LifeTraceEvent, SourceType } from '../../data/types/event';

export class EventIndex {
  public readonly events: ReadonlyArray<LifeTraceEvent>;
  private readonly timestamps: Float64Array;
  
  // Hash Map Indices
  private readonly dateMap: Map<string, number[]> = new Map(); // YYYY-MM-DD -> indices
  private readonly monthMap: Map<string, number[]> = new Map(); // YYYY-MM -> indices
  private readonly dayOfWeekMap: Map<number, number[]> = new Map(); // 0-6 -> indices
  private readonly sourceMap: Map<SourceType, number[]> = new Map(); // source -> indices
  private readonly categoryMap: Map<EventCategory, number[]> = new Map(); // category -> indices

  constructor(rawEvents: LifeTraceEvent[]) {
    // 1. Sort events chronologically by timestamp ascending
    const sorted = [...rawEvents].sort((a, b) => a.timestamp - b.timestamp);
    this.events = sorted;

    // 2. Build Typed Array for O(log N) binary search
    const n = sorted.length;
    this.timestamps = new Float64Array(n);

    // 3. Populate Hash Map Indices
    for (let i = 0; i < n; i++) {
      const ev = sorted[i];
      this.timestamps[i] = ev.timestamp;

      // Date Key (YYYY-MM-DD)
      const dk = ev.dateKey;
      if (!this.dateMap.has(dk)) this.dateMap.set(dk, []);
      this.dateMap.get(dk)!.push(i);

      // Month Key (YYYY-MM)
      const mk = dk.substring(0, 7);
      if (!this.monthMap.has(mk)) this.monthMap.set(mk, []);
      this.monthMap.get(mk)!.push(i);

      // Day of Week (0 = Sun, 6 = Sat)
      const dt = new Date(ev.timestamp);
      const dow = dt.getUTCDay();
      if (!this.dayOfWeekMap.has(dow)) this.dayOfWeekMap.set(dow, []);
      this.dayOfWeekMap.get(dow)!.push(i);

      // Source Map
      if (!this.sourceMap.has(ev.source)) this.sourceMap.set(ev.source, []);
      this.sourceMap.get(ev.source)!.push(i);

      // Category Map
      if (!this.categoryMap.has(ev.category)) this.categoryMap.set(ev.category, []);
      this.categoryMap.get(ev.category)!.push(i);
    }
  }

  public get size(): number {
    return this.events.length;
  }

  /**
   * O(log N) binary search to find the start index (lower bound) for a given timestamp.
   */
  private findLowerBound(targetTimestamp: number): number {
    let low = 0;
    let high = this.timestamps.length;
    while (low < high) {
      const mid = (low + high) >>> 1;
      if (this.timestamps[mid] < targetTimestamp) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }
    return low;
  }

  /**
   * O(log N) binary search to find the end index (upper bound) for a given timestamp.
   */
  private findUpperBound(targetTimestamp: number): number {
    let low = 0;
    let high = this.timestamps.length;
    while (low < high) {
      const mid = (low + high) >>> 1;
      if (this.timestamps[mid] <= targetTimestamp) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }
    return low;
  }

  /**
   * Returns all events within [startTimestamp, endTimestamp] using O(log N) binary search slice.
   */
  public queryTimeRange(startTimestamp: number, endTimestamp: number): LifeTraceEvent[] {
    if (startTimestamp > endTimestamp || this.events.length === 0) return [];
    const startIndex = this.findLowerBound(startTimestamp);
    const endIndex = this.findUpperBound(endTimestamp);
    return this.events.slice(startIndex, endIndex) as LifeTraceEvent[];
  }

  /**
   * Query events for a specific date (YYYY-MM-DD).
   */
  public queryByDate(dateKey: string): LifeTraceEvent[] {
    const indices = this.dateMap.get(dateKey) || [];
    return indices.map(idx => this.events[idx]);
  }

  /**
   * Query events for a specific month (YYYY-MM).
   */
  public queryByMonth(monthKey: string): LifeTraceEvent[] {
    const indices = this.monthMap.get(monthKey) || [];
    return indices.map(idx => this.events[idx]);
  }

  /**
   * Query events by source ('spotify' | 'household' | 'transactions').
   */
  public queryBySource(source: SourceType): LifeTraceEvent[] {
    const indices = this.sourceMap.get(source) || [];
    return indices.map(idx => this.events[idx]);
  }

  /**
   * Query events by category ('media' | 'expense' | 'income').
   */
  public queryByCategory(category: EventCategory): LifeTraceEvent[] {
    const indices = this.categoryMap.get(category) || [];
    return indices.map(idx => this.events[idx]);
  }

  /**
   * Get all distinct available month keys (e.g. ['2013-07', '2013-08', ...]).
   */
  public getAvailableMonths(): string[] {
    return Array.from(this.monthMap.keys()).sort();
  }
}
