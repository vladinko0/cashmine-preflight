// src/screens/Claim/styles.ts
import { StyleSheet } from 'react-native';
import { colors } from '../../theme';
export const styles = StyleSheet.create({
  container: { gap: 18 },
  card: {
    backgroundColor: colors.surface,
    padding: 20,
    gap: 18,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: { color: colors.ink, fontWeight: '800', fontSize: 27 },
  label: { color: colors.ink, fontSize: 14, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  text: { color: colors.muted, fontSize: 14, lineHeight: 21 },
  input: {
    color: colors.ink,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 24,
    minHeight: 60,
    backgroundColor: colors.background,
  },
  field: { gap: 8 },
  amount: { color: colors.accent, fontSize: 25, fontWeight: '800' },
  destination: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 48,
  },
  selected: { backgroundColor: colors.accentSoft, borderColor: colors.accent },
});
