// src/api/client.ts
import { decimal, equalExact } from '../money';
import type { ClaimBody } from './types';
import { decodeActivity, decodeBalances, decodeClaim, decodeOptions } from './validation';

export const API_BASE_URL = 'https://task-api.cashmine.io';
export const networkTiming = { timeoutMs: 12000, balancePollMs: 15000, claimPollMs: 3000, minimumRetryMs: 1000 } as const;
export class ApiError extends Error {
  constructor(message: string, public status = 0, public code = 'NETWORK', public retryAfterMs = 0, public field?: string) {
    super(message);
    this.name = 'ApiError';
  }
}
export const retryDelay = (error: unknown) => error instanceof ApiError ? Math.max(networkTiming.claimPollMs, error.retryAfterMs) : networkTiming.claimPollMs;
export const errorMessage = (error: unknown): string => error instanceof Error ? error.message : 'Something went wrong. Please try again.';

export const createApi = (token: string, transport: typeof fetch = fetch) => {
  let blockedUntil = 0;
  const request = async <Result>(path: string, decode: (value: unknown) => Result, init: RequestInit = {}): Promise<Result> => {
    if (Date.now() < blockedUntil) throw new ApiError('Rate limited. Please wait before retrying.', 429, 'RATE_LIMITED', blockedUntil - Date.now());
    const controller = new AbortController();
    const abort = () => controller.abort();
    init.signal?.addEventListener('abort', abort, { once: true });
    if (init.signal?.aborted) controller.abort();
    const timeout = setTimeout(abort, networkTiming.timeoutMs);
    try {
      const response = await transport(`${API_BASE_URL}${path}`, {
        ...init,
        signal: controller.signal,
        headers: { Accept: 'application/json', Authorization: `Bearer ${token}`, ...(init.body ? { 'Content-Type': 'application/json' } : {}), ...init.headers },
      });
      let body: unknown;
      try { body = await response.json(); } catch { throw new ApiError('The server returned an unreadable response.', response.status, 'INVALID_RESPONSE'); }
      if (!response.ok) {
        const payload = (body as { error?: { code?: string; message?: string; retryAfterMs?: number; field?: string } })?.error;
        const header = response.headers.get('Retry-After');
        const headerMs = header ? (Number.isFinite(Number(header)) ? Number(header) * 1000 : Math.max(0, Date.parse(header) - Date.now())) : 0;
        const retryAfterMs = response.status === 429 ? Math.max(networkTiming.minimumRetryMs, payload?.retryAfterMs ?? 0, Number.isFinite(headerMs) ? headerMs : 0) : 0;
        if (response.status === 429) blockedUntil = Date.now() + retryAfterMs;
        throw new ApiError(response.status === 401 ? 'Your token is invalid or expired. Change your token to reconnect.' : payload?.message ?? `Request failed (${response.status}).`, response.status, payload?.code ?? 'SERVER', retryAfterMs, payload?.field);
      }
      try { return decode(body); } catch { throw new ApiError('The server returned unexpected data. Please refresh.', response.status, 'INVALID_RESPONSE'); }
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(controller.signal.aborted ? 'The request timed out or was interrupted.' : 'Cannot reach the API. Check your connection and retry.');
    } finally {
      clearTimeout(timeout);
      init.signal?.removeEventListener('abort', abort);
    }
  };
  return {
    balances: (signal?: AbortSignal) => request('/v1/balances', decodeBalances, { signal }),
    options: (asset: string, signal?: AbortSignal) => request(`/v1/claim-options?asset=${encodeURIComponent(asset)}`, decodeOptions, { signal }),
    submit: (body: ClaimBody, key: string, signal?: AbortSignal) => request('/v1/claims', (value) => {
      const claim = decodeClaim(value);
      if (claim.asset !== body.asset || claim.destinationId !== body.destinationId || !equalExact(decimal(claim.amount), decimal(body.amount))) throw new Error('Claim response does not match the submitted intent.');
      return claim;
    }, { method: 'POST', headers: { 'Idempotency-Key': key }, body: JSON.stringify(body), signal }),
    claim: (id: string, signal?: AbortSignal) => request(`/v1/claims/${encodeURIComponent(id)}`, decodeClaim, { signal }),
    activity: (cursor?: string, signal?: AbortSignal) => request(`/v1/activity?limit=20${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`, decodeActivity, { signal }),
  };
};
export type ApiClient = ReturnType<typeof createApi>;
