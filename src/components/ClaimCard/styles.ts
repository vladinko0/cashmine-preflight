// src/components/ClaimCard/styles.ts
import { StyleSheet } from 'react-native';
import { colors } from '../../theme';
export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderColor: colors.border,
    borderWidth: 1,
    padding: 18,
    gap: 10,
  },
  heading: { color: colors.ink, fontWeight: '800', fontSize: 17 },
  status: { color: colors.accent, fontWeight: '700', fontSize: 14 },
  body: { color: colors.muted, fontSize: 13, lineHeight: 20 },
  id: { color: colors.muted, fontSize: 11 },
});
