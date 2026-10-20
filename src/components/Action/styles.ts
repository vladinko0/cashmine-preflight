// src/components/Action/styles.ts
import { StyleSheet } from 'react-native';
import { colors } from '../../theme';
export const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.accent,
    minHeight: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    flexDirection: 'row',
    gap: 8,
  },
  secondary: { backgroundColor: colors.accentSoft },
  compact: { minHeight: 48, paddingHorizontal: 14, paddingVertical: 10 },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.75 },
  label: { color: colors.white, fontWeight: '700', fontSize: 15 },
  secondaryLabel: { color: colors.accent },
});
