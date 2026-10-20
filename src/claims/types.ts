// src/claims/types.ts
import type { Claim, ClaimBody } from '../api/types';
export const operationPhase = { sending: 'sending', unknown: 'unknown', accepted: 'accepted', rejected: 'rejected' } as const;
export type OperationPhase = typeof operationPhase[keyof typeof operationPhase];
export interface ClaimOperation {
  key: string;
  body: ClaimBody;
  phase: OperationPhase;
  createdAt: string;
  claim?: Claim;
  error?: string;
  errorCode?: string;
  retryAt?: number;
}
