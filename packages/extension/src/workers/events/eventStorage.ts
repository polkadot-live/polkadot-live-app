// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { DbController } from '../../controllers';
import type { ChainID } from '@polkadot-live/types/chains';
import type {
  EventAccountData,
  EventCallback,
  EventCategory,
} from '@polkadot-live/types/reporter';

export const clearAll = async (category: EventCategory) => {
  try {
    const events = await DbController.getAllObjects('events');
    for (const [uid, e] of (events as Map<string, EventCallback>).entries()) {
      if (e.category === category) {
        await DbController.delete('events', uid);
      }
    }
    return true;
  } catch {
    return false;
  }
};

// TODO: Take into account keep outdated events setting.
export const persistEvent = async (event: EventCallback) => {
  await DbController.set('events', event.uid, event);
};

export const removeEvent = async (event: EventCallback) =>
  await DbController.delete('events', event.uid);

export const updateEventWhoInfo = async (
  address: string,
  chainId: ChainID,
  newName: string,
): Promise<EventCallback[]> => {
  const cmp = (a: EventAccountData) =>
    a.address === address && a.chainId === chainId && a.accountName !== newName;

  const updated: EventCallback[] = [];
  const events = (await DbController.getAllObjects('events')) as Map<
    string,
    EventCallback
  >;
  for (const [uid, e] of events.entries()) {
    if (e.who.origin !== 'account') {
      continue;
    }
    if (cmp(e.who.data as EventAccountData)) {
      (e.who.data as EventAccountData).accountName = newName;
      await DbController.set('events', uid, e);
      updated.push(e);
    }
  }
  return updated;
};
