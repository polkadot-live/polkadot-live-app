// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { APIsController } from '@polkadot-live/core';
import { sendChromeMessage } from '../utils';
import type { FlattenedAPIData } from '@polkadot-live/types/apis';
import type { ChainID } from '@polkadot-live/types/chains';

export const initAPIs = async () => {
  await APIsController.initialize('browser');
  const map = new Map<ChainID, FlattenedAPIData>();
  APIsController.clients.map((c) => map.set(c.chainId, c.flatten()));
  sendChromeMessage('api', 'state:chains', {
    ser: JSON.stringify(Array.from(map.entries())),
  });
};
