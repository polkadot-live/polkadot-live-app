// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyData } from '@polkadot-live/types/misc';

export const sendChromeMessage = async <T>(
  type: string,
  task: string,
  payloadObj?: AnyData
): Promise<T | void> => {
  try {
    return (await chrome.runtime.sendMessage({
      type,
      task,
      payload: payloadObj ? { ...payloadObj } : undefined,
    })) as T | void;
  } catch (err) {
    console.error(err);
  }
};
