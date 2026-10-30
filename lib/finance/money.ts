import type { Currency, MoneyMinor } from './types';

const MAX_MINOR = BigInt(1_000_000_000_000);
const FX_SCALE = BigInt(100_000_000);

/** Enforce decimal integer serialization; no JS Number conversion. */
export function minorBigInt(value: MoneyMinor): bigint {
  if (!/^-?(0|[1-9]\d*)$/.test(value)) throw new Error('Invalid minor-unit integer');
  const parsed = BigInt(value);
  if (parsed < -MAX_MINOR || parsed > MAX_MINOR) throw new Error('Money exceeds supported per-operation range');
  return parsed;
}

/** Parse a human-entered TWD/INR amount (exactly zero to two decimals). */
export function parseMoney(text: string, allowNegative = false): MoneyMinor {
  const clean = text.trim();
  const match = /^(-?)(0|[1-9]\d*)(?:\.(\d{1,2}))?$/.exec(clean);
  if (!match) throw new Error('Enter an amount with at most two decimal places');
  if (match[1] === '-' && !allowNegative) throw new Error('Negative amount not permitted');
  const amount = BigInt(match[2]) * BigInt(100) + BigInt((match[3] ?? '').padEnd(2,'0'));
  const signed = match[1] === '-' ? -amount : amount;
  return minorBigInt(signed.toString()).toString();
}

export function formatMoney(minor: MoneyMinor, currency: Currency): string {
  const units = minorBigInt(minor);
  const prefix = units < BigInt(0) ? '-' : '';
  const absolute = units < BigInt(0) ? -units : units;
  const intPart = absolute / BigInt(100);
  const decimal = (absolute % BigInt(100)).toString().padStart(2,'0');
  return prefix + (currency === 'TWD' ? 'NT$' : '₹') +
    intPart.toLocaleString('en-US') + '.' + decimal;
}

/** Persisted manual rate: one INR equals N TWD; 1-8 fractional digits. */
export function parseManualTwdPerInr(text: string): string {
  const m = /^(0|[1-9]\d*)(?:\.(\d{1,8}))?$/.exec(text.trim());
  if (!m) throw new Error('Manual FX rate must have at most eight decimal places');
  const scaled = BigInt(m[1]) * FX_SCALE + BigInt((m[2] ?? '').padEnd(8,'0'));
  if (scaled < BigInt(1) || scaled > BigInt(10_000) * FX_SCALE) throw new Error('Manual FX rate outside supported range');
  return scaled.toString();
}

/** INR paise -> TWD cents. Positive amounts round half-up to the nearest cent. */
export function convertInrMinorToTwd(inrMinor: MoneyMinor, manualRate: string): MoneyMinor {
  const amount = minorBigInt(inrMinor);
  if (amount < BigInt(0)) throw new Error('Budget cannot be negative');
  const scaledRate = BigInt(parseManualTwdPerInr(manualRate));
  const converted = (amount * scaledRate + FX_SCALE / BigInt(2)) / FX_SCALE;
  return minorBigInt(converted.toString()).toString();
}
