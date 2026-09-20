import { LifeTraceEvent } from '../types/event';
import { parseSpotifyTimestamp } from './dateParser';

export interface RawSpotifyRow {
  spotify_track_uri?: string;
  '\ufeffspotify_track_uri'?: string;
  ts?: string;
  platform?: string;
  ms_played?: string | number;
  track_name?: string;
  artist_name?: string;
  album_name?: string;
  reason_start?: string;
  reason_end?: string;
  shuffle?: string | boolean;
  skipped?: string | boolean;
}

export function normalizeSpotifyRow(row: RawSpotifyRow, index: number): LifeTraceEvent | null {
  const tsRaw = row.ts || '';
  const parsedDate = parseSpotifyTimestamp(tsRaw);
  if (!parsedDate) return null;

  const msPlayed = typeof row.ms_played === 'number' 
    ? row.ms_played 
    : parseInt(row.ms_played || '0', 10);

  const trackUri = row.spotify_track_uri || row['\ufeffspotify_track_uri'] || '';
  const trackName = (row.track_name || 'Unknown Track').trim();
  const artistName = (row.artist_name || 'Unknown Artist').trim();
  const albumName = (row.album_name || '').trim();

  const isSkipped = typeof row.skipped === 'boolean' 
    ? row.skipped 
    : String(row.skipped).toLowerCase() === 'true';

  const isShuffle = typeof row.shuffle === 'boolean' 
    ? row.shuffle 
    : String(row.shuffle).toLowerCase() === 'true';

  return {
    id: `spot_${index}_${parsedDate.timestamp}`,
    timestamp: parsedDate.timestamp,
    dateKey: parsedDate.dateKey,
    source: 'spotify',
    category: 'media',
    title: trackName,
    subtitle: artistName,
    value: isNaN(msPlayed) ? 0 : msPlayed,
    metadata: {
      platform: row.platform || '',
      reasonStart: row.reason_start || '',
      reasonEnd: row.reason_end || '',
      skipped: isSkipped,
      shuffle: isShuffle,
      albumName,
      trackUri,
    },
  };
}
