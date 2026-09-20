/**
 * Deterministic timestamp parser for LIFE//TRACE datasets.
 * 
 * Supported date formats across datasets:
 * 1. Spotify: "YYYY-MM-DD HH:mm:ss" (e.g. "2013-07-08 02:44:34")
 * 2. Household: "DD/MM/YYYY HH:mm:ss", "DD/MM/YYYY HH:mm", "DD/MM/YYYY" (e.g. "20/09/2018 12:04:08", "19/09/2018")
 * 3. Multi-Facet: "M/D/YYYY H:mm" or "MM/DD/YYYY HH:mm" (e.g. "12/26/2023 0:55", "7/7/2023 7:02")
 */

export interface ParsedDateResult {
  timestamp: number;
  dateKey: string; // YYYY-MM-DD
}

export function parseSpotifyTimestamp(tsStr: string): ParsedDateResult | null {
  if (!tsStr) return null;
  const str = tsStr.trim();
  // YYYY-MM-DD HH:mm:ss
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})(?:\s+(\d{2}):(\d{2}):(\d{2}))?$/);
  if (match) {
    const [, y, m, d, hh = '00', mm = '00', ss = '00'] = match;
    const year = parseInt(y, 10);
    const month = parseInt(m, 10) - 1;
    const day = parseInt(d, 10);
    const hour = parseInt(hh, 10);
    const min = parseInt(mm, 10);
    const sec = parseInt(ss, 10);
    const dt = new Date(Date.UTC(year, month, day, hour, min, sec));
    const timestamp = dt.getTime();
    const dateKey = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    return { timestamp, dateKey };
  }
  
  // Fallback
  const parsed = Date.parse(str.replace(' ', 'T') + 'Z');
  if (!isNaN(parsed)) {
    const dt = new Date(parsed);
    const dateKey = dt.toISOString().split('T')[0];
    return { timestamp: parsed, dateKey };
  }
  return null;
}

export function parseHouseholdTimestamp(dateStr: string): ParsedDateResult | null {
  if (!dateStr) return null;
  const str = dateStr.trim();
  // DD/MM/YYYY HH:mm:ss or DD/MM/YYYY HH:mm or DD/MM/YYYY
  const parts = str.split(' ');
  const datePart = parts[0];
  const timePart = parts[1] || '00:00:00';

  const dateTokens = datePart.split('/');
  if (dateTokens.length === 3) {
    const day = parseInt(dateTokens[0], 10);
    const month = parseInt(dateTokens[1], 10);
    const year = parseInt(dateTokens[2], 10);

    const timeTokens = timePart.split(':');
    const hour = parseInt(timeTokens[0] || '0', 10);
    const min = parseInt(timeTokens[1] || '0', 10);
    const sec = parseInt(timeTokens[2] || '0', 10);

    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
      const dt = new Date(Date.UTC(year, month - 1, day, hour, min, sec));
      const timestamp = dt.getTime();
      const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      return { timestamp, dateKey };
    }
  }

  return null;
}

export function parseMultiFacetTimestamp(tsStr: string): ParsedDateResult | null {
  if (!tsStr) return null;
  const str = tsStr.trim();
  // M/D/YYYY H:mm or MM/DD/YYYY HH:mm (US format: Month/Day/Year)
  const parts = str.split(' ');
  const datePart = parts[0];
  const timePart = parts[1] || '00:00';

  const dateTokens = datePart.split('/');
  if (dateTokens.length === 3) {
    const month = parseInt(dateTokens[0], 10);
    const day = parseInt(dateTokens[1], 10);
    const year = parseInt(dateTokens[2], 10);

    const timeTokens = timePart.split(':');
    const hour = parseInt(timeTokens[0] || '0', 10);
    const min = parseInt(timeTokens[1] || '0', 10);
    const sec = parseInt(timeTokens[2] || '0', 10);

    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
      const dt = new Date(Date.UTC(year, month - 1, day, hour, min, sec));
      const timestamp = dt.getTime();
      const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      return { timestamp, dateKey };
    }
  }

  return null;
}
