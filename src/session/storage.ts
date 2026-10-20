// src/session/storage.ts
const TOKEN_KEY = 'cashmine.session.token';
export const readToken = (): string => {
  try { return typeof window === 'undefined' ? '' : window.sessionStorage.getItem(TOKEN_KEY) ?? ''; } catch { return ''; }
};
export const saveToken = (token: string) => window.sessionStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => window.sessionStorage.removeItem(TOKEN_KEY);
export const tokenScope = async (token: string): Promise<string> => {
  const digest = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
};
