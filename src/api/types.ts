// src/api/types.ts
export interface Balance {
  asset: string;
  decimals: number;
  available: string;
  pending: string;
  claiming: string;
  usdPrice: string;
}
export interface Balances { asOf: string; items: Balance[] }
export interface ClaimOptions {
  asset: string;
  minAmount: string;
  fee: string;
  destinations: { id: string; label: string }[];
}
export interface ClaimBody { asset: string; amount: string; destinationId: string }
export const claimStatus = { pending: 'pending', completed: 'completed', failed: 'failed' } as const;
export type ClaimStatus = typeof claimStatus[keyof typeof claimStatus];
export interface Claim extends ClaimBody {
  id: string;
  fee: string;
  receiveAmount: string;
  status: ClaimStatus;
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;
}
export interface ActivityItem {
  id: string;
  type: 'accrual' | 'reversal' | 'claim';
  asset: string;
  amount: string;
  status: 'pending' | 'confirmed' | 'completed' | 'failed';
  exchange: string | null;
  relatedId: string | null;
  createdAt: string;
}
export interface ActivityPage { items: ActivityItem[]; nextCursor: string | null }
