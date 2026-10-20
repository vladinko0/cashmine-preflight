// src/screens/Activity/useActivity.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError, errorMessage } from '../../api/client';
import type { ApiClient } from '../../api/client';
import type { ActivityItem } from '../../api/types';
import { mergeActivity } from './utils';

export const useActivity = (api: ApiClient) => {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const [retryAt, setRetryAt] = useState(0);
  const cursorRef = useRef<string | null>(null);
  const busyRef = useRef(false);
  const active = useRef(true);
  const abortRef = useRef<AbortController | null>(null);
  const lastMode = useRef<'refresh' | 'more'>('refresh');
  const nextRequestAt = useRef(0);
  const load = useCallback(
    async (mode: 'refresh' | 'more') => {
      if (busyRef.current || Date.now() < nextRequestAt.current) return;
      if (mode === 'more' && !cursorRef.current) return;
      busyRef.current = true;
      lastMode.current = mode;
      setBusy(true);
      const controller = new AbortController();
      abortRef.current = controller;
      const cursor = mode === 'more' ? cursorRef.current! : undefined;
      try {
        const page = await api.activity(cursor, controller.signal);
        if (!active.current) return;
        if (cursor && page.nextCursor === cursor)
          throw new Error(
            'The server repeated a page cursor. Refresh the history to continue safely.',
          );
        setItems((previous) =>
          mode === 'refresh' ? mergeActivity([], page.items) : mergeActivity(previous, page.items),
        );
        cursorRef.current = page.nextCursor;
        setNextCursor(page.nextCursor);
        setLoaded(true);
        setError('');
        setRetryAt(0);
      } catch (failure) {
        if (!active.current) return;
        const retryTime = Date.now() + (failure instanceof ApiError ? failure.retryAfterMs : 0);
        nextRequestAt.current = retryTime;
        setRetryAt(retryTime);
        setError(errorMessage(failure));
      } finally {
        busyRef.current = false;
        if (active.current) setBusy(false);
      }
    },
    [api],
  );
  useEffect(() => {
    active.current = true;
    const initial = setTimeout(() => load('refresh'), 0);
    return () => {
      active.current = false;
      clearTimeout(initial);
      abortRef.current?.abort();
    };
  }, [load]);
  return {
    items,
    nextCursor,
    loaded,
    busy,
    error,
    retryAt,
    refresh: () => load('refresh'),
    more: () => load('more'),
    retry: () => load(lastMode.current),
  };
};
