// tests/activity.test.ts
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mergeActivity } from '../src/screens/Activity/utils';
import type { ActivityItem } from '../src/api/types';
const item: ActivityItem = {
  id: 'one',
  type: 'accrual',
  asset: 'USDT',
  amount: '1',
  status: 'confirmed',
  exchange: 'Example',
  relatedId: null,
  createdAt: '2026-10-20T14:00:00Z',
};
test('overlapping pages preserve order and do not duplicate records', () => {
  const result = mergeActivity(
    [item],
    [item, { ...item, id: 'two', type: 'reversal', amount: '-1' }, { ...item, id: 'two' }],
  );
  assert.deepEqual(
    result.map((entry) => entry.id),
    ['one', 'two'],
  );
  assert.equal(result[1].amount, '-1');
});
