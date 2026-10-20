// src/screens/Claim/useClaimForm.ts
import { useEffect, useRef, useState } from 'react';
import { errorMessage } from '../../api/client';
import type { ClaimOptions } from '../../api/types';
import { formatUnits, parseUnits, receiveAmount, validateAmount } from '../../money';
import type { Props } from './types';
export const useClaimForm = ({ api, balance, blocked, onSubmit, onClose }: Props) => {
  const mounted = useRef(true);
  const submitting = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const [options, setOptions] = useState<ClaimOptions | null>(null);
  const [amount, setAmount] = useState('');
  const [destinationId, setDestinationId] = useState('');
  const [loadError, setLoadError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const load = async () => {
      try {
        const result = await api.options(balance.asset, controller.signal);
        if (result.asset !== balance.asset)
          throw new Error('Claim options do not match the selected asset.');
        parseUnits(result.minAmount, balance.decimals);
        parseUnits(result.fee, balance.decimals);
        if (active) {
          setOptions(result);
          setDestinationId(result.destinations[0]?.id ?? '');
          setLoadError('');
        }
      } catch (failure) {
        if (active) setLoadError(errorMessage(failure));
      }
    };
    load();
    return () => {
      active = false;
      controller.abort();
    };
  }, [api, balance.asset, balance.decimals, attempt]);
  const validation = options ? validateAmount(amount, balance, options) : null;
  const destination = options?.destinations.find((item) => item.id === destinationId);
  const net = options && !validation ? receiveAmount(amount, options.fee, balance.decimals) : null;
  const canSubmit = !!options && !!destination && !validation && !blocked && !busy;
  const submit = async () => {
    if (!canSubmit || !confirming || submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setSubmitError('');
    try {
      const failure = await onSubmit({
        asset: balance.asset,
        amount: formatUnits(parseUnits(amount, balance.decimals), balance.decimals),
        destinationId,
      });
      if (!mounted.current) return;
      if (failure) setSubmitError(failure);
      else onClose();
    } catch (failure) {
      if (mounted.current) setSubmitError(errorMessage(failure));
    } finally {
      submitting.current = false;
      if (mounted.current) setBusy(false);
    }
  };
  return {
    options,
    amount,
    setAmount,
    destinationId,
    setDestinationId,
    destination,
    validation,
    net,
    loadError,
    submitError,
    confirming,
    setConfirming,
    busy,
    canSubmit,
    submit,
    retry: () => setAttempt((value) => value + 1),
  };
};
