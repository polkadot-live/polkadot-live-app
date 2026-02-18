// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { setStateWithRef } from '@w3ux/utils';
import type { AnyData, FlattenedAccountData } from '@polkadot-live/types';
import type { ChainID } from '@polkadot-live/types/chains';
import type { AddressesAdapter } from './types';

export const chromeAdapter: AddressesAdapter = {
  importAddress: async (
    _accountName,
    fromBackup,
    addressesRef,
    setAddresses,
  ) => {
    const msg = { type: 'managedAccounts', task: 'getAll' };
    const arr: [ChainID, FlattenedAccountData[]][] = JSON.parse(
      (await chrome.runtime.sendMessage(msg)) as string,
    );
    const map = new Map<ChainID, FlattenedAccountData[]>(arr);
    setStateWithRef(map, setAddresses, addressesRef);
    if (!fromBackup) {
      // TODO: accountName notification.
    }
  },

  onMount: () => {
    /* empty */
  },

  listenOnMount: (addressesRef, setAddresses) => {
    const callback = async (message: AnyData) => {
      if (message.type === 'managedAccounts') {
        switch (message.task) {
          case 'setAccountsState': {
            const { ser }: { ser: string } = message.payload;
            const array: [ChainID, FlattenedAccountData[]][] = JSON.parse(ser);
            const map = new Map<ChainID, FlattenedAccountData[]>(array);
            setStateWithRef(map, setAddresses, addressesRef);
            break;
          }
        }
      }
    };
    chrome.runtime.onMessage.addListener(callback);
    return () => chrome.runtime.onMessage.removeListener(callback);
  },

  removeAddress: async () => {
    /* empty */
  },
};
