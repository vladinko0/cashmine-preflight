// src/claims/useClaimOperations.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError, errorMessage, networkTiming, retryDelay } from '../api/client';
import type { ApiClient } from '../api/client';
import type { ClaimBody } from '../api/types';
import { isAssetBlocked, loadJournal, saveJournal } from './journal';
import type { ClaimOperation } from './types';

export const useClaimOperations = (api: ApiClient, scope: string, snapshotAsOf?: string) => {
  const [initial] = useState(() => loadJournal(scope));
  const [operations, setOperations] = useState(initial.operations);
  const [storageError, setStorageError] = useState(initial.error);
  const operationsRef = useRef(initial.operations);
  const storageFailed = useRef(!!initial.error);
  const active = useRef(true);
  const inFlight = useRef(new Set<string>());
  const controllers = useRef(new Set<AbortController>());
  const persist = useCallback(
    (next: ClaimOperation[], beforeSend = false) => {
      try {
        saveJournal(scope, next);
      } catch {
        storageFailed.current = true;
        if (active.current)
          setStorageError(
            'Could not save claim state. New claims are blocked. Keep this tab open; the current claim may still exist on the server.',
          );
        if (beforeSend)
          throw new Error('Cannot safely save this claim before sending. Nothing was submitted.');
      }
      operationsRef.current = next;
      if (active.current) setOperations(next);
    },
    [scope],
  );
  const update = useCallback(
    (key: string, changes: Partial<ClaimOperation>) => {
      // Preserve the saved sending intent for recovery; a disconnected instance must not overwrite a newer session.
      if (!active.current) return;
      persist(
        operationsRef.current.map((operation) =>
          operation.key === key ? { ...operation, ...changes } : operation,
        ),
      );
    },
    [persist],
  );
  const send = useCallback(
    async (operation: ClaimOperation) => {
      if (
        inFlight.current.has(operation.key) ||
        Date.now() < (operation.retryAt ?? 0) ||
        operation.errorCode === 'IDEMPOTENCY_MISMATCH'
      )
        return;
      inFlight.current.add(operation.key);
      const controller = new AbortController();
      controllers.current.add(controller);
      try {
        update(operation.key, { phase: 'sending', error: undefined, errorCode: undefined });
        const claim = await api.submit(operation.body, operation.key, controller.signal);
        if (
          claim.asset !== operation.body.asset ||
          claim.destinationId !== operation.body.destinationId
        )
          throw new ApiError(
            'Claim response does not match this request. Keep the same request identity.',
            0,
            'INVALID_RESPONSE',
          );
        update(operation.key, {
          phase: 'accepted',
          claim,
          error: undefined,
          errorCode: undefined,
          retryAt: undefined,
        });
      } catch (failure) {
        const knownRejection = failure instanceof ApiError && [400, 401].includes(failure.status);
        update(operation.key, {
          phase: knownRejection ? 'rejected' : 'unknown',
          error:
            failure instanceof ApiError && failure.field
              ? `${failure.field}: ${failure.message}`
              : errorMessage(failure),
          errorCode: failure instanceof ApiError ? failure.code : 'NETWORK',
          retryAt: Date.now() + (failure instanceof ApiError ? failure.retryAfterMs : 0),
        });
      } finally {
        inFlight.current.delete(operation.key);
        controllers.current.delete(controller);
      }
    },
    [api, update],
  );
  const create = useCallback(
    async (body: ClaimBody): Promise<string | null> => {
      if (storageFailed.current)
        return 'Browser storage is unavailable. A claim cannot be submitted safely.';
      if (isAssetBlocked(operationsRef.current, body.asset, snapshotAsOf))
        return 'A claim for this asset is still being resolved. Wait for its status and a fresh balance.';
      try {
        const operation: ClaimOperation = {
          key: window.crypto.randomUUID(),
          body: { ...body },
          phase: 'sending',
          createdAt: new Date().toISOString(),
        };
        persist([...operationsRef.current, operation], true);
        await send(operation);
        const result = operationsRef.current.find((item) => item.key === operation.key);
        return result?.phase === 'rejected'
          ? (result.error ?? 'The server rejected this claim.')
          : null;
      } catch (failure) {
        return errorMessage(failure);
      }
    },
    [persist, send, snapshotAsOf],
  );
  const retry = useCallback(
    async (key: string) => {
      const operation = operationsRef.current.find((item) => item.key === key);
      if (operation && !operation.claim && operation.phase !== 'rejected') await send(operation);
    },
    [send],
  );
  const pendingSignature = operations
    .filter((operation) => operation.claim?.status === 'pending')
    .map((operation) => operation.key)
    .join('|');
  useEffect(() => {
    active.current = true;
    const pendingControllers = controllers.current;
    return () => {
      active.current = false;
      for (const controller of pendingControllers) controller.abort();
    };
  }, []);
  useEffect(() => {
    if (!pendingSignature) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    const controller = new AbortController();
    const poll = async () => {
      let delay: number = networkTiming.claimPollMs;
      for (const operation of operationsRef.current.filter(
        (item) => item.claim?.status === 'pending',
      )) {
        if (stopped) return;
        try {
          const claim = await api.claim(operation.claim!.id, controller.signal);
          if (!stopped) update(operation.key, { claim, error: undefined, errorCode: undefined });
        } catch (failure) {
          if (stopped) return;
          update(operation.key, {
            error:
              failure instanceof ApiError && failure.field
                ? `${failure.field}: ${failure.message}`
                : errorMessage(failure),
            errorCode: failure instanceof ApiError ? failure.code : 'NETWORK',
          });
          if (failure instanceof ApiError && failure.status === 401) return;
          delay = Math.max(delay, retryDelay(failure));
          if (failure instanceof ApiError && failure.status === 429) break;
        }
      }
      if (!stopped) timer = setTimeout(poll, delay);
    };
    timer = setTimeout(poll, networkTiming.claimPollMs);
    return () => {
      stopped = true;
      clearTimeout(timer);
      controller.abort();
    };
  }, [api, pendingSignature, update]);
  return { operations, storageError, create, retry };
};
