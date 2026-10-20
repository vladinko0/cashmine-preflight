// src/components/Notice/styles.ts
import { StyleSheet } from 'react-native';
import { colors } from '../../theme';
export const styles = StyleSheet.create({
  box: { backgroundColor: colors.warningSoft, borderRadius: 12, padding: 14 },
  errorBox: { backgroundColor: colors.dangerSoft },
  text: { color: colors.warning, fontSize: 14, lineHeight: 21 },
  error: { color: colors.danger },
});
