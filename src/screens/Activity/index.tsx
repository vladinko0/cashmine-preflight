// src/screens/Activity/index.tsx
import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Action } from '../../components/Action';
import { Notice } from '../../components/Notice';
import { colors } from '../../theme';
import type { Props } from './types';
import { styles } from './styles';
import { useActivity } from './useActivity';
import { activityLabels } from './utils';
export const ActivityScreen: React.FC<Props> = ({ api, now }) => {
  const activity = useActivity(api);
  const waitSeconds = Math.max(0, Math.ceil((activity.retryAt - now) / 1000));
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text accessibilityRole="header" style={styles.heading}>
          Activity
        </Text>
        <Action
          compact
          secondary
          label="Refresh history"
          onPress={activity.refresh}
          busy={activity.busy}
          disabled={waitSeconds > 0}
        />
      </View>
      <Text style={styles.muted}>Payback, reversals and claims. Newest first.</Text>
      {!!activity.error && (
        <>
          <Notice error text={activity.error} />
          <Action
            secondary
            label={waitSeconds ? `Retry in ${waitSeconds}s` : 'Retry history'}
            onPress={activity.retry}
            disabled={waitSeconds > 0}
            busy={activity.busy}
          />
        </>
      )}
      {activity.busy && !activity.loaded && <ActivityIndicator color={colors.accent} />}
      {activity.loaded && activity.items.length === 0 && (
        <Notice text="No activity yet. Your payback history will appear here." />
      )}
      {activity.items.map((item) => (
        <View key={item.id} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>{activityLabels[item.type]}</Text>
            <Text style={styles.badge}>{item.status}</Text>
          </View>
          <Text selectable style={[styles.amount, item.amount.startsWith('-') && styles.negative]}>
            {item.amount.startsWith('-') || item.amount === '0' ? '' : '+'}
            {item.amount} {item.asset}
          </Text>
          <Text style={styles.muted}>
            {new Date(item.createdAt).toLocaleString()}
            {item.exchange ? ` · ${item.exchange}` : ''}
          </Text>
          {item.relatedId && (
            <Text selectable style={styles.reference}>
              Related: {item.relatedId}
            </Text>
          )}
        </View>
      ))}
      {activity.nextCursor && (
        <Action
          secondary
          label="Load more activity"
          onPress={activity.more}
          busy={activity.busy}
          disabled={waitSeconds > 0}
        />
      )}
      {activity.loaded && !activity.nextCursor && activity.items.length > 0 && (
        <Text style={styles.muted}>You’re all caught up.</Text>
      )}
    </View>
  );
};
