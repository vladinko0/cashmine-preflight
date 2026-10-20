// src/app/_layout.tsx
import React from 'react';
import { Slot } from 'expo-router';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { rootStyles } from '../theme/styles';
const RootLayout: React.FC = () => <SafeAreaProvider><SafeAreaView style={rootStyles.root}><Slot /></SafeAreaView></SafeAreaProvider>;
export default RootLayout;
