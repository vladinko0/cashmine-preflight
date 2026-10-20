// src/screens/Activity/styles.ts
import { StyleSheet } from 'react-native';
import { colors } from '../../theme';
export const styles = StyleSheet.create({
  container: { gap: 16 },
  heading: { color: colors.ink, fontSize: 28, fontWeight: '800', letterSpacing: -0.7 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  label: { color: colors.ink, fontWeight: '700', fontSize: 15 },
  amount: { color: colors.ink, fontSize: 17, fontWeight: '700' },
  negative: { color: colors.danger },
  muted: { color: colors.muted, fontSize: 12, lineHeight: 19 },
  badge: {
    color: colors.accent,
    backgroundColor: colors.accentSoft,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    fontSize: 11,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  reference: { color: colors.muted, fontSize: 11 },
});
