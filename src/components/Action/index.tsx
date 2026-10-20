// src/components/Action/index.tsx
import React from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';
import type { Props } from './types';
import { styles } from './styles';
import { colors } from '../../theme';
export const Action: React.FC<Props> = ({ label, onPress, disabled, secondary, compact, busy }) => (
  <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled: !!disabled || !!busy, busy: !!busy }} disabled={disabled || busy} onPress={onPress}
    style={({ pressed }) => [styles.button, secondary && styles.secondary, compact && styles.compact, (disabled || busy) && styles.disabled, pressed && styles.pressed]}>
    {busy && <ActivityIndicator size="small" color={secondary ? colors.accent : colors.white} />}
    <Text style={[styles.label, secondary && styles.secondaryLabel]}>{label}</Text>
  </Pressable>
);
