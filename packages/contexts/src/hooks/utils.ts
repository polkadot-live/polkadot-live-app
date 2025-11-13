// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { chainUnits, getSignSources } from '@polkadot-live/consts/chains';
import type { AccountSource, SendAccount } from '@polkadot-live/types';
import type { ChainID } from '@polkadot-live/types/chains';

/**
 * Return all addresses for receiver address list.
 */
export const getRecipientAccounts = (
  addressMap: Map<AccountSource, SendAccount[]>,
  sendNetwork: ChainID | null,
  sender: SendAccount | null
): SendAccount[] => {
  let result: SendAccount[] = [];
  for (const addresses of addressMap.values()) {
    result = result.concat(addresses);
  }
  // Filter accounts based on selected network.
  return result
    .filter(({ chainId }) => chainId === sendNetwork)
    .filter(({ address }) => address !== sender?.address)
    .sort((a, b) => a.alias.localeCompare(b.alias));
};

/**
 * Return all addresses capable of signing extrinsics.
 */
export const getSenderAccounts = (
  addressMap: Map<AccountSource, SendAccount[]>,
  sendNetwork: ChainID | null
): SendAccount[] => {
  let result: SendAccount[] = [];
  for (const source of getSignSources()) {
    const accounts = addressMap.get(source);
    if (!accounts || accounts.length === 0) {
      continue;
    }
    const filtered: SendAccount[] = accounts
      .filter(({ chainId }) => chainId === sendNetwork)
      .map((en) => ({ ...en, source }));
    result = result.concat(filtered);
  }
  return result.sort((a, b) => a.alias.localeCompare(b.alias));
};

/**
 * Removes leading zeros from a numeric string but keeps a single zero if a decimal follows.
 */
export const removeLeadingZeros = (value: string): string => {
  // Remove unnecessary leading zeros.
  let cleaned = value.replace(/^0+(?=\d)/, '');

  // If the first character is ".", prepend "0"
  if (cleaned.startsWith('.')) {
    cleaned = '0' + cleaned;
  }
  // Ensure empty string returns "0"
  return cleaned || '0';
};

/**
 * Utility to truncate a send amount to the network's allowable decimal places.
 */
export const truncateDecimals = (amount: string, chainId: ChainID): string => {
  const decimals = chainUnits(chainId);
  const [integerPart, decimalPart] = amount.split('.');

  if (!decimalPart) {
    return integerPart;
  }
  const truncatedDecimal = decimalPart.slice(0, decimals);
  return `${integerPart}.${truncatedDecimal}`;
};
