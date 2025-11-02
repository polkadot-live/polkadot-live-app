// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { DbController } from '../../controllers';
import { getAllEvents } from '../events';
import { getFromBackupFile } from '@polkadot-live/core';
import { sendChromeMessage } from '../utils';
import type {
  EventAccountData,
  EventCallback,
} from '@polkadot-live/types/reporter';

export const importEventData = async (contents: string) => {
  const serEvents = getFromBackupFile('events', contents);
  if (!serEvents) {
    return;
  }
  // Cache <chainId:address> with <accountName> for imported events.
  const nameSyncMap = new Map<string, string>();
  type M = Map<string, EventCallback>;
  const fetched = (await DbController.getAllObjects('events')) as M;

  // Update database (overwrites events with same uid).
  const parsed: EventCallback[] = JSON.parse(serEvents);
  for (const event of parsed) {
    const { uid: key } = event;
    await DbController.set('events', key, event);

    if (event.who.origin === 'account') {
      const whoData = event.who.data as EventAccountData;
      const { accountName, address, chainId } = whoData;
      nameSyncMap.set(`${chainId}:${address}`, accountName);
    }
  }
  // Update cached account names in current events.
  for (const event of fetched.values()) {
    if (event.who.origin === 'account') {
      const whoData = event.who.data as EventAccountData;
      const { accountName, address, chainId } = whoData;
      const maybeName = nameSyncMap.get(`${chainId}:${address}`);
      if (maybeName && accountName !== maybeName) {
        whoData.accountName = maybeName;
        await DbController.set('events', event.uid, event);
      }
    }
  }
  // Set events state.
  sendChromeMessage('events', 'setEventsState', {
    result: await getAllEvents(),
  });
};
