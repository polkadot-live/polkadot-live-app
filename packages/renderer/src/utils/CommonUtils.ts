// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
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
 * @name getOnlineStatus
 * @summary Util: Get connection status.
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
