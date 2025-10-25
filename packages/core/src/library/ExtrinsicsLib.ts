// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ConfigRenderer } from '../config';
import type {
  AccountSource,
  ImportedGenericAccount,
  SendAccount,
} from '@polkadot-live/types/accounts';
import type { ActionMeta } from '@polkadot-live/types/tx';

/**
 * @name initExtrinsicBrowser
 * @summary Browser implementation of initializing an extrinsic.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const initExtrinsicBrowser = async (meta: ActionMeta) => {
  /* empty */
};

/**
 * @name initExtrinsicElectron
 * @summary Electron implementation of initializing an extrinsic.
 */
export const initExtrinsicElectron = async (meta: ActionMeta) => {
  // Send extrinsic to action window.
  window.myAPI.relaySharedState('extrinsic:building', true);
  const extrinsicsViewOpen = await window.myAPI.isViewOpen('action');

  if (!extrinsicsViewOpen) {
    // Relay init task to extrinsics window after its DOM has loaded.
    window.myAPI.openWindow('action', {
      windowId: 'action',
      task: 'action:init',
      serData: JSON.stringify(meta),
    });

    // Analytics.
    window.myAPI.umamiEvent('window-open-extrinsics', {
      action: `send-transfer-keep-alive`,
    });
  } else {
    window.myAPI.openWindow('action');

    // Send init task directly to extrinsics window if it's already open.
    ConfigRenderer.portToAction?.postMessage({
      task: 'action:init',
      data: JSON.stringify(meta),
    });
  }
};

/**
 * @name fetchSendAccountsBrowser
 * @summary Fetches send accounts state for browser environment.
 */
export const fetchSendAccountsBrowser = async () => {
  /* empty */
};

/**
 * @name fetchSendAccountsElectron
 * @summary Fetches send accounts state for electron environment.
 */
export const fetchSendAccountsElectron = async () => {
  const serialized = (await window.myAPI.rawAccountTask({
    action: 'raw-account:getAll',
    data: null,
  })) as string;

  const parsedMap = new Map<AccountSource, string>(JSON.parse(serialized));
  const map = new Map<AccountSource, SendAccount[]>();

  for (const [source, ser] of parsedMap.entries()) {
    const parsed: ImportedGenericAccount[] = JSON.parse(ser);
    const addresses = parsed
      .map(({ encodedAccounts }) =>
        Object.values(encodedAccounts).map((en) => en)
      )
      .flat();
    const accounts = addresses.map((en) => ({ ...en, source }));
    map.set(source, accounts);
  }
  return map;
};
