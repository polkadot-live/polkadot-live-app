// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

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
  arr2: string[],
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
    '',
  );
};

/**
 * @name getOnlineStatus
 * @summary Get connection status.
 */
export const getOnlineStatus = async (backend: 'electron' | 'browser') => {
  switch (backend) {
    case 'electron': {
      return (
        (await window.myAPI.sendConnectionTaskAsync({
          action: 'connection:getStatus',
          data: null,
        })) || false
      );
    }
    case 'browser': {
      return navigator.onLine;
    }
  }
};

/**
 * @name waitMs
 * @summary Waits the given milliseconds and returns the provided boolean result.
 */
export const waitMs = async (ms: number, result = false): Promise<boolean> =>
  new Promise<boolean>((resolve) => setTimeout(() => resolve(result), ms));

/**
 * @name runSequential
 * @summary Executes an array of async tasks sequentially and returns their results in order.
 */
export const runSequential = async <T>(
  tasks: (() => Promise<T>)[],
): Promise<T[]> => {
  const results: T[] = [];
  for (const task of tasks) {
    results.push(await task());
  }
  return results;
};

/**
 * @name withTimeout
 * @summary Resolves to true if the promise settles before the timeout, otherwise false.
 */
export const withTimeout = async (
  promise: Promise<unknown>,
  timeoutMs: number,
): Promise<boolean> =>
  Promise.race([
    promise.then(() => true).catch(() => false),
    waitMs(timeoutMs).then(() => false),
  ]);

/**
 * @name perbillToPercent Converts a Perbill value into a percentage string with fixed decimal places.
 * @param perbill - A bigint or number representing a Perbill (0 to 1_000_000_000).
 * @param decimals - Number of decimal places to display (default: 2).
 * @returns A string like "12.34%"
 */
export const perbillToPercent = (
  perbill: bigint | number,
  decimals = 2,
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

/**
 * @name parseMap
 * @summary Parse a serialized nested array into a map.
 */
export const parseMap = <K, V>(map: string) => {
  const array: [K, V][] = JSON.parse(map);
  return new Map<K, V>(array);
};
