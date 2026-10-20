// src/session/useSession.ts
import { useCallback, useEffect, useState } from 'react';
import { clearToken, readToken, saveToken, tokenScope } from './storage';

export const useSession = () => {
  const [session, setSession] = useState<{ token: string; scope: string } | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const connect = useCallback(async (token: string) => {
    try {
      setError('');
      const cleaned = token.trim();
      if (!cleaned) throw new Error('Enter your personal API token.');
      const scope = await tokenScope(cleaned);
      saveToken(cleaned);
      setSession({ token: cleaned, scope });
    } catch {
      setError('Browser session storage is unavailable. Enable storage and try again.');
    }
  }, []);
  useEffect(() => {
    let active = true;
    const restore = async () => {
      const token = readToken();
      if (token) {
        try {
          const scope = await tokenScope(token);
          if (active) setSession({ token, scope });
        } catch {
          if (active) setError('Unable to restore this browser session. Please reconnect.');
        }
      }
      if (active) setReady(true);
    };
    restore();
    return () => {
      active = false;
    };
  }, []);
  const disconnect = useCallback(() => {
    try {
      clearToken();
    } catch {
      /* Keep the in-memory session disconnected even when storage is unavailable. */
    }
    setSession(null);
  }, []);
  return { session, ready, error, connect, disconnect };
};
