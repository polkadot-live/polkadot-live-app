// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyData } from '@polkadot-live/types/misc';
import type { ChainID } from '@polkadot-live/types/chains';
import type { EventsAdaptor } from './types';
import type { EventCallback } from '@polkadot-live/types';

export const chromeAdapter: EventsAdaptor = {
  removeEvent: async (event) => {
    const msg = { type: 'events', task: 'remove', payload: { event } };
    await chrome.runtime.sendMessage(msg);
  },

  listenOnMount: (markStaleEvent, setEvents, updateEventsOnAccountRename) => {
    const callback = (message: AnyData) => {
      if (message.type == 'events') {
        switch (message.task) {
          case 'setEventsState': {
            const { result }: { result: EventCallback[] } = message.payload;
            setEvents(result);
            break;
          }
          case 'updateAccountNames': {
            const {
              chainId,
              updated,
            }: { chainId: ChainID; updated: EventCallback[] } = message.payload;
            updated.length > 0 && updateEventsOnAccountRename(updated, chainId);
            break;
          }
          case 'staleEvent': {
            const { uid, chainId }: { uid: string; chainId: ChainID } =
              message.payload;
            markStaleEvent(uid, chainId);
            break;
          }
        }
      }
    };
    chrome.runtime.onMessage.addListener(callback);
    return () => chrome.runtime.onMessage.removeListener(callback);
  },
};
