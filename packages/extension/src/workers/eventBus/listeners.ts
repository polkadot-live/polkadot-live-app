// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { DbController } from '../../controllers';
import { dispatchNotification } from '../notifications';
import { eventBus } from '.';
import { getActiveChains, getAllAccountSubscriptions } from '../subscriptions';
import { getAllEvents, persistEvent } from '../events';
import {
  AccountsController,
  doRemoveOutdatedEvents,
  pushUniqueEvent,
} from '@polkadot-live/core';
import { sendChromeMessage } from '../utils';
import type { ExtrinsicInfo, TxStatus } from '@polkadot-live/types/tx';
import type {
  EventCallback,
  NotificationData,
} from '@polkadot-live/types/reporter';

eventBus.addEventListener('showNotification', (e) => {
  const { title, body }: { title: string; body: string } = (e as CustomEvent)
    .detail;
  dispatchNotification(Date.now().toString(), title, body);
});

eventBus.addEventListener('handleTxStatus', async (e) => {
  interface I {
    info: ExtrinsicInfo;
    status: TxStatus;
    isMock: boolean;
  }
  const { info, status, isMock }: I = (e as CustomEvent).detail;
  const { txId, txHash, actionMeta } = info;
  const { eventUid } = actionMeta;

  sendChromeMessage(
    'extrinsics',
    'reportTxStatus',
    txHash ? { status, txId, txHash } : { status, txId }
  );

  if (eventUid && status === 'finalized' && !isMock) {
    const event = (await DbController.get('events', eventUid)) as
      | EventCallback
      | undefined;

    if (event) {
      event.stale = true;
      await DbController.set('events', eventUid, event);
      sendChromeMessage('events', 'staleEvent', { uid: event.uid });
    }
  }
});

// Set react state after bootstrapping is complete.
eventBus.addEventListener('initSystems:complete', async () => {
  // Set subscriptions state.
  const map = await getAllAccountSubscriptions();
  const active = await getActiveChains(map);

  sendChromeMessage('subscriptions', 'setAccountSubscriptions', {
    subscriptions: JSON.stringify(Array.from(map.entries())),
    activeChains: JSON.stringify(Array.from(active.entries())),
  });
  // Set managed accounts state.
  sendChromeMessage('managedAccounts', 'setAccountsState', {
    ser: JSON.stringify(
      Array.from(AccountsController.getAllFlattenedAccountData().entries())
    ),
  });
});

eventBus.addEventListener('processEvent', async (e) => {
  const generateUID = (): string => {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0].toString(36);
  };
  interface I {
    event: EventCallback;
    notification: NotificationData;
    showNotification: {
      isOneShot: boolean;
      isEnabled: boolean;
    };
  }
  const { event, notification, showNotification }: I = (e as CustomEvent)
    .detail;

  // Assign UID to event.
  const uid = generateUID();
  event.uid = uid;
  event.txActions = event.txActions.map((obj) => {
    obj.txMeta.eventUid = uid;
    return obj;
  });

  // Handle outdated events.
  let handleOutdated = false;
  const keepOutdated = (await DbController.get(
    'settings',
    'setting:keep-outdated-events'
  )) as boolean;

  if (!keepOutdated) {
    const all = await getAllEvents();
    const { updated, events } = doRemoveOutdatedEvents(event, all);
    if (updated) {
      handleOutdated = true;
      const remove = all.filter((a) => !events.find((b) => b.uid === a.uid));
      for (const { uid: key } of remove) {
        await DbController.delete('events', key);
      }
    }
  }

  // Persist event if it's unique.
  const events = await getAllEvents();
  const { updated } = pushUniqueEvent(event, events);
  if (updated) {
    await persistEvent(event);
  }

  // Show native notification.
  const { isOneShot, isEnabled } = showNotification;
  const silenced = (await DbController.get(
    'settings',
    'setting:silence-os-notifications'
  )) as boolean;
  const notify = isOneShot ? true : silenced ? false : isEnabled;
  if (isOneShot || (updated && notify)) {
    const { body, title, subtitle } = notification;
    await dispatchNotification(event.uid, title, body, subtitle);
  }

  // Add to events state.
  sendChromeMessage('events', 'addEvent', { event, handleOutdated });
});

eventBus.addEventListener('setManagedAccountsState', async () => {
  sendChromeMessage('managedAccounts', 'setAccountsState', {
    ser: JSON.stringify(
      Array.from(AccountsController.getAllFlattenedAccountData().entries())
    ),
  });
});
