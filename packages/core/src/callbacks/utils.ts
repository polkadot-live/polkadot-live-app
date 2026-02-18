// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { APIsController, BusDispatcher } from '../controllers';
import type { ChainID } from '@polkadot-live/types/chains';
import type { IpcTask } from '@polkadot-live/types/communication';
import type {
  EventCallback,
  NotificationData,
} from '@polkadot-live/types/reporter';

export const getApiOrThrow = async (chainId: ChainID) =>
  (await APIsController.getConnectedApiOrThrow(chainId)).getApi();

export const handleEvent = async (ipcTask: IpcTask) => {
  switch (APIsController.backend) {
    case 'electron': {
      window.myAPI.sendEventTask(ipcTask);
      break;
    }
    case 'browser': {
      interface I {
        event: EventCallback;
        notification: NotificationData | null;
        showNotification: {
          isOneShot: boolean;
          isEnabled: boolean;
        };
      }
      const { event, notification, showNotification }: I = ipcTask.data;
      const detail = { event, notification, showNotification };
      BusDispatcher.dispatch('processEvent', detail);
      break;
    }
  }
};
