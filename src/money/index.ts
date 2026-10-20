// src/money/index.ts
import type { Balance, ClaimOptions } from '../api/types';

const MAX_DIGITS = 80;
const MAX_SCALE = 36;
const DECIMAL_PATTERN = /^(0|[1-9]\d*)(?:\.(\d+))?$/;
export interface ExactDecimal { units: bigint; scale: number }

export const decimal = (value: string): ExactDecimal => {
  if (value.length > MAX_DIGITS || !DECIMAL_PATTERN.test(value)) {
    throw new Error('Use digits and a decimal point, without leading zeros.');
  }
  const [whole, fraction = ''] = value.split('.');
  if (fraction.length > MAX_SCALE) throw new Error('Too many decimal places.');
  return { units: BigInt(whole + fraction), scale: fraction.length };
};
const power = (scale: number) => 10n ** BigInt(scale);
export const parseUnits = (value: string, decimals: number): bigint => {
  if (!Number.isInteger(decimals) || decimals < 0 || decimals > MAX_SCALE) throw new Error('Unsupported asset precision.');
  const parsed = decimal(value);
  if (parsed.scale > decimals) throw new Error(`Use at most ${decimals} decimal places.`);
  return parsed.units * power(decimals - parsed.scale);
};
export const formatUnits = (units: bigint, decimals: number): string => {
  const sign = units < 0n ? '-' : '';
  const absolute = units < 0n ? -units : units;
  const digits = absolute.toString().padStart(decimals + 1, '0');
  const fraction = decimals ? digits.slice(-decimals).replace(/0+$/, '') : '';
  return `${sign}${decimals ? digits.slice(0, -decimals) : digits}${fraction ? `.${fraction}` : ''}`;
};
export const addExact = (left: ExactDecimal, right: ExactDecimal): ExactDecimal => {
  const scale = Math.max(left.scale, right.scale);
  return { units: left.units * power(scale - left.scale) + right.units * power(scale - right.scale), scale };
};
export const equalExact = (left: ExactDecimal, right: ExactDecimal): boolean => {
  const scale = Math.max(left.scale, right.scale);
  return left.units * power(scale - left.scale) === right.units * power(scale - right.scale);
};
export const multiplyExact = (left: ExactDecimal, right: ExactDecimal): ExactDecimal => ({ units: left.units * right.units, scale: left.scale + right.scale });
export const totalUsd = (items: Balance[], bucket?: 'available' | 'pending' | 'claiming'): ExactDecimal => items.reduce((total, item) => {
  const assetUnits = bucket
    ? parseUnits(item[bucket], item.decimals)
    : parseUnits(item.available, item.decimals) + parseUnits(item.pending, item.decimals) + parseUnits(item.claiming, item.decimals);
  return addExact(total, multiplyExact({ units: assetUnits, scale: item.decimals }, decimal(item.usdPrice)));
}, { units: 0n, scale: 0 });
export const formatUsd = (value: ExactDecimal): string => {
  const cents = value.scale > 2
    ? (value.units + power(value.scale - 2) / 2n) / power(value.scale - 2)
    : value.units * power(2 - value.scale);
  const digits = cents.toString().padStart(3, '0');
  return `$${digits.slice(0, -2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.${digits.slice(-2)}`;
};
export const validateAmount = (amount: string, balance: Balance, options: ClaimOptions): string | null => {
  try {
    const units = parseUnits(amount, balance.decimals);
    if (units === 0n) return 'Enter an amount greater than zero.';
    if (units < parseUnits(options.minAmount, balance.decimals)) return `Minimum claim is ${options.minAmount} ${balance.asset}.`;
    if (units > parseUnits(balance.available, balance.decimals)) return 'Amount exceeds the latest available balance.';
    if (units <= parseUnits(options.fee, balance.decimals)) return 'The amount must be greater than the fee.';
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : 'Enter a valid amount.';
  }
};
export const receiveAmount = (amount: string, fee: string, decimals: number): string => formatUnits(parseUnits(amount, decimals) - parseUnits(fee, decimals), decimals);
