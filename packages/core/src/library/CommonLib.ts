// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainID } from '@polkadot-live/types/chains';

/**
 * @name arraysAreEqual
 * @summary Returns `true` if the two passed arrays are equal, `false` otherwise.
 * @returns {boolean}
 */
export const arraysAreEqual = <T>(array1: T[], array2: T[]): boolean => {
  if (array1.length !== array2.length) {
    return false;
  }

  for (let i = 0; i < array1.length; i++) {
    if (array1[i] !== array2[i]) {
      return false;
    }
  }

  return true;
};

/**
 * @name areSortedArraysEqual
 * @summary Checks if two sorted string arrays are equal, returns `true` or `false`.
 */
export const areSortedArraysEqual = (
  arr1: string[],
  arr2: string[]
): boolean => {
  if (arr1.length !== arr2.length) {
    return false;
  }

  const sortedArr1 = [...arr1].sort();
  const sortedArr2 = [...arr2].sort();

  for (let i = 0; i < sortedArr1.length; i++) {
    if (sortedArr1[i] !== sortedArr2[i]) {
      return false;
    }
  }

  return true;
};

/**
 * @name generateUID
 * @summary Util for generating a UID in the browser.
 */
export const generateUID = (): string => {
  // Generate a random 16-byte array.
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);

  // Convert to a hexadecimal string.
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join(
    ''
  );
};

/**
 * @name getInitialChainAccordionValue
 * @summary Returns an initial chain ID in preferential order.
 */
export const getInitialChainAccordionValue = (chains: ChainID[]): ChainID =>
  chains.includes('Polkadot')
    ? 'Polkadot'
    : chains.includes('Kusama')
      ? 'Kusama'
      : 'Westend';

/**
 * @name getOnlineStatus
 * @summary Get connection status.
 */
export const getOnlineStatus = async () =>
  (await window.myAPI.sendConnectionTaskAsync({
    action: 'connection:getStatus',
    data: null,
  })) || false;

/**
 * @name waitMs
 * @summary Waits the given milliseconds and returns the provided boolean result.
 */
export const waitMs = async (ms: number, result: boolean): Promise<boolean> =>
  new Promise<boolean>((resolve) => setTimeout(() => resolve(result), ms));

/**
 * @name perbillToPercent Converts a Perbill value into a percentage string with fixed decimal places.
 * @param perbill - A bigint or number representing a Perbill (0 to 1_000_000_000).
 * @param decimals - Number of decimal places to display (default: 2).
 * @returns A string like "12.34%"
 */
export const perbillToPercent = (
  perbill: bigint | number,
  decimals = 2
): string => {
  const BILLION = 1_000_000_000n;
  const value = typeof perbill === 'number' ? BigInt(perbill) : perbill;

  if (value < 0n || value > BILLION) {
    throw new Error('Perbill must be between 0 and 1_000_000_000');
  }

  const percentage = (value * 10n ** BigInt(decimals + 2)) / BILLION; // scale to get decimal percentage
  const integerPart = percentage / 10n ** BigInt(decimals);
  const fractionPart = percentage % 10n ** BigInt(decimals);

  return `${integerPart}.${fractionPart.toString().padStart(decimals, '0')}%`;
};
