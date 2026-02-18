// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ContextError } from '@polkadot-live/core';
import { use } from 'react';
import { toast, Zoom } from 'react-toastify';
import type { AnyData } from '@polkadot-live/types/misc';
import type { ToastOptions, ToastPosition } from 'react-toastify';

export const createSafeContextHook =
  <T>(Context: React.Context<T | undefined>, name: string) =>
  () => {
    const context = use(Context);
    if (context === undefined) {
      throw new ContextError('ContextUndefined', name);
    }
    return context;
  };

export const buildCache = (
  entries: Record<string, () => AnyData>,
): Map<string, () => AnyData> => {
  const cache = new Map<string, () => AnyData>();
  Object.entries(entries).forEach(([key, value]) => {
    cache.set(key, value);
  });
  return cache;
};

export const renderToast = (
  message: string,
  toastId: string,
  toastType: 'error' | 'success',
  position?: ToastPosition,
) => {
  const args: ToastOptions<unknown> = {
    position: position ? position : 'top-center',
    autoClose: 3000,
    hideProgressBar: true,
    closeOnClick: true,
    closeButton: false,
    pauseOnHover: false,
    draggable: false,
    progress: undefined,
    theme: 'dark',
    transition: Zoom,
    toastId,
  };

  toastType === 'success'
    ? toast.success(message, args)
    : toast.error(message, args);
};

/**
 * @name validateAccountName
 * @summary Validate an account name received from user input.
 */
export const validateAccountName = (accountName: string): boolean => {
  // Regulare expression for allowed characters in the account name (including spaces).
  const regex = /^[a-zA-Z0-9._-\s]+$/;

  // Check if the length of the nickname is between 3 and 35 characters.
  if (accountName.length < 3 || accountName.length > 35) {
    return false;
  }

  // Check if the account name contains only allowed characters.
  if (!regex.test(accountName)) {
    return false;
  }

  return true;
};
