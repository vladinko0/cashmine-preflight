// src/screens/Wallet/index.tsx
import React from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { Action } from '../../components/Action';
import { Notice } from '../../components/Notice';
import { ClaimCard } from '../../components/ClaimCard';
import { ActivityScreen } from '../Activity';
import { ClaimScreen } from '../Claim';
import { formatUsd, parseUnits, totalUsd } from '../../money';
import { colors } from '../../theme';
import type { Props } from './types';
import { styles } from './styles';
import { useWallet } from './useWallet';
import { useResetScroll } from './useResetScroll';
export const WalletScreen: React.FC<Props> = (props) => {
  const wallet = useWallet(props);
  const scrollRef = useResetScroll(wallet.navigationKey);
  const { balances, claims } = wallet;
  return (
    <ScrollView
      ref={scrollRef}
      style={styles.page}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.row}>
        <Text style={styles.brand}>cashmine</Text>
        <Action compact secondary label="Change token" onPress={props.disconnect} />
      </View>
      {!wallet.selectedBalance && (
        <View style={styles.row}>
          <View style={styles.flex}>
            <Action
              label="Balances"
              secondary={wallet.activitySelected}
              onPress={() => wallet.selectTab('balances')}
            />
          </View>
          <View style={styles.flex}>
            <Action
              label="Activity"
              secondary={!wallet.activitySelected}
              onPress={() => wallet.selectTab('activity')}
            />
          </View>
        </View>
      )}
      {wallet.selectedBalance ? (
        <ClaimScreen
          key={wallet.selectedBalance.asset}
          balance={wallet.selectedBalance}
          api={wallet.api}
          blocked={wallet.assetBlocked(wallet.selectedBalance.asset)}
          onClose={wallet.closeClaim}
          onSubmit={claims.create}
        />
      ) : wallet.activitySelected ? (
        <ActivityScreen api={wallet.api} now={balances.now} />
      ) : (
        <>
          <View>
            <Text style={styles.eyebrow}>PAYBACK WALLET</Text>
            <Text accessibilityRole="header" style={styles.title}>
              Your balances
            </Text>
          </View>
          {balances.data && (
            <View style={styles.hero}>
              <Text style={styles.heroLabel}>TOTAL PAYBACK VALUE</Text>
              <Text style={styles.total}>{formatUsd(totalUsd(balances.data.items))}</Text>
              <Text style={styles.heroDetail}>
                Available {formatUsd(totalUsd(balances.data.items, 'available'))}
                {'\n'}Pending {formatUsd(totalUsd(balances.data.items, 'pending'))} · In claims{' '}
                {formatUsd(totalUsd(balances.data.items, 'claiming'))}
              </Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={[styles.muted, styles.flex]}>
              {balances.data
                ? `Snapshot ${balances.ageSeconds}s ago · ${new Date(balances.data.asOf).toLocaleTimeString()}`
                : 'Loading your balances…'}
            </Text>
            <Action
              compact
              secondary
              label="Refresh"
              onPress={balances.refresh}
              busy={balances.busy}
            />
          </View>
          {!!balances.error && (
            <>
              <Notice text={balances.error} error />
              <Action
                secondary
                label="Retry balances"
                onPress={balances.refresh}
                busy={balances.busy}
              />
            </>
          )}
          {balances.busy && !balances.data && <ActivityIndicator color={colors.accent} />}
          {!!claims.storageError && <Notice error text={claims.storageError} />}
          {wallet.claimSelected && !balances.busy && (
            <>
              <Notice text="The selected asset is not available in this balance snapshot." />
              <Action secondary label="Back to balances" onPress={wallet.closeClaim} />
            </>
          )}
          {claims.operations.length > 0 && (
            <View style={styles.section}>
              <Text accessibilityRole="header" style={styles.asset}>
                Your claims
              </Text>
              <Notice text="Balances below are server snapshots, not live spendable amounts. While a claim is resolving, another claim of that asset is paused so you cannot accidentally submit it twice." />
              {[...claims.operations].reverse().map((operation) => (
                <ClaimCard
                  key={operation.key}
                  operation={operation}
                  snapshotAsOf={balances.data?.asOf}
                  now={balances.now}
                  retry={claims.retry}
                />
              ))}
            </View>
          )}
          {balances.data?.items.length === 0 && (
            <Notice text="No payback balances yet. Your assets will appear here when you earn payback." />
          )}
          {balances.data?.items.map((balance) => (
            <View key={balance.asset} style={styles.card}>
              <View style={styles.assetHeading}>
                <View style={styles.assetIcon}>
                  <Text style={styles.assetLetter}>{balance.asset.slice(0, 1)}</Text>
                </View>
                <Text style={styles.asset}>{balance.asset}</Text>
              </View>
              <View style={styles.split}>
                <Text style={styles.muted}>Available (snapshot)</Text>
                <Text selectable style={styles.amount}>
                  {balance.available}
                </Text>
              </View>
              <View style={styles.split}>
                <Text style={styles.muted}>Pending payback</Text>
                <Text selectable style={styles.amount}>
                  {balance.pending}
                </Text>
              </View>
              <View style={styles.split}>
                <Text style={styles.muted}>In claims</Text>
                <Text selectable style={styles.amount}>
                  {balance.claiming}
                </Text>
              </View>
              <Action
                label={
                  wallet.assetBlocked(balance.asset)
                    ? `${balance.asset} claim paused`
                    : `Claim ${balance.asset}`
                }
                onPress={() => wallet.selectAsset(balance.asset)}
                disabled={
                  wallet.assetBlocked(balance.asset) ||
                  parseUnits(balance.available, balance.decimals) === 0n
                }
              />
            </View>
          ))}
          <Text style={styles.small}>
            Balances are snapshots refreshed every 15 seconds. Pending payback is not available to
            claim yet. USD values are estimates. Completed claims leave the wallet total.
          </Text>
          <Text style={styles.small}>
            Changing your token hides this wallet. Re-enter the same token in this tab to resume
            saved claims. Closing the tab ends this session.
          </Text>
        </>
      )}
    </ScrollView>
  );
};
