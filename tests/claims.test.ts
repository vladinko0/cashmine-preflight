// tests/claims.test.ts
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ApiError, createApi } from '../src/api/client';
import type { Claim } from '../src/api/types';
import { isAssetBlocked, isOperationBlocking, parseJournal } from '../src/claims/journal';
import type { ClaimOperation } from '../src/claims/types';
const body = { asset: 'ETH', amount: '0.5', destinationId: 'dest_wallet' };
const claim: Claim = { ...body, id: 'claim_test', fee: '0.0012', receiveAmount: '0.4988', status: 'pending', failureReason: null, createdAt: '2026-10-20T14:00:00.000Z', updatedAt: '2026-10-20T14:00:00.000Z' };
const operation: ClaimOperation = { key: 'test-intent', body, phase: 'sending', createdAt: claim.createdAt };
const response = (value: unknown, status = 200, headers: Record<string, string> = {}) => new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json', ...headers } });

test('a reload restores sending as unknown without changing body or idempotency key', () => {
  const [restored] = parseJournal(JSON.stringify([operation]));
  assert.equal(restored.phase, 'unknown');
  assert.equal(restored.key, operation.key);
  assert.deepEqual(restored.body, operation.body);
});
test('corrupted journal is rejected instead of silently allowing a duplicate', () => {
  assert.throws(() => parseJournal('{broken'));
  assert.throws(() => parseJournal(JSON.stringify([{ ...operation, body: { ...body, amount: '.5' } }])));
});
test('unknown and pending claims block only their own asset', () => {
  assert.equal(isAssetBlocked([operation], 'ETH'), true);
  assert.equal(isAssetBlocked([operation], 'BTC'), false);
  assert.equal(isOperationBlocking({ ...operation, phase: 'accepted', claim }), true);
  assert.equal(isOperationBlocking({ ...operation, phase: 'rejected' }), false);
});
test('completed and failed claims remain blocked until a fresh terminal snapshot', () => {
  for (const status of ['completed', 'failed'] as const) {
    const settled: ClaimOperation = { ...operation, phase: 'accepted', claim: { ...claim, status, updatedAt: '2026-10-20T14:00:20.000Z' } };
    assert.equal(isOperationBlocking(settled, '2026-10-20T14:00:15.000Z'), true);
    assert.equal(isOperationBlocking(settled, '2026-10-20T14:00:20.000Z'), false);
    assert.equal(isOperationBlocking(settled, '2026-10-20T14:00:30.000Z'), false);
  }
});
test('lost submission response followed by restored safe retry creates one remote claim', async () => {
  const received: { key: string; body: string }[] = [];
  let remoteCreations = 0;
  const remote = new Map<string, string>();
  const transport: typeof fetch = async (_url, init) => {
    const key = new Headers(init?.headers).get('Idempotency-Key')!;
    const serialized = init?.body as string;
    received.push({ key, body: serialized });
    if (remote.has(key)) {
      if (remote.get(key) !== serialized) return response({ error: { code: 'IDEMPOTENCY_MISMATCH', message: 'Body changed' } }, 409);
      return response(claim, 200, { 'Idempotent-Replayed': 'true' });
    }
    remote.set(key, serialized);
    remoteCreations += 1;
    throw new TypeError('Response lost after remote acceptance');
  };
  const api = createApi('test-only-placeholder', transport);
  await assert.rejects(api.submit(operation.body, operation.key), /Cannot reach/);
  const [restored] = parseJournal(JSON.stringify([operation]));
  assert.equal((await api.submit(restored.body, restored.key)).id, claim.id);
  assert.equal(remoteCreations, 1);
  assert.deepEqual(received[0], received[1]);
});
test('HTTP 409 remains a typed conflict, not an automatically retried new intent', async () => {
  let calls = 0;
  const api = createApi('test-only-placeholder', async () => { calls += 1; return response({ error: { code: 'IDEMPOTENCY_MISMATCH', message: 'Body changed' } }, 409); });
  await assert.rejects(api.submit(body, operation.key), (error: unknown) => error instanceof ApiError && error.status === 409 && error.code === 'IDEMPOTENCY_MISMATCH');
  assert.equal(calls, 1);
});
test('429 applies a shared per-token cooldown across endpoints', async () => {
  let calls = 0;
  const api = createApi('test-only-placeholder', async () => { calls += 1; return response({ error: { code: 'RATE_LIMITED', message: 'Wait', retryAfterMs: 2000 } }, 429, { 'Retry-After': '3' }); });
  await assert.rejects(api.submit(body, operation.key), (error: unknown) => error instanceof ApiError && error.retryAfterMs >= 3000);
  await assert.rejects(api.balances(), (error: unknown) => error instanceof ApiError && error.status === 429);
  assert.equal(calls, 1);
});
test('amounts encoded as JSON numbers are not accepted as valid balances', async () => {
  const api = createApi('test-only-placeholder', async () => response({ asOf: claim.createdAt, items: [{ asset: 'ETH', decimals: 18, available: 0.5, pending: '0', claiming: '0', usdPrice: '1' }] }));
  await assert.rejects(api.balances(), (error: unknown) => error instanceof ApiError && error.code === 'INVALID_RESPONSE');
});

test('a financially inconsistent claim response is rejected', async () => {
  const api = createApi('test-only-placeholder', async () => response({ ...claim, receiveAmount: '0.4999' }));
  await assert.rejects(api.claim(claim.id), (error: unknown) => error instanceof ApiError && error.code === 'INVALID_RESPONSE');
});
