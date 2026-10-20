// src/components/ClaimCard/types.ts
import type { ClaimOperation } from '../../claims/types';
export interface Props {
  operation: ClaimOperation;
  snapshotAsOf?: string;
  now: number;
  retry: (key: string) => Promise<void>;
}
