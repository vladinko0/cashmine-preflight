// src/components/Notice/index.tsx
import React from 'react';
import { Text, View } from 'react-native';
import type { Props } from './types';
import { styles } from './styles';
export const Notice: React.FC<Props> = ({ text, error }) => <View style={[styles.box, error && styles.errorBox]}><Text accessibilityLiveRegion="polite" style={[styles.text, error && styles.error]}>{text}</Text></View>;
