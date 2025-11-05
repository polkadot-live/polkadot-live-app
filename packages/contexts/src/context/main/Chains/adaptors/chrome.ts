// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyData, FlattenedAPIData } from '@polkadot-live/types';
import type { ChainID } from '@polkadot-live/types/chains';
import type { ChainsAdaptor } from './types';

export const chromeAdapter: ChainsAdaptor = {
  listenOnMount: (setChains, setUiTrigger) => {
    const callback = (message: AnyData) => {
      const { type, task } = message;
      if (type === 'api') {
        switch (task) {
          case 'state:chains':
          case 'state:onPopupReload': {
            const { ser }: { ser: string } = message.payload;
            const array: [ChainID, FlattenedAPIData][] = JSON.parse(ser);
            const map = new Map<ChainID, FlattenedAPIData>(array);
            setChains(map);
            setUiTrigger(true);
            break;
          }
          case 'state:chain': {
            const { ser }: { ser: string } = message.payload;
            const flattened: FlattenedAPIData = JSON.parse(ser);
            setChains((pv) => new Map(pv).set(flattened.chainId, flattened));
            setUiTrigger(true);
            break;
          }
        }
      }
    };
    chrome.runtime.onMessage.addListener(callback);
    return () => chrome.runtime.onMessage.removeListener(callback);
  },

  onDisconnectApi: async (chainId) => {
    const data = { type: 'api', task: 'closeApi', chainId };
    await chrome.runtime.sendMessage(data);
  },

  onMount: () => {
    const data = { type: 'api', task: 'syncChainState' };
    chrome.runtime.sendMessage(data);
  },
};
