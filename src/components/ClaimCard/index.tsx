// src/components/ClaimCard/index.tsx
import React from 'react';
import { Text, View } from 'react-native';
import { Action } from '../Action';
import { Notice } from '../Notice';
import { isOperationBlocking } from '../../claims/journal';
import type { Props } from './types';
import { styles } from './styles';
export const ClaimCard: React.FC<Props> = ({ operation, snapshotAsOf, now, retry }) => {
  const claim = operation.claim;
  const waitingSnapshot =
    claim && claim.status !== 'pending' && isOperationBlocking(operation, snapshotAsOf);
  const waitSeconds = Math.max(0, Math.ceil(((operation.retryAt ?? 0) - now) / 1000));
  return (
    <View style={styles.card}>
      <Text style={styles.heading}>
        {operation.body.amount} {operation.body.asset} claim
      </Text>
      <Text accessibilityLiveRegion="polite" style={styles.status}>
        {claim
          ? claim.status === 'completed'
            ? 'Completed'
            : claim.status === 'failed'
              ? 'Failed'
              : 'Claim in progress'
          : operation.phase === 'sending'
            ? 'Submitting…'
            : operation.phase === 'rejected'
              ? 'Not submitted'
              : 'Outcome not yet known'}
      </Text>
      {claim && (
        <>
          <Text style={styles.body}>
            {claim.status === 'failed'
              ? `Returned to available: ${claim.amount} ${claim.asset}`
              : `Fee: ${claim.fee} ${claim.asset}\n${claim.status === 'completed' ? 'Received' : 'To receive'}: ${claim.receiveAmount} ${claim.asset}`}
          </Text>
          <Text selectable style={styles.id}>
            Reference: {claim.id}
          </Text>
        </>
      )}
      {claim?.status === 'pending' && (
        <Text style={styles.body}>
          We are checking the server automatically. Another claim for this asset is paused until
          this one is resolved.
        </Text>
      )}
      {claim?.status === 'failed' && (
        <Notice
          error
          text={claim.failureReason ?? 'The claim failed. No transfer was completed.'}
        />
      )}
      {waitingSnapshot && (
        <Text style={styles.body}>
          Waiting for a server snapshot after this result. The balance shown above may still be old.
        </Text>
      )}
      {!!operation.error && <Notice error text={operation.error} />}
      {!claim && operation.phase === 'unknown' && (
        <>
          <Text style={styles.body}>
            The server may have accepted this claim. Do not start another one. Retry safely reuses
            the original request and cannot create a second claim.
          </Text>
          <Action
            secondary
            label={
              operation.errorCode === 'IDEMPOTENCY_MISMATCH'
                ? 'Request conflict — needs review'
                : waitSeconds
                  ? `Retry in ${waitSeconds}s`
                  : 'Resolve with safe retry'
            }
            disabled={waitSeconds > 0 || operation.errorCode === 'IDEMPOTENCY_MISMATCH'}
            onPress={() => retry(operation.key)}
          />
        </>
      )}
    </View>
  );
};
