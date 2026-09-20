import { LifeTraceEvent } from '../../data/types/event';

/**
 * Privacy & PII Protection Filter for LIFE//TRACE.
 * 
 * Rules:
 * 1. Never expose raw credit card numbers (cc_num).
 * 2. Never expose first or last names.
 * 3. Never expose street addresses.
 * 4. Never expose exact date of birth (dob).
 * 5. Never expose raw customer IDs.
 * 6. Mask bank account numbers/labels in free text notes if present.
 */

// Regex to detect 12 to 19 digit credit card numbers
const CC_REGEX = /\b(?:\d[ -]*?){12,19}\b/g;

// Regex to detect street numbers and address keywords
const STREET_REGEX = /\b\d{1,5}\s+[A-Za-z0-9\s,.-]+(?:Street|St|Road|Rd|Avenue|Ave|Nagar|Marg|Lane|Ln|Drive|Dr|Bldg)\b/gi;

/**
 * Redacts any sensitive pattern in free-text fields (notes, titles, subtitles).
 */
export function sanitizeText(text: string): string {
  if (!text) return '';
  
  let cleaned = text;
  
  // 1. Redact credit card patterns
  cleaned = cleaned.replace(CC_REGEX, '[REDACTED_CARD]');
  
  // 2. Redact street address patterns
  cleaned = cleaned.replace(STREET_REGEX, '[REDACTED_ADDRESS]');
  
  // 3. Mask bank account identifiers like "Saving Bank account 1" -> "Saving Bank Account"
  cleaned = cleaned.replace(/Saving Bank account \d+/gi, 'Savings Account');

  return cleaned.trim();
}

/**
 * Sanitize an entire LifeTraceEvent object before UI rendering or state storage.
 * Ensures zero PII/financial leakage even if upstream raw data contained unexpected values.
 */
export function sanitizeEventForUI(event: LifeTraceEvent): LifeTraceEvent {
  const sanitizedTitle = sanitizeText(event.title);
  const sanitizedSubtitle = sanitizeText(event.subtitle);
  
  const sanitizedMetadata = { ...event.metadata };

  if (sanitizedMetadata.note) {
    sanitizedMetadata.note = sanitizeText(sanitizedMetadata.note);
  }
  if (sanitizedMetadata.mode) {
    sanitizedMetadata.mode = sanitizeText(sanitizedMetadata.mode);
  }
  if (sanitizedMetadata.merchant) {
    sanitizedMetadata.merchant = sanitizeText(sanitizedMetadata.merchant);
  }

  // Double check no PII keys exist in metadata
  const sensitiveKeys = ['cc_num', 'first', 'last', 'street', 'dob', 'customer_id', 'ccNum', 'customerId'];
  for (const key of sensitiveKeys) {
    if (key in sanitizedMetadata) {
      delete (sanitizedMetadata as Record<string, unknown>)[key];
    }
  }

  return {
    ...event,
    title: sanitizedTitle,
    subtitle: sanitizedSubtitle,
    metadata: sanitizedMetadata,
  };
}

/**
 * Checks if a record or string contains any sensitive PII violation.
 */
export function hasSensitiveData(text: string): boolean {
  if (!text) return false;
  return CC_REGEX.test(text) || STREET_REGEX.test(text);
}
