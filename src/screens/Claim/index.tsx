// src/screens/Claim/index.tsx
import React from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { Action } from '../../components/Action';
import { Notice } from '../../components/Notice';
import { colors } from '../../theme';
import type { Props } from './types';
import { styles } from './styles';
import { useClaimForm } from './useClaimForm';
export const ClaimScreen: React.FC<Props> = (props) => {
  const form = useClaimForm(props);
  return (
    <View style={styles.container}>
      <Action secondary label="Back to balances" onPress={props.onClose} disabled={form.busy} />
      <Text accessibilityRole="header" style={styles.title}>
        Claim {props.balance.asset}
      </Text>
      {!form.options && !form.loadError && <ActivityIndicator color={colors.accent} />}
      {!!form.loadError && (
        <>
          <Notice error text={form.loadError} />
          <Action label="Retry claim options" onPress={form.retry} />
        </>
      )}
      {form.options && (
        <View style={styles.card}>
          {!form.confirming ? (
            <>
              <View style={styles.field}>
                <View style={styles.row}>
                  <Text style={styles.label}>Amount in {props.balance.asset}</Text>
                  <Action
                    compact
                    secondary
                    label="Max"
                    onPress={() => form.setAmount(props.balance.available)}
                  />
                </View>
                <TextInput
                  accessibilityLabel={`Claim amount in ${props.balance.asset}`}
                  inputMode="decimal"
                  placeholder="0.00"
                  placeholderTextColor={colors.muted}
                  value={form.amount}
                  onChangeText={form.setAmount}
                  style={styles.input}
                />
                <Text style={styles.text}>
                  Available: {props.balance.available}
                  {'\n'}Minimum: {form.options.minAmount}
                </Text>
                {!!form.amount && !!form.validation && <Notice error text={form.validation} />}
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Destination</Text>
                {form.options.destinations.length === 0 && (
                  <Notice error text="No claim destinations are available for this asset." />
                )}
                {form.options.destinations.map((destination) => (
                  <Pressable
                    key={destination.id}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: destination.id === form.destinationId }}
                    accessibilityLabel={destination.label}
                    onPress={() => form.setDestinationId(destination.id)}
                    style={[
                      styles.destination,
                      destination.id === form.destinationId && styles.selected,
                    ]}
                  >
                    <Text style={styles.text}>
                      {destination.id === form.destinationId ? '● ' : '○ '}
                      {destination.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </>
          ) : (
            <>
              <Text accessibilityRole="header" style={styles.label}>
                Review your claim
              </Text>
              <Text style={styles.text}>
                Claim: {form.amount} {props.balance.asset}
                {'\n'}To: {form.destination?.label}
              </Text>
            </>
          )}
          <View style={styles.field}>
            <View style={styles.row}>
              <Text style={styles.text}>Fee (included in amount)</Text>
              <Text style={styles.label}>
                {form.options.fee} {props.balance.asset}
              </Text>
            </View>
            <Text style={styles.text}>You receive</Text>
            <Text selectable style={styles.amount}>
              {form.net ?? '—'} {props.balance.asset}
            </Text>
          </View>
          {props.blocked && (
            <Notice text="A claim is still resolving, or its balance snapshot has not caught up. Please wait before submitting another claim." />
          )}
          {!!form.submitError && <Notice error text={form.submitError} />}
          {form.confirming ? (
            <>
              <Notice text="Submitting creates a claim. We will track its result here. If the response is lost, use safe retry instead of creating another claim." />
              <Action
                label="Confirm and submit claim"
                onPress={form.submit}
                disabled={!form.canSubmit}
                busy={form.busy}
              />
              <Action
                secondary
                label="Edit amount"
                onPress={() => form.setConfirming(false)}
                disabled={form.busy}
              />
            </>
          ) : (
            <Action
              label="Review claim"
              onPress={() => form.setConfirming(true)}
              disabled={!form.canSubmit}
            />
          )}
        </View>
      )}
    </View>
  );
};
