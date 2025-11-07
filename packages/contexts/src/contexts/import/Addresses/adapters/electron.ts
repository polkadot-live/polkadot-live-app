// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getSupportedSources } from '@polkadot-live/consts/chains';
import type {
  AccountSource,
  ImportedGenericAccount,
  IpcTask,
} from '@polkadot-live/types';
import type { ImportAddressesAdapter } from './types';

export const electronAdapter: ImportAddressesAdapter = {
  fetchOnMount: async () => {
    const map = new Map<AccountSource, ImportedGenericAccount[]>();
    for (const source of getSupportedSources()) {
      const task: IpcTask = { action: 'raw-account:get', data: { source } };
      const result = (await window.myAPI.rawAccountTask(task)) as string;
      map.set(source, JSON.parse(result));
    }
    return map;
  },

  listenOnMount: () => null,
};
