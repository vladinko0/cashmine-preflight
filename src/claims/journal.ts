// src/claims/journal.ts
import { decodeClaim } from '../api/validation';
import { decimal } from '../money';
import type { ClaimOperation } from './types';
export const journalKey = (scope: string) => `cashmine.claims.v1.${scope}`;
export const parseJournal = (raw: string | null): ClaimOperation[] => {
  if (!raw) return [];
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) throw new Error('Invalid claim journal.');
  return parsed.map((value) => {
    if (!value || typeof value.key !== 'string' || !value.key || value.key.length > 100 || typeof value.body?.asset !== 'string' || typeof value.body?.destinationId !== 'string' || typeof value.body?.amount !== 'string' || !['sending', 'unknown', 'accepted', 'rejected'].includes(value.phase) || !Number.isFinite(Date.parse(value.createdAt))) throw new Error('Invalid saved claim.');
    decimal(value.body.amount);
    const claim = value.claim ? decodeClaim(value.claim) : undefined;
    return { key: value.key, body: { ...value.body }, phase: value.phase === 'sending' ? 'unknown' : value.phase, createdAt: value.createdAt, claim, error: typeof value.error === 'string' ? value.error : undefined, errorCode: typeof value.errorCode === 'string' ? value.errorCode : undefined, retryAt: typeof value.retryAt === 'number' && Number.isFinite(value.retryAt) ? value.retryAt : undefined };
  });
};
export const loadJournal = (scope: string): { operations: ClaimOperation[]; error: string } => {
  try { return { operations: parseJournal(window.sessionStorage.getItem(journalKey(scope))), error: '' }; }
  catch { return { operations: [], error: 'Saved claim state is unavailable or unreadable. New claims are blocked to avoid duplicates. Keep this tab open and do not clear its storage.' }; }
};
export const saveJournal = (scope: string, operations: ClaimOperation[]) => window.sessionStorage.setItem(journalKey(scope), JSON.stringify(operations));
export const isOperationBlocking = (operation: ClaimOperation, snapshotAsOf?: string): boolean => {
  if (operation.phase === 'rejected') return false;
  if (!operation.claim || operation.claim.status === 'pending') return true;
  return !snapshotAsOf || Date.parse(snapshotAsOf) < Date.parse(operation.claim.updatedAt);
};
export const isAssetBlocked = (operations: ClaimOperation[], asset: string, snapshotAsOf?: string): boolean => operations.some((operation) => operation.body.asset === asset && isOperationBlocking(operation, snapshotAsOf));
