// src/screens/Token/styles.ts
import { StyleSheet } from 'react-native';
import { colors } from '../../theme';
export const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    gap: 20,
  },
  brand: { color: colors.accent, fontWeight: '900', fontSize: 22, letterSpacing: -0.8 },
  eyebrow: { color: colors.muted, fontSize: 12, fontWeight: '700', letterSpacing: 2 },
  title: {
    color: colors.ink,
    fontSize: 38,
    lineHeight: 44,
    fontWeight: '800',
    letterSpacing: -1.3,
  },
  body: { color: colors.muted, fontSize: 16, lineHeight: 24 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    gap: 16,
  },
  label: { color: colors.ink, fontWeight: '700', fontSize: 14 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    minHeight: 52,
    color: colors.ink,
    backgroundColor: colors.background,
  },
  footnote: { color: colors.muted, fontSize: 12, lineHeight: 19 },
});
