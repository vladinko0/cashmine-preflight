// tests/money.test.ts
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { decimal, formatUnits, formatUsd, parseUnits, receiveAmount, totalUsd, validateAmount } from '../src/money';
import type { Balance, ClaimOptions } from '../src/api/types';
const balance: Balance = { asset: 'ETH', decimals: 18, available: '1.000000000000000001', pending: '0', claiming: '0', usdPrice: '2500.123456' };
const options: ClaimOptions = { asset: 'ETH', minAmount: '0.01', fee: '0.0012', destinations: [{ id: 'dest_wallet', label: 'Test wallet' }] };

test('parses exact 18-decimal amounts beyond Number precision', () => {
  assert.equal(parseUnits('1.000000000000000001', 18), 1000000000000000001n);
  assert.equal(formatUnits(1000000000000000001n, 18), '1.000000000000000001');
});
test('accepts zero, integers and a canonical decimal', () => {
  assert.equal(parseUnits('0', 0), 0n);
  assert.equal(parseUnits('12', 6), 12000000n);
  assert.equal(parseUnits('0.5', 6), 500000n);
});
test('rejects noncanonical input instead of silently normalizing money', () => {
  for (const invalid of ['', '.5', '1.', '05', '01.2', '1e-3', '-1', '+1', ' 1', '1 ', '0,5', 'NaN', 'Infinity']) assert.throws(() => parseUnits(invalid, 18));
});
test('rejects excess precision even for trailing zero input', () => {
  assert.throws(() => parseUnits('0.0000001', 6));
  assert.throws(() => parseUnits('1.0000000', 6));
});
test('validates minimum, available and zero boundaries exactly', () => {
  assert.equal(validateAmount('0.01', balance, options), null);
  assert.equal(validateAmount(balance.available, balance, options), null);
  assert.match(validateAmount('0.009999999999999999', balance, options)!, /Minimum/);
  assert.match(validateAmount('1.000000000000000002', balance, options)!, /exceeds/);
  assert.match(validateAmount('0', balance, options)!, /greater than zero/);
});
test('Max uses full available, and the fee is deducted from that amount', () => {
  assert.equal(receiveAmount(balance.available, options.fee, balance.decimals), '0.998800000000000001');
  assert.equal(receiveAmount('0.5', '0.0012', 18), '0.4988');
});
test('rejects a claim whose net amount is non-positive', () => {
  assert.match(validateAmount('0.01', balance, { ...options, fee: '0.01' })!, /greater than the fee/);
});
test('calculates USD total including available, pending and claiming', () => {
  const items: Balance[] = [{ asset: 'USDT', decimals: 6, available: '10', pending: '2', claiming: '3', usdPrice: '1.0002' }];
  assert.equal(formatUsd(totalUsd(items)), '$15.00');
  assert.equal(formatUsd(totalUsd(items, 'available')), '$10.00');
  assert.equal(formatUsd(totalUsd(items, 'pending')), '$2.00');
});
test('sums before rounding and handles different price scales', () => {
  const items: Balance[] = [
    { asset: 'A', decimals: 6, available: '0.004', pending: '0', claiming: '0', usdPrice: '1' },
    { asset: 'B', decimals: 18, available: '0.004', pending: '0', claiming: '0', usdPrice: '1.0000' },
  ];
  assert.equal(formatUsd(totalUsd(items)), '$0.01');
});
test('USD half-up display handles a cent boundary and large exact integers', () => {
  assert.equal(formatUsd(decimal('1.004999999999999999')), '$1.00');
  assert.equal(formatUsd(decimal('1.005')), '$1.01');
  assert.equal(formatUsd(decimal('9007199254740993.99')), '$9,007,199,254,740,993.99');
  assert.equal(formatUsd(totalUsd([])), '$0.00');
});
