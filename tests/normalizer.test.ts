import { describe, it, expect } from 'vitest';
import { parseSpotifyTimestamp, parseHouseholdTimestamp, parseMultiFacetTimestamp } from '../src/data/normalizers/dateParser';
import { normalizeSpotifyRow } from '../src/data/normalizers/spotifyNormalizer';
import { normalizeHouseholdRow } from '../src/data/normalizers/householdNormalizer';
import { normalizeTransactionsRow } from '../src/data/normalizers/transactionsNormalizer';

describe('Timestamp Normalization', () => {
  it('parses Spotify UTC timestamp correctly', () => {
    const res = parseSpotifyTimestamp('2013-07-08 02:44:34');
    expect(res).not.toBeNull();
    expect(res?.dateKey).toBe('2013-07-08');
    expect(res?.timestamp).toBe(Date.UTC(2013, 6, 8, 2, 44, 34));
  });

  it('parses Household DD/MM/YYYY timestamp correctly', () => {
    const res = parseHouseholdTimestamp('20/09/2018 12:04:08');
    expect(res).not.toBeNull();
    expect(res?.dateKey).toBe('2018-09-20');
    expect(res?.timestamp).toBe(Date.UTC(2018, 8, 20, 12, 4, 8));
  });

  it('parses Multi-Facet M/D/YYYY H:mm timestamp correctly', () => {
    const res = parseMultiFacetTimestamp('12/26/2023 0:55');
    expect(res).not.toBeNull();
    expect(res?.dateKey).toBe('2023-12-26');
    expect(res?.timestamp).toBe(Date.UTC(2023, 11, 26, 0, 55, 0));
  });
});

describe('Event Normalization', () => {
  it('normalizes Spotify row properly', () => {
    const ev = normalizeSpotifyRow({
      ts: '2023-05-10 14:30:00',
      track_name: 'Test Song',
      artist_name: 'Test Artist',
      ms_played: '180000',
      skipped: 'true',
    }, 1);

    expect(ev).not.toBeNull();
    expect(ev?.source).toBe('spotify');
    expect(ev?.category).toBe('media');
    expect(ev?.title).toBe('Test Song');
    expect(ev?.subtitle).toBe('Test Artist');
    expect(ev?.value).toBe(180000);
    expect(ev?.metadata.skipped).toBe(true);
  });

  it('normalizes Household transaction row properly', () => {
    const ev = normalizeHouseholdRow({
      Date: '15/06/2017 10:15:00',
      Category: 'Transportation',
      Subcategory: 'Train',
      Amount: '150',
      'Income/Expense': 'Expense',
    }, 2);

    expect(ev).not.toBeNull();
    expect(ev?.source).toBe('household');
    expect(ev?.category).toBe('expense');
    expect(ev?.title).toBe('Transportation');
    expect(ev?.value).toBe(150);
  });

  it('normalizes Multi-Facet transaction row and strips PII', () => {
    const ev = normalizeTransactionsRow({
      trans_date_trans_time: '7/7/2023 7:02',
      merchant: 'fraud_Bedi-Krish Pvt Ltd',
      category: 'entertainment',
      amt: '9139.49',
      cc_num: '4126110000000000',
      first: 'Bhavin',
      last: 'Roy',
      street: '123 Test St',
      dob: '10/20/1994',
    }, 3);

    expect(ev).not.toBeNull();
    expect(ev?.source).toBe('transactions');
    expect(ev?.title).toBe('Bedi-Krish Pvt Ltd');
    expect(ev?.subtitle).toBe('entertainment');
    expect(ev?.value).toBe(9139.49);
    
    // Explicitly verify PII keys do not exist in metadata
    const meta = ev?.metadata as any;
    expect(meta.cc_num).toBeUndefined();
    expect(meta.first).toBeUndefined();
    expect(meta.last).toBeUndefined();
    expect(meta.street).toBeUndefined();
    expect(meta.dob).toBeUndefined();
  });
});
