// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { AccountsController } from '@polkadot-live/core';
import type { AddressesAdapter } from './types';

export const electronAdapter: AddressesAdapter = {
  importAddress: async (accountName, fromBackup) => {
    AccountsController.syncState();
    if (!fromBackup) {
      await window.myAPI.sendAccountTask({
        action: 'account:import',
        data: { accountName },
      });
    }
  },

  onMount: (addressesRef, setAddresses) => {
    AccountsController.cachedSetAddresses = setAddresses;
    AccountsController.cachedAddressesRef = addressesRef;
  },

  listenOnMount: () => null,

  removeAddress: async (chainId, address) => {
    AccountsController.syncState();
    AccountsController.remove(chainId, address);
  },
};
