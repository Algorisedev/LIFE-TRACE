import { LifeTraceEvent } from '../types/event';
import { parseMultiFacetTimestamp } from './dateParser';
import { sanitizeText } from '../../utils/privacy/privacyFilter';

export interface RawMultiFacetRow {
  trans_id?: string | number;
  trans_date_trans_time?: string;
  cc_num?: string | number;
  merchant?: string;
  category?: string;
  amt?: string | number;
  first?: string;
  last?: string;
  gender?: string;
  street?: string;
  city?: string;
  state?: string;
  lat?: string | number;
  long?: string | number;
  city_pop?: string | number;
  job?: string;
  dob?: string;
  merch_lat?: string | number;
  merch_long?: string | number;
  is_fraud?: string | number;
  customer_id?: string | number;
}

export function normalizeTransactionsRow(row: RawMultiFacetRow, index: number): LifeTraceEvent | null {
  const tsRaw = row.trans_date_trans_time || '';
  const parsedDate = parseMultiFacetTimestamp(tsRaw);
  if (!parsedDate) return null;

  const rawMerchant = (row.merchant || '').trim();
  const rawCategory = (row.category || 'General').trim();
  
  // Clean merchant name if it has prefixes like 'fraud_'
  const cleanedMerchant = rawMerchant.replace(/^fraud_/, '');
  const title = cleanedMerchant ? sanitizeText(cleanedMerchant) : sanitizeText(rawCategory);
  const subtitle = sanitizeText(rawCategory);

  const amt = typeof row.amt === 'number' 
    ? row.amt 
    : parseFloat(row.amt || '0');

  const isFraudVal = row.is_fraud !== undefined && row.is_fraud !== null && String(row.is_fraud) === '1.0';

  const lat = row.lat ? parseFloat(String(row.lat)) : undefined;
  const long = row.long ? parseFloat(String(row.long)) : undefined;
  const merchLat = row.merch_lat ? parseFloat(String(row.merch_lat)) : undefined;
  const merchLong = row.merch_long ? parseFloat(String(row.merch_long)) : undefined;
  const cityPop = row.city_pop ? parseFloat(String(row.city_pop)) : undefined;

  // STRICT PRIVACY ENFORCEMENT:
  // We explicitly DO NOT ingest or store: cc_num, first, last, street, dob, customer_id.
  return {
    id: `tx_${index}_${parsedDate.timestamp}`,
    timestamp: parsedDate.timestamp,
    dateKey: parsedDate.dateKey,
    source: 'transactions',
    category: 'expense',
    title,
    subtitle,
    value: isNaN(amt) ? 0 : amt,
    metadata: {
      merchant: cleanedMerchant,
      transCategory: rawCategory,
      isFraud: isFraudVal,
      city: row.city ? sanitizeText(row.city) : undefined,
      state: row.state ? sanitizeText(row.state) : undefined,
      lat,
      long,
      merchLat,
      merchLong,
      gender: row.gender ? sanitizeText(row.gender) : undefined,
      job: row.job ? sanitizeText(row.job) : undefined,
      cityPop,
    },
  };
}
