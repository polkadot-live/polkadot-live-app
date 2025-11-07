// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getSupportedSources } from '@polkadot-live/consts/chains';
import { setStateWithRef } from '@w3ux/utils';
import type {
  AccountSource,
  AnyData,
  ImportedGenericAccount,
} from '@polkadot-live/types';
import type { ImportAddressesAdapter } from './types';

export const chromeAdapter: ImportAddressesAdapter = {
  fetchOnMount: async () => {
    const map = new Map<AccountSource, ImportedGenericAccount[]>();
    for (const source of getSupportedSources()) {
      const result: ImportedGenericAccount[] | undefined =
        await chrome.runtime.sendMessage({
          type: 'rawAccount',
          task: 'getAllBySource',
          payload: { source },
        });
      map.set(source, result || []);
    }
    return map;
  },

  listenOnMount: (setGenericAccounts, genericAccountsRef) => {
    if (!(setGenericAccounts && genericAccountsRef)) {
      return null;
    }
    const callback = (message: AnyData) => {
      if (message.type === 'rawAccount') {
        switch (message.task) {
          case 'import:setAccounts': {
            const { ser }: { ser: string } = message.payload;
            const arr: [AccountSource, ImportedGenericAccount[]][] =
              JSON.parse(ser);
            const map = new Map<AccountSource, ImportedGenericAccount[]>(arr);
            setStateWithRef(map, setGenericAccounts, genericAccountsRef);
            break;
          }
        }
      }
    };
    chrome.runtime.onMessage.addListener(callback);
    return () => chrome.runtime.onMessage.removeListener(callback);
  },
};
