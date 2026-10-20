// src/screens/Wallet/useResetScroll.ts
import { useEffect, useRef } from 'react';
import type { ScrollViewInstance } from 'react-native';
export const useResetScroll = (navigationKey: string) => {
  const scrollRef = useRef<ScrollViewInstance | null>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [navigationKey]);
  return scrollRef;
};
