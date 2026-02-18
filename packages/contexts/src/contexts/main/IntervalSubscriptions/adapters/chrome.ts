// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyData, IntervalSubscription } from '@polkadot-live/types';
import type { ChainID } from '@polkadot-live/types/chains';
import type { IntervalSubscriptionsAdapter } from './types';

export const chromeAdapter: IntervalSubscriptionsAdapter = {
  getIntervalSubs: async () =>
    (await chrome.runtime.sendMessage({
      type: 'intervalSubscriptions',
      task: 'getAll',
    })) as IntervalSubscription[],

  listenOnMount: (setSubscriptions) => {
    const callback = (message: AnyData) => {
      if (message.type === 'intervalSubscriptions') {
        switch (message.task) {
          case 'import:setSubscriptions': {
            const { tasks }: { tasks: IntervalSubscription[] } =
              message.payload;
            const map = new Map<ChainID, IntervalSubscription[]>();
            for (const task of tasks) {
              const { chainId } = task;
              map.has(chainId)
                ? map.set(chainId, [...map.get(chainId)!, task])
                : map.set(chainId, [task]);
            }
            setSubscriptions(map);
            break;
          }
        }
      }
    };
    chrome.runtime.onMessage.addListener(callback);
    return () => chrome.runtime.onMessage.removeListener(callback);
  },

  onMount: (addIntervalSubscription) => {
    if (!addIntervalSubscription) {
      return;
    }
    chrome.runtime
      .sendMessage({
        type: 'intervalSubscriptions',
        task: 'getAll',
      })
      .then((tasks: IntervalSubscription[]) => {
        tasks.forEach((t) => {
          addIntervalSubscription(t);
        });
      });
  },
};
