// src/screens/Wallet/useBalances.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError, errorMessage, networkTiming } from '../../api/client';
import type { ApiClient } from '../../api/client';
import type { Balances } from '../../api/types';

export const useBalances = (api: ApiClient) => {
  const [data, setData] = useState<Balances | null>(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const [now, setNow] = useState(() => Date.now());
  const active = useRef(true);
  const inFlight = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const nextRequestAt = useRef(0);
  const unauthorized = useRef(false);
  const refresh = useCallback(async () => {
    if (inFlight.current || Date.now() < nextRequestAt.current || unauthorized.current) return;
    inFlight.current = true;
    const controller = new AbortController();
    abortRef.current = controller;
    setBusy(true);
    try {
      const result = await api.balances(controller.signal);
      if (!active.current) return;
      setData((previous) => !previous || Date.parse(result.asOf) >= Date.parse(previous.asOf) ? result : previous);
      setError('');
    } catch (failure) {
      if (!active.current) return;
      if (failure instanceof ApiError) {
        nextRequestAt.current = Date.now() + failure.retryAfterMs;
        unauthorized.current = failure.status === 401;
      }
      setError(errorMessage(failure));
    } finally {
      inFlight.current = false;
      if (active.current) setBusy(false);
    }
  }, [api]);
  useEffect(() => {
    active.current = true;
    const initial = setTimeout(refresh, 0);
    const poll = setInterval(refresh, networkTiming.balancePollMs);
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => { active.current = false; abortRef.current?.abort(); clearTimeout(initial); clearInterval(poll); clearInterval(tick); };
  }, [refresh]);
  return { data, busy, error, refresh, ageSeconds: data ? Math.max(0, Math.floor((now - Date.parse(data.asOf)) / 1000)) : 0 };
};
