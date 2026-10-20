// src/screens/Activity/types.ts
import type { ApiClient } from '../../api/client';
export interface Props {
  api: ApiClient;
  now: number;
}
