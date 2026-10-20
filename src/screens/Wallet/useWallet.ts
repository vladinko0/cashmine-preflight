// src/screens/Wallet/useWallet.ts
import { useMemo } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { createApi } from '../../api/client';
import { isAssetBlocked } from '../../claims/journal';
import { useClaimOperations } from '../../claims/useClaimOperations';
import { useBalances } from './useBalances';
import type { Props } from './types';
export const useWallet = ({ token, scope }: Props) => {
  const api = useMemo(() => createApi(token), [token]);
  const balances = useBalances(api);
  const claims = useClaimOperations(api, scope, balances.data?.asOf);
  const params = useLocalSearchParams<{ claim?: string; tab?: string }>();
  const selectedBalance = balances.data?.items.find((balance) => balance.asset === params.claim);
  const assetBlocked = (asset: string) =>
    !!claims.storageError || isAssetBlocked(claims.operations, asset, balances.data?.asOf);
  return {
    api,
    balances,
    claims,
    selectedBalance,
    navigationKey: `${params.claim ?? ''}|${params.tab ?? ''}`,
    assetBlocked,
    claimSelected: !!params.claim,
    activitySelected: params.tab === 'activity',
    selectAsset: (asset: string) => router.setParams({ claim: asset }),
    closeClaim: () => router.setParams({ claim: undefined }),
    selectTab: (tab: string) => router.setParams({ tab, claim: undefined }),
  };
};
