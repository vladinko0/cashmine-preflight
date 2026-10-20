// src/screens/Wallet/index.tsx
import React, { useMemo } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { createApi } from '../../api/client';
import { Action } from '../../components/Action';
import { Notice } from '../../components/Notice';
import { formatUsd, totalUsd } from '../../money';
import { colors } from '../../theme';
import type { Props } from './types';
import { styles } from './styles';
import { useBalances } from './useBalances';
export const WalletScreen: React.FC<Props> = ({ token, disconnect }) => {
  const api = useMemo(() => createApi(token), [token]);
  const balances = useBalances(api);
  return <ScrollView style={styles.page} contentContainerStyle={styles.content}>
    <View style={styles.row}><Text style={styles.brand}>cashmine</Text><Action compact secondary label="Change token" onPress={disconnect} /></View>
    <View><Text style={styles.eyebrow}>PAYBACK WALLET</Text><Text accessibilityRole="header" style={styles.title}>Your balances</Text></View>
    {balances.data && <View style={styles.hero}>
      <Text style={styles.heroLabel}>TOTAL PAYBACK VALUE</Text>
      <Text style={styles.total}>{formatUsd(totalUsd(balances.data.items))}</Text>
      <Text style={styles.heroDetail}>Available {formatUsd(totalUsd(balances.data.items, 'available'))}{'\n'}Pending {formatUsd(totalUsd(balances.data.items, 'pending'))} · In claims {formatUsd(totalUsd(balances.data.items, 'claiming'))}</Text>
    </View>}
    <View style={styles.row}><Text style={[styles.muted, styles.flex]}>{balances.data ? `Snapshot ${balances.ageSeconds}s ago · ${new Date(balances.data.asOf).toLocaleTimeString()}` : 'Loading your balances…'}</Text><Action compact secondary label="Refresh" onPress={balances.refresh} busy={balances.busy} /></View>
    {!!balances.error && <><Notice text={balances.error} error /><Action secondary label="Retry balances" onPress={balances.refresh} busy={balances.busy} /></>}
    {balances.busy && !balances.data && <ActivityIndicator color={colors.accent} />}
    {balances.data?.items.length === 0 && <Notice text="No payback balances yet. Your assets will appear here when you earn payback." />}
    {balances.data?.items.map((balance) => <View key={balance.asset} style={styles.card}>
      <View style={styles.assetHeading}><View style={styles.assetIcon}><Text style={styles.assetLetter}>{balance.asset.slice(0, 1)}</Text></View><Text style={styles.asset}>{balance.asset}</Text></View>
      <View style={styles.split}><Text style={styles.muted}>Available</Text><Text selectable style={styles.amount}>{balance.available}</Text></View>
      <View style={styles.split}><Text style={styles.muted}>Pending payback</Text><Text selectable style={styles.amount}>{balance.pending}</Text></View>
      <View style={styles.split}><Text style={styles.muted}>In claims</Text><Text selectable style={styles.amount}>{balance.claiming}</Text></View>
    </View>)}
    <Text style={styles.small}>Balances are server snapshots refreshed every 15 seconds. Pending payback is not available to claim yet. USD values are estimates.</Text>
  </ScrollView>;
};
