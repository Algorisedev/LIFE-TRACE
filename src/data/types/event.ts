export type SourceType = 'spotify' | 'household' | 'transactions';
export type EventCategory = 'media' | 'expense' | 'income';

export interface EventMetadata {
  // Spotify metadata
  platform?: string;
  reasonStart?: string;
  reasonEnd?: string;
  skipped?: boolean;
  shuffle?: boolean;
  albumName?: string;
  trackUri?: string;

  // Household metadata
  mode?: string;
  note?: string;
  currency?: string;

  // Transactions metadata
  transCategory?: string;
  merchant?: string;
  isFraud?: boolean;
  city?: string;
  state?: string;
  lat?: number;
  long?: number;
  merchLat?: number;
  merchLong?: number;
  gender?: string;
  job?: string;
  cityPop?: number;
}

export interface LifeTraceEvent {
  id: string;
  timestamp: number;        // Epoch timestamp in milliseconds (UTC)
  dateKey: string;          // YYYY-MM-DD format
  source: SourceType;
  category: EventCategory;
  title: string;            // Main display title (track_name / Household Category / Merchant)
  subtitle: string;         // Sub-label (artist_name / Household Subcategory / Trans Category)
  value: number;            // ms_played for Spotify, monetary amount for financial
  metadata: EventMetadata;
}
