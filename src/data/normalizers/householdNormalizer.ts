import { LifeTraceEvent } from '../types/event';
import { parseHouseholdTimestamp } from './dateParser';
import { sanitizeText } from '../../utils/privacy/privacyFilter';

export interface RawHouseholdRow {
  Date?: string;
  Mode?: string;
  Category?: string;
  Subcategory?: string;
  Note?: string;
  Amount?: string | number;
  'Income/Expense'?: string;
  Currency?: string;
}

export function normalizeHouseholdRow(row: RawHouseholdRow, index: number): LifeTraceEvent | null {
  const dateRaw = row.Date || '';
  const parsedDate = parseHouseholdTimestamp(dateRaw);
  if (!parsedDate) return null;

  const rawCategory = (row.Category || 'Other').trim();
  const subcategory = (row.Subcategory || '').trim();
  const rawNote = (row.Note || '').trim();
  const incomeOrExpense = (row['Income/Expense'] || 'Expense').trim();
  
  const isIncome = incomeOrExpense.toLowerCase() === 'income';
  const categoryType = isIncome ? 'income' : 'expense';

  const amount = typeof row.Amount === 'number' 
    ? row.Amount 
    : parseFloat(row.Amount || '0');

  // Subtitle prioritization: Subcategory first, fallback to sanitized note
  const sanitizedNote = sanitizeText(rawNote);
  const subtitle = subcategory ? sanitizeText(subcategory) : sanitizedNote;

  // Mode sanitization (mask Bank account 1 / 2 into safe identifiers)
  const rawMode = row.Mode || 'Cash';
  const sanitizedMode = sanitizeText(rawMode);

  return {
    id: `hh_${index}_${parsedDate.timestamp}`,
    timestamp: parsedDate.timestamp,
    dateKey: parsedDate.dateKey,
    source: 'household',
    category: categoryType,
    title: sanitizeText(rawCategory),
    subtitle,
    value: isNaN(amount) ? 0 : amount,
    metadata: {
      mode: sanitizedMode,
      note: sanitizedNote,
      currency: row.Currency || 'INR',
    },
  };
}
