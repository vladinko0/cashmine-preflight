// src/screens/Claim/types.ts
import type { ApiClient } from '../../api/client';
import type { Balance, ClaimBody } from '../../api/types';
export interface Props { balance: Balance; api: ApiClient; blocked: boolean; onClose: () => void; onSubmit: (body: ClaimBody) => Promise<string | null> }
