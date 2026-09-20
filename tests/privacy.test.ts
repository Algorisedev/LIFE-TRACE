import { describe, it, expect } from 'vitest';
import { sanitizeText, sanitizeEventForUI } from '../src/utils/privacy/privacyFilter';
import { LifeTraceEvent } from '../src/data/types/event';

describe('Privacy Filtering & PII Protection', () => {
  it('redacts credit card numbers from text', () => {
    const rawText = 'Paid using card 4532-1234-5678-9010 at store';
    const cleaned = sanitizeText(rawText);
    expect(cleaned).not.toContain('4532-1234-5678-9010');
    expect(cleaned).toContain('[REDACTED_CARD]');
  });

  it('redacts street address patterns', () => {
    const rawText = 'Delivery to 123 Main Street Nagar';
    const cleaned = sanitizeText(rawText);
    expect(cleaned).not.toContain('123 Main Street');
    expect(cleaned).toContain('[REDACTED_ADDRESS]');
  });

  it('masks specific bank account names', () => {
    const rawText = 'Transfer from Saving Bank account 1';
    const cleaned = sanitizeText(rawText);
    expect(cleaned).toBe('Transfer from Savings Account');
  });

  it('sanitizes entire LifeTraceEvent object prior to UI rendering', () => {
    const unsafeEvent: LifeTraceEvent = {
      id: 'tx_123',
      timestamp: Date.now(),
      dateKey: '2023-01-01',
      source: 'transactions',
      category: 'expense',
      title: 'Merchant at 4532123456789010',
      subtitle: 'Category',
      value: 100,
      metadata: {
        note: 'Payment to 99 Baker Road',
        merchant: 'Unsafe Merchant 4532123456789010',
        cc_num: '4532123456789010', // Unexpected PII key injected
      } as any,
    };

    const safeEvent = sanitizeEventForUI(unsafeEvent);
    expect(safeEvent.title).not.toContain('4532123456789010');
    expect(safeEvent.metadata.note).not.toContain('99 Baker Road');
    expect((safeEvent.metadata as any).cc_num).toBeUndefined();
  });
});
