// src/screens/Token/index.tsx
import React from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { colors } from '../../theme';
import { Action } from '../../components/Action';
import { Notice } from '../../components/Notice';
import type { Props } from './types';
import { styles } from './styles';
import { useTokenForm } from './useTokenForm';
export const TokenScreen: React.FC<Props> = ({ connect, error }) => {
  const form = useTokenForm(connect);
  return <ScrollView style={styles.page} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <Text style={styles.brand}>cashmine<Text style={styles.footnote}> / PAYBACK</Text></Text>
    <Text style={styles.eyebrow}>YOUR FEES. BACK WITH YOU.</Text>
    <Text accessibilityRole="header" style={styles.title}>Make your trading{ '\n' }come back to you.</Text>
    <Text style={styles.body}>See your payback balances and claim what’s yours.</Text>
    <View style={styles.card}>
      <Text style={styles.label}>Connect with your API token</Text>
      <TextInput accessibilityLabel="API token" placeholder="Paste your personal token" placeholderTextColor={colors.muted} secureTextEntry autoCapitalize="none" autoCorrect={false} value={form.token} onChangeText={form.setToken} style={styles.input} onSubmitEditing={form.submit} />
      {!!error && <Notice text={error} error />}
      <Action label="Connect to CashMine" onPress={form.submit} disabled={!form.token.trim()} busy={form.busy} />
      <Text style={styles.footnote}>Your token stays in this browser tab’s session. It is sent only to the CashMine test API. Change it any time.</Text>
    </View>
    <Text style={styles.footnote}>PRACTICAL TASK · TEST DATA · NO REAL TRANSFERS</Text>
  </ScrollView>;
};
