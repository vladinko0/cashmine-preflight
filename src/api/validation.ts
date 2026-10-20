// src/api/validation.ts
import type { ActivityPage, Balances, Claim, ClaimOptions } from './types';
import { addExact, equalExact, parseUnits, decimal } from '../money';

const record = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Invalid API response.');
  return value as Record<string, unknown>;
};
const string = (value: unknown): string => {
  if (typeof value !== 'string') throw new Error('Invalid API text value.');
  return value;
};
const date = (value: unknown): string => {
  const result = string(value);
  if (!Number.isFinite(Date.parse(result))) throw new Error('Invalid API timestamp.');
  return result;
};
const array = (value: unknown): unknown[] => {
  if (!Array.isArray(value)) throw new Error('Invalid API list.');
  return value;
};
export const decodeBalances = (value: unknown): Balances => {
  const response = record(value);
  const items = array(response.items).map((entry) => {
    const item = record(entry);
    const decimals = item.decimals;
    if (
      typeof decimals !== 'number' ||
      !Number.isInteger(decimals) ||
      decimals < 0 ||
      decimals > 36
    )
      throw new Error('Invalid asset precision.');
    const balance = {
      asset: string(item.asset),
      decimals,
      available: string(item.available),
      pending: string(item.pending),
      claiming: string(item.claiming),
      usdPrice: string(item.usdPrice),
    };
    parseUnits(balance.available, decimals);
    parseUnits(balance.pending, decimals);
    parseUnits(balance.claiming, decimals);
    decimal(balance.usdPrice);
    return balance;
  });
  if (new Set(items.map((item) => item.asset)).size !== items.length)
    throw new Error('Duplicate asset in response.');
  return { asOf: date(response.asOf), items };
};
export const decodeOptions = (value: unknown): ClaimOptions => {
  const response = record(value);
  const minAmount = string(response.minAmount);
  const fee = string(response.fee);
  decimal(minAmount);
  decimal(fee);
  return {
    asset: string(response.asset),
    minAmount,
    fee,
    destinations: array(response.destinations).map((entry) => {
      const destination = record(entry);
      return { id: string(destination.id), label: string(destination.label) };
    }),
  };
};
export const decodeClaim = (value: unknown): Claim => {
  const response = record(value);
  if (!['pending', 'completed', 'failed'].includes(string(response.status)))
    throw new Error('Invalid claim status.');
  const amount = string(response.amount);
  const fee = string(response.fee);
  const receiveAmount = string(response.receiveAmount);
  if (!equalExact(addExact(decimal(fee), decimal(receiveAmount)), decimal(amount)))
    throw new Error('Claim fee and net amount do not match the gross amount.');
  return {
    id: string(response.id),
    asset: string(response.asset),
    amount,
    fee,
    receiveAmount,
    destinationId: string(response.destinationId),
    status: response.status as Claim['status'],
    failureReason: response.failureReason === null ? null : string(response.failureReason),
    createdAt: date(response.createdAt),
    updatedAt: date(response.updatedAt),
  };
};
export const decodeActivity = (value: unknown): ActivityPage => {
  const response = record(value);
  const items = array(response.items).map((entry) => {
    const item = record(entry);
    if (
      !['accrual', 'reversal', 'claim'].includes(string(item.type)) ||
      !['pending', 'confirmed', 'completed', 'failed'].includes(string(item.status))
    )
      throw new Error('Invalid activity type or status.');
    const amount = string(item.amount);
    decimal(amount.startsWith('-') ? amount.slice(1) : amount);
    return {
      id: string(item.id),
      type: item.type as ActivityPage['items'][number]['type'],
      asset: string(item.asset),
      amount,
      status: item.status as ActivityPage['items'][number]['status'],
      exchange: item.exchange === null ? null : string(item.exchange),
      relatedId: item.relatedId === null ? null : string(item.relatedId),
      createdAt: date(item.createdAt),
    };
  });
  return { items, nextCursor: response.nextCursor === null ? null : string(response.nextCursor) };
};
