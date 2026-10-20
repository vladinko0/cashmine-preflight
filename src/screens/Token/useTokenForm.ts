// src/screens/Token/useTokenForm.ts
import { useState } from 'react';
import type { Props } from './types';
export const useTokenForm = (connect: Props['connect']) => {
  const [token, setToken] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (busy || !token.trim()) return;
    setBusy(true);
    try { await connect(token); } finally { setBusy(false); }
  };
  return { token, setToken, busy, submit };
};
